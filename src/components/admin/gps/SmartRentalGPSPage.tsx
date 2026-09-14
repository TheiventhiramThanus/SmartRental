import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../../../firebase';
import { ArrowLeft, Car, MapPin, Gauge, DollarSign, Settings, Play, Square, Receipt, AlertTriangle, Wrench, Radio, History } from 'lucide-react';
import { LiveMap } from './LiveMap';
import { TripBill } from './TripBill';
import { TripHistory } from './TripHistory';



interface PathPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface TripData {
  tripId: string;
  startTime: number;
  endTime: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  distance: number;
  ratePerKm: number;
  totalCost: number;
  pricingModel?: string;
  baseDayRate?: number;
  includedKmPerDay?: number;
  extraKmRate?: number;
  dayCharges?: number;
  extraKm?: number;
  extraKmCharges?: number;
  fixedBasePrice?: number;
  includedKmTotal?: number;
}

type PricingModel = 'day-based' | 'fixed-100km' | 'per-km';

interface PricingConfig {
  model: PricingModel;
  baseDayRate: number;
  includedKmPerDay: number;
  extraDayRate: number;
  extraKmRate: number;
  fixedBasePrice: number;
  includedKmTotal: number;
  fixedExtraKmRate: number;
  perKmRate: number;
}

export interface SmartRentalGPSPageProps {
  vehicle: {
    id: string;
    name: string;
    licensePlate: string;
    model: string;
  };
  onBack: () => void;
}

