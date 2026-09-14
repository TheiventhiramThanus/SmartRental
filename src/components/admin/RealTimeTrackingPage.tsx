import { useState, useEffect } from 'react';
import { MapPin, Navigation, Gauge, AlertTriangle, Car, Radio, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { getDocuments } from '../../firebase';

interface VehicleTrack {
  id: string;
  name: string;
  customer?: string;
  lat: number;
  lng: number;
  speed: number;
  distance: number;
  status: 'normal' | 'speeding';
  location: string;
  startTime: string;
}

export function RealTimeTrackingPage() {
  const [vehicles, setVehicles] = useState<VehicleTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    totalDistanceToday: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [vehiclesData, bookingsData] = await Promise.all([
        getDocuments('vehicles'),
        getDocuments('bookings')
      ]);

      const activeVehiclesList: VehicleTrack[] = vehiclesData
        .filter(v => v.status === 'Rented' || v.status === 'Booked')
        .map((v, index) => {
          const booking = bookingsData.find(b => (b.carId === v.id || b.vehicleId === v.id) && b.status === 'Ongoing');

          return {
            id: v.licensePlate || v.id,
            name: v.name,
            customer: booking?.customerName || 'Customer',
            lat: 6.9271 + (Math.random() - 0.5) * 0.1, // Centered around Colombo
            lng: 79.8612 + (Math.random() - 0.5) * 0.1,
            speed: 0,
            distance: 0,
            status: 'normal',
            location: 'Colombo District',
            startTime: new Date().toISOString()
          };
        });

      setVehicles(activeVehiclesList);
      setStats({
        activeVehicles: activeVehiclesList.length,
        availableVehicles: vehiclesData.filter(v => v.status === 'Available').length,
        totalDistanceToday: 0
      });
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    if (vehicles.length === 0) return;

    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        const newSpeed = Math.floor(Math.random() * 80) + 20;
        const newDistance = vehicle.distance + (newSpeed * (3 / 3600)); // km per 3 seconds
        const status = newSpeed > 75 ? 'speeding' : 'normal';

        return {
          ...vehicle,
          lat: vehicle.lat + (Math.random() - 0.5) * 0.002,
          lng: vehicle.lng + (Math.random() - 0.5) * 0.002,
          speed: newSpeed,
          distance: newDistance,
          status
        };
      }));

      setStats(prev => ({
        ...prev,
        totalDistanceToday: vehicles.reduce((sum, v) => sum + v.distance, 0)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [vehicles.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Initializing live GPS stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-600">Live Fleet Tracking</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">In-Transit</p>
                <h2 className="text-3xl font-bold mt-2">{stats.activeVehicles}</h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Ready to Rent</p>
                <h2 className="text-3xl font-bold mt-2">{stats.availableVehicles}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Fleet Distance (Today)</p>
                <h2 className="text-3xl font-bold mt-2">{stats.totalDistanceToday.toFixed(1)} km</h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Navigation className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Map */}
      <Card className="overflow-hidden border-2 border-secondary shadow-xl">
        <CardContent className="p-0">
          <div className="w-full h-[500px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Dark Mode Map simulation */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-12 grid-rows-12 h-full">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/20"></div>
                ))}
              </div>
            </div>

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
              <path d="M0 100 Q 250 150 500 100 T 1000 100" fill="none" stroke="white" strokeWidth="20" />
              <path d="M100 0 Q 150 250 100 500 T 100 1000" fill="none" stroke="white" strokeWidth="20" />
            </svg>

            {/* Vehicle markers */}
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="absolute transition-all duration-3000 ease-linear"
                style={{
                  left: `${10 + (index * 30) % 80}%`,
                  top: `${20 + (index * 25) % 80}%`,
                }}
              >
                <div className={`relative flex flex-col items-center group cursor-pointer`}>
                  <div className={`p-2 rounded-full shadow-2xl transition-transform hover:scale-125 ${vehicle.status === 'speeding' ? 'bg-red-600 animate-bounce' : 'bg-red-500'}`}>
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-2 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-bold border border-secondary whitespace-nowrap">
                    <p className="text-red-600">{vehicle.id}</p>
                    <p className="text-gray-600 dark:text-gray-300">{vehicle.speed} km/h</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute top-6 left-6 bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="h-5 w-5 text-green-500" />
                  <div className="absolute inset-0 text-green-500 animate-ping shadow-lg rounded-full">
                    <Radio className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-400">System Live</p>
                  <p className="text-[10px] text-white/60">GPS Polling: 3000ms</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 font-mono flex items-center gap-2">
              <Car className="text-red-600" />
              Active Assets
            </h3>
            <Badge variant="outline" className="text-xs font-bold font-mono">
              TOTAL: {vehicles.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className={`p-5 rounded-2xl transition-all border-2 ${vehicle.status === 'speeding'
                  ? 'bg-red-50 border-red-200 shadow-red-100 shadow-lg'
                  : 'bg-white border-secondary hover:border-red-200'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vehicle.status === 'speeding' ? 'bg-red-600' : 'bg-slate-800'} text-white`}>
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{vehicle.name}</h4>
                      <p className="text-xs font-bold text-red-600 font-mono uppercase">{vehicle.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {vehicle.status === 'speeding' && (
                      <Badge className="bg-red-600 animate-pulse text-[10px] font-bold">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        OVERSPEED
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-[10px] font-bold">
                      <Radio className="mr-1 h-3 w-3" />
                      TX ACTIVE
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Speed</p>
                    <div className="flex items-center gap-1.5">
                      <Gauge className={`h-4 w-4 ${vehicle.status === 'speeding' ? 'text-red-600' : 'text-blue-500'}`} />
                      <span className={`text-sm font-bold font-mono ${vehicle.status === 'speeding' ? 'text-red-700' : 'text-gray-900'}`}>
                        {vehicle.speed} <span className="text-[10px] opacity-60">KM/H</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Odometer</p>
                    <div className="flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-bold font-mono text-gray-900">
                        {vehicle.distance.toFixed(1)} <span className="text-[10px] opacity-60">KM</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Zone</p>
                    <div className="flex items-center justify-end gap-1.5">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-bold text-gray-900">{vehicle.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px]">
                  <p className="font-bold text-muted-foreground">DRIVER: <span className="text-gray-900 uppercase">{vehicle.customer}</span></p>
                  <p className="font-mono text-gray-400">{vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</p>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 font-bold">No active rentals being tracked at this moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
