import { useState, useEffect } from 'react';
import { Navigation, MapPin, Gauge, Clock, ArrowLeft, Loader2, ShieldCheck, Car } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../ui/utils';
import { getDocument } from '../../firebase';

interface LiveTrackingPageProps {
  bookingId: string;
  onBack: () => void;
}

export function LiveTrackingPage({ bookingId, onBack }: LiveTrackingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [tripData, setTripData] = useState({
    currentSpeed: 0,
    totalDistance: 0,
    duration: 0,
    currentLocation: { lat: 6.9271, lng: 79.8612 }, // Colombo default
    route: [] as any[]
  });

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const bookingData = await getDocument('bookings', bookingId) as any;
      if (bookingData) {
        setBooking(bookingData);
        if (bookingData.vehicleId) {
          const vehicleData = await getDocument('vehicles', bookingData.vehicleId) as any;
          setVehicle(vehicleData);
        }
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate real-time tracking
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setTripData(prev => ({
        ...prev,
        currentSpeed: Math.floor(Math.random() * 80) + 20,
        totalDistance: prev.totalDistance + 0.1,
        duration: prev.duration + 1,
        currentLocation: {
          lat: prev.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.currentLocation.lng + (Math.random() - 0.5) * 0.001
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground font-bold italic tracking-widest">ESTABLISHING ENCRYPTED SAT-LINK...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2">
        <div className="flex items-center gap-6">
          <Button variant="outline" onClick={onBack} className="rounded-full w-12 h-12 p-0 border-2 hover:bg-slate-900 hover:text-white transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Tactical Telemetry</h2>
            <p className="text-muted-foreground font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Live Secure Feed — Booking #{bookingId.toUpperCase().slice(0, 8)}
            </p>
          </div>
        </div>
        {vehicle && (
          <div className="bg-white border-2 border-accent/20 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Car className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Target Vehicle</p>
              <h4 className="font-black text-gray-900 uppercase leading-none">{vehicle.brand} {vehicle.model}</h4>
              <p className="text-[10px] font-mono font-bold text-accent mt-1">{vehicle.licensePlate}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 shadow-lg group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <Gauge className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Velocity</div>
                <div className="text-2xl font-black tracking-tighter">{tripData.currentSpeed} <span className="text-xs">KM/H</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Odometry</div>
                <div className="text-2xl font-black tracking-tighter">{tripData.totalDistance.toFixed(1)} <span className="text-xs">KM</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trip Time</div>
                <div className="text-2xl font-black tracking-tighter uppercase text-sm">{formatDuration(tripData.duration)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accrued Cost</div>
                <div className="text-2xl font-black tracking-tighter">{formatCurrency(tripData.totalDistance * (vehicle?.pricePerKm || 150) + (booking?.estimatedCost || 24000))}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Implementation Simulation */}
      <Card className="shadow-2xl border-4 border-slate-900 rounded-3xl overflow-hidden relative group">
        <CardContent className="p-0">
          <div className="w-full h-[500px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
            {/* Mock Map Background Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="text-center z-10 p-12 bg-white/80 backdrop-blur-md rounded-3xl border-2 shadow-2xl scale-110">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-accent animate-ping rounded-full opacity-20" />
                <MapPin className="h-20 w-20 mx-auto text-accent drop-shadow-2xl relative" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">LIVE SAT-LOCATOR</h3>
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.3em] mb-6">
                COORD: {tripData.currentLocation.lat.toFixed(6)}N | {tripData.currentLocation.lng.toFixed(6)}E
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <p className="text-[8px] font-black uppercase opacity-50 mb-1">SIGNAL</p>
                  <p className="text-xs font-bold text-green-400">OPTIMAL (98%)</p>
                </div>
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <p className="text-[8px] font-black uppercase opacity-50 mb-1">LATENCY</p>
                  <p className="text-xs font-bold text-green-400">12ms</p>
                </div>
              </div>
            </div>

            {/* Simulated UI Overlays */}
            <div className="absolute top-8 left-8 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/10 hidden md:block">
              <p className="text-[10px] font-black uppercase opacity-50">STATUS</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-bold">VEHICLE OPERATIONAL</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-2 shadow-xl rounded-3xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <h3 className="text-xl font-black uppercase tracking-tighter">TRIP DIAGNOSTICS</h3>
              <div className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">Real-time breakdown</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Pricing Log</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group/item p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <span className="text-xs font-bold text-slate-500 uppercase">Base Reservation Rate</span>
                    <span className="font-mono font-black">{formatCurrency(booking?.estimatedCost || 24000)}</span>
                  </div>
                  <div className="flex justify-between items-center group/item p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Distance Accumulation</span>
                      <span className="text-[9px] font-bold text-accent uppercase">{tripData.totalDistance.toFixed(2)} KM × {formatCurrency(vehicle?.pricePerKm || 150)}</span>
                    </div>
                    <span className="font-mono font-black">{formatCurrency(tripData.totalDistance * (vehicle?.pricePerKm || 150))}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-xl mt-6">
                    <span className="text-xs font-black uppercase text-accent tracking-tighter italic">Aggregate Total</span>
                    <span className="text-xl font-black text-white">{formatCurrency(tripData.totalDistance * (vehicle?.pricePerKm || 150) + (booking?.estimatedCost || 24000))}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Mission Meta</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Internal Reference</p>
                    <p className="text-sm font-bold font-mono uppercase tracking-tighter">{bookingId}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Start Timestamp</p>
                    <p className="text-sm font-bold">{new Date().toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Dynamic Mean Velocity</p>
                    <p className="text-sm font-bold">{Math.floor(tripData.totalDistance / (tripData.duration / 3600) || 0)} KM/H</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Sidebar */}
        <Card className="border-4 border-slate-900 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden text-white h-fit">
          <CardContent className="p-8">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-8 italic">Quick Protocols</h3>
            <div className="space-y-4">
              <Button className="w-full bg-white text-slate-900 font-black h-14 rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl shadow-white/5">
                SOS EMERGENCY
              </Button>
              <Button variant="outline" className="w-full border-2 border-white/20 font-black h-14 rounded-2xl hover:bg-white/10 transition-all">
                CONTACT FLEET COMMAND
              </Button>
              <Button variant="outline" className="w-full border-2 border-white/20 font-black h-14 rounded-2xl hover:bg-white/10 transition-all">
                EXTEND RESERVATION
              </Button>
            </div>
            <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">System Health</p>
              </div>
              <p className="text-[9px] font-bold text-slate-400">All subsystems are performing within standard operating parameters. GPS accuracy: ±3m.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
