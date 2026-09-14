import { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Camera, Upload, Printer, DollarSign, AlertTriangle, CheckCircle, XCircle, FileText, Phone, Mail, Car } from 'lucide-react';
import { formatCurrency } from '../ui/utils';

interface DamageReport {
  type: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  description: string;
  estimatedCost: number;
  photos: string[];
}

export function EnhancedVehicleReturnsPage({ user }: any) {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [currentDamage, setCurrentDamage] = useState<DamageReport>({
    type: 'Scratch',
    severity: 'Minor',
    description: '',
    estimatedCost: 0,
    photos: []
  });
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [returnData, setReturnData] = useState({
    finalMileage: '',
    fuelLevel: '0',
    exteriorClean: false,
    interiorClean: false,
    allKeysReturned: false,
    noSmoking: false,
    noDamage: false,
    paymentMethod: 'Cash',
    lateFee: 0,
    cleaningFee: 0,
    fuelCharge: 0,
    damageCharge: 0,
    staffNotes: ''
  });

  // Mock returns ready for processing
  const pendingReturns = [
    {
      id: 'RET-001',
      bookingId: 'BOOK-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      vehicle: 'Tesla Model 3',
      vehicleImage: 'https://images.unsplash.com/photo-1610470832703-95d40c3fad55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMG1vZGVsJTIwZWxlY3RyaWN8ZW58MXx8fHwxNzY5MDUyNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      licensePlate: 'ABC-1234',
      pickupDate: '2025-01-20',
      returnDate: '2025-01-27',
      startMileage: 9500,
      currentMileage: 9850,
      initialFuel: 100,
      rentalAmount: 252000,
      status: 'Pending Return'
    },
    {
      id: 'RET-002',
      bookingId: 'BOOK-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      vehicle: 'Toyota RAV4',
      vehicleImage: 'https://images.unsplash.com/photo-1724311299235-08ae5231c919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBzdXYlMjB2ZWhpY2xlfGVufDF8fHx8MTc2OTA1MjY0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      licensePlate: 'LMN-9012',
      pickupDate: '2025-01-15',
      returnDate: '2025-01-22',
      startMileage: 8000,
      currentMileage: 8420,
      initialFuel: 100,
      rentalAmount: 199500,
      status: 'Overdue'
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
      alert('Camera access denied');
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
        setCurrentDamage({...currentDamage, photos: [...currentDamage.photos, imageData]});
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

  const addDamageReport = () => {
    if (!currentDamage.description || currentDamage.photos.length === 0) {
      alert('Please provide damage description and at least one photo');
      return;
    }

    setDamageReports([...damageReports, currentDamage]);
    const totalDamageCost = damageReports.reduce((sum, d) => sum + d.estimatedCost, 0) + currentDamage.estimatedCost;
    setReturnData({...returnData, damageCharge: totalDamageCost});
    
    setCurrentDamage({
      type: 'Scratch',
      severity: 'Minor',
      description: '',
      estimatedCost: 0,
      photos: []
    });
  };

  const calculateCharges = () => {
    let lateFee = 0;
    let cleaningFee = 0;
    let fuelCharge = 0;
    
    if (!selectedReturn) return { lateFee: 0, cleaningFee: 0, fuelCharge: 0, damageCharge: 0, total: 0 };

    // Late fee calculation (based on return date)
    if (selectedReturn.status === 'Overdue') {
      const daysLate = Math.ceil((new Date().getTime() - new Date(selectedReturn.returnDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysLate > 0) lateFee = daysLate * 15000; // 15,000 LKR per day late fee
    }

    // Cleaning fee
    if (!returnData.exteriorClean || !returnData.interiorClean) {
      cleaningFee = 15000; // 15,000 LKR
    }

    // Fuel charge
    const currentFuel = parseInt(returnData.fuelLevel) || 0;
    const fuelDifference = selectedReturn.initialFuel - currentFuel;
    if (fuelDifference > 10) {
      fuelCharge = fuelDifference * 900; // 900 LKR per % fuel
    }

    // Damage charge
    const damageCharge = returnData.damageCharge;
    const total = lateFee + cleaningFee + fuelCharge + damageCharge;

    return { lateFee, cleaningFee, fuelCharge, damageCharge, total };
  };

  const charges = calculateCharges();

  const completeReturn = () => {
    if (!returnData.finalMileage) {
      alert('Please enter final mileage');
      return;
    }

    if (vehiclePhotos.length < 4) {
      alert('Please take at least 4 photos of the returned vehicle');
      return;
    }

    const totalCharges = charges.total;
    const mileageDriven = parseInt(returnData.finalMileage) - selectedReturn.startMileage;

    const returnReport = {
      returnId: selectedReturn.id,
      bookingId: selectedReturn.bookingId,
      returnTime: new Date().toISOString(),
      receivedBy: user.name,
      mileageDriven,
      returnData: { ...returnData, ...charges },
      damageReports,
      vehiclePhotos,
      additionalCharges: totalCharges,
      totalAmount: selectedReturn.rentalAmount + totalCharges
    };

    localStorage.setItem(`return_${selectedReturn.id}`, JSON.stringify(returnReport));
    
    alert(`Return processed! Mileage: ${mileageDriven}km. Additional charges: ${formatCurrency(totalCharges)}`);
    printReturnReport(returnReport);
    
    setShowReturnModal(false);
    setSelectedReturn(null);
    resetReturnData();
  };

  const resetReturnData = () => {
    setReturnData({
      finalMileage: '',
      fuelLevel: '0',
      exteriorClean: false,
      interiorClean: false,
      allKeysReturned: false,
      noSmoking: false,
      noDamage: false,
      paymentMethod: 'Cash',
      lateFee: 0,
      cleaningFee: 0,
      fuelCharge: 0,
      damageCharge: 0,
      staffNotes: ''
    });
    setDamageReports([]);
    setVehiclePhotos([]);
  };

  const printReturnReport = (report: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Vehicle Return Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #ef4444; }
            .section { margin: 20px 0; padding: 15px; background: #f5f5f5; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .total { font-size: 20px; font-weight: bold; background: #ef4444; color: white; padding: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SmartRental</div>
            <h2>Vehicle Return Report</h2>
          </div>

          <div class="section">
            <h3>Booking Information</h3>
            <div class="row"><span class="label">Booking ID:</span><span>${report.bookingId}</span></div>
            <div class="row"><span class="label">Customer:</span><span>${selectedReturn.customerName}</span></div>
            <div class="row"><span class="label">Vehicle:</span><span>${selectedReturn.vehicle} (${selectedReturn.licensePlate})</span></div>
            <div class="row"><span class="label">Return Date:</span><span>${new Date(report.returnTime).toLocaleString()}</span></div>
            <div class="row"><span class="label">Received By:</span><span>${report.receivedBy}</span></div>
          </div>

          <div class="section">
            <h3>Mileage & Fuel</h3>
            <div class="row"><span class="label">Start Mileage:</span><span>${selectedReturn.startMileage} km</span></div>
            <div class="row"><span class="label">Final Mileage:</span><span>${report.returnData.finalMileage} km</span></div>
            <div class="row"><span class="label">Distance Driven:</span><span>${report.mileageDriven} km</span></div>
            <div class="row"><span class="label">Fuel Level:</span><span>${report.returnData.fuelLevel}%</span></div>
          </div>

          <div class="section">
            <h3>Vehicle Condition</h3>
            <div class="row"><span>Exterior Clean:</span><span>${report.returnData.exteriorClean ? 'Yes' : 'No'}</span></div>
            <div class="row"><span>Interior Clean:</span><span>${report.returnData.interiorClean ? 'Yes' : 'No'}</span></div>
            <div class="row"><span>All Keys Returned:</span><span>${report.returnData.allKeysReturned ? 'Yes' : 'No'}</span></div>
          </div>

          ${report.damageReports.length > 0 ? `
          <div class="section">
            <h3>Damage Reports (${report.damageReports.length})</h3>
            ${report.damageReports.map((d: DamageReport, i: number) => `
              <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
                <strong>${i + 1}. ${d.type} (${d.severity})</strong>
                <p>${d.description}</p>
                <p>Estimated Cost: ${formatCurrency(d.estimatedCost)}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <h3>Charges</h3>
            <div class="row"><span>Base Rental:</span><span>${formatCurrency(selectedReturn.rentalAmount)}</span></div>
            ${report.returnData.lateFee > 0 ? `<div class="row"><span>Late Fee:</span><span>${formatCurrency(report.returnData.lateFee)}</span></div>` : ''}
            ${report.returnData.cleaningFee > 0 ? `<div class="row"><span>Cleaning Fee:</span><span>${formatCurrency(report.returnData.cleaningFee)}</span></div>` : ''}
            ${report.returnData.fuelCharge > 0 ? `<div class="row"><span>Fuel Charge:</span><span>${formatCurrency(report.returnData.fuelCharge)}</span></div>` : ''}
            ${report.returnData.damageCharge > 0 ? `<div class="row"><span>Damage Charge:</span><span>${formatCurrency(report.returnData.damageCharge)}</span></div>` : ''}
          </div>

          <div class="total">
            <div class="row" style="border: none; color: white;">
              <span>TOTAL AMOUNT:</span>
              <span>${formatCurrency(report.totalAmount)}</span>
            </div>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 12px;">
            Thank you for choosing SmartRental!
          </p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-red-600">Vehicle Returns & Damage</h2>
        <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
          {pendingReturns.length} Pending
        </Badge>
      </div>

      {/* Returns List */}
      <div className="space-y-4">
        {pendingReturns.map((returnItem) => (
          <Card key={returnItem.id} className="border-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Vehicle Image */}
                <div className="lg:w-64 h-48 lg:h-auto">
                  <img 
                    src={returnItem.vehicleImage} 
                    alt={returnItem.vehicle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Return Info */}
                <div className="flex-1 p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{returnItem.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{returnItem.bookingId}</p>
                    </div>
                    <Badge className={returnItem.status === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500'}>
                      {returnItem.status}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vehicle:</span>
                        <p className="font-medium">{returnItem.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{returnItem.licensePlate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Return Date:</span>
                        <p className="font-medium">{returnItem.returnDate}</p>
                        {returnItem.status === 'Overdue' && (
                          <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mileage:</span>
                        <p className="font-bold text-blue-600">
                          {returnItem.currentMileage - returnItem.startMileage} km
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-bold text-green-600">{formatCurrency(returnItem.rentalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 p-6 lg:w-64 border-l">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `tel:${returnItem.customerPhone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${returnItem.customerEmail}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Customer
                  </Button>

                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setSelectedReturn(returnItem);
                      setShowReturnModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Process Return
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Return Processing Modal */}
      {showReturnModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-6xl my-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Process Vehicle Return</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReturn.vehicle} ({selectedReturn.licensePlate}) - {selectedReturn.customerName}
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setShowReturnModal(false);
                  setSelectedReturn(null);
                  resetReturnData();
                }}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Inspection */}
                <div className="space-y-6">
                  {/* Basic Checks */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-4 text-red-600">Return Checklist</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="exterior"
                            checked={returnData.exteriorClean}
                            onCheckedChange={(checked) => 
                              setReturnData({...returnData, exteriorClean: checked as boolean})
                            }
                          />
                          <Label htmlFor="exterior">Exterior Clean</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="interior"
                            checked={returnData.interiorClean}
                            onCheckedChange={(checked) => 
                              setReturnData({...returnData, interiorClean: checked as boolean})
                            }
                          />
                          <Label htmlFor="interior">Interior Clean</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="keys"
                            checked={returnData.allKeysReturned}
                            onCheckedChange={(checked) => 
                              setReturnData({...returnData, allKeysReturned: checked as boolean})
                            }
                          />
                          <Label htmlFor="keys">All Keys Returned</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="smoking"
                            checked={returnData.noSmoking}
                            onCheckedChange={(checked) => 
                              setReturnData({...returnData, noSmoking: checked as boolean})
                            }
                          />
                          <Label htmlFor="smoking">No Smoking Evidence</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="damage"
                            checked={returnData.noDamage}
                            onCheckedChange={(checked) => 
                              setReturnData({...returnData, noDamage: checked as boolean})
                            }
                          />
                          <Label htmlFor="damage">No New Damage</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Final Mileage *</Label>
                          <Input
                            type="number"
                            value={returnData.finalMileage}
                            onChange={(e) => setReturnData({...returnData, finalMileage: e.target.value})}
                            placeholder={`Start: ${selectedReturn.startMileage}`}
                          />
                        </div>
                        <div>
                          <Label>Fuel Level (%) *</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={returnData.fuelLevel}
                            onChange={(e) => setReturnData({...returnData, fuelLevel: e.target.value})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Damage Report */}
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-4 text-red-600">Report Damage</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Damage Type</Label>
                          <Select value={currentDamage.type} onValueChange={(value) => setCurrentDamage({...currentDamage, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scratch">Scratch</SelectItem>
                              <SelectItem value="Dent">Dent</SelectItem>
                              <SelectItem value="Broken Glass">Broken Glass</SelectItem>
                              <SelectItem value="Interior Damage">Interior Damage</SelectItem>
                              <SelectItem value="Tire Damage">Tire Damage</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Severity</Label>
                          <Select value={currentDamage.severity} onValueChange={(value: any) => setCurrentDamage({...currentDamage, severity: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Minor">Minor (15,000-60,000 LKR)</SelectItem>
                              <SelectItem value="Moderate">Moderate (60,000-150,000 LKR)</SelectItem>
                              <SelectItem value="Severe">Severe (150,000+ LKR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={currentDamage.description}
                            onChange={(e) => setCurrentDamage({...currentDamage, description: e.target.value})}
                            placeholder="Describe the damage..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label>Estimated Cost (LKR)</Label>
                          <Input
                            type="number"
                            value={currentDamage.estimatedCost}
                            onChange={(e) => setCurrentDamage({...currentDamage, estimatedCost: parseFloat(e.target.value) || 0})}
                          />
                        </div>

                        {!cameraActive ? (
                          <Button variant="outline" className="w-full" onClick={startCamera}>
                            <Camera className="h-4 w-4 mr-2" />
                            Take Damage Photos
                          </Button>
                        ) : (
                          <div>
                            <video ref={videoRef} autoPlay playsInline className="w-full rounded mb-2" />
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-red-600" onClick={capturePhoto}>
                                <Camera className="h-4 w-4 mr-2" />
                                Capture
                              </Button>
                              <Button variant="outline" onClick={stopCamera}>Close</Button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          {currentDamage.photos.map((photo, i) => (
                            <img key={i} src={photo} alt={`Damage ${i+1}`} className="w-full h-20 object-cover rounded" />
                          ))}
                        </div>

                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={addDamageReport}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Add Damage Report
                        </Button>
                      </div>

                      {damageReports.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-red-300">
                          <p className="font-bold">Reported Damages: {damageReports.length}</p>
                          {damageReports.map((report, i) => (
                            <div key={i} className="text-sm mt-2 p-2 bg-white rounded">
                              <strong>{report.type} ({report.severity})</strong> - {formatCurrency(report.estimatedCost)}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Summary & Photos */}
                <div className="space-y-6">
                  {/* Charges Summary */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-4 text-green-600">Charges Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Rental:</span>
                          <span className="font-bold">{formatCurrency(selectedReturn.rentalAmount)}</span>
                        </div>
                        {charges.lateFee > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Late Fee:</span>
                            <span className="font-bold">{formatCurrency(charges.lateFee)}</span>
                          </div>
                        )}
                        {charges.cleaningFee > 0 && (
                          <div className="flex justify-between text-yellow-600">
                            <span>Cleaning Fee:</span>
                            <span className="font-bold">{formatCurrency(charges.cleaningFee)}</span>
                          </div>
                        )}
                        {charges.fuelCharge > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span>Fuel Charge:</span>
                            <span className="font-bold">{formatCurrency(charges.fuelCharge)}</span>
                          </div>
                        )}
                        {charges.damageCharge > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Damage Charge:</span>
                            <span className="font-bold">{formatCurrency(charges.damageCharge)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-3 border-t-2 border-green-600">
                          <span className="font-bold text-lg">TOTAL:</span>
                          <span className="font-bold text-2xl text-green-600">
                            {formatCurrency(selectedReturn.rentalAmount + charges.total)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => alert(`Additional charges calculated: ${formatCurrency(charges.total)}`)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Calculate Charges
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Vehicle Photos */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-4">Vehicle Return Photos</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {vehiclePhotos.map((photo, i) => (
                          <div key={i} className="relative">
                            <img src={photo} alt={`Vehicle ${i+1}`} className="w-full h-32 object-cover rounded" />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1"
                              onClick={() => setVehiclePhotos(vehiclePhotos.filter((_, index) => index !== i))}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="vehicle-photos"
                        onChange={(e) => {
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
                        }}
                      />
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('vehicle-photos')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos ({vehiclePhotos.length}/4 minimum)
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Staff Notes */}
                  <div>
                    <Label>Staff Notes</Label>
                    <Textarea
                      value={returnData.staffNotes}
                      onChange={(e) => setReturnData({...returnData, staffNotes: e.target.value})}
                      placeholder="Additional notes about the return..."
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => printReturnReport({
                        returnId: selectedReturn.id,
                        bookingId: selectedReturn.bookingId,
                        returnTime: new Date().toISOString(),
                        receivedBy: user.name,
                        mileageDriven: parseInt(returnData.finalMileage) - selectedReturn.startMileage,
                        returnData: { ...returnData, ...charges },
                        damageReports,
                        vehiclePhotos,
                        additionalCharges: charges.total,
                        totalAmount: selectedReturn.rentalAmount + charges.total
                      })}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Report
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={completeReturn}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Return
                    </Button>
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