import { useState, useEffect } from 'react';
import { CheckSquare, Upload, Camera } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

interface PickupHandoverPageProps {
  user: any;
}

export function PickupHandoverPage({ user }: PickupHandoverPageProps) {
  const [approvedBookings, setApprovedBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState({
    fuelLevel: false,
    tiresCondition: false,
    lightsWorking: false,
    brakeCheck: false,
    bodyScratches: false,
    interiorCleanliness: false,
    gpsDevice: false,
    documentsCheck: false
  });
  const [formData, setFormData] = useState({
    startingOdometer: '',
    fuelPercentage: '',
    conditionNotes: '',
    pickupPhotos: [] as File[]
  });

  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const approved = allBookings.filter((b: any) => b.status === 'Approved');
    setApprovedBookings(approved);
  }, []);

  const handleChecklistChange = (key: string) => {
    setChecklistItems({ ...checklistItems, [key]: !checklistItems[key] });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, pickupPhotos: [...formData.pickupPhotos, ...files] });
    }
  };

  const handleStartTrip = (bookingId: string) => {
    const allChecked = Object.values(checklistItems).every(v => v);
    if (!allChecked) {
      alert('Please complete all checklist items before starting the trip.');
      return;
    }

    if (!formData.startingOdometer || !formData.fuelPercentage) {
      alert('Please fill in all required fields.');
      return;
    }

    if (confirm('Confirm vehicle handover and start trip?')) {
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updated = allBookings.map((b: any) => 
        b.id === bookingId ? { 
          ...b, 
          status: 'Ongoing',
          handedOverBy: user.name,
          startingOdometer: formData.startingOdometer,
          startingFuel: formData.fuelPercentage,
          conditionNotes: formData.conditionNotes,
          checklistCompleted: checklistItems,
          handoverDate: new Date().toISOString()
        } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      
      const approved = updated.filter((b: any) => b.status === 'Approved');
      setApprovedBookings(approved);
      setSelectedBooking(null);
      
      // Reset form
      setChecklistItems({
        fuelLevel: false,
        tiresCondition: false,
        lightsWorking: false,
        brakeCheck: false,
        bodyScratches: false,
        interiorCleanliness: false,
        gpsDevice: false,
        documentsCheck: false
      });
      setFormData({
        startingOdometer: '',
        fuelPercentage: '',
        conditionNotes: '',
        pickupPhotos: []
      });
      
      alert('Trip started successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h2>Vehicle Pickup & Handover</h2>

      {approvedBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No approved bookings ready for pickup</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {approvedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                {selectedBooking?.id !== booking.id ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3>{booking.carName} - {booking.assignedVehicle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Customer: {booking.customerName} | Pickup: {booking.pickupDate} {booking.pickupTime}
                      </p>
                    </div>
                    <Button 
                      className="bg-accent hover:bg-accent/90"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Start Handover Process
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3>{booking.carName} - {booking.assignedVehicle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Pickup Checklist & Documentation
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedBooking(null)}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Checklist */}
                      <div>
                        <h4 className="mb-4">Pre-Pickup Inspection Checklist</h4>
                        <div className="space-y-3">
                          {Object.entries({
                            fuelLevel: 'Fuel Level Checked',
                            tiresCondition: 'Tires Condition Good',
                            lightsWorking: 'All Lights Working',
                            brakeCheck: 'Brakes Checked',
                            bodyScratches: 'Body Scratches Documented',
                            interiorCleanliness: 'Interior Clean',
                            gpsDevice: 'GPS Device Active',
                            documentsCheck: 'Documents Verified'
                          }).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox 
                                id={key}
                                checked={checklistItems[key as keyof typeof checklistItems]}
                                onCheckedChange={() => handleChecklistChange(key)}
                              />
                              <label htmlFor={key} className="text-sm cursor-pointer">
                                {label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Starting Odometer (km)</label>
                          <Input
                            type="number"
                            placeholder="e.g., 15000"
                            value={formData.startingOdometer}
                            onChange={(e) => setFormData({ ...formData, startingOdometer: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Fuel Level (%)</label>
                          <Input
                            type="number"
                            placeholder="e.g., 100"
                            value={formData.fuelPercentage}
                            onChange={(e) => setFormData({ ...formData, fuelPercentage: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Condition Notes</label>
                          <Textarea
                            placeholder="Document any scratches, damages, or issues..."
                            value={formData.conditionNotes}
                            onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Upload Pickup Photos</label>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload photos
                              </p>
                              {formData.pickupPhotos.length > 0 && (
                                <p className="text-sm mt-2">
                                  {formData.pickupPhotos.length} photo(s) selected
                                </p>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600 flex-1"
                        onClick={() => handleStartTrip(booking.id)}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Complete Handover & Start Trip
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBooking(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
