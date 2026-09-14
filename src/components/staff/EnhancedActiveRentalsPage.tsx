import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, MapPin, Phone, Mail, Car, Clock, DollarSign, Navigation, AlertTriangle, Eye, Fuel, Gauge } from 'lucide-react';

interface ActiveRental {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  vehicleImage: string;
  licensePlate: string;
  pickupDate: string;
  returnDate: string;
  daysRemaining: number;
  currentLocation: string;
  startMileage: number;
  currentMileage: number;
  fuelLevel: number;
  speed: number;
  status: 'Active' | 'Delayed' | 'Near Return';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  gpsTracking: boolean;
}

export function EnhancedActiveRentalsPage({ user }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<ActiveRental | null>(null);
  
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([
    {
      id: 'RENT-001',
      bookingId: 'BOOK-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      vehicle: 'Tesla Model 3',
      vehicleImage: 'https://images.unsplash.com/photo-1610470832703-95d40c3fad55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMG1vZGVsJTIwZWxlY3RyaWN8ZW58MXx8fHwxNzY5MDUyNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      licensePlate: 'ABC-1234',
      pickupDate: '2025-01-20',
      returnDate: '2025-01-27',
      daysRemaining: 4,
      currentLocation: 'Broadway & 7th Ave, NY',
      startMileage: 9500,
      currentMileage: 9850,
      fuelLevel: 75,
      speed: 45,
      status: 'Active',
      totalAmount: 840,
      paidAmount: 840,
      paymentStatus: 'Paid',
      gpsTracking: true
    },
    {
      id: 'RENT-002',
      bookingId: 'BOOK-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 (555) 234-5678',
      vehicle: 'BMW 5 Series',
      vehicleImage: 'https://images.unsplash.com/photo-1682845485707-f5029d736001?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NjkwNTI2NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      licensePlate: 'XYZ-5678',
      pickupDate: '2025-01-18',
      returnDate: '2025-01-25',
      daysRemaining: 2,
      currentLocation: '5th Avenue & 42nd St, NY',
      startMileage: 12000,
      currentMileage: 12350,
      fuelLevel: 60,
      speed: 0,
      status: 'Near Return',
      totalAmount: 1050,
      paidAmount: 1050,
      paymentStatus: 'Paid',
      gpsTracking: true
    },
    {
      id: 'RENT-003',
      bookingId: 'BOOK-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      vehicle: 'Toyota RAV4',
      vehicleImage: 'https://images.unsplash.com/photo-1724311299235-08ae5231c919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBzdXYlMjB2ZWhpY2xlfGVufDF8fHx8MTc2OTA1MjY0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      licensePlate: 'LMN-9012',
      pickupDate: '2025-01-15',
      returnDate: '2025-01-22',
      daysRemaining: -1,
      currentLocation: 'JFK Airport, NY',
      startMileage: 8000,
      currentMileage: 8420,
      fuelLevel: 40,
      speed: 35,
      status: 'Delayed',
      totalAmount: 665,
      paidAmount: 665,
      paymentStatus: 'Overdue Fee',
      gpsTracking: true
    }
  ]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRentals(prev => prev.map(rental => {
        if (rental.speed > 0) {
          return {
            ...rental,
            currentMileage: rental.currentMileage + (Math.random() * 0.5),
            fuelLevel: Math.max(20, rental.fuelLevel - (Math.random() * 0.1)),
            speed: Math.max(0, rental.speed + (Math.random() - 0.5) * 10)
          };
        }
        return rental;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredRentals = activeRentals.filter(rental => {
    const matchesSearch = rental.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rental.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rental.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Near Return': return 'bg-yellow-500';
      case 'Delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const viewLocation = (rental: ActiveRental) => {
    setSelectedRental(rental);
    setShowLocationModal(true);
  };

  const sendReminder = (rental: ActiveRental) => {
    const subject = encodeURIComponent(`Rental Return Reminder - ${rental.bookingId}`);
    const body = encodeURIComponent(`Dear ${rental.customerName},\n\nThis is a reminder that your rental of ${rental.vehicle} (${rental.licensePlate}) is due for return on ${rental.returnDate}.\n\nPlease ensure the vehicle is returned on time to avoid late fees.\n\nThank you,\nSmartRental Team`);
    window.location.href = `mailto:${rental.customerEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-red-600">Active Rentals</h2>
        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
          {filteredRentals.length} Active
        </Badge>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-2xl font-bold text-blue-600">{filteredRentals.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredRentals.filter(r => r.status === 'Active').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Near Return</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredRentals.filter(r => r.status === 'Near Return').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredRentals.filter(r => r.status === 'Delayed').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, booking ID, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="near return">Near Return</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rentals List */}
      <div className="space-y-4">
        {filteredRentals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No active rentals found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRentals.map((rental) => (
            <Card key={rental.id} className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Vehicle Image */}
                  <div className="lg:w-64 h-48 lg:h-auto">
                    <img 
                      src={rental.vehicleImage} 
                      alt={rental.vehicle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Rental Info */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{rental.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{rental.bookingId}</p>
                      </div>
                      <Badge className={getStatusColor(rental.status)}>
                        {rental.status}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Vehicle:</span>
                          <p className="font-medium">{rental.vehicle}</p>
                          <p className="text-xs text-muted-foreground">{rental.licensePlate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Return Date:</span>
                          <p className="font-medium">{rental.returnDate}</p>
                          <p className={`text-xs font-bold ${rental.daysRemaining < 0 ? 'text-red-600' : rental.daysRemaining <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {rental.daysRemaining < 0 ? `${Math.abs(rental.daysRemaining)} days overdue` : `${rental.daysRemaining} days remaining`}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Distance:</span>
                          <p className="font-bold text-blue-600">
                            {(rental.currentMileage - rental.startMileage).toFixed(0)} km
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment:</span>
                          <p className="font-bold text-green-600">${rental.totalAmount}</p>
                          <Badge className={rental.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'} variant="outline">
                            {rental.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Data */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Speed</p>
                              <p className="font-bold">{rental.speed.toFixed(0)} km/h</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Fuel</p>
                              <p className="font-bold">{rental.fuelLevel.toFixed(0)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Mileage</p>
                              <p className="font-bold">{rental.currentMileage.toFixed(0)} km</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">GPS</p>
                              <p className="text-xs font-medium truncate">{rental.currentLocation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 p-6 lg:w-64 border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewLocation(rental)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View Location
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `tel:${rental.customerPhone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReminder(rental)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>

                    {rental.status === 'Delayed' && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Flag Overdue
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && selectedRental && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Live GPS Tracking</h3>
                <Button variant="outline" onClick={() => setShowLocationModal(false)}>
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-bold">{selectedRental.vehicle} ({selectedRental.licensePlate})</p>
                </div>

                <div className="relative bg-gray-100 rounded-lg" style={{ height: '400px' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-red-600 mx-auto mb-4 animate-bounce" />
                      <p className="font-bold text-lg">{selectedRental.currentLocation}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last updated: {new Date().toLocaleTimeString()}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-xs text-muted-foreground">Current Speed</p>
                          <p className="text-xl font-bold text-blue-600">{selectedRental.speed.toFixed(0)} km/h</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-xs text-muted-foreground">Distance Today</p>
                          <p className="text-xl font-bold text-purple-600">
                            {(selectedRental.currentMileage - selectedRental.startMileage).toFixed(0)} km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-600">Real-Time GPS Active</h4>
                      <p className="text-sm text-muted-foreground">
                        Vehicle location is being tracked in real-time via IoT GPS system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
