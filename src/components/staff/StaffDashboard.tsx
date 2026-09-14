import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, LogOut, Car, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface StaffDashboardProps {
  user: any;
  onLogout: () => void;
}

export function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [conditionNotes, setConditionNotes] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');

  useEffect(() => {
    // Load all pending and approved bookings
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(allBookings);
  }, []);

  const handleApprove = (bookingId: string) => {
    if (confirm('Approve this booking?')) {
      const updated = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Approved', approvedBy: user.name } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      setBookings(updated);
      alert('Booking approved successfully!');
    }
  };

  const handleReject = (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const updated = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Rejected', rejectionReason: reason } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      setBookings(updated);
      alert('Booking rejected.');
    }
  };

  const handleStartTrip = (bookingId: string) => {
    if (!fuelLevel || !conditionNotes) {
      alert('Please record fuel level and vehicle condition before starting trip.');
      return;
    }

    const updated = bookings.map(b => 
      b.id === bookingId ? { 
        ...b, 
        status: 'Ongoing', 
        startedBy: user.name,
        initialFuelLevel: fuelLevel,
        initialCondition: conditionNotes,
        startTime: new Date().toISOString()
      } : b
    );
    localStorage.setItem('bookings', JSON.stringify(updated));
    setBookings(updated);
    setSelectedBooking(null);
    setFuelLevel('');
    setConditionNotes('');
    alert('Trip started successfully!');
  };

  const handleEndTrip = (bookingId: string) => {
    if (!fuelLevel || !conditionNotes) {
      alert('Please record final fuel level and vehicle condition.');
      return;
    }

    const updated = bookings.map(b => 
      b.id === bookingId ? { 
        ...b, 
        status: 'Completed',
        completedBy: user.name,
        finalFuelLevel: fuelLevel,
        finalCondition: conditionNotes,
        endTime: new Date().toISOString()
      } : b
    );
    localStorage.setItem('bookings', JSON.stringify(updated));
    setBookings(updated);
    setSelectedBooking(null);
    setFuelLevel('');
    setConditionNotes('');
    alert('Trip completed successfully!');
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const ongoingBookings = bookings.filter(b => b.status === 'Ongoing');

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2>{user.name}</h2>
                <p className="text-primary-foreground/80">Staff Dashboard</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl">{pendingBookings.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                  <div className="text-2xl">{approvedBookings.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ongoing</div>
                  <div className="text-2xl">{ongoingBookings.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Today</div>
                  <div className="text-2xl">{bookings.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="mb-4">Pending Approvals</h2>
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No pending bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img 
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3>{booking.carName}</h3>
                            <p className="text-sm text-muted-foreground">Customer: {booking.customerName}</p>
                          </div>
                          <Badge className="bg-yellow-500">Pending</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                          <p>Pickup: {booking.pickupDate} at {booking.pickupTime}</p>
                          <p>Return: {booking.returnDate} at {booking.returnTime}</p>
                          <p>From: {booking.pickupLocation}</p>
                          <p>To: {booking.returnLocation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(booking.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(booking.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approved - Ready for Pickup */}
        <div className="mb-8">
          <h2 className="mb-4">Ready for Pickup</h2>
          {approvedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No approved bookings waiting for pickup</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img 
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3>{booking.carName}</h3>
                            <p className="text-sm text-muted-foreground">Customer: {booking.customerName}</p>
                          </div>
                          <Badge className="bg-blue-500">Approved</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                          <p>Pickup: {booking.pickupDate} at {booking.pickupTime}</p>
                          <p>Location: {booking.pickupLocation}</p>
                        </div>
                        
                        {selectedBooking?.id === booking.id ? (
                          <div className="space-y-4 mt-4 p-4 bg-secondary rounded-lg">
                            <h4>Pre-Trip Inspection</h4>
                            <div className="space-y-2">
                              <label>Fuel Level (%)</label>
                              <Input
                                type="number"
                                placeholder="e.g., 100"
                                value={fuelLevel}
                                onChange={(e) => setFuelLevel(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label>Vehicle Condition Notes</label>
                              <Textarea
                                placeholder="Record any damages, scratches, or issues..."
                                value={conditionNotes}
                                onChange={(e) => setConditionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStartTrip(booking.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Start Trip
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-accent hover:bg-accent/90"
                          >
                            Handle Pickup
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ongoing Trips - Ready for Return */}
        <div>
          <h2 className="mb-4">Ongoing Trips - Ready for Return</h2>
          {ongoingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No ongoing trips</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ongoingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img 
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3>{booking.carName}</h3>
                            <p className="text-sm text-muted-foreground">Customer: {booking.customerName}</p>
                          </div>
                          <Badge className="bg-green-500">Ongoing</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                          <p>Return Due: {booking.returnDate} at {booking.returnTime}</p>
                          <p>Initial Fuel: {booking.initialFuelLevel}%</p>
                        </div>
                        
                        {selectedBooking?.id === booking.id ? (
                          <div className="space-y-4 mt-4 p-4 bg-secondary rounded-lg">
                            <h4>Post-Trip Inspection</h4>
                            <div className="space-y-2">
                              <label>Final Fuel Level (%)</label>
                              <Input
                                type="number"
                                placeholder="e.g., 75"
                                value={fuelLevel}
                                onChange={(e) => setFuelLevel(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label>Vehicle Condition & Damages</label>
                              <Textarea
                                placeholder="Record any new damages or issues..."
                                value={conditionNotes}
                                onChange={(e) => setConditionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEndTrip(booking.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Complete Trip
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-accent hover:bg-accent/90"
                          >
                            Handle Return
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
