import { useEffect, useState, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Car, MapPin, Gauge, DollarSign, Settings, Play, Square, Receipt, AlertTriangle, Wrench } from 'lucide-react';
import { LiveMap } from './components/LiveMap';
import { TripBill } from './components/TripBill';

const firebaseConfig = {
  apiKey: "AIzaSyD3c2Vfemby5OfCi_Ibb1smtdOFWWDllZQ",
  authDomain: "smartrental-f7bb0.firebaseapp.com",
  projectId: "smartrental-f7bb0",
  storageBucket: "smartrental-f7bb0.firebasestorage.app",
  messagingSenderId: "520136391428",
  appId: "1:520136391428:web:c3af431f0587210488ee51",
  measurementId: "G-CBLE363F6J",
  databaseURL: "https://smartrental-f7bb0-default-rtdb.firebaseio.com"
};

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
  // Day-based model
  baseDayRate: number;
  includedKmPerDay: number;
  extraDayRate: number;
  extraKmRate: number;
  // Fixed 100km model
  fixedBasePrice: number;
  includedKmTotal: number;
  fixedExtraKmRate: number;
  // Per-km model
  perKmRate: number;
}

export default function App() {
  const [gpsData, setGpsData] = useState({
    latitude: 0,
    longitude: 0,
    distance: 0,
    speed: 0
  });

  // Pricing configuration
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    model: 'day-based',
    // Day-based model defaults
    baseDayRate: 5000,
    includedKmPerDay: 100,
    extraDayRate: 4000,
    extraKmRate: 50,
    // Fixed 100km model defaults
    fixedBasePrice: 8000,
    includedKmTotal: 100,
    fixedExtraKmRate: 60,
    // Per-km model defaults
    perKmRate: 75
  });
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [tempPricing, setTempPricing] = useState<PricingConfig>(pricingConfig);

  const [totalCost, setTotalCost] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState({
    dayCharges: 0,
    includedKm: 0,
    extraKm: 0,
    extraKmCharges: 0
  });
  const [mapStyle, setMapStyle] = useState<'default' | 'dark' | 'retro'>('default');

  // Trip management
  const [tripActive, setTripActive] = useState(false);
  const [tripStartLocation, setTripStartLocation] = useState<{lat: number, lng: number} | null>(null);
  const [tripStartTime, setTripStartTime] = useState<number | null>(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [showBill, setShowBill] = useState(false);
  const [currentTripData, setCurrentTripData] = useState<TripData | null>(null);

  // Maintenance tracking
  const [totalOdometerKm, setTotalOdometerKm] = useState(0);
  const totalOdometerKmRef = useRef(totalOdometerKm);
  const lastOdometerPosRef = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    totalOdometerKmRef.current = totalOdometerKm;
  }, [totalOdometerKm]);

  useEffect(() => {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const database = getDatabase(app);
    const odometerRef = ref(database, 'VEHICLE/odometer');

    const unsubscribe = onValue(odometerRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        setTotalOdometerKm(val);
      }
    });

    return () => unsubscribe();
  }, []);

  const [lastServiceKm, setLastServiceKm] = useState(0);
  const [lastOilChangeKm, setLastOilChangeKm] = useState(0);
  const [lastBrakeCheckKm, setLastBrakeCheckKm] = useState(0);
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<string[]>([]);

  // Maintenance intervals (configurable)
  const [serviceInterval, setServiceInterval] = useState(1000); // km
  const [oilChangeInterval, setOilChangeInterval] = useState(1000); // km
  const [brakeCheckInterval, setBrakeCheckInterval] = useState(1000); // km
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [warningThreshold] = useState(100); // Start warning 100km before

  // Speed limit tracking
  const [speedLimit, setSpeedLimit] = useState(70); // Default 70 km/h
  const [showSpeedAlert, setShowSpeedAlert] = useState(false);
  const [isEditingSpeedLimit, setIsEditingSpeedLimit] = useState(false);

  useEffect(() => {
    // Initialize Firebase inside useEffect
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const database = getDatabase(app);
    const gpsRef = ref(database, 'GPS');

    const unsubscribe = onValue(gpsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newGpsData = {
          latitude: data.Latitude || 0,
          longitude: data.Longitude || 0,
          distance: data.Distance_m || 0,
          speed: data.Speed_kmph || 0
        };
        setGpsData(newGpsData);

        // Track background odometer independently of trips
        if (newGpsData.latitude !== 0 && newGpsData.longitude !== 0) {
          if (lastOdometerPosRef.current) {
            const distanceMoved = calculateDistance(
              lastOdometerPosRef.current.lat, 
              lastOdometerPosRef.current.lng, 
              newGpsData.latitude, 
              newGpsData.longitude
            );
            if (distanceMoved > 0.01) { // Only update if moved > 10m
              const newTotal = totalOdometerKmRef.current + distanceMoved;
              set(ref(database, 'VEHICLE/odometer'), newTotal);
              lastOdometerPosRef.current = { lat: newGpsData.latitude, lng: newGpsData.longitude };
            }
          } else {
            lastOdometerPosRef.current = { lat: newGpsData.latitude, lng: newGpsData.longitude };
          }
        }

        // If trip is active, add to path
        if (tripActive && newGpsData.latitude !== 0 && newGpsData.longitude !== 0) {
          const newPoint: PathPoint = {
            lat: newGpsData.latitude,
            lng: newGpsData.longitude,
            timestamp: Date.now()
          };

          setPathPoints(prev => {
            // Only add if location changed significantly (more than ~10 meters)
            if (prev.length === 0) return [newPoint];
            const lastPoint = prev[prev.length - 1];
            const distance = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
            if (distance > 0.01) { // 10 meters
              return [...prev, newPoint];
            }
            return prev;
          });
        }
      }
    });

    return () => unsubscribe();
  }, [tripActive]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate trip distance from path points
  useEffect(() => {
    if (pathPoints.length < 2) {
      setTripDistance(0);
      return;
    }

    let totalDist = 0;
    for (let i = 1; i < pathPoints.length; i++) {
      totalDist += calculateDistance(
        pathPoints[i-1].lat, pathPoints[i-1].lng,
        pathPoints[i].lat, pathPoints[i].lng
      );
    }
    setTripDistance(totalDist * 1000); // Convert to meters
  }, [pathPoints]);

  // Check maintenance alerts based on odometer
  useEffect(() => {
    const alerts: string[] = [];
    const totalKm = totalOdometerKm + (tripDistance / 1000);

    // Check if service is needed or approaching
    const kmSinceService = totalKm - lastServiceKm;
    const kmUntilService = serviceInterval - kmSinceService;

    if (kmSinceService >= serviceInterval) {
      alerts.push(`🔴 Service OVERDUE - ${Math.floor(kmSinceService)} km since last service`);
    } else if (kmUntilService <= warningThreshold) {
      alerts.push(`⚠️ Service Due Soon - ${Math.floor(kmUntilService)} km remaining`);
    }

    // Check if oil change is needed or approaching
    const kmSinceOilChange = totalKm - lastOilChangeKm;
    const kmUntilOilChange = oilChangeInterval - kmSinceOilChange;

    if (kmSinceOilChange >= oilChangeInterval) {
      alerts.push(`🔴 Oil Change OVERDUE - ${Math.floor(kmSinceOilChange)} km since last oil change`);
    } else if (kmUntilOilChange <= warningThreshold) {
      alerts.push(`⚠️ Oil Change Due Soon - ${Math.floor(kmUntilOilChange)} km remaining`);
    }

    // Check if brake check is needed or approaching
    const kmSinceBrakeCheck = totalKm - lastBrakeCheckKm;
    const kmUntilBrakeCheck = brakeCheckInterval - kmSinceBrakeCheck;

    if (kmSinceBrakeCheck >= brakeCheckInterval) {
      alerts.push(`🔴 Brake Check OVERDUE - ${Math.floor(kmSinceBrakeCheck)} km since last brake check`);
    } else if (kmUntilBrakeCheck <= warningThreshold) {
      alerts.push(`⚠️ Brake Check Due Soon - ${Math.floor(kmUntilBrakeCheck)} km remaining`);
    }

    setMaintenanceAlerts(alerts);
    setShowMaintenanceAlert(alerts.length > 0);
  }, [tripDistance, totalOdometerKm, lastServiceKm, lastOilChangeKm, lastBrakeCheckKm, serviceInterval, oilChangeInterval, brakeCheckInterval, warningThreshold]);

  // Monitor speed limit
  useEffect(() => {
    if (tripActive && gpsData.speed > speedLimit) {
      setShowSpeedAlert(true);
    } else {
      setShowSpeedAlert(false);
    }
  }, [gpsData.speed, speedLimit, tripActive]);

  // Real-time cost calculation that runs continuously during active trip
  useEffect(() => {
    if (!tripActive || !tripStartTime) {
      return;
    }

    // Calculate cost immediately
    const calculateCost = () => {
      const distanceInKm = tripDistance / 1000;
      const tripDurationMs = Date.now() - tripStartTime;
      const tripDurationDays = Math.ceil(tripDurationMs / (1000 * 60 * 60 * 24));
      const daysCount = Math.max(tripDurationDays, 1);

      let total = 0;
      let breakdown = {
        dayCharges: 0,
        includedKm: 0,
        extraKm: 0,
        extraKmCharges: 0
      };

      if (pricingConfig.model === 'day-based') {
        // Model 1: Day-based pricing
        const dayCharges = pricingConfig.baseDayRate + (pricingConfig.extraDayRate * Math.max(daysCount - 1, 0));
        const totalIncludedKm = pricingConfig.includedKmPerDay * daysCount;
        const extraKm = Math.max(distanceInKm - totalIncludedKm, 0);
        const extraKmCharges = extraKm * pricingConfig.extraKmRate;

        total = dayCharges + extraKmCharges;
        breakdown = {
          dayCharges,
          includedKm: Math.min(distanceInKm, totalIncludedKm),
          extraKm,
          extraKmCharges
        };
      } else if (pricingConfig.model === 'fixed-100km') {
        // Model 2: Fixed price for first 100km (or configured amount)
        const basePrice = pricingConfig.fixedBasePrice;
        const extraKm = Math.max(distanceInKm - pricingConfig.includedKmTotal, 0);
        const extraKmCharges = extraKm * pricingConfig.fixedExtraKmRate;

        total = basePrice + extraKmCharges;
        breakdown = {
          dayCharges: basePrice,
          includedKm: Math.min(distanceInKm, pricingConfig.includedKmTotal),
          extraKm,
          extraKmCharges
        };
      } else if (pricingConfig.model === 'per-km') {
        // Model 3: Simple per-km rate
        total = distanceInKm * pricingConfig.perKmRate;
        breakdown = {
          dayCharges: 0,
          includedKm: distanceInKm,
          extraKm: 0,
          extraKmCharges: 0
        };
      }

      setCostBreakdown(breakdown);
      setTotalCost(total);
    };

    // Calculate immediately
    calculateCost();

    // Update cost every 5 seconds for real-time updates
    const intervalId = setInterval(calculateCost, 5000);

    return () => clearInterval(intervalId);
  }, [tripDistance, tripStartTime, pricingConfig, tripActive]);

  // Reset cost when trip is not active
  useEffect(() => {
    if (!tripActive && !currentTripData) {
      setTotalCost(0);
      setCostBreakdown({
        dayCharges: 0,
        includedKm: 0,
        extraKm: 0,
        extraKmCharges: 0
      });
    }
  }, [tripActive, currentTripData]);

  const handleStartTrip = async () => {
    if (gpsData.latitude !== 0 && gpsData.longitude !== 0) {
      // Generate unique trip ID
      const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Reset all trip data
      setTripActive(true);
      setTripStartLocation({ lat: gpsData.latitude, lng: gpsData.longitude });
      setTripStartTime(Date.now());
      setTripDistance(0);
      setTotalCost(0);
      setCostBreakdown({
        dayCharges: 0,
        includedKm: 0,
        extraKm: 0,
        extraKmCharges: 0
      });
      setPathPoints([{
        lat: gpsData.latitude,
        lng: gpsData.longitude,
        timestamp: Date.now()
      }]);
      setShowBill(false);
      setCurrentTripData(null);

      // Save to Firebase with status: started
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const database = getDatabase(app);
      const tripRef = ref(database, `TRIPS/${tripId}`);

      await set(tripRef, {
        tripId,
        startTime: Date.now(),
        startLat: gpsData.latitude,
        startLng: gpsData.longitude,
        distance: 0,
        amount: 0,
        status: 'started',
        pricingModel: pricingConfig.model,
      });
    }
  };

  const handleStopTrip = async () => {
    setTripActive(false);

    // Generate trip data and save to Firebase
    if (tripStartTime && tripStartLocation) {
      const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate trip days
      const tripDurationMs = Date.now() - tripStartTime;
      const tripDays = Math.ceil(tripDurationMs / (1000 * 60 * 60 * 24));

      const tripData: TripData = {
        tripId,
        startTime: tripStartTime,
        endTime: Date.now(),
        startLocation: tripStartLocation,
        endLocation: { lat: gpsData.latitude, lng: gpsData.longitude },
        distance: tripDistance,
        ratePerKm: pricingConfig.model === 'per-km' ? pricingConfig.perKmRate : pricingConfig.extraKmRate,
        totalCost,
        pricingModel: pricingConfig.model,
        baseDayRate: pricingConfig.baseDayRate,
        includedKmPerDay: pricingConfig.includedKmPerDay,
        extraKmRate: pricingConfig.extraKmRate,
        fixedBasePrice: pricingConfig.fixedBasePrice,
        includedKmTotal: pricingConfig.includedKmTotal,
        dayCharges: costBreakdown.dayCharges,
        extraKm: costBreakdown.extraKm,
        extraKmCharges: costBreakdown.extraKmCharges,
      };

      // Save to Firebase with status: completed
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const database = getDatabase(app);
      const tripRef = ref(database, `TRIPS/${tripId}`);

      await set(tripRef, {
        tripId: tripData.tripId,
        startTime: tripData.startTime,
        endTime: tripData.endTime,
        tripDays,
        pricingModel: pricingConfig.model,
        startLat: tripData.startLocation.lat,
        startLng: tripData.startLocation.lng,
        endLat: tripData.endLocation.lat,
        endLng: tripData.endLocation.lng,
        distance: tripData.distance,
        baseDayRate: pricingConfig.baseDayRate,
        includedKmPerDay: pricingConfig.includedKmPerDay,
        extraKmRate: pricingConfig.extraKmRate,
        extraDayRate: pricingConfig.extraDayRate,
        fixedBasePrice: pricingConfig.fixedBasePrice,
        includedKmTotal: pricingConfig.includedKmTotal,
        fixedExtraKmRate: pricingConfig.fixedExtraKmRate,
        perKmRate: pricingConfig.perKmRate,
        dayCharges: costBreakdown.dayCharges,
        extraKm: costBreakdown.extraKm,
        extraKmCharges: costBreakdown.extraKmCharges,
        totalCost: tripData.totalCost,
        pathPoints: pathPoints.map(p => ({ lat: p.lat, lng: p.lng })),
        status: 'completed',
      });

      // Set current trip data and show bill
      setCurrentTripData(tripData);
      setShowBill(true);
    }
  };

  const handlePricingUpdate = () => {
    const valid =
      (tempPricing.model === 'day-based' && tempPricing.baseDayRate > 0 && tempPricing.extraDayRate >= 0 && tempPricing.includedKmPerDay >= 0 && tempPricing.extraKmRate > 0) ||
      (tempPricing.model === 'fixed-100km' && tempPricing.fixedBasePrice > 0 && tempPricing.includedKmTotal >= 0 && tempPricing.fixedExtraKmRate > 0) ||
      (tempPricing.model === 'per-km' && tempPricing.perKmRate > 0);

    if (valid) {
      setPricingConfig(tempPricing);
      setIsEditingPricing(false);
    }
  };

  const getPricingModelName = (model: PricingModel) => {
    switch (model) {
      case 'day-based':
        return 'Day-Based + Extra km';
      case 'fixed-100km':
        return 'Fixed Base + Extra km';
      case 'per-km':
        return 'Per Kilometer';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col p-3 max-w-[1800px] mx-auto w-full min-h-0">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-2 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Smart Car Rental</h1>
                <p className="text-xs text-gray-600">Live GPS Tracking & Billing</p>
              </div>
            </div>

            {/* Trip Control Buttons */}
            <div className="flex items-center gap-2">
              {!tripActive ? (
                <button
                  onClick={handleStartTrip}
                  disabled={gpsData.latitude === 0}
                  className="flex items-center gap-2 h-10 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  <Play className="w-4 h-4" />
                  Start Trip
                </button>
              ) : (
                <button
                  onClick={handleStopTrip}
                  className="flex items-center gap-2 h-10 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                >
                  <Square className="w-4 h-4" />
                  Stop Trip
                </button>
              )}
              {currentTripData && (
                <button
                  onClick={() => setShowBill(true)}
                  className="flex items-center gap-2 h-10 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                >
                  <Receipt className="w-4 h-4" />
                  View Bill
                </button>
              )}
            </div>
          </div>

          {/* Trip Status */}
          {tripActive && tripStartTime && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">Trip Active</span>
                </div>
                <div className="text-gray-600">
                  Started: {new Date(tripStartTime).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Alert */}
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
                          <Wrench className="w-3 h-3" />
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowMaintenanceAlert(false)}
                    className="text-orange-600 hover:text-orange-800 text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Speed Alert */}
          {showSpeedAlert && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-800">⚠️ SPEED LIMIT EXCEEDED!</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Current Speed: <span className="font-bold">{gpsData.speed.toFixed(1)} km/h</span> |
                      Limit: <span className="font-bold">{speedLimit} km/h</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 lg:overflow-hidden min-h-0">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-scroll custom-scrollbar scroll-smooth h-full max-h-full pb-3">{/* Speed and Location Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Speed Card */}
              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-green-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Speed</h2>
                </div>
                <div className="bg-green-50 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {gpsData.speed.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">km/h</p>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Location</h2>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-blue-50 rounded p-1.5">
                    <p className="text-xs text-gray-600">Lat</p>
                    <p className="text-xs font-mono font-semibold text-gray-900">
                      {gpsData.latitude.toFixed(4)}°
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded p-1.5">
                    <p className="text-xs text-gray-600">Lng</p>
                    <p className="text-xs font-mono font-semibold text-gray-900">
                      {gpsData.longitude.toFixed(4)}°
                    </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {(tripDistance / 1000).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-1">kilometers</p>
                {pathPoints.length > 0 && (
                  <p className="text-xs text-purple-600 mt-1">{pathPoints.length} points</p>
                )}
              </div>
            </div>

            {/* Rate Configuration Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <h2 className="text-xs font-semibold text-gray-800">Pricing Setup</h2>
              </div>

              {isEditingPricing ? (
                <div className="space-y-2">
                  <div className="bg-orange-50 rounded p-2 space-y-2">
                    {/* Pricing Model Selector */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Pricing Model
                      </label>
                      <select
                        value={tempPricing.model}
                        onChange={(e) => setTempPricing({...tempPricing, model: e.target.value as PricingModel})}
                        className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                      >
                        <option value="day-based">Day-Based + Extra km</option>
                        <option value="fixed-100km">Fixed Base + Extra km</option>
                        <option value="per-km">Per Kilometer</option>
                      </select>
                    </div>

                    {/* Day-Based Model Fields */}
                    {tempPricing.model === 'day-based' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            First Day Rate (LKR)
                          </label>
                          <input
                            type="number"
                            value={tempPricing.baseDayRate}
                            onChange={(e) => setTempPricing({...tempPricing, baseDayRate: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="1"
                            step="100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Extra Day Rate (LKR)
                          </label>
                          <input
                            type="number"
                            value={tempPricing.extraDayRate}
                            onChange={(e) => setTempPricing({...tempPricing, extraDayRate: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="0"
                            step="100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Free km/Day
                          </label>
                          <input
                            type="number"
                            value={tempPricing.includedKmPerDay}
                            onChange={(e) => setTempPricing({...tempPricing, includedKmPerDay: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="0"
                            step="10"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Extra km Rate (LKR)
                          </label>
                          <input
                            type="number"
                            value={tempPricing.extraKmRate}
                            onChange={(e) => setTempPricing({...tempPricing, extraKmRate: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="1"
                            step="5"
                          />
                        </div>
                      </>
                    )}

                    {/* Fixed 100km Model Fields */}
                    {tempPricing.model === 'fixed-100km' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Fixed Base Price (LKR)
                          </label>
                          <input
                            type="number"
                            value={tempPricing.fixedBasePrice}
                            onChange={(e) => setTempPricing({...tempPricing, fixedBasePrice: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="1"
                            step="100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Included Kilometers
                          </label>
                          <input
                            type="number"
                            value={tempPricing.includedKmTotal}
                            onChange={(e) => setTempPricing({...tempPricing, includedKmTotal: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="0"
                            step="10"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Extra km Rate (LKR)
                          </label>
                          <input
                            type="number"
                            value={tempPricing.fixedExtraKmRate}
                            onChange={(e) => setTempPricing({...tempPricing, fixedExtraKmRate: Number(e.target.value)})}
                            className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                            min="1"
                            step="5"
                          />
                        </div>
                      </>
                    )}

                    {/* Per-km Model Fields */}
                    {tempPricing.model === 'per-km' && (
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Rate per Kilometer (LKR)
                        </label>
                        <input
                          type="number"
                          value={tempPricing.perKmRate}
                          onChange={(e) => setTempPricing({...tempPricing, perKmRate: Number(e.target.value)})}
                          className="w-full px-2 py-1 text-xs border-2 border-orange-300 rounded focus:outline-none focus:border-orange-500"
                          min="1"
                          step="5"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handlePricingUpdate}
                      className="flex-1 bg-orange-600 text-white py-1 text-xs rounded font-semibold hover:bg-orange-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPricing(false);
                        setTempPricing(pricingConfig);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-1 text-xs rounded font-semibold hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-1 mb-2">
                    <div className="bg-orange-100 rounded p-1.5 border-2 border-orange-300">
                      <div className="text-center">
                        <span className="text-xs font-bold text-orange-700">
                          {getPricingModelName(pricingConfig.model)}
                        </span>
                      </div>
                    </div>

                    {pricingConfig.model === 'day-based' && (
                      <>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">1st Day:</span>
                            <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.baseDayRate}</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Extra Days:</span>
                            <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.extraDayRate}</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Free km/day:</span>
                            <span className="text-xs font-bold text-orange-600">{pricingConfig.includedKmPerDay} km</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Extra km:</span>
                            <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.extraKmRate}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {pricingConfig.model === 'fixed-100km' && (
                      <>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Base Price:</span>
                            <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.fixedBasePrice}</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Includes:</span>
                            <span className="text-xs font-bold text-orange-600">{pricingConfig.includedKmTotal} km</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Extra km:</span>
                            <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.fixedExtraKmRate}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {pricingConfig.model === 'per-km' && (
                      <div className="bg-orange-50 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Rate/km:</span>
                          <span className="text-xs font-bold text-orange-600">LKR {pricingConfig.perKmRate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingPricing(true);
                      setTempPricing(pricingConfig);
                    }}
                    disabled={tripActive}
                    className="w-full bg-orange-600 text-white py-1 text-xs rounded font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {tripActive ? 'Trip Active' : 'Edit Pricing'}
                  </button>
                </div>
              )}
            </div>

            {/* Billing Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-3 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                <h2 className="text-xs font-semibold">Total Cost</h2>
              </div>
              <div className="bg-white/20 backdrop-blur rounded p-3">
                {tripActive && tripStartTime ? (
                  <div className="space-y-1">
                    <div className="text-center border-b border-white/30 pb-2 mb-2">
                      <p className="text-3xl font-bold">
                        LKR {totalCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-xs space-y-1">
                      {pricingConfig.model === 'day-based' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Days:</span>
                            <span className="font-semibold">
                              {Math.ceil((Date.now() - tripStartTime) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Day Charges:</span>
                            <span className="font-semibold">LKR {costBreakdown.dayCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Included km:</span>
                            <span className="font-semibold">{costBreakdown.includedKm.toFixed(2)} km</span>
                          </div>
                        </>
                      )}

                      {pricingConfig.model === 'fixed-100km' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Base Price:</span>
                            <span className="font-semibold">LKR {costBreakdown.dayCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Included km:</span>
                            <span className="font-semibold">{costBreakdown.includedKm.toFixed(2)} km</span>
                          </div>
                        </>
                      )}

                      {pricingConfig.model === 'per-km' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Distance:</span>
                            <span className="font-semibold">{(tripDistance / 1000).toFixed(2)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-100">Rate/km:</span>
                            <span className="font-semibold">LKR {pricingConfig.perKmRate}</span>
                          </div>
                        </>
                      )}

                      {costBreakdown.extraKm > 0 && pricingConfig.model !== 'per-km' && (
                        <>
                          <div className="flex justify-between text-yellow-200">
                            <span>Extra km:</span>
                            <span className="font-semibold">{costBreakdown.extraKm.toFixed(2)} km</span>
                          </div>
                          <div className="flex justify-between text-yellow-200">
                            <span>Extra Charges:</span>
                            <span className="font-semibold">LKR {costBreakdown.extraKmCharges.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      LKR 0.00
                    </p>
                    <p className="text-xs text-blue-200 mt-2 italic">Start trip to begin billing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Maintenance Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-semibold text-gray-800">Maintenance</h2>
                </div>
                <button
                  onClick={() => setIsEditingMaintenance(!isEditingMaintenance)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {isEditingMaintenance ? 'Cancel' : 'Settings'}
                </button>
              </div>

              {isEditingMaintenance ? (
                <div className="space-y-2">
                  <div className="bg-purple-50 rounded p-2 space-y-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Service Interval (km)
                      </label>
                      <input
                        type="number"
                        value={serviceInterval}
                        onChange={(e) => setServiceInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500"
                        min="100"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Oil Change Interval (km)
                      </label>
                      <input
                        type="number"
                        value={oilChangeInterval}
                        onChange={(e) => setOilChangeInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500"
                        min="100"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Brake Check Interval (km)
                      </label>
                      <input
                        type="number"
                        value={brakeCheckInterval}
                        onChange={(e) => setBrakeCheckInterval(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500"
                        min="100"
                        step="100"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingMaintenance(false)}
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                  >
                    Save Settings
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-purple-50 rounded p-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-700">Total Odometer:</span>
                      <span className="font-bold text-purple-700">
                        {(totalOdometerKm + tripDistance / 1000).toFixed(2)} km
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Service Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSinceService = totalKm - lastServiceKm;
                      const kmUntilService = serviceInterval - kmSinceService;
                      const progress = (kmSinceService / serviceInterval) * 100;
                      const isOverdue = kmSinceService >= serviceInterval;
                      const isWarning = kmUntilService <= warningThreshold && !isOverdue;

                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Service:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>
                              {Math.floor(kmSinceService)} / {serviceInterval} km
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          {(isOverdue || isWarning) && (
                            <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isOverdue ? `OVERDUE by ${Math.floor(kmSinceService - serviceInterval)} km!` : `Due in ${Math.floor(kmUntilService)} km`}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Oil Change Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSinceOil = totalKm - lastOilChangeKm;
                      const kmUntilOil = oilChangeInterval - kmSinceOil;
                      const progress = (kmSinceOil / oilChangeInterval) * 100;
                      const isOverdue = kmSinceOil >= oilChangeInterval;
                      const isWarning = kmUntilOil <= warningThreshold && !isOverdue;

                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Oil Change:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>
                              {Math.floor(kmSinceOil)} / {oilChangeInterval} km
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          {(isOverdue || isWarning) && (
                            <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isOverdue ? `OVERDUE by ${Math.floor(kmSinceOil - oilChangeInterval)} km!` : `Due in ${Math.floor(kmUntilOil)} km`}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Brake Check Status */}
                    {(() => {
                      const totalKm = totalOdometerKm + tripDistance / 1000;
                      const kmSinceBrake = totalKm - lastBrakeCheckKm;
                      const kmUntilBrake = brakeCheckInterval - kmSinceBrake;
                      const progress = (kmSinceBrake / brakeCheckInterval) * 100;
                      const isOverdue = kmSinceBrake >= brakeCheckInterval;
                      const isWarning = kmUntilBrake <= warningThreshold && !isOverdue;

                      return (
                        <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 font-medium">Brake Check:</span>
                            <span className={`font-bold ${isOverdue ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>
                              {Math.floor(kmSinceBrake)} / {brakeCheckInterval} km
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${isOverdue ? 'bg-red-600' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          {(isOverdue || isWarning) && (
                            <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isOverdue ? `OVERDUE by ${Math.floor(kmSinceBrake - brakeCheckInterval)} km!` : `Due in ${Math.floor(kmUntilBrake)} km`}
                            </p>
                          )}
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
                <button
                  onClick={() => setIsEditingSpeedLimit(!isEditingSpeedLimit)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {isEditingSpeedLimit ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="space-y-2">
                {!isEditingSpeedLimit ? (
                  <>
                    <div className={`rounded p-3 text-center ${showSpeedAlert ? 'bg-red-100 animate-pulse' : 'bg-gray-50'}`}>
                      <p className={`text-2xl font-bold ${showSpeedAlert ? 'text-red-600' : 'text-gray-800'}`}>
                        {speedLimit}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">km/h limit</p>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded text-xs">
                      <span className="text-gray-700">Current Speed:</span>
                      <span className={`font-bold ${showSpeedAlert ? 'text-red-600' : 'text-blue-700'}`}>
                        {gpsData.speed.toFixed(1)} km/h
                      </span>
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
                    <input
                      type="number"
                      value={speedLimit}
                      onChange={(e) => setSpeedLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Speed Limit (km/h)"
                      min="0"
                    />
                    <button
                      onClick={() => setIsEditingSpeedLimit(false)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Save Limit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3 lg:overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
            <div className="bg-white rounded-lg shadow-lg p-3 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">Live Tracking Map</h2>
                {tripActive && pathPoints.length > 1 && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                    🚗 Tracking Route
                  </span>
                )}
              </div>
              <div className="rounded-lg overflow-hidden shadow-inner flex-1">
                <LiveMap
                  currentPosition={{ lat: gpsData.latitude, lng: gpsData.longitude }}
                  pathPoints={pathPoints}
                  isTracking={tripActive}
                  mapStyle={mapStyle}
                  onMapStyleChange={setMapStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Modal */}
      {showBill && currentTripData && (
        <TripBill tripData={currentTripData} onClose={() => setShowBill(false)} />
      )}
    </div>
  );
}