import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Navigation, Clock, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../ui/utils';

interface RouteDistanceMapPageProps {
  bookingId: string;
  onBack: () => void;
}

export function RouteDistanceMapPage({ bookingId, onBack }: RouteDistanceMapPageProps) {
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7580, lng: -73.9855 });
  const [destination] = useState({ lat: 40.7489, lng: -73.9680 });
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
      
      // Simulate distance calculation
      const dist = Math.sqrt(
        Math.pow(currentLocation.lat - destination.lat, 2) +
        Math.pow(currentLocation.lng - destination.lng, 2)
      ) * 111; // Convert to km (approximate)
      
      setDistance(dist);
      setDuration(dist / 40 * 60); // Assuming 40 km/h average speed
      setSpeed(35 + Math.random() * 20); // Random speed between 35-55 km/h
    }, 2000);

    return () => clearInterval(interval);
  }, [currentLocation, destination]);

  // Mock trip data
  const tripData = {
    startLocation: 'Times Square, New York',
    currentLocation: 'Broadway & 7th Ave',
    destination: 'Central Park South',
    startTime: '2025-01-22 14:30',
    estimatedArrival: '2025-01-22 15:15',
    totalDistance: 5.2,
    remainingDistance: distance.toFixed(1),
    vehicle: 'Tesla Model 3 (ABC-1234)'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-red-600">Live Route Tracking</h2>
          <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold text-blue-600">{tripData.totalDistance} km</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-orange-600">{tripData.remainingDistance} km</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Time</p>
                <p className="text-2xl font-bold text-green-600">{duration.toFixed(0)} min</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Speed</p>
                <p className="text-2xl font-bold text-purple-600">{speed.toFixed(0)} km/h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Simulated Map with Google Maps style */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative">
                {/* Background map pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <line 
                    x1="20%" 
                    y1="80%" 
                    x2="80%" 
                    y2="20%" 
                    stroke="#3b82f6" 
                    strokeWidth="4" 
                    strokeDasharray="10,5"
                  />
                  <line 
                    x1="20%" 
                    y1="80%" 
                    x2={`${20 + ((80-20) * (1 - distance / tripData.totalDistance))}%`}
                    y2={`${80 - ((80-20) * (1 - distance / tripData.totalDistance))}%`}
                    stroke="#ef4444" 
                    strokeWidth="4"
                  />
                </svg>

                {/* Start Location Marker */}
                <div className="absolute" style={{ left: '20%', top: '80%', transform: 'translate(-50%, -100%)' }}>
                  <div className="bg-green-600 text-white p-2 rounded-full shadow-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="bg-white px-3 py-1 rounded shadow-md mt-2 text-sm font-medium whitespace-nowrap">
                    {tripData.startLocation}
                  </div>
                </div>

                {/* Current Location Marker (Animated) */}
                <div 
                  className="absolute transition-all duration-2000" 
                  style={{ 
                    left: `${20 + ((80-20) * (1 - distance / tripData.totalDistance))}%`,
                    top: `${80 - ((80-20) * (1 - distance / tripData.totalDistance))}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75" style={{ width: '40px', height: '40px' }}></div>
                    <div className="relative bg-red-600 text-white p-2 rounded-full shadow-lg">
                      <Navigation className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded shadow-md mt-2 text-sm font-medium whitespace-nowrap">
                    {tripData.vehicle}
                  </div>
                </div>

                {/* Destination Marker */}
                <div className="absolute" style={{ left: '80%', top: '20%', transform: 'translate(-50%, -100%)' }}>
                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="bg-white px-3 py-1 rounded shadow-md mt-2 text-sm font-medium whitespace-nowrap">
                    {tripData.destination}
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
                  <h4 className="font-bold mb-2">Map Legend</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span>Start Point</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <span>Current Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span>Destination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-500"></div>
                      <span>Planned Route</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-red-500"></div>
                      <span>Traveled</span>
                    </div>
                  </div>
                </div>

                {/* Trip Info Card */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-green-500">In Progress</Badge>
                    <span className="text-xs text-muted-foreground">Live Updates</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <p className="font-medium">{tripData.currentLocation}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <p className="font-medium">{tripData.startTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <p className="font-medium">{tripData.estimatedArrival}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Integration Note */}
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white px-2 py-1 rounded">
              Map Data © 2025
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 text-red-600">Route Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Location:</span>
                <span className="font-medium text-right">{tripData.startLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Location:</span>
                <span className="font-medium text-right">{tripData.currentLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium text-right">{tripData.destination}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-bold text-red-600">
                  {((1 - distance / tripData.totalDistance) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 text-red-600">Trip Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Speed:</span>
                <span className="font-medium">{(speed * 0.9).toFixed(0)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Covered:</span>
                <span className="font-medium">{(tripData.totalDistance - parseFloat(tripData.remainingDistance)).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Elapsed:</span>
                <span className="font-medium">{(45 - duration).toFixed(0)} min</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Estimated Cost:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(tripData.totalDistance * 150)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-blue-500 border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-600">Real-Time GPS Tracking Active</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your trip is being monitored in real-time for safety and billing accuracy. 
                Distance and time are automatically calculated for your convenience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
