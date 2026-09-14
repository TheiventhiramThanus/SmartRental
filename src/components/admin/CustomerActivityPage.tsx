import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../ui/utils';
import { getDocuments } from '../../firebase';

interface CustomerActivityPageProps {
  gpsVehicleId?: string;
  gpsVehicleName?: string;
}

export function CustomerActivityPage({ gpsVehicleId, gpsVehicleName }: CustomerActivityPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    newCustomers: 0,
    cancellations: 0,
    revenue: 0
  });

  const [bookingsPerDay, setBookingsPerDay] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [mostRentedVehicles, setMostRentedVehicles] = useState<any[]>([]);
  const [usageRate, setUsageRate] = useState({
    rented: 0,
    available: 0,
    maintenance: 0,
    total: 0
  });

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setIsLoading(true);
      const [bookings, users, vehicles] = await Promise.all([
        getDocuments('bookings'),
        getDocuments('users'),
        getDocuments('vehicles')
      ]);

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Daily Stats
      const todayBookings = bookings.filter(b => (b.createdAt || b.startDate)?.startsWith(today));
      const newCustomers = users.filter(u => u.role === 'customer' && u.joinDate?.startsWith(today.substring(0, 7))).length;
      const cancellations = bookings.filter(b => b.status === 'Cancelled' && (b.updatedAt || b.createdAt)?.startsWith(today)).length;
      const revenueToday = todayBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

      setStats({
        totalBookingsToday: todayBookings.length,
        newCustomers,
        cancellations,
        revenue: revenueToday
      });

      // Bookings Per Day (Last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayLabel = days[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];
        const count = bookings.filter(b => (b.createdAt || b.startDate)?.startsWith(dateStr)).length;
        return { day: dayLabel, bookings: count };
      });
      setBookingsPerDay(last7Days);

      // Top Customers
      const customerStats: Record<string, { name: string, bookings: number, spent: number }> = {};
      bookings.forEach(b => {
        if (!customerStats[b.customerId]) {
          customerStats[b.customerId] = { name: b.customerName, bookings: 0, spent: 0 };
        }
        customerStats[b.customerId].bookings += 1;
        customerStats[b.customerId].spent += (parseFloat(b.totalAmount) || 0);
      });
      const sortedCustomers = Object.values(customerStats)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);
      setTopCustomers(sortedCustomers);

      // Most Rented Vehicles
      const vehicleStats: Record<string, { name: string, bookings: number, revenue: number }> = {};
      bookings.forEach(b => {
        const vehicleId = b.vehicleId || b.carId;
        const vehicleName = b.vehicleName || b.carName;
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = { name: vehicleName, bookings: 0, revenue: 0 };
        }
        vehicleStats[vehicleId].bookings += 1;
        vehicleStats[vehicleId].revenue += (parseFloat(b.totalAmount) || 0);
      });
      const sortedVehicles = Object.values(vehicleStats)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4);
      setMostRentedVehicles(sortedVehicles);

      // Usage Rate
      const rented = vehicles.filter(v => v.status === 'Rented' || v.status === 'Booked').length;
      const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;
      const available = vehicles.filter(v => v.status === 'Available').length;
      setUsageRate({
        rented,
        maintenance,
        available,
        total: vehicles.length
      });

    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxBookings = Math.max(...bookingsPerDay.map(d => d.bookings), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading customer insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-600">Customer Activity Insights</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookings Today</p>
                <h2 className="text-2xl font-bold mt-2">{stats.totalBookingsToday}</h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Customers</p>
                <h2 className="text-2xl font-bold mt-2">{stats.newCustomers}</h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancellations</p>
                <h2 className="text-2xl font-bold mt-2 text-red-600">{stats.cancellations}</h2>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
                <h2 className="text-2xl font-bold mt-2 text-blue-600">{formatCurrency(stats.revenue)}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Bookings Per Day (Last 7 Days)</h3>
          <div className="space-y-4">
            {bookingsPerDay.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{day.day}</div>
                <div className="flex-1 bg-secondary rounded-full h-8 relative">
                  <div
                    className="bg-red-600 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${(day.bookings / maxBookings) * 100}%` }}
                  >
                    <span className="text-sm font-semibold text-white">{day.bookings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Top Customers</h3>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{customer.name}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{customer.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{formatCurrency(customer.spent)}</div>
                    <div className="text-xs text-muted-foreground font-medium">Lifetime</div>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && <p className="text-center py-4 text-muted-foreground">No customer data available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Most Rented Vehicles */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Most Rented Vehicles</h3>
            <div className="space-y-3">
              {mostRentedVehicles.map((vehicle, index) => (
                <div key={vehicle.name} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{vehicle.name}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{vehicle.bookings} rentals</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{formatCurrency(vehicle.revenue)}</div>
                    <div className="text-xs text-muted-foreground font-medium">Total Revenue</div>
                  </div>
                </div>
              ))}
              {mostRentedVehicles.length === 0 && <p className="text-center py-4 text-muted-foreground">No vehicle data available</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Usage Rate */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-6 text-center">Vehicle Fleet Utilization</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-36 h-36 mx-auto relative mb-4">
                <div className="absolute inset-0 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {usageRate.total ? Math.round((usageRate.rented / usageRate.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold">Active Utilization</h4>
              <p className="text-sm text-muted-foreground font-medium">{usageRate.rented} out of {usageRate.total} rented</p>
            </div>

            <div className="text-center group">
              <div className="w-36 h-36 mx-auto relative mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {usageRate.total ? Math.round((usageRate.available / usageRate.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold">Fleet Availability</h4>
              <p className="text-sm text-muted-foreground font-medium">{usageRate.available} vehicles ready</p>
            </div>

            <div className="text-center group">
              <div className="w-36 h-36 mx-auto relative mb-4">
                <div className="absolute inset-0 bg-amber-100 rounded-full group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {usageRate.total ? Math.round((usageRate.maintenance / usageRate.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold">Maintenance Rate</h4>
              <p className="text-sm text-muted-foreground font-medium">{usageRate.maintenance} in service</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
