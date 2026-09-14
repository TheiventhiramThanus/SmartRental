import { useState, useEffect } from 'react';
import { Navigation, Phone, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface StaffActiveRentalsPageProps {
  user: any;
}

export function StaffActiveRentalsPage({ user }: StaffActiveRentalsPageProps) {
  const [activeRentals, setActiveRentals] = useState<any[]>([]);

  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const ongoing = allBookings.filter((b: any) => b.status === 'Ongoing');
    setActiveRentals(ongoing);
  }, []);

  const sendReminder = (booking: any, type: string) => {
    alert(`Sending ${type} reminder to ${booking.customerName}...`);
  };

  const reportMisuse = (booking: any) => {
    const report = prompt('Describe the misuse incident:');
    if (report) {
      alert(`Misuse report submitted to admin for ${booking.carName}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Active Rentals</h2>
        <Badge className="bg-green-500 text-lg px-4 py-2">
          {activeRentals.length} Active
        </Badge>
      </div>

      {activeRentals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No active rentals at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeRentals.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{booking.carName} - {booking.assignedVehicle}</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer: {booking.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Ongoing</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      GPS Active
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <h4>Trip Information</h4>
                    <p><strong>Started:</strong> {new Date(booking.handoverDate).toLocaleDateString()}</p>
                    <p><strong>Return Due:</strong> {booking.returnDate} {booking.returnTime}</p>
                    <p><strong>Odometer:</strong> {booking.startingOdometer} km</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4>Current Status</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Downtown Area</span>
                    </div>
                    <p><strong>Speed:</strong> 45 km/h</p>
                    <p><strong>Distance:</strong> ~50 km</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4>Contact</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>customer@email.com</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => sendReminder(booking, 'return time')}>
                    Send Return Reminder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendReminder(booking, 'rules')}>
                    Send Rules Reminder
                    </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:+15551234567`)}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Customer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => reportMisuse(booking)}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Misuse
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
