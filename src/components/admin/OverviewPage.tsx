import { useState, useEffect } from 'react';
import { Car, Users, DollarSign, TrendingUp, Calendar, AlertTriangle, Loader2, MapPin, Gauge } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../ui/utils';
import { getDocuments } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';

interface OverviewPageProps {
  gpsVehicleId?: string;
  gpsVehicleName?: string;
}

export function OverviewPage({ gpsVehicleId, gpsVehicleName }: OverviewPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeRentals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    pendingBookings: 0
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Live GPS data for the assigned vehicle
  const [liveOdometer, setLiveOdometer] = useState<number | null>(null);
  const [liveGpsData, setLiveGpsData] = useState<{ lat: number; lng: number; speed: number } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Subscribe to live GPS data for the GPS vehicle
  useEffect(() => {
    if (!gpsVehicleId) return;
    const odomRef = ref(rtdb, `tracking/${gpsVehicleId}/odometer`);
    const gpsRef = ref(rtdb, `tracking/${gpsVehicleId}/GPS`);
    const unsub1 = onValue(odomRef, (snap) => { const v = snap.val(); if (v !== null) setLiveOdometer(parseFloat(v.toFixed(2))); });
    const unsub2 = onValue(gpsRef, (snap) => {
      const d = snap.val();
      if (d) setLiveGpsData({ lat: d.Latitude || d.latitude || 0, lng: d.Longitude || d.longitude || 0, speed: d.Speed_kmph || d.speed || 0 });
    });
    return () => { unsub1(); unsub2(); };
  }, [gpsVehicleId]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [vehicles, users, bookings, maintenance, tripBills] = await Promise.all([
        getDocuments('vehicles'),
        getDocuments('users'),
        getDocuments('bookings'),
        getDocuments('maintenance'),
        getDocuments('trip_bills').catch(() => []) // Fallback in case collection is empty/missing
      ]);

      const activeRentals = bookings.filter(b => b.status === 'Ongoing' || b.status === 'Approved').length;
      
      const bookingRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      const manualBillRevenue = tripBills.reduce((sum, tb) => sum + (parseFloat(tb.totalAmount) || 0), 0);
      const totalRevenue = bookingRevenue + manualBillRevenue;
      
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;

      // Calculate monthly revenue (simple filter for current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const bookingMonthlyRevenue = bookings
        .filter(b => {
          const date = new Date(b.createdAt || b.startDate);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
        
      const manualBillMonthlyRevenue = tripBills
        .filter(tb => {
          const date = new Date(tb.createdAt);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, tb) => sum + (parseFloat(tb.totalAmount) || 0), 0);
        
      const monthlyRevenue = bookingMonthlyRevenue + manualBillMonthlyRevenue;

      setStats({
        totalVehicles: vehicles.length,
        activeRentals,
        totalRevenue,
        monthlyRevenue,
        totalCustomers: users.filter(u => u.role === 'customer').length,
        pendingBookings
      });

      // Sort and take top 5 recent bookings
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime())
        .slice(0, 5);
      setRecentBookings(sortedBookings);

      // Generate alerts from maintenance and late bookings
      const newAlerts: any[] = [];
      const upcomingMaintenance = maintenance.filter(m => m.status !== 'Completed').slice(0, 2);
      upcomingMaintenance.forEach(m => {
        newAlerts.push({
          id: m.id,
          type: 'maintenance',
          message: `${m.vehicleName} - ${m.type} due on ${m.date}`,
          severity: m.priority === 'high' ? 'error' : 'warning'
        });
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Approved': return 'bg-blue-500';
      case 'Completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-600">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* GPS Vehicle Live Status Panel */}
      {gpsVehicleId && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{gpsVehicleName || 'GPS Vehicle'}</h3>
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      LIVE GPS
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">WP-LUX-5678 • Real-time tracking active</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white border border-blue-100 rounded-lg px-4 py-2 text-center min-w-[90px]">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Odometer</p>
                  <p className="text-lg font-bold text-blue-600">{liveOdometer !== null ? liveOdometer.toFixed(1) : '—'}</p>
                  <p className="text-[10px] text-gray-500">km total</p>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg px-4 py-2 text-center min-w-[90px]">
                  <Gauge className="h-4 w-4 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{liveGpsData ? liveGpsData.speed.toFixed(1) : '0.0'}</p>
                  <p className="text-[10px] text-gray-500">km/h</p>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg px-4 py-2 text-center min-w-[90px]">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Lat</p>
                  <p className="text-sm font-bold font-mono text-gray-700">{liveGpsData ? liveGpsData.lat.toFixed(4) : '—'}</p>
                  <p className="text-[10px] text-gray-500">Lng: {liveGpsData ? liveGpsData.lng.toFixed(4) : '—'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Vehicles</p>
                <h2 className="text-3xl font-bold mt-2">{stats.totalVehicles}</h2>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Live status</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Car className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Rentals</p>
                <h2 className="text-3xl font-bold mt-2">{stats.activeRentals}</h2>
                <div className="flex items-center gap-1 text-xs text-blue-500 mt-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>Current bookings</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Monthly Revenue</p>
                <h2 className="text-2xl font-bold mt-2">{formatCurrency(stats.monthlyRevenue)}</h2>
                <div className="text-xs text-green-500 mt-1 font-medium">This Month</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
                <h2 className="text-3xl font-bold mt-2">{stats.totalCustomers}</h2>
                <div className="text-xs text-purple-500 mt-1 font-medium">Registered Users</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Recent Bookings</h3>
                <Badge variant="outline">{stats.pendingBookings} Pending</Badge>
              </div>
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">No bookings found</p>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                      <div className="flex-1">
                        <h4 className="font-bold flex items-center gap-2">
                          {booking.customerName}
                          <span className="text-xs font-normal text-muted-foreground bg-white/50 px-2 py-0.5 rounded">
                            {booking.id.slice(-6)}
                          </span>
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium">{booking.vehicleName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-red-600">{formatCurrency(parseFloat(booking.totalAmount) || 0)}</div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">System Alerts</h3>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No critical alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border-l-4 shadow-sm ${alert.severity === 'error'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-900'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'error' ? 'text-red-500' : 'text-yellow-600'
                          }`} />
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wider mb-0.5" style={{ fontSize: '10px' }}>
                            {alert.type}
                          </p>
                          <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>Total Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Lifetime Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="flex justify-between items-end pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>System Status</p>
                    <p className="font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse inline-block" />
                      Operational
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