export function SmartRentalGPSPage({ vehicle, onBack }: SmartRentalGPSPageProps) {
  const [gpsData, setGpsData] = useState({ latitude: 0, longitude: 0, distance: 0, speed: 0 });

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    model: 'day-based',
    baseDayRate: 5000,
    includedKmPerDay: 100,
    extraDayRate: 4000,
    extraKmRate: 50,
    fixedBasePrice: 8000,
    includedKmTotal: 100,
    fixedExtraKmRate: 60,
    perKmRate: 75
  });
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [tempPricing, setTempPricing] = useState<PricingConfig>(pricingConfig);

  const [totalCost, setTotalCost] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState({ dayCharges: 0, includedKm: 0, extraKm: 0, extraKmCharges: 0 });
  const [mapStyle, setMapStyle] = useState<'default' | 'dark' | 'retro'>('default');

  const [tripActive, setTripActive] = useState(false);
  const [tripStartLocation, setTripStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tripStartTime, setTripStartTime] = useState<number | null>(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [showBill, setShowBill] = useState(false);
  const [currentTripData, setCurrentTripData] = useState<TripData | null>(null);

  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [dbError, setDbError] = useState<string | null>(null);

  const [totalOdometerKm, setTotalOdometerKm] = useState(0);
  const totalOdometerKmRef = useRef(totalOdometerKm);
  const lastOdometerPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // Right panel tab: 'map' | 'history'
  const [activeTab, setActiveTab] = useState<'map' | 'history'>('map');

  useEffect(() => { totalOdometerKmRef.current = totalOdometerKm; }, [totalOdometerKm]);

  useEffect(() => {
    setDbStatus('connecting');
    // Primary path: tracking/{vehicleId}/odometer
    // Fallback path: /odometer (old firmware)
    const primaryOdomRef = ref(rtdb, `tracking/${vehicle.id}/odometer`);
    const fallbackOdomRef = ref(rtdb, `/odometer`);

    console.log(`📡 Listening to RTDB paths:\n  Primary: tracking/${vehicle.id}/GPS\n  Fallback: /GPS`);

    const unsubPrimary = onValue(primaryOdomRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) { setTotalOdometerKm(val); setDbStatus('connected'); }
    }, (error) => {
      console.error("Firebase Primary Odometer Error:", error);
      setDbStatus('error');
      setDbError(error.message);
    });

    // Fallback odometer (root /odometer — old firmware)
    const unsubFallback = onValue(fallbackOdomRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setDbStatus('connected');
    }, () => {/* silently ignore fallback errors */});

    return () => { unsubPrimary(); unsubFallback(); };
  }, [vehicle.id]);

  const [lastServiceKm, setLastServiceKm] = useState(0);
  const [lastOilChangeKm, setLastOilChangeKm] = useState(0);
  const [lastBrakeCheckKm, setLastBrakeCheckKm] = useState(0);
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<string[]>([]);

  const [serviceInterval, setServiceInterval] = useState(1000);
  const [oilChangeInterval, setOilChangeInterval] = useState(1000);
  const [brakeCheckInterval, setBrakeCheckInterval] = useState(1000);
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [warningThreshold] = useState(100);

  const [speedLimit, setSpeedLimit] = useState(70);
  const [showSpeedAlert, setShowSpeedAlert] = useState(false);
  const [isEditingSpeedLimit, setIsEditingSpeedLimit] = useState(false);

  useEffect(() => {
    // Primary path: tracking/{vehicleId}/GPS  ← new firmware
    // Fallback path: /GPS                     ← current/old firmware
    const primaryGpsRef  = ref(rtdb, `tracking/${vehicle.id}/GPS`);
    const fallbackGpsRef = ref(rtdb, `/GPS`);

    const processGpsData = (data: any) => {
      if (!data) return;
      setDbStatus('connected');
      const newGpsData = {
        latitude:  data.Latitude  || data.latitude  || 0,
        longitude: data.Longitude || data.longitude || 0,
        distance:  data.Distance_m || data.distance || 0,
        speed:     data.Speed_kmph || data.speed    || 0
      };
      // Only use data if it has valid coordinates
      if (newGpsData.latitude === 0 && newGpsData.longitude === 0) return;
      setGpsData(newGpsData);

      if (lastOdometerPosRef.current) {
        const distanceMoved = calculateDistance(
          lastOdometerPosRef.current.lat, lastOdometerPosRef.current.lng,
          newGpsData.latitude, newGpsData.longitude
        );
        if (distanceMoved > 0.01) {
          const newTotal = totalOdometerKmRef.current + distanceMoved;
          set(ref(rtdb, `tracking/${vehicle.id}/odometer`), newTotal);
          lastOdometerPosRef.current = { lat: newGpsData.latitude, lng: newGpsData.longitude };
        }
      } else {
        lastOdometerPosRef.current = { lat: newGpsData.latitude, lng: newGpsData.longitude };
      }

      if (tripActive) {
        const newPoint: PathPoint = { lat: newGpsData.latitude, lng: newGpsData.longitude, timestamp: Date.now() };
        setPathPoints(prev => {
          if (prev.length === 0) return [newPoint];
          const lastPoint = prev[prev.length - 1];
          const distance = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
          if (distance > 0.01) return [...prev, newPoint];
          return prev;
        });
      }
    };

    // Subscribe to primary path
    const unsubPrimary = onValue(primaryGpsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && (data.Latitude || data.latitude)) {
        console.log('✅ GPS data from primary path (tracking/{id}/GPS)');
        processGpsData(data);
      }
    }, (error) => {
      console.error("GPS Primary Path Error:", error);
      setDbStatus('error');
    });

    // Subscribe to fallback path (current firmware writes here)
    const unsubFallback = onValue(fallbackGpsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && (data.Latitude || data.latitude)) {
        console.log('ℹ️ GPS data from fallback path (/GPS) — update firmware to fix this');
        processGpsData(data);
      }
    }, () => {/* silently ignore if root /GPS doesn't exist */});

    return () => { unsubPrimary(); unsubFallback(); };
  }, [tripActive, vehicle.id]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (pathPoints.length < 2) { setTripDistance(0); return; }
    let totalDist = 0;
    for (let i = 1; i < pathPoints.length; i++) {
      totalDist += calculateDistance(pathPoints[i - 1].lat, pathPoints[i - 1].lng, pathPoints[i].lat, pathPoints[i].lng);
    }
    setTripDistance(totalDist * 1000);
  }, [pathPoints]);

  useEffect(() => {
    const alerts: string[] = [];
    const totalKm = totalOdometerKm + (tripDistance / 1000);

    const kmSinceService = totalKm - lastServiceKm;
    const kmUntilService = serviceInterval - kmSinceService;
    if (kmSinceService >= serviceInterval) alerts.push(`🔴 Service OVERDUE - ${Math.floor(kmSinceService)} km since last service`);
    else if (kmUntilService <= warningThreshold) alerts.push(`⚠️ Service Due Soon - ${Math.floor(kmUntilService)} km remaining`);

    const kmSinceOilChange = totalKm - lastOilChangeKm;
    const kmUntilOilChange = oilChangeInterval - kmSinceOilChange;
    if (kmSinceOilChange >= oilChangeInterval) alerts.push(`🔴 Oil Change OVERDUE - ${Math.floor(kmSinceOilChange)} km since last oil change`);
    else if (kmUntilOilChange <= warningThreshold) alerts.push(`⚠️ Oil Change Due Soon - ${Math.floor(kmUntilOilChange)} km remaining`);

    const kmSinceBrakeCheck = totalKm - lastBrakeCheckKm;
    const kmUntilBrakeCheck = brakeCheckInterval - kmSinceBrakeCheck;
    if (kmSinceBrakeCheck >= brakeCheckInterval) alerts.push(`🔴 Brake Check OVERDUE - ${Math.floor(kmSinceBrakeCheck)} km since last brake check`);
    else if (kmUntilBrakeCheck <= warningThreshold) alerts.push(`⚠️ Brake Check Due Soon - ${Math.floor(kmUntilBrakeCheck)} km remaining`);

    setMaintenanceAlerts(alerts);
    setShowMaintenanceAlert(alerts.length > 0);
  }, [tripDistance, totalOdometerKm, lastServiceKm, lastOilChangeKm, lastBrakeCheckKm, serviceInterval, oilChangeInterval, brakeCheckInterval, warningThreshold]);

  useEffect(() => {
    setShowSpeedAlert(tripActive && gpsData.speed > speedLimit);
  }, [gpsData.speed, speedLimit, tripActive]);

  useEffect(() => {
    if (!tripActive || !tripStartTime) return;

    const calculateCost = () => {
      const distanceInKm = tripDistance / 1000;
      const tripDurationMs = Date.now() - tripStartTime;
      const tripDurationDays = Math.ceil(tripDurationMs / (1000 * 60 * 60 * 24));
      const daysCount = Math.max(tripDurationDays, 1);

      let total = 0;
      let breakdown = { dayCharges: 0, includedKm: 0, extraKm: 0, extraKmCharges: 0 };

      if (pricingConfig.model === 'day-based') {
        const dayCharges = pricingConfig.baseDayRate + (pricingConfig.extraDayRate * Math.max(daysCount - 1, 0));
        const totalIncludedKm = pricingConfig.includedKmPerDay * daysCount;
        const extraKm = Math.max(distanceInKm - totalIncludedKm, 0);
        total = dayCharges + extraKm * pricingConfig.extraKmRate;
        breakdown = { dayCharges, includedKm: Math.min(distanceInKm, totalIncludedKm), extraKm, extraKmCharges: extraKm * pricingConfig.extraKmRate };
      } else if (pricingConfig.model === 'fixed-100km') {
        const extraKm = Math.max(distanceInKm - pricingConfig.includedKmTotal, 0);
        total = pricingConfig.fixedBasePrice + extraKm * pricingConfig.fixedExtraKmRate;
        breakdown = { dayCharges: pricingConfig.fixedBasePrice, includedKm: Math.min(distanceInKm, pricingConfig.includedKmTotal), extraKm, extraKmCharges: extraKm * pricingConfig.fixedExtraKmRate };
      } else if (pricingConfig.model === 'per-km') {
        total = distanceInKm * pricingConfig.perKmRate;
        breakdown = { dayCharges: 0, includedKm: distanceInKm, extraKm: 0, extraKmCharges: 0 };
      }

      setCostBreakdown(breakdown);
      setTotalCost(total);
    };

    calculateCost();
    const intervalId = setInterval(calculateCost, 5000);
    return () => clearInterval(intervalId);
  }, [tripDistance, tripStartTime, pricingConfig, tripActive]);

  useEffect(() => {
    if (!tripActive && !currentTripData) {
      setTotalCost(0);
      setCostBreakdown({ dayCharges: 0, includedKm: 0, extraKm: 0, extraKmCharges: 0 });
    }
  }, [tripActive, currentTripData]);

  const handleStartTrip = async () => {
    if (gpsData.latitude !== 0 && gpsData.longitude !== 0) {
      const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setTripActive(true);
      setTripStartLocation({ lat: gpsData.latitude, lng: gpsData.longitude });
      setTripStartTime(Date.now());
      setTripDistance(0);
      setTotalCost(0);
      setCostBreakdown({ dayCharges: 0, includedKm: 0, extraKm: 0, extraKmCharges: 0 });
      setPathPoints([{ lat: gpsData.latitude, lng: gpsData.longitude, timestamp: Date.now() }]);
      setShowBill(false);
      setCurrentTripData(null);

      await set(ref(rtdb, `tracking/${vehicle.id}/TRIPS/${tripId}`), {
        tripId, startTime: Date.now(), startLat: gpsData.latitude, startLng: gpsData.longitude,
        distance: 0, amount: 0, status: 'started', pricingModel: pricingConfig.model,
      });
    }
  };

  const handleStopTrip = async () => {
    setTripActive(false);
    if (tripStartTime && tripStartLocation) {
      const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tripDurationMs = Date.now() - tripStartTime;
      const tripDays = Math.ceil(tripDurationMs / (1000 * 60 * 60 * 24));

      const tripData: TripData = {
        tripId, startTime: tripStartTime, endTime: Date.now(),
        startLocation: tripStartLocation,
        endLocation: { lat: gpsData.latitude, lng: gpsData.longitude },
        distance: tripDistance,
        ratePerKm: pricingConfig.model === 'per-km' ? pricingConfig.perKmRate : pricingConfig.extraKmRate,
        totalCost, pricingModel: pricingConfig.model,
        baseDayRate: pricingConfig.baseDayRate, includedKmPerDay: pricingConfig.includedKmPerDay,
        extraKmRate: pricingConfig.extraKmRate, fixedBasePrice: pricingConfig.fixedBasePrice,
        includedKmTotal: pricingConfig.includedKmTotal,
        dayCharges: costBreakdown.dayCharges, extraKm: costBreakdown.extraKm, extraKmCharges: costBreakdown.extraKmCharges,
      };

      await set(ref(rtdb, `tracking/${vehicle.id}/TRIPS/${tripId}`), {
        ...tripData, tripDays, pathPoints: pathPoints.map(p => ({ lat: p.lat, lng: p.lng })), status: 'completed',
      });

      setCurrentTripData(tripData);
      setShowBill(true);
    }
  };

  const handlePricingUpdate = () => {
    const valid =
      (tempPricing.model === 'day-based' && tempPricing.baseDayRate > 0 && tempPricing.extraDayRate >= 0 && tempPricing.includedKmPerDay >= 0 && tempPricing.extraKmRate > 0) ||
      (tempPricing.model === 'fixed-100km' && tempPricing.fixedBasePrice > 0 && tempPricing.includedKmTotal >= 0 && tempPricing.fixedExtraKmRate > 0) ||
      (tempPricing.model === 'per-km' && tempPricing.perKmRate > 0);
    if (valid) { setPricingConfig(tempPricing); setIsEditingPricing(false); }
  };

  const getPricingModelName = (model: PricingModel) => {
    switch (model) {
      case 'day-based': return 'Day-Based + Extra km';
      case 'fixed-100km': return 'Fixed Base + Extra km';
      case 'per-km': return 'Per Kilometer';
    }
  };

  const handleSimulatePosition = () => {
    const currentLat = gpsData.latitude === 0 ? 6.9271 : gpsData.latitude;
    const currentLng = gpsData.longitude === 0 ? 79.8612 : gpsData.longitude;
    const newLat = currentLat + (Math.random() - 0.5) * 0.001;
    const newLng = currentLng + (Math.random() - 0.5) * 0.001;

    set(ref(rtdb, `tracking/${vehicle.id}/GPS`), {
      Latitude: newLat,
      Longitude: newLng,
      Speed_kmph: Math.floor(Math.random() * 40) + 20,
      Timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="flex-1 flex flex-col p-3 max-w-[1800px] mx-auto w-full min-h-0">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-2 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back to Vehicles"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="bg-blue-600 p-2.5 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-800">{vehicle.name}</h1>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dbStatus === 'connected' ? 'bg-green-100 text-green-700' :
                    dbStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {dbStatus === 'connected' ? '📡 LIVE' : dbStatus === 'error' ? '❌ ERROR' : '🔄 CONNECTING'}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{vehicle.licensePlate} • tracking/{vehicle.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulatePosition}
                className="flex items-center gap-2 h-10 bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition text-sm"
              >
                <Radio className="w-4 h-4" /> Simulate GPS
              </button>
              {!tripActive ? (
                <button
                  onClick={handleStartTrip}
                  disabled={gpsData.latitude === 0}
                  className="flex items-center gap-2 h-10 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  <Play className="w-4 h-4" /> Start Trip
                </button>
              ) : (
                <button
                  onClick={handleStopTrip}
                  className="flex items-center gap-2 h-10 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                >
                  <Square className="w-4 h-4" /> Stop Trip
                </button>
              )}
              {currentTripData && (
                <button
                  onClick={() => setShowBill(true)}
                  className="flex items-center gap-2 h-10 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                >
                  <Receipt className="w-4 h-4" /> View Bill
                </button>
              )}
            </div>
          </div>

          {tripActive && tripStartTime && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">Trip Active</span>
                </div>
                <div className="text-gray-600">Started: {new Date(tripStartTime).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {dbStatus === 'error' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Database Connection Error</h4>
                    <p className="text-xs text-red-700">{dbError || "Make sure you have a working internet connection and Firebase is configured correctly."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showMaintenanceAlert && maintenanceAlerts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-orange-800 mb-2">Maintenance Alerts</h4>
                    <ul className="space-y-1">
                      {maintenanceAlerts.map((alert, index) => (
                        <li key={index} className="text-xs text-orange-700 flex items-center gap-2">
                          <Wrench className="w-3 h-3" />{alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => setShowMaintenanceAlert(false)} className="text-orange-600 hover:text-orange-800 text-xs font-semibold">Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {showSpeedAlert && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-800">⚠️ SPEED LIMIT EXCEEDED!</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Current Speed: <span className="font-bold">{gpsData.speed.toFixed(1)} km/h</span> | Limit: <span className="font-bold">{speedLimit} km/h</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 lg:overflow-hidden min-h-0">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-scroll custom-scrollbar scroll-smooth h-full max-h-full pb-3">

            {/* Speed and Location Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-green-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Speed</h2>
                </div>
                <div className="bg-green-50 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{gpsData.speed.toFixed(1)}</p>
                  <p className="text-xs text-gray-600 mt-1">km/h</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Location</h2>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-blue-50 rounded p-1.5">
                    <p className="text-xs text-gray-600">Lat</p>
                    <p className="text-xs font-mono font-semibold text-gray-900">{gpsData.latitude.toFixed(4)}°</p>
                  </div>
                  <div className="bg-blue-50 rounded p-1.5">
                    <p className="text-xs text-gray-600">Lng</p>
                    <p className="text-xs font-mono font-semibold text-gray-900">{gpsData.longitude.toFixed(4)}°</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distance Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-semibold text-gray-800">Trip Distance</h2>
              </div>
              <div className="bg-purple-50 rounded p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{(tripDistance / 1000).toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">kilometers</p>
                {pathPoints.length > 0 && <p className="text-xs text-purple-600 mt-1">{pathPoints.length} points</p>}
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <h2 className="text-xs font-semibold text-gray-800">Pricing Setup</h2>
              </div>

              {isEditingPricing ? (
                <div className="space-y-2">
                  <div className="bg-orange-50 rounded p-2 space-y-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Pricing Model</label>
                      <select value={tempPricing.model} onChange={(e) => setTempPricing({ ...tempPricing, model: e.target.value as PricingModel })}
                        className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500">
                        <option value="day-based">Day-Based + Extra km</option>
                        <option value="fixed-100km">Fixed Base + Extra km</option>
                        <option value="per-km">Per Kilometer</option>
                      </select>
                    </div>

                    {tempPricing.model === 'day-based' && (<>
                      <div><label className="text-xs text-gray-600 block mb-1">First Day Rate (LKR)</label>
                        <input type="number" value={tempPricing.baseDayRate} onChange={(e) => setTempPricing({ ...tempPricing, baseDayRate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="1" step="100" /></div>
                      <div><label className="text-xs text-gray-600 block mb-1">Extra Day Rate (LKR)</label>
                        <input type="number" value={tempPricing.extraDayRate} onChange={(e) => setTempPricing({ ...tempPricing, extraDayRate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="0" step="100" /></div>
                      <div><label className="text-xs text-gray-600 block mb-1">Free km/Day</label>
                        <input type="number" value={tempPricing.includedKmPerDay} onChange={(e) => setTempPricing({ ...tempPricing, includedKmPerDay: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="0" step="10" /></div>
                      <div><label className="text-xs text-gray-600 block mb-1">Extra km Rate (LKR)</label>
                        <input type="number" value={tempPricing.extraKmRate} onChange={(e) => setTempPricing({ ...tempPricing, extraKmRate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="1" step="5" /></div>
                    </>)}

                    {tempPricing.model === 'fixed-100km' && (<>
                      <div><label className="text-xs text-gray-600 block mb-1">Fixed Base Price (LKR)</label>
                        <input type="number" value={tempPricing.fixedBasePrice} onChange={(e) => setTempPricing({ ...tempPricing, fixedBasePrice: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="1" step="100" /></div>
                      <div><label className="text-xs text-gray-600 block mb-1">Included Kilometers</label>
                        <input type="number" value={tempPricing.includedKmTotal} onChange={(e) => setTempPricing({ ...tempPricing, includedKmTotal: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="0" step="10" /></div>
                      <div><label className="text-xs text-gray-600 block mb-1">Extra km Rate (LKR)</label>
                        <input type="number" value={tempPricing.fixedExtraKmRate} onChange={(e) => setTempPricing({ ...tempPricing, fixedExtraKmRate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="1" step="5" /></div>
                    </>)}

                    {tempPricing.model === 'per-km' && (
                      <div><label className="text-xs text-gray-600 block mb-1">Rate per Kilometer (LKR)</label>
                        <input type="number" value={tempPricing.perKmRate} onChange={(e) => setTempPricing({ ...tempPricing, perKmRate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500" min="1" step="5" /></div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={handlePricingUpdate} className="flex-1 bg-orange-600 text-white py-1 text-xs rounded font-semibold hover:bg-orange-700 transition">Save</button>
                    <button onClick={() => { setIsEditingPricing(false); setTempPricing(pricingConfig); }} className="flex-1 bg-gray-300 text-gray-700 py-1 text-xs rounded font-semibold hover:bg-gray-400 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-1 mb-2">
                    <div className="bg-orange-100 rounded p-1.5 border-2 border-orange-300">
                      <div className="text-center"><span className="text-xs font-bold text-orange-700">{getPricingModelName(pricingConfig.model)}</span></div>
                    </div>

                    {pricingConfig.model === 'day-based' && (<>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">1st Day:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.baseDayRate}</span></div></div>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Extra Days:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.extraDayRate}</span></div></div>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Free km/day:</span><span className="text-xs font-bold text-orange-600">{pricingConfig.includedKmPerDay} km</span></div></div>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Extra km:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.extraKmRate}</span></div></div>
                    </>)}

                    {pricingConfig.model === 'fixed-100km' && (<>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Base Price:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.fixedBasePrice}</span></div></div>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Includes:</span><span className="text-xs font-bold text-orange-600">{pricingConfig.includedKmTotal} km</span></div></div>
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Extra km:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.fixedExtraKmRate}</span></div></div>
                    </>)}

                    {pricingConfig.model === 'per-km' && (
                      <div className="bg-orange-50 rounded p-1.5"><div className="flex justify-between items-center"><span className="text-xs text-gray-600">Rate/km:</span><span className="text-xs font-bold text-orange-600">LKR {pricingConfig.perKmRate}</span></div></div>
                    )}
                  </div>
                  <button onClick={() => { setIsEditingPricing(true); setTempPricing(pricingConfig); }} disabled={tripActive}
                    className="w-full bg-orange-600 text-white py-1 text-xs rounded font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {tripActive ? 'Trip Active' : 'Edit Pricing'}
                  </button>
                </div>
              )}
            </div>

            {/* Billing Card */}
            <div className="rounded-lg shadow-lg p-3" style={{ background: 'linear-gradient(135deg, #2563eb, #4338ca)', color: '#ffffff' }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" style={{ color: '#ffffff' }} />
                <h2 className="text-xs font-semibold" style={{ color: '#ffffff' }}>Total Cost</h2>
              </div>
              <div className="rounded p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                {tripActive && tripStartTime ? (
                  <div className="space-y-1">
                    <div className="text-center pb-2 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                      <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>LKR {totalCost.toFixed(2)}</p>
                    </div>
                    <div className="text-xs space-y-1">
                      {pricingConfig.model === 'day-based' && (<>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Days:</span><span className="font-semibold" style={{ color: '#ffffff' }}>{Math.ceil((Date.now() - tripStartTime) / (1000 * 60 * 60 * 24))}</span></div>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Day Charges:</span><span className="font-semibold" style={{ color: '#ffffff' }}>LKR {costBreakdown.dayCharges.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Included km:</span><span className="font-semibold" style={{ color: '#ffffff' }}>{costBreakdown.includedKm.toFixed(2)} km</span></div>
                      </>)}
                      {pricingConfig.model === 'fixed-100km' && (<>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Base Price:</span><span className="font-semibold" style={{ color: '#ffffff' }}>LKR {costBreakdown.dayCharges.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Included km:</span><span className="font-semibold" style={{ color: '#ffffff' }}>{costBreakdown.includedKm.toFixed(2)} km</span></div>
                      </>)}
                      {pricingConfig.model === 'per-km' && (<>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Distance:</span><span className="font-semibold" style={{ color: '#ffffff' }}>{(tripDistance / 1000).toFixed(2)} km</span></div>
                        <div className="flex justify-between"><span style={{ color: '#bfdbfe' }}>Rate/km:</span><span className="font-semibold" style={{ color: '#ffffff' }}>LKR {pricingConfig.perKmRate}</span></div>
                      </>)}
                      {costBreakdown.extraKm > 0 && pricingConfig.model !== 'per-km' && (<>
                        <div className="flex justify-between" style={{ color: '#fef08a' }}><span>Extra km:</span><span className="font-semibold">{costBreakdown.extraKm.toFixed(2)} km</span></div>
                        <div className="flex justify-between" style={{ color: '#fef08a' }}><span>Extra Charges:</span><span className="font-semibold">LKR {costBreakdown.extraKmCharges.toFixed(2)}</span></div>
                      </>)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>LKR 0.00</p>
                    <p className="text-xs mt-2 italic" style={{ color: 'rgba(255,255,255,0.75)' }}>Start trip to begin billing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Maintenance Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Maintenance</h2>
                </div>
                <button onClick={() => setIsEditingMaintenance(!isEditingMaintenance)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  {isEditingMaintenance ? 'Cancel' : 'Settings'}
                </button>
              </div>

              {isEditingMaintenance ? (
                <div className="space-y-2">
                  <div className="bg-purple-50 rounded p-2 space-y-2">
                    <div><label className="text-xs text-gray-600 block mb-1">Service Interval (km)</label>
                      <input type="number" value={serviceInterval} onChange={(e) => setServiceInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500" min="100" step="100" /></div>
                    <div><label className="text-xs text-gray-600 block mb-1">Oil Change Interval (km)</label>
                      <input type="number" value={oilChangeInterval} onChange={(e) => setOilChangeInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500" min="100" step="100" /></div>
                    <div><label className="text-xs text-gray-600 block mb-1">Brake Check Interval (km)</label>
                      <input type="number" value={brakeCheckInterval} onChange={(e) => setBrakeCheckInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500" min="100" step="100" /></div>
                  </div>
                  <button onClick={() => setIsEditingMaintenance(false)} className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition">Save Settings</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-purple-50 rounded p-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-700">Total Odometer:</span>
                      <span className="font-bold text-purple-700">{(totalOdometerKm + tripDistance / 1000).toFixed(2)} km</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Service Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSince = totalKm - lastServiceKm;
                      const kmUntil = serviceInterval - kmSince;
                      const progress = (kmSince / serviceInterval) * 100;
                      const isOverdue = kmSince >= serviceInterval;
                      const isWarning = kmUntil <= warningThreshold && !isOverdue;
                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Service:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>{Math.floor(kmSince)} / {serviceInterval} km</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                          </div>
                          {(isOverdue || isWarning) && <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>{isOverdue ? `OVERDUE by ${Math.floor(kmSince - serviceInterval)} km!` : `Due in ${Math.floor(kmUntil)} km`}</p>}
                        </div>
                      );
                    })()}

                    {/* Oil Change Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSince = totalKm - lastOilChangeKm;
                      const kmUntil = oilChangeInterval - kmSince;
                      const progress = (kmSince / oilChangeInterval) * 100;
                      const isOverdue = kmSince >= oilChangeInterval;
                      const isWarning = kmUntil <= warningThreshold && !isOverdue;
                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Oil Change:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>{Math.floor(kmSince)} / {oilChangeInterval} km</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                          </div>
                          {(isOverdue || isWarning) && <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>{isOverdue ? `OVERDUE by ${Math.floor(kmSince - oilChangeInterval)} km!` : `Due in ${Math.floor(kmUntil)} km`}</p>}
                        </div>
                      );
                    })()}

                    {/* Brake Check Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSince = totalKm - lastBrakeCheckKm;
                      const kmUntil = brakeCheckInterval - kmSince;
                      const progress = (kmSince / brakeCheckInterval) * 100;
                      const isOverdue = kmSince >= brakeCheckInterval;
                      const isWarning = kmUntil <= warningThreshold && !isOverdue;
                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Brake Check:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>{Math.floor(kmSince)} / {brakeCheckInterval} km</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                          </div>
                          {(isOverdue || isWarning) && <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>{isOverdue ? `OVERDUE by ${Math.floor(kmSince - brakeCheckInterval)} km!` : `Due in ${Math.floor(kmUntil)} km`}</p>}
                        </div>
                      );
                    })()}
                  </div>

                  {maintenanceAlerts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs font-semibold">{maintenanceAlerts.length} Alert(s)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Speed Limit Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-red-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Speed Limit</h2>
                </div>
                <button onClick={() => setIsEditingSpeedLimit(!isEditingSpeedLimit)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  {isEditingSpeedLimit ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="space-y-2">
                {!isEditingSpeedLimit ? (
                  <>
                    <div className={`rounded p-3 text-center ${showSpeedAlert ? 'bg-red-100 animate-pulse' : 'bg-gray-50'}`}>
                      <p className={`text-2xl font-bold ${showSpeedAlert ? 'text-red-600' : 'text-gray-800'}`}>{speedLimit}</p>
                      <p className="text-xs text-gray-600 mt-1">km/h limit</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded text-xs">
                      <span className="text-gray-700">Current Speed:</span>
                      <span className={`font-bold ${showSpeedAlert ? 'text-red-600' : 'text-blue-700'}`}>{gpsData.speed.toFixed(1)} km/h</span>
                    </div>
                    {showSpeedAlert && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-700">Exceeding Limit!</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input type="number" value={speedLimit} onChange={(e) => setSpeedLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Speed Limit (km/h)" min="0" />
                    <button onClick={() => setIsEditingSpeedLimit(false)} className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition">Save Limit</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map + History Tabs */}
          <div className="lg:col-span-3 lg:overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
            <div className="bg-white rounded-lg shadow-lg p-3 h-full flex flex-col">

              {/* Tab Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      activeTab === 'map'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Live Map
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      activeTab === 'history'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Trip History
                  </button>
                </div>

                {activeTab === 'map' && tripActive && pathPoints.length > 1 && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">🚗 Tracking Route</span>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'map' ? (
                <div className="rounded-lg overflow-hidden shadow-inner flex-1">
                  <LiveMap
                    currentPosition={{ lat: gpsData.latitude, lng: gpsData.longitude }}
                    pathPoints={pathPoints}
                    isTracking={tripActive}
                    mapStyle={mapStyle}
                    onMapStyleChange={setMapStyle}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <TripHistory vehicleId={vehicle.id} vehicleName={vehicle.name} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {showBill && currentTripData && createPortal(
        <TripBill tripData={currentTripData} onClose={() => setShowBill(false)} />,
        document.body
      )}
    </div>
  );
}
