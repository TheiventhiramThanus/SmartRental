import { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Camera, CheckCircle, XCircle, Upload, Printer, AlertTriangle, Car, User, FileText, Phone, Mail } from 'lucide-react';
import { formatCurrency } from '../ui/utils';

interface PickupHandoverPageProps {
  user: any;
}

export function EnhancedPickupHandoverPage({ user }: PickupHandoverPageProps) {
  const [activeTab, setActiveTab] = useState<'pickup' | 'handover'>('pickup');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Inspection checklist
  const [inspectionData, setInspectionData] = useState({
    exteriorCondition: false,
    interiorCondition: false,
    tiresCondition: false,
    lightsWorking: false,
    wipersFunctional: false,
    fuelLevel: '0',
    mileage: '',
    damages: '',
    customerSignature: '',
    staffNotes: ''
  });

  // Mock bookings ready for pickup/handover
  const pickupBookings = [
    {
      id: 'BOOK-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      vehicle: 'Tesla Model 3',
      licensePlate: 'ABC-1234',
      pickupDate: '2025-01-23',
      pickupTime: '10:00 AM',
      returnDate: '2025-01-30',
      status: 'Ready for Pickup',
      totalAmount: 252000,
      paymentStatus: 'Paid',
      licenseVerified: true,
      documentsComplete: true
    },
    {
      id: 'BOOK-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 (555) 234-5678',
      vehicle: 'BMW 5 Series',
      licensePlate: 'XYZ-5678',
      pickupDate: '2025-01-23',
      pickupTime: '02:00 PM',
      returnDate: '2025-02-01',
      status: 'Ready for Pickup',
      totalAmount: 315000,
      paymentStatus: 'Paid',
      licenseVerified: true,
      documentsComplete: true
    }
  ];

  const handoverBookings = [
    {
      id: 'BOOK-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      vehicle: 'Toyota RAV4',
      licensePlate: 'LMN-9012',
      pickupDate: '2025-01-16',
      returnDate: '2025-01-23',
      status: 'Active',
      totalAmount: 199500,
      paymentStatus: 'Paid',
      startMileage: 8000,
      currentMileage: 8245
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setVehiclePhotos([...vehiclePhotos, imageData]);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVehiclePhotos([...vehiclePhotos, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCompletePickup = () => {
    if (!selectedBooking) return;

    // Validate inspection
    if (!inspectionData.exteriorCondition || !inspectionData.interiorCondition) {
      alert('Please complete all mandatory inspection items');
      return;
    }

    if (!inspectionData.mileage || !inspectionData.fuelLevel) {
      alert('Please enter mileage and fuel level');
      return;
    }

    if (vehiclePhotos.length < 4) {
      alert('Please take at least 4 photos of the vehicle (front, back, sides)');
      return;
    }

    // Save pickup data
    const pickupData = {
      bookingId: selectedBooking.id,
      pickupTime: new Date().toISOString(),
      inspection: inspectionData,
      photos: vehiclePhotos,
      handedOverBy: user.name,
      status: 'Active'
    };

    localStorage.setItem(`pickup_${selectedBooking.id}`, JSON.stringify(pickupData));
    
    alert('Vehicle pickup completed successfully!');
    setShowInspectionModal(false);
    setSelectedBooking(null);
    resetInspection();
  };

  const handleCompleteHandover = () => {
    if (!selectedBooking) return;

    // Validate inspection
    if (!inspectionData.exteriorCondition || !inspectionData.interiorCondition) {
      alert('Please complete all mandatory inspection items');
      return;
    }

    if (!inspectionData.mileage || !inspectionData.fuelLevel) {
      alert('Please enter final mileage and fuel level');
      return;
    }

    if (vehiclePhotos.length < 4) {
      alert('Please take at least 4 photos of the vehicle condition');
      return;
    }

    // Calculate charges
    const mileageDriven = parseInt(inspectionData.mileage) - selectedBooking.startMileage;
    const additionalCharges = inspectionData.damages ? 30000 : 0; // Damage fee

    const handoverData = {
      bookingId: selectedBooking.id,
      returnTime: new Date().toISOString(),
      inspection: inspectionData,
      photos: vehiclePhotos,
      receivedBy: user.name,
      mileageDriven,
      additionalCharges,
      status: 'Completed'
    };

    localStorage.setItem(`handover_${selectedBooking.id}`, JSON.stringify(handoverData));
    
    alert(`Vehicle return completed! Mileage driven: ${mileageDriven} km. Additional charges: ${formatCurrency(additionalCharges)}`);
    setShowInspectionModal(false);
    setSelectedBooking(null);
    resetInspection();
  };

  const resetInspection = () => {
    setInspectionData({
      exteriorCondition: false,
      interiorCondition: false,
      tiresCondition: false,
      lightsWorking: false,
      wipersFunctional: false,
      fuelLevel: '0',
      mileage: '',
      damages: '',
      customerSignature: '',
      staffNotes: ''
    });
    setVehiclePhotos([]);
  };

  const printHandoverReport = (booking: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Vehicle ${activeTab === 'pickup' ? 'Pickup' : 'Return'} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #ef4444; }
            .section { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; }
            .checkbox { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SmartRental</div>
            <h2>Vehicle ${activeTab === 'pickup' ? 'Pickup' : 'Return'} Report</h2>
          </div>
          
          <div class="section">
            <h3>Booking Information</h3>
            <div class="row"><span class="label">Booking ID:</span><span>${booking.id}</span></div>
            <div class="row"><span class="label">Customer:</span><span>${booking.customerName}</span></div>
            <div class="row"><span class="label">Vehicle:</span><span>${booking.vehicle} (${booking.licensePlate})</span></div>
            <div class="row"><span class="label">Date:</span><span>${new Date().toLocaleString()}</span></div>
          </div>

          <div class="section">
            <h3>Vehicle Inspection</h3>
            <div class="checkbox">✓ Exterior Condition: ${inspectionData.exteriorCondition ? 'Good' : 'Issues Found'}</div>
            <div class="checkbox">✓ Interior Condition: ${inspectionData.interiorCondition ? 'Good' : 'Issues Found'}</div>
            <div class="checkbox">✓ Tires Condition: ${inspectionData.tiresCondition ? 'Good' : 'Issues Found'}</div>
            <div class="checkbox">✓ Lights Working: ${inspectionData.lightsWorking ? 'Yes' : 'No'}</div>
            <div class="checkbox">✓ Wipers Functional: ${inspectionData.wipersFunctional ? 'Yes' : 'No'}</div>
            <div class="row"><span class="label">Fuel Level:</span><span>${inspectionData.fuelLevel}%</span></div>
            <div class="row"><span class="label">Mileage:</span><span>${inspectionData.mileage} km</span></div>
            ${inspectionData.damages ? `<div class="row"><span class="label">Damages:</span><span>${inspectionData.damages}</span></div>` : ''}
          </div>

          <div class="section">
            <h3>Staff Notes</h3>
            <p>${inspectionData.staffNotes || 'No additional notes'}</p>
          </div>

          <div class="section">
            <h3>Signatures</h3>
            <div class="row"><span class="label">Staff Member:</span><span>${user.name}</span></div>
            <div class="row"><span class="label">Customer:</span><span>_______________________</span></div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const currentBookings = activeTab === 'pickup' ? pickupBookings : handoverBookings;

  return (
    <div className="space-y-6">
      <h2 className="text-red-600">Pickup & Handover Management</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'pickup' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pickup')}
          className={activeTab === 'pickup' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <Car className="mr-2 h-4 w-4" />
          Vehicle Pickup ({pickupBookings.length})
        </Button>
        <Button
          variant={activeTab === 'handover' ? 'default' : 'outline'}
          onClick={() => setActiveTab('handover')}
          className={activeTab === 'handover' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Vehicle Return ({handoverBookings.length})
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {currentBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No vehicles ready for {activeTab === 'pickup' ? 'pickup' : 'return'} today
              </p>
            </CardContent>
          </Card>
        ) : (
          currentBookings.map((booking) => (
            <Card key={booking.id} className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{booking.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.id}</p>
                      </div>
                      <Badge className={
                        booking.status === 'Ready for Pickup' ? 'bg-green-500' :
                        booking.status === 'Active' ? 'bg-blue-500' : 'bg-gray-500'
                      }>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Vehicle:</span>
                          <p className="font-medium">{booking.vehicle}</p>
                          <p className="text-xs text-muted-foreground">{booking.licensePlate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {activeTab === 'pickup' ? 'Pickup Date:' : 'Return Date:'}
                          </span>
                          <p className="font-medium">
                            {activeTab === 'pickup' ? booking.pickupDate : booking.returnDate}
                          </p>
                          {activeTab === 'pickup' && booking.pickupTime && (
                            <p className="text-xs text-muted-foreground">{booking.pickupTime}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment:</span>
                          <p className="font-bold text-green-600">{formatCurrency(booking.totalAmount)}</p>
                          <Badge className="bg-green-500 text-xs mt-1">{booking.paymentStatus}</Badge>
                        </div>
                        {activeTab === 'handover' && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Start Mileage:</span>
                              <p className="font-medium">{booking.startMileage} km</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Mileage:</span>
                              <p className="font-medium">{booking.currentMileage} km</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Distance:</span>
                              <p className="font-bold text-blue-600">
                                {booking.currentMileage - booking.startMileage} km
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {activeTab === 'pickup' && (
                      <div className="flex gap-2">
                        {booking.licenseVerified && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            License Verified
                          </Badge>
                        )}
                        {booking.documentsComplete && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Documents Complete
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-64">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `tel:${booking.customerPhone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `mailto:${booking.customerEmail}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Customer
                    </Button>

                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowInspectionModal(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Start {activeTab === 'pickup' ? 'Pickup' : 'Return'} Process
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Inspection Modal */}
      {showInspectionModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Vehicle {activeTab === 'pickup' ? 'Pickup' : 'Return'} Inspection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.vehicle} ({selectedBooking.licensePlate}) - {selectedBooking.customerName}
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setShowInspectionModal(false);
                  setSelectedBooking(null);
                  resetInspection();
                }}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Inspection Checklist */}
                <Card className="bg-gray-50 border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-4 text-red-600">Inspection Checklist</h4>
                    
                    {/* Checkboxes in 2 columns */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="exterior"
                          checked={inspectionData.exteriorCondition}
                          onCheckedChange={(checked) => 
                            setInspectionData({...inspectionData, exteriorCondition: checked as boolean})
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="exterior" className="cursor-pointer font-normal text-sm">
                          Exterior Condition Good *
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="interior"
                          checked={inspectionData.interiorCondition}
                          onCheckedChange={(checked) => 
                            setInspectionData({...inspectionData, interiorCondition: checked as boolean})
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="interior" className="cursor-pointer font-normal text-sm">
                          Interior Condition Good *
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="tires"
                          checked={inspectionData.tiresCondition}
                          onCheckedChange={(checked) => 
                            setInspectionData({...inspectionData, tiresCondition: checked as boolean})
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="tires" className="cursor-pointer font-normal text-sm">
                          Tires in Good Condition
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="lights"
                          checked={inspectionData.lightsWorking}
                          onCheckedChange={(checked) => 
                            setInspectionData({...inspectionData, lightsWorking: checked as boolean})
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="lights" className="cursor-pointer font-normal text-sm">
                          All Lights Working
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="wipers"
                          checked={inspectionData.wipersFunctional}
                          onCheckedChange={(checked) => 
                            setInspectionData({...inspectionData, wipersFunctional: checked as boolean})
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="wipers" className="cursor-pointer font-normal text-sm">
                          Wipers Functional
                        </Label>
                      </div>
                    </div>

                    {/* Input fields in 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Fuel Level (%) *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={inspectionData.fuelLevel}
                          onChange={(e) => setInspectionData({...inspectionData, fuelLevel: e.target.value})}
                          placeholder="0"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mileage (km) *</Label>
                        <Input
                          type="number"
                          value={inspectionData.mileage}
                          onChange={(e) => setInspectionData({...inspectionData, mileage: e.target.value})}
                          placeholder="Current mileage"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Photos */}
                <Card className="bg-gray-50 border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-4 text-red-600">Vehicle Photos (Min. 4 required)</h4>
                    
                    {!cameraActive ? (
                      <div className="flex gap-2 mb-4">
                        <Button variant="outline" onClick={startCamera}>
                          <Camera className="h-4 w-4 mr-2" />
                          Open Camera
                        </Button>
                        <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photos
                        </Button>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-2" />
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={capturePhoto}>
                            <Camera className="h-4 w-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button variant="outline" onClick={stopCamera}>
                            Close Camera
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {vehiclePhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Vehicle ${index + 1}`} className="w-full h-32 object-cover rounded" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1"
                            onClick={() => setVehiclePhotos(vehiclePhotos.filter((_, i) => i !== index))}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Photos taken: {vehiclePhotos.length}/4 minimum
                    </p>
                  </CardContent>
                </Card>

                {/* Damages & Notes */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Damages / Issues Found</Label>
                    <Textarea
                      value={inspectionData.damages}
                      onChange={(e) => setInspectionData({...inspectionData, damages: e.target.value})}
                      placeholder="Describe any damages or issues..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Staff Notes</Label>
                    <Textarea
                      value={inspectionData.staffNotes}
                      onChange={(e) => setInspectionData({...inspectionData, staffNotes: e.target.value})}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => printHandoverReport(selectedBooking)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={activeTab === 'pickup' ? handleCompletePickup : handleCompleteHandover}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete {activeTab === 'pickup' ? 'Pickup' : 'Handover'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
