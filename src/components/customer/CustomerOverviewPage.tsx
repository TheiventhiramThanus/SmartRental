import { useState, useEffect } from 'react';
import { Calendar, Car, DollarSign, CreditCard, Clock, MapPin, Navigation, Phone, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../ui/utils';
import { getDocuments, where } from '../../firebase';

interface CustomerOverviewPageProps {
  user: any;
  onNavigate: (page: string) => void;
}

export function CustomerOverviewPage({ user, onNavigate }: CustomerOverviewPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeRental: false,
    totalSpend: 0,
    pendingPayments: 0
  });
  const [activeRental, setActiveRental] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [recommendedCars, setRecommendedCars] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Fetch user specific data
      const [userBookings, userPayments, allVehicles] = await Promise.all([
        getDocuments('bookings', where('customerId', '==', user.id)),
        getDocuments('payments', where('customerId', '==', user.id)),
        getDocuments('vehicles')
      ]);

      const ongoing = userBookings.find((b: any) => b.status === 'Ongoing');
      const totalSpendValue = userPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

      setStats({
        totalBookings: userBookings.length,
        activeRental: !!ongoing,
        totalSpend: totalSpendValue,
        pendingPayments: userBookings.filter((b: any) => b.status === 'Approved').length
      });

      setActiveRental(ongoing);

      // Get recommended cars (available ones)
      const recommendations = allVehicles
        .filter((v: any) => v.status === 'Available')
        .slice(0, 3)
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          image: v.mainImage || 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400',
          pricePerDay: v.pricePerDay || 20000,
          rating: v.rating || 4.8
        }));

      setRecommendedCars(recommendations);

    } catch (error) {
      console.error('Error fetching customer overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate real-time updates for active rental
  useEffect(() => {
    if (activeRental) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
        setDistance(prev => prev + 0.1);
        setCurrentCost(prev => prev + 6); // roughly 6 LKR per second in simulation
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeRental]);

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground font-medium">Here's your rental overview</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg" onClick={() => onNavigate('cars')}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-accent shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Total Bookings</p>
                <h2 className="text-2xl font-bold mt-2">{stats.totalBookings}</h2>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-md ${stats.activeRental ? 'border-l-green-500' : 'border-l-gray-300'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Active Rental</p>
                <h2 className="text-2xl font-bold mt-2">{stats.activeRental ? 'Yes' : 'No'}</h2>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.activeRental ? 'bg-green-500/10' : 'bg-gray-500/10'
                }`}>
                <Car className={`h-6 w-6 ${stats.activeRental ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Total Spend</p>
                <h2 className="text-2xl font-bold mt-2">{formatCurrency(stats.totalSpend)}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-bold">Pending Actions</p>
                <h2 className="text-2xl font-bold mt-2">{stats.pendingPayments}</h2>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Rental Card */}
      {activeRental && (
        <Card className="border-accent border-2 shadow-xl bg-accent/[0.02]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Active Rental</h3>
                <p className="text-sm text-muted-foreground font-medium">{activeRental.carName || activeRental.vehicleName}</p>
              </div>
              <Badge className="bg-green-500 animate-pulse font-bold px-3 py-1">Ongoing</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              {/* Pickup Info */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground italic">Pickup Details</h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2 bg-white p-2 rounded-lg border">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="font-bold">{activeRental.pickupDate} <span className="text-muted-foreground ml-1">at {activeRental.pickupTime}</span></span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border">
                    <MapPin className="h-4 w-4 text-accent mt-0.5" />
                    <span className="font-medium text-muted-foreground text-xs leading-relaxed">{activeRental.pickupLocation}</span>
                  </div>
                </div>
              </div>

              {/* Return Info */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground italic">Return Target</h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2 bg-white p-2 rounded-lg border">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="font-bold">{activeRental.returnDate} <span className="text-muted-foreground ml-1">at {activeRental.returnTime}</span></span>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border">
                    <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span className="font-medium text-muted-foreground text-xs leading-relaxed">{activeRental.returnLocation}</span>
                  </div>
                </div>
              </div>

              {/* Live Stats */}
              <div className="space-y-3 bg-white p-4 rounded-xl shadow-inner border border-secondary">
                <h4 className="text-xs uppercase tracking-wider font-bold text-accent">Live Telemetry</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Uptime</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{formatDuration(duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Navigation className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">ODO</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{distance.toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">ACCRUED</span>
                    </div>
                    <span className="text-accent font-bold text-lg">{formatCurrency(currentCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-6 shadow-md shadow-accent/20">
                Extend Rental
              </Button>
              <Button variant="outline" className="font-bold border-2">
                <Phone className="mr-2 h-4 w-4" />
                Emergency Support
              </Button>
              <Button variant="outline" className="font-bold border-2" onClick={() => onNavigate('bookings')}>
                Full History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent/20" onClick={() => onNavigate('bookings')}>
          <CardContent className="p-8 text-center bg-white rounded-xl">
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-16 w-16 mx-auto text-accent bg-accent/5 p-3 rounded-2xl" />
            </div>
            <h3 className="text-lg font-bold mb-2">My Bookings</h3>
            <p className="text-sm text-muted-foreground font-medium">Manage active and past reservations</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent/20" onClick={() => onNavigate('payments')}>
          <CardContent className="p-8 text-center bg-white rounded-xl">
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-16 w-16 mx-auto text-accent bg-accent/5 p-3 rounded-2xl" />
            </div>
            <h3 className="text-lg font-bold mb-2">Billing</h3>
            <p className="text-sm text-muted-foreground font-medium">Invoices and payment transaction logs</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent/20" onClick={() => onNavigate('profile')}>
          <CardContent className="p-8 text-center bg-white rounded-xl">
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Car className="h-16 w-16 mx-auto text-accent bg-accent/5 p-3 rounded-2xl" />
            </div>
            <h3 className="text-lg font-bold mb-2">My Profile</h3>
            <p className="text-sm text-muted-foreground font-medium">Identity verification & preferences</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Cars */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 bg-secondary/30 border-b">
            <h3 className="text-xl font-bold">Recommended for You</h3>
            <p className="text-sm text-muted-foreground mt-1">Based on availability and top ratings</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCars.map((car) => (
                <div key={car.id} className="group bg-white border-2 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-secondary">
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md border border-secondary">
                      <span className="text-yellow-500">★</span>
                      <span>{car.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-bold mb-3">{car.name}</h4>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-accent">
                        <span className="text-xl font-black">{formatCurrency(car.pricePerDay)}</span>
                        <span className="text-[10px] font-bold opacity-70 ml-1">/DAY</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20"
                      size="sm"
                      onClick={() => onNavigate('cars')}
                    >
                      Instant Book
                    </Button>
                  </div>
                </div>
              ))}
              {recommendedCars.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground italic">
                  No recommendations available at the moment.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
