import { useState, useEffect } from 'react';
import { Phone, Mail, CheckCircle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BookingRequestsPageProps {
  user: any;
}

export function BookingRequestsPage({ user }: BookingRequestsPageProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const pending = allBookings.filter((b: any) => b.status === 'Pending');
    setBookings(pending);
  }, []);

  const availableVehicles = [
    { id: 'ABC-1234', name: 'Tesla Model 3' },
    { id: 'XYZ-5678', name: 'BMW 5 Series' },
    { id: 'LMN-9012', name: 'Toyota RAV4' },
  ];

  const handleApprove = (bookingId: string) => {
    if (!assignedVehicle) {
      alert('Please assign a vehicle first');
      return;
    }

    if (confirm('Approve this booking?')) {
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updated = allBookings.map((b: any) => 
        b.id === bookingId ? { 
          ...b, 
          status: 'Approved', 
          approvedBy: user.name,
          assignedVehicle,
          approvalDate: new Date().toISOString()
        } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      
      const pending = updated.filter((b: any) => b.status === 'Pending');
      setBookings(pending);
      setSelectedBooking(null);
      setAssignedVehicle('');
      alert('Booking approved successfully!');
    }
  };

  const handleReject = (bookingId: string) => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (confirm('Reject this booking?')) {
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updated = allBookings.map((b: any) => 
        b.id === bookingId ? { 
          ...b, 
          status: 'Rejected', 
          rejectedBy: user.name,
          rejectionReason,
          rejectionDate: new Date().toISOString()
        } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      
      const pending = updated.filter((b: any) => b.status === 'Pending');
      setBookings(pending);
      setSelectedBooking(null);
      setRejectionReason('');
      alert('Booking rejected.');
    }
  };

  return (
    <div className="space-y-6">
      <h2>Booking Requests</h2>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No pending booking requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Booking Details */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="mb-1">{booking.carName}</h3>
                        <p className="text-sm text-muted-foreground">Booking ID: #{booking.id.slice(0, 8)}</p>
                      </div>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <h4>Customer Details</h4>
                        <p><strong>Name:</strong> {booking.customerName}</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">customer@email.com</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <h4>Rental Details</h4>
                        <p><strong>Pickup:</strong> {booking.pickupDate} {booking.pickupTime}</p>
                        <p><strong>Return:</strong> {booking.returnDate} {booking.returnTime}</p>
                        <p><strong>From:</strong> {booking.pickupLocation}</p>
                        <p><strong>To:</strong> {booking.returnLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View License
                      </Button>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        View NIC
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:+15551234567`)}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call Customer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:customer@email.com`)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="mb-4">Approval Actions</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm">Assign Vehicle</label>
                        <Select value={assignedVehicle} onValueChange={setAssignedVehicle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableVehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} ({vehicle.id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm">Security Deposit</label>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Cash
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Online
                          </Button>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(booking.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Booking
                      </Button>

                      <div className="border-t pt-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-sm">Rejection Reason</label>
                          <Textarea
                            placeholder="Enter reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button 
                          variant="destructive"
                          className="w-full mt-2"
                          onClick={() => handleReject(booking.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
