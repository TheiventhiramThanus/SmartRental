import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, X, FileText, Loader2, Car, Calendar, Clock, Navigation } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '../ui/utils';
import { getDocuments, updateDocument, where } from '../../firebase';

interface MyBookingsTablePageProps {
  user: any;
  onViewTracking: (bookingId: string) => void;
}

export function MyBookingsTablePage({ user, onViewTracking }: MyBookingsTablePageProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user?.id) return;
    fetchBookings();
  }, [user.id]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const userBookings = await getDocuments('bookings', where('customerId', '==', user.id));
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'approved': return 'bg-blue-500 hover:bg-blue-600';
      case 'ongoing': return 'bg-green-500 hover:bg-green-600';
      case 'completed': return 'bg-gray-500 hover:bg-gray-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await updateDocument('bookings', bookingId, { status: 'Cancelled' });
        await fetchBookings();
        alert('Booking cancelled successfully.');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const carName = booking.carName || booking.vehicleName || '';
    const matchesSearch = carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground font-bold italic tracking-widest">SYNCHRONIZING SECURE BOOKING DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Reservation Archive</h2>
          <p className="text-muted-foreground font-medium">History of your vehicle bookings and schedules</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
            <Input
              placeholder="Search by vehicle or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 font-bold border-2 focus:border-accent"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 font-black border-2 h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">ALL RESERVATIONS</SelectItem>
              <SelectItem value="pending" className="font-bold text-yellow-600">PENDING</SelectItem>
              <SelectItem value="approved" className="font-bold text-blue-600">APPROVED</SelectItem>
              <SelectItem value="ongoing" className="font-bold text-green-600">ONGOING</SelectItem>
              <SelectItem value="completed" className="font-bold text-gray-600">COMPLETED</SelectItem>
              <SelectItem value="cancelled" className="font-bold text-red-600">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-2xl border-4 border-slate-900 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">Internal Ref</th>
                  <th className="px-6 py-5 text-left">Vehicle Fleet</th>
                  <th className="px-6 py-5 text-left">Schedule Detail</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Investment</th>
                  <th className="px-6 py-5 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 mb-4 opacity-20" />
                        <p className="font-black italic uppercase tracking-widest">No active records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-6 text-[10px] font-black font-mono text-slate-400">
                        #{booking.id.toUpperCase().slice(0, 10)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-white rounded-xl shadow-md border-2 overflow-hidden group-hover:scale-110 transition-transform">
                            <img
                              src={booking.carImage || booking.vehicleImage || 'https://via.placeholder.com/150'}
                              alt={booking.carName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-black block text-gray-900 uppercase text-xs">{booking.carName || booking.vehicleName}</span>
                            <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">Premium Rental Fleet</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-black">
                            <Calendar className="h-3 w-3 text-accent" />
                            <span>{booking.pickupDate}</span>
                            <span className="text-slate-300">→</span>
                            <span>{booking.returnDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                            <Clock className="h-3 w-3" />
                            <span>{booking.pickupTime || '09:00 AM'} — {booking.returnTime || '09:00 PM'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <Badge className={`${getStatusColor(booking.status)} text-white font-black text-[10px] uppercase shadow-lg border-none px-3 py-1`}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          {formatCurrency(booking.estimatedCost || booking.totalPrice || booking.amount)}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Secure</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="View Security Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(booking.status.toLowerCase() === 'pending' || booking.status.toLowerCase() === 'approved') && (
                            <Button
                              size="icon"
                              variant="destructive"
                              className="rounded-xl shadow-lg shadow-red-200"
                              onClick={() => handleCancelBooking(booking.id)}
                              title="Abort Mission / Cancel Booking"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status.toLowerCase() === 'ongoing' && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-2 hover:bg-accent hover:text-white transition-all shadow-sm"
                              onClick={() => onViewTracking(booking.id)}
                              title="Engage Live Sat-Tracking"
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status.toLowerCase() === 'completed' && (
                            <Button size="icon" variant="outline" className="rounded-xl border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200" title="Secure Receipt Download">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {['Pending', 'Approved', 'Ongoing', 'Completed', 'Cancelled'].map((status) => {
          const count = bookings.filter(b => b.status.toLowerCase() === status.toLowerCase()).length;
          return (
            <Card key={status} className="border-2 border-slate-100 hover:border-accent/20 transition-all shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 italic">{status}</div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
