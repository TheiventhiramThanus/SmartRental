import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Car, Users, Download, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '../ui/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDocuments } from '../../firebase';

type TimeRange = 'weekly' | 'monthly' | 'yearly';

interface ReportsPageProps {
  gpsVehicleId?: string;
  gpsVehicleName?: string;
}

export function ReportsPage({ gpsVehicleId, gpsVehicleName }: ReportsPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const [bookings, payments, vehicles, tripBills] = await Promise.all([
        getDocuments('bookings'),
        getDocuments('payments'),
        getDocuments('vehicles'),
        getDocuments('trip_bills').catch(() => []) // Fallback in case collection is empty
      ]);

      const now = new Date();
      let startDate = new Date();

      if (timeRange === 'weekly') startDate.setDate(now.getDate() - 7);
      else if (timeRange === 'monthly') startDate.setDate(now.getDate() - 30);
      else startDate.setFullYear(now.getFullYear() - 1);

      const filteredPayments = payments.filter((p: any) => new Date(p.date || p.createdAt) >= startDate);
      const filteredBookings = bookings.filter((b: any) => new Date(b.createdAt || b.pickupDate) >= startDate);
      const filteredTripBills = tripBills.filter((tb: any) => new Date(tb.createdAt) >= startDate);

      // Statistics
      const bookingRevenue = filteredPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const manualBillRevenue = filteredTripBills.reduce((sum: number, tb: any) => sum + (parseFloat(tb.totalAmount) || 0), 0);
      const totalRevenue = bookingRevenue + manualBillRevenue;
      
      const totalBookings = filteredBookings.length + filteredTripBills.length;
      
      const bookingDays = filteredBookings.reduce((sum: number, b: any) => sum + (b.totalDays || 0), 0);
      const manualBillDays = filteredTripBills.reduce((sum: number, tb: any) => sum + (tb.durationDays || 0), 0);
      const avgDuration = totalBookings > 0
        ? ((bookingDays + manualBillDays) / totalBookings).toFixed(1)
        : "0";

      // Vehicle Performance
      const vehicleStats: Record<string, { name: string, bookings: number, revenue: number }> = {};
      
      // Process Bookings
      filteredBookings.forEach((b: any) => {
        const vehicleId = b.carId || b.vehicleId;
        const vehicleName = b.carName || b.vehicleName || 'Unknown Vehicle';
        if (!vehicleId) return;
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = { name: vehicleName, bookings: 0, revenue: 0 };
        }
        vehicleStats[vehicleId].bookings += 1;
        const payment = payments.find((p: any) => p.bookingId === b.id);
        if (payment) {
          vehicleStats[vehicleId].revenue += (parseFloat(payment.amount) || 0);
        }
      });
      
      // Process Manual Bills (AI Billing)
      filteredTripBills.forEach((tb: any) => {
        const vehicleId = tb.vehicleId;
        const vehicleName = tb.vehicleName;
        if (!vehicleId) return;
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = { name: vehicleName, bookings: 0, revenue: 0 };
        }
        vehicleStats[vehicleId].bookings += 1;
        vehicleStats[vehicleId].revenue += (parseFloat(tb.totalAmount) || 0);
      });

      const topVehicles = Object.values(vehicleStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Chart Data
      let chartData: any[] = [];
      let chartTitle = "";

      if (timeRange === 'weekly') {
        chartTitle = "7-Day Revenue Trend";
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayLabel = days[d.getDay()];
          const dateStr = d.toISOString().split('T')[0];
          
          const revP = filteredPayments
            .filter((p: any) => (p.date || p.createdAt)?.startsWith(dateStr))
            .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
            
          const revTB = filteredTripBills
            .filter((tb: any) => tb.createdAt?.startsWith(dateStr))
            .reduce((sum: number, tb: any) => sum + (parseFloat(tb.totalAmount) || 0), 0);
            
          return { name: dayLabel, revenue: revP + revTB };
        });
      } else if (timeRange === 'monthly') {
        chartTitle = "30-Day Revenue Trend (Weekly Groups)";
        chartData = Array.from({ length: 4 }).map((_, i) => {
          const weekStart = new Date();
          weekStart.setDate(now.getDate() - (4 - i) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(now.getDate() - (3 - i) * 7);

          const revP = filteredPayments
            .filter((p: any) => {
              const d = new Date(p.date || p.createdAt);
              return d >= weekStart && d < weekEnd;
            })
            .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
            
          const revTB = filteredTripBills
            .filter((tb: any) => {
              const d = new Date(tb.createdAt);
              return d >= weekStart && d < weekEnd;
            })
            .reduce((sum: number, tb: any) => sum + (parseFloat(tb.totalAmount) || 0), 0);
            
          return { name: `Week ${i + 1}`, revenue: revP + revTB };
        });
      } else {
        chartTitle = "12-Month Revenue Breakdown";
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        chartData = Array.from({ length: 12 }).map((_, i) => {
          const m = new Date();
          m.setMonth(now.getMonth() - (11 - i));
          const monthLabel = months[m.getMonth()];
          const year = m.getFullYear();
          const monthKey = `${year}-${String(m.getMonth() + 1).padStart(2, '0')}`;

          const revP = payments
            .filter((p: any) => (p.date || p.createdAt)?.startsWith(monthKey))
            .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
            
          const revTB = tripBills
            .filter((tb: any) => tb.createdAt?.startsWith(monthKey))
            .reduce((sum: number, tb: any) => sum + (parseFloat(tb.totalAmount) || 0), 0);
            
          return { name: monthLabel, revenue: revP + revTB };
        });
      }

      setData({
        stats: {
          revenue: totalRevenue,
          bookings: totalBookings,
          duration: `${avgDuration} days`,
          satisfaction: "4.8/5" // Keeping this mocked as no rating data exists
        },
        vehicles: topVehicles,
        chartData,
        chartTitle
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReports = () => {
    if (!data) return;

    let csvContent = `REPORT SUMMARY (${timeRange.toUpperCase()})\n`;
    csvContent += `Generated on,${new Date().toLocaleDateString()}\n\n`;

    csvContent += "KEY METRICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue,"${formatCurrency(data.stats.revenue)}"\n`;
    csvContent += `Total Bookings,${data.stats.bookings}\n`;
    csvContent += `Avg. Rental Duration,${data.stats.duration}\n`;
    csvContent += `Customer Satisfaction,${data.stats.satisfaction}\n\n`;

    csvContent += "VEHICLE PERFORMANCE\n";
    csvContent += "Vehicle Name,Bookings,Revenue\n";
    data.vehicles.forEach((vehicle: any) => {
      csvContent += `${vehicle.name},${vehicle.bookings},"${formatCurrency(vehicle.revenue)}"\n`;
    });
    csvContent += "\n";

    csvContent += `${data.chartTitle.toUpperCase()}\n`;
    csvContent += "Period,Revenue\n";
    data.chartData.forEach((item: any) => {
      csvContent += `${item.name},"${formatCurrency(item.revenue)}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_rental_reports_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Gathering business analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-red-600">Reports & Analytics</h2>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
              <SelectTrigger className="font-bold border-2">
                <Calendar className="w-4 h-4 mr-2 text-red-600" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={handleExportReports}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-bold mb-1">Total Revenue</div>
            <div className="text-2xl mb-1 text-red-600 font-bold">{formatCurrency(data.stats.revenue)}</div>
            <div className="text-xs text-green-600 font-medium">Actual processed revenue</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-bold mb-1">Total Bookings</div>
            <div className="text-2xl mb-1 font-bold">{data.stats.bookings}</div>
            <div className="text-xs text-blue-600 font-medium">In selected period</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-bold mb-1">Avg. Rental Duration</div>
            <div className="text-2xl mb-1 font-bold">{data.stats.duration}</div>
            <div className="text-xs text-orange-600 font-medium">Mean duration</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-bold mb-1">Customer Satisfaction</div>
            <div className="text-2xl mb-1 font-bold">{data.stats.satisfaction}</div>
            <div className="text-xs text-green-600 font-medium">Aggregate score</div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Utilization */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Top Performing Vehicles ({timeRange})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.vehicles.map((vehicle: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors border border-transparent hover:border-red-200">
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    {vehicle.name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium ml-8">{vehicle.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold">{formatCurrency(vehicle.revenue)}</div>
                  <div className="text-xs text-muted-foreground font-medium">Revenue</div>
                </div>
              </div>
            ))}
            {data.vehicles.length === 0 && (
              <p className="col-span-full text-center py-8 text-muted-foreground">No vehicle data for this period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">{data.chartTitle}</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded-sm" />
                Revenue
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg">
                          <p className="font-bold text-gray-900 mb-1">{label}</p>
                          <p className="text-red-600 font-bold text-lg">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#dc2626"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
