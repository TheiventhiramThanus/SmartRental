import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TripData {
  tripId: string;
  startTime: number;
  endTime: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  distance: number;
  ratePerKm: number;
  totalCost: number;
  pricingModel?: 'day-based' | 'fixed-100km' | 'per-km';
  baseDayRate?: number;
  includedKmPerDay?: number;
  extraKmRate?: number;
  dayCharges?: number;
  extraKm?: number;
  extraKmCharges?: number;
  fixedBasePrice?: number;
  includedKmTotal?: number;
}

interface TripBillProps {
  tripData: TripData;
  onClose: () => void;
}

export function TripBill({ tripData, onClose }: TripBillProps) {
  const [startAddress, setStartAddress] = useState<string>('Loading address...');
  const [endAddress, setEndAddress] = useState<string>('Loading address...');

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SmartCarRental/1.0'
          }
        }
      );
      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    } catch (error) {
      console.error('Error fetching address:', error);
      return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    }
  };

  useEffect(() => {
    const loadAddresses = async () => {
      const startAddr = await getAddressFromCoordinates(
        tripData.startLocation.lat,
        tripData.startLocation.lng
      );
      const endAddr = await getAddressFromCoordinates(
        tripData.endLocation.lat,
        tripData.endLocation.lng
      );
      setStartAddress(startAddr);
      setEndAddress(endAddr);
    };

    loadAddresses();
  }, [tripData.startLocation, tripData.endLocation]);

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-LK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatDuration = (startTime: number, endTime: number) => {
    const durationMs = endTime - startTime;
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getTripDays = () => {
    const durationMs = tripData.endTime - tripData.startTime;
    return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8" id="bill-content">
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Car Rental</h1>
            <p className="text-gray-600">Trip Invoice</p>
            <p className="text-sm text-gray-500 mt-2">Trip ID: {tripData.tripId}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">TRIP START</h3>
              <p className="text-gray-800">{formatDateTime(tripData.startTime)}</p>
              <p className="text-sm text-gray-700 mt-2 font-medium">{startAddress}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tripData.startLocation.lat.toFixed(4)}°, {tripData.startLocation.lng.toFixed(4)}°
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">TRIP END</h3>
              <p className="text-gray-800">{formatDateTime(tripData.endTime)}</p>
              <p className="text-sm text-gray-700 mt-2 font-medium">{endAddress}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tripData.endLocation.lat.toFixed(4)}°, {tripData.endLocation.lng.toFixed(4)}°
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Trip Duration</span>
              <span className="text-gray-900 font-bold">
                {formatDuration(tripData.startTime, tripData.endTime)}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Details</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Pricing Model:</span>
                  <span className="text-blue-700 font-bold">
                    {tripData.pricingModel === 'day-based' && 'Day-Based + Extra km'}
                    {tripData.pricingModel === 'fixed-100km' && 'Fixed Base + Extra km'}
                    {tripData.pricingModel === 'per-km' && 'Per Kilometer'}
                    {!tripData.pricingModel && 'Legacy'}
                  </span>
                </div>
              </div>

              {(tripData.pricingModel === 'day-based' || (!tripData.pricingModel && tripData.baseDayRate)) && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Trip Duration</span>
                    <span className="text-gray-900 font-medium">
                      {getTripDays()} {getTripDays() === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Base Rate per Day</span>
                    <span className="text-gray-900 font-medium">LKR {tripData.baseDayRate?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-gray-700 font-medium">Day Charges</span>
                    <span className="text-gray-900 font-bold">LKR {tripData.dayCharges?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Distance Traveled</span>
                    <span className="text-gray-900 font-medium">
                      {(tripData.distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Included Kilometers</span>
                    <span className="text-gray-900 font-medium">
                      {tripData.includedKmPerDay! * getTripDays()} km ({tripData.includedKmPerDay} km/day)
                    </span>
                  </div>
                  {tripData.extraKm! > 0 && (
                    <>
                      <div className="flex justify-between items-center text-orange-700">
                        <span className="font-medium">Extra Kilometers</span>
                        <span className="font-bold">{tripData.extraKm?.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Extra km Rate</span>
                        <span className="text-gray-900 font-medium">LKR {tripData.extraKmRate?.toFixed(2)}/km</span>
                      </div>
                      <div className="flex justify-between items-center bg-orange-50 p-2 rounded">
                        <span className="text-gray-700 font-medium">Extra km Charges</span>
                        <span className="text-gray-900 font-bold">LKR {tripData.extraKmCharges?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {tripData.pricingModel === 'fixed-100km' && (
                <>
                   <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-gray-700 font-medium">Fixed Base Price</span>
                    <span className="text-gray-900 font-bold">LKR {tripData.fixedBasePrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Included Kilometers</span>
                    <span className="text-gray-900 font-medium">{tripData.includedKmTotal} km</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Distance Traveled</span>
                    <span className="text-gray-900 font-medium">
                      {(tripData.distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  {tripData.extraKm! > 0 && (
                    <>
                      <div className="flex justify-between items-center text-orange-700">
                        <span className="font-medium">Extra Kilometers</span>
                        <span className="font-bold">{tripData.extraKm?.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Extra km Rate</span>
                        <span className="text-gray-900 font-medium">LKR {tripData.extraKmRate?.toFixed(2)}/km</span>
                      </div>
                      <div className="flex justify-between items-center bg-orange-50 p-2 rounded">
                        <span className="text-gray-700 font-medium">Extra km Charges</span>
                        <span className="text-gray-900 font-bold">LKR {tripData.extraKmCharges?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {tripData.pricingModel === 'per-km' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Distance Traveled</span>
                    <span className="text-gray-900 font-medium">
                      {(tripData.distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Rate per Kilometer</span>
                    <span className="text-gray-900 font-medium">LKR {tripData.ratePerKm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-gray-700 font-medium">Total Distance Charges</span>
                    <span className="text-gray-900 font-bold">
                      LKR {((tripData.distance / 1000) * tripData.ratePerKm).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    LKR {tripData.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Thank you for choosing Smart Car Rental</p>
            <p className="mt-1">For support, contact: support@smartcarrental.lk</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Printer className="w-5 h-5" />
            Print Bill
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #bill-content, #bill-content * {
            visibility: visible;
          }
          #bill-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
