import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, Eye, X, Navigation, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../ui/utils';
import { getDocuments, updateDocument, where } from '../../firebase';

interface MyBookingsPageProps {
  user: any;
  onViewTracking: (bookingId: string) => void;
}

export function MyBookingsPage({ user, onViewTracking }: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        // Fetch bookings where customerId matches current user
        const userBookings = await getDocuments('bookings',
          where('customerId', '==', user.id)
        );
        setBookings(userBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'Approved': return 'bg-blue-500';
      case 'Ongoing': return 'bg-green-500';
      case 'Completed': return 'bg-gray-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await updateDocument('bookings', bookingId, { status: 'Cancelled' });

        // Update local state
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: 'Cancelled' } : b
        ));
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>My Bookings</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'ongoing', 'completed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-accent hover:bg-accent/90' : ''}
              disabled={isLoading}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-20 text-center">
            <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Fetching your bookings...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all'
                    ? "You haven't made any bookings yet"
                    : `No ${filter} bookings found`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="mb-2">{booking.carName}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl text-accent">{formatCurrency(booking.estimatedCost)}</div>
                            <div className="text-sm text-muted-foreground">Estimated</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Pickup: {booking.pickupDate} at {booking.pickupTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Return: {booking.returnDate} at {booking.returnTime}</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span>Pickup: {booking.pickupLocation}</span>
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span>Return: {booking.returnLocation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {booking.status === 'Ongoing' && (
                            <Button
                              onClick={() => onViewTracking(booking.id)}
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              <Navigation className="mr-2 h-4 w-4" />
                              Track Vehicle
                            </Button>
                          )}
                          {(booking.status === 'Pending' || booking.status === 'Approved') && (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </Button>
                          )}
                          {booking.status === 'Completed' && (
                            <Button variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
