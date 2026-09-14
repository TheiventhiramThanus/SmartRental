import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export function LiveTrackingAdminPage() {
  const [activeRentals] = useState([
    { id: '1', car: 'Tesla Model 3', customer: 'John Doe', speed: 65, location: 'Downtown', lat: 40.7128, lng: -74.0060, status: 'normal' },
    { id: '2', car: 'BMW 5 Series', customer: 'Sarah Smith', speed: 95, location: 'Highway 101', lat: 40.7580, lng: -73.9855, status: 'speeding' },
    { id: '3', car: 'Toyota RAV4', customer: 'Mike Johnson', speed: 45, location: 'Suburb Area', lat: 40.6782, lng: -73.9442, status: 'normal' },
  ]);

  return (
    <div className="space-y-6">
      <h2>Live Vehicle Tracking</h2>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full h-96 bg-muted flex items-center justify-center relative">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-accent" />
              <h3 className="mb-2">Real-Time GPS Map</h3>
              <p className="text-muted-foreground">
                Tracking {activeRentals.length} active vehicles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRentals.map((rental) => (
          <Card key={rental.id} className={rental.status === 'speeding' ? 'border-red-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="mb-1">{rental.car}</h4>
                  <p className="text-sm text-muted-foreground">{rental.customer}</p>
                </div>
                {rental.status === 'speeding' && (
                  <Badge className="bg-red-500">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Speeding
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span>Speed: <strong>{rental.speed} km/h</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{rental.location}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {rental.lat.toFixed(4)}, {rental.lng.toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
