import { useState } from 'react';
import { Calendar, User, Car, DollarSign, MapPin, Phone, Mail, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { formatCurrency } from '../ui/utils';

interface ManualBookingPageProps {
  user: any;
}

export function ManualBookingPage({ user }: ManualBookingPageProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    licenseNumber: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    pickupLocation: '',
    notes: ''
  });

  const availableVehicles = [
    { id: 'ABC-1234', name: 'Tesla Model 3', dailyRate: 36000, image: 'https://images.unsplash.com/photo-1610470832703-95d40c3fad55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMG1vZGVsJTIwZWxlY3RyaWN8ZW58MXx8fHwxNzY5MDUyNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'XYZ-5678', name: 'BMW 5 Series', dailyRate: 45000, image: 'https://images.unsplash.com/photo-1682845485707-f5029d736001?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NjkwNTI2NDd8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'LMN-9012', name: 'Toyota RAV4', dailyRate: 28500, image: 'https://images.unsplash.com/photo-1724311299235-08ae5231c919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBzdXYlMjB2ZWhpY2xlfGVufDF8fHx8MTc2OTA1MjY0N3ww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'PQR-3456', name: 'Porsche 911', dailyRate: 90000, image: 'https://images.unsplash.com/photo-1641209624342-e20d49275892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3JzY2hlJTIwc3BvcnRzJTIwY2FyfGVufDF8fHx8MTc2ODk3NTkwNXww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'STU-7890', name: 'Mercedes C-Class', dailyRate: 54000, image: 'https://images.unsplash.com/photo-1706977384830-df8b515e6b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMGx1eHVyeSUyMHNlZGFufGVufDF8fHx8MTc2ODk2ODk1MXww&ixlib=rb-4.1.0&q=80&w=1080' },
  ];

  const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate || !selectedVehicle) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days * selectedVehicle.dailyRate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.vehicleId || 
        !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newBooking = {
      id: `BOOK-${Date.now()}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      licenseNumber: formData.licenseNumber,
      vehicle: selectedVehicle?.name,
      vehicleId: formData.vehicleId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: formData.pickupLocation,
      status: 'Approved',
      totalAmount: calculateTotal(),
      createdBy: user.name,
      createdByStaff: true,
      createdAt: new Date().toISOString(),
      notes: formData.notes
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([...existingBookings, newBooking]));

    alert('Booking created successfully!');
    
    // Reset form
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      licenseNumber: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      pickupLocation: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-red-600">Create Manual Booking</h2>
          <p className="text-muted-foreground">Create a booking for walk-in customers or phone reservations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
          <Plus className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">Manual Entry</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-red-600" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Driver's License</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="DL-2024-12345"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-red-600" />
                  Booking Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Select Vehicle *</Label>
                    <Select value={formData.vehicleId} onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} - {formatCurrency(vehicle.dailyRate)}/day
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input
                      id="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      placeholder="New York Main Branch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <div className="space-y-4">
            {selectedVehicle && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Selected Vehicle</h3>
                  <img 
                    src={selectedVehicle.image} 
                    alt={selectedVehicle.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h4 className="mb-2">{selectedVehicle.name}</h4>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedVehicle.dailyRate)}<span className="text-sm text-muted-foreground">/day</span></p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardContent className="p-6">
                <h3 className="mb-4 text-red-600">Booking Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span className="font-medium">{selectedVehicle ? formatCurrency(selectedVehicle.dailyRate) : formatCurrency(0)}</span>
                  </div>
                  
                  {formData.startDate && formData.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-red-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  Create Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
