import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../../firebase';
import { TripBill } from './TripBill';
import { Clock, MapPin, ChevronDown, ChevronUp, Receipt, Loader2, Route, Calendar } from 'lucide-react';

interface TripRecord {
  tripId: string;
  startTime: number;
  endTime: number;
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  distance: number;
  amount: number;
  status: 'started' | 'completed';
  pricingModel?: string;
  baseDayRate?: number;
  includedKmPerDay?: number;
  extraKmRate?: number;
  dayCharges?: number;
  extraKm?: number;
  extraKmCharges?: number;
  fixedBasePrice?: number;
  includedKmTotal?: number;
  ratePerKm?: number;
  tripDays?: number;
  pathPoints?: { lat: number; lng: number }[];
}

interface TripHistoryProps {
  vehicleId: string;
  vehicleName: string;
}

export function TripHistory({ vehicleId, vehicleName }: TripHistoryProps) {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [selectedBillTrip, setSelectedBillTrip] = useState<TripRecord | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const tripsRef = ref(rtdb, `tracking/${vehicleId}/TRIPS`);
    const unsub = onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: TripRecord[] = Object.entries(data)
          .map(([key, val]: [string, any]) => ({ tripId: key, ...val }))
          // Only completed trips that have a bill amount
          .filter((t: TripRecord) => t.status === 'completed' && t.amount > 0);
        list.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
        setTrips(list);
      } else {
        setTrips([]);
      }
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, [vehicleId]);

  const totalRevenue = trips.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);

  const fmt = (ts: number) =>
    ts ? new Date(ts).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const duration = (start: number, end: number) => {
    if (!start || !end) return '—';
    const ms = end - start;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const toBillData = (trip: TripRecord) => ({
    tripId: trip.tripId,
    startTime: trip.startTime,
    endTime: trip.endTime,
    startLocation: { lat: trip.startLat, lng: trip.startLng },
    endLocation: { lat: trip.endLat ?? trip.startLat, lng: trip.endLng ?? trip.startLng },
    distance: trip.distance || 0,
    ratePerKm: trip.ratePerKm || 0,
    totalCost: trip.amount || 0,
    pricingModel: trip.pricingModel as any,
    baseDayRate: trip.baseDayRate,
    includedKmPerDay: trip.includedKmPerDay,
    extraKmRate: trip.extraKmRate,
    dayCharges: trip.dayCharges,
    extraKm: trip.extraKm,
    extraKmCharges: trip.extraKmCharges,
    fixedBasePrice: trip.fixedBasePrice,
    includedKmTotal: trip.includedKmTotal,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading trip history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-gray-400">Trips</p>
          <p className="text-2xl font-bold text-gray-800">{trips.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-gray-400">Distance</p>
          <p className="text-2xl font-bold text-blue-600">{(totalDistance / 1000).toFixed(1)}</p>
          <p className="text-[10px] text-gray-400">km</p>
        </div>
        <div className="rounded-xl shadow-sm border border-blue-100 p-3 text-center"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4338ca)' }}>
          <p className="text-[10px] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Revenue</p>
          <p className="text-xl font-bold text-white">LKR {totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Trip List */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No completed trip bills yet</p>
          <p className="text-xs text-gray-400 mt-1">Complete a trip to see its bill here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip, index) => {
            const isExpanded = expandedTrip === trip.tripId;
            const distKm = (trip.distance || 0) / 1000;

            return (
              <div key={trip.tripId} className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">

                {/* Header Row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedTrip(isExpanded ? null : trip.tripId)}
                >
                  <div className="flex items-center gap-3">
                    {/* Trip number */}
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {trips.length - index}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">
                          {new Date(trip.startTime).toLocaleDateString('en-LK', { dateStyle: 'medium' })}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          ✓ BILLED
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {duration(trip.startTime, trip.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Route className="w-3 h-3" />
                          {distKm.toFixed(2)} km
                        </span>
                        {trip.tripDays && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {trip.tripDays}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-blue-700">LKR {trip.amount.toFixed(0)}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{trip.pricingModel || 'per-km'}</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Duration</p>
                        <p className="text-sm font-bold text-gray-700 mt-0.5">{duration(trip.startTime, trip.endTime)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Distance</p>
                        <p className="text-sm font-bold text-gray-700 mt-0.5">{distKm.toFixed(2)} km</p>
                      </div>
                    </div>

                    {/* Time bar */}
                    <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Start</p>
                        <p className="text-gray-700 font-semibold mt-0.5">{fmt(trip.startTime)}</p>
                      </div>
                      <div className="text-blue-300 text-lg">→</div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">End</p>
                        <p className="text-gray-700 font-semibold mt-0.5">{fmt(trip.endTime)}</p>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-green-500" /> Start
                        </p>
                        <p className="text-xs font-mono text-blue-600 mt-0.5">
                          {trip.startLat.toFixed(4)}, {trip.startLng.toFixed(4)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-red-500" /> End
                        </p>
                        <p className="text-xs font-mono text-blue-600 mt-0.5">
                          {trip.endLat ? `${trip.endLat.toFixed(4)}, ${trip.endLng?.toFixed(4)}` : '—'}
                        </p>
                      </div>
                    </div>

                    {trip.pathPoints && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.pathPoints.length} GPS waypoints recorded
                      </p>
                    )}

                    {/* Bill CTA */}
                    <div className="flex items-center justify-between rounded-xl p-3 border border-blue-100"
                      style={{ background: 'linear-gradient(135deg,#eff6ff,#eef2ff)' }}>
                      <div>
                        <p className="text-xs text-gray-500">
                          {trip.pricingModel === 'day-based' && `Day charges + extra km`}
                          {trip.pricingModel === 'fixed-100km' && `Fixed base + extra km`}
                          {trip.pricingModel === 'per-km' && `${distKm.toFixed(2)} km × LKR ${trip.ratePerKm}/km`}
                        </p>
                        <p className="text-xl font-bold text-blue-700">LKR {trip.amount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedBillTrip(trip)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition"
                      >
                        <Receipt className="w-4 h-4" />
                        View Bill
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-gray-300 text-right">ID: {trip.tripId}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Modal */}
      {selectedBillTrip && (
        <TripBill
          tripData={toBillData(selectedBillTrip)}
          onClose={() => setSelectedBillTrip(null)}
        />
      )}
    </div>
  );
}
