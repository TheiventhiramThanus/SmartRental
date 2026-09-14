import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../ui/utils';

interface VehicleReturnsPageProps {
  user: any;
}

export function VehicleReturnsPage({ user }: VehicleReturnsPageProps) {
  const [ongoingBookings, setOngoingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [damageReport, setDamageReport] = useState({
    hasDamage: false,
    damageType: [] as string[],
    damageNotes: '',
    damagePhotos: [] as File[],
    estimatedCost: ''
  });
  const [returnData, setReturnData] = useState({
    endingOdometer: '',
    endingFuel: '',
    lateFee: 0,
    fuelCharge: 0,
    cleaningFee: 0
  });

  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const ongoing = allBookings.filter((b: any) => b.status === 'Ongoing');
    setOngoingBookings(ongoing);
  }, []);

  const damageTypes = [
    'Scratches',
    'Dent',
    'Broken Mirror',
    'Tire Damage',
    'Interior Damage',
    'Window Crack',
    'Bumper Damage',
    'Other'
  ];

  const handleDamageTypeToggle = (type: string) => {
    if (damageReport.damageType.includes(type)) {
      setDamageReport({
        ...damageReport,
        damageType: damageReport.damageType.filter(t => t !== type)
      });
    } else {
      setDamageReport({
        ...damageReport,
        damageType: [...damageReport.damageType, type]
      });
    }
  };

  const calculateExtraCharges = () => {
    const lateFee = returnData.lateFee || 0;
    const fuelCharge = returnData.fuelCharge || 0;
    const cleaningFee = returnData.cleaningFee || 0;
    const damageCost = parseInt(damageReport.estimatedCost) || 0;
    return lateFee + fuelCharge + cleaningFee + damageCost;
  };

  const handleCompleteReturn = (bookingId: string) => {
    if (!returnData.endingOdometer || !returnData.endingFuel) {
      alert('Please fill in all required fields.');
      return;
    }

    if (confirm('Complete vehicle return?')) {
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updated = allBookings.map((b: any) => 
        b.id === bookingId ? { 
          ...b, 
          status: 'Completed',
          returnedBy: user.name,
          endingOdometer: returnData.endingOdometer,
          endingFuel: returnData.endingFuel,
          damageReport: damageReport.hasDamage ? damageReport : null,
          extraCharges: {
            lateFee: returnData.lateFee,
            fuelCharge: returnData.fuelCharge,
            cleaningFee: returnData.cleaningFee,
            damageCost: parseInt(damageReport.estimatedCost) || 0
          },
          totalExtraCharges: calculateExtraCharges(),
          returnDate: new Date().toISOString()
        } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updated));
      
      const ongoing = updated.filter((b: any) => b.status === 'Ongoing');
      setOngoingBookings(ongoing);
      setSelectedBooking(null);
      
      // Reset forms
      setDamageReport({
        hasDamage: false,
        damageType: [],
        damageNotes: '',
        damagePhotos: [],
        estimatedCost: ''
      });
      setReturnData({
        endingOdometer: '',
        endingFuel: '',
        lateFee: 0,
        fuelCharge: 0,
        cleaningFee: 0
      });
      
      alert('Vehicle return completed successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h2>Vehicle Returns & Damage Reports</h2>

      {ongoingBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No ongoing rentals ready for return</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ongoingBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                {selectedBooking?.id !== booking.id ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3>{booking.carName} - {booking.assignedVehicle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Customer: {booking.customerName} | Expected Return: {booking.returnDate} {booking.returnTime}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-green-500">Ongoing</Badge>
                        <Badge variant="outline">
                          Started: {new Date(booking.handoverDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="bg-accent hover:bg-accent/90"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Process Return
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3>{booking.carName} - {booking.assignedVehicle}</h3>
                        <p className="text-sm text-muted-foreground">Return Processing</p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Return Details */}
                      <div className="space-y-4">
                        <h4>Return Details</h4>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ending Odometer (km)</label>
                          <Input
                            type="number"
                            placeholder="e.g., 15250"
                            value={returnData.endingOdometer}
                            onChange={(e) => setReturnData({ ...returnData, endingOdometer: e.target.value })}
                            required
                          />
                          {booking.startingOdometer && returnData.endingOdometer && (
                            <p className="text-xs text-muted-foreground">
                              Distance: {parseInt(returnData.endingOdometer) - parseInt(booking.startingOdometer)} km
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ending Fuel Level (%)</label>
                          <Input
                            type="number"
                            placeholder="e.g., 75"
                            value={returnData.endingFuel}
                            onChange={(e) => setReturnData({ ...returnData, endingFuel: e.target.value })}
                            required
                          />
                          {booking.startingFuel && returnData.endingFuel && (
                            <p className="text-xs text-muted-foreground">
                              Fuel used: {parseInt(booking.startingFuel) - parseInt(returnData.endingFuel)}%
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Late Fee (LKR)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={returnData.lateFee}
                            onChange={(e) => setReturnData({ ...returnData, lateFee: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Fuel Charge (LKR)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={returnData.fuelCharge}
                            onChange={(e) => setReturnData({ ...returnData, fuelCharge: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cleaning Fee (LKR)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={returnData.cleaningFee}
                            onChange={(e) => setReturnData({ ...returnData, cleaningFee: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      {/* Damage Report */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={damageReport.hasDamage}
                            onCheckedChange={(checked) => setDamageReport({ ...damageReport, hasDamage: checked as boolean })}
                          />
                          <label className="font-medium">Report Damage</label>
                        </div>

                        {damageReport.hasDamage && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Damage Type</label>
                              <div className="grid grid-cols-2 gap-2">
                                {damageTypes.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={damageReport.damageType.includes(type)}
                                      onCheckedChange={() => handleDamageTypeToggle(type)}
                                    />
                                    <label className="text-sm cursor-pointer">{type}</label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Damage Notes</label>
                              <Textarea
                                placeholder="Describe the damage in detail..."
                                value={damageReport.damageNotes}
                                onChange={(e) => setDamageReport({ ...damageReport, damageNotes: e.target.value })}
                                rows={4}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Estimated Repair Cost (LKR)</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={damageReport.estimatedCost}
                                onChange={(e) => setDamageReport({ ...damageReport, estimatedCost: e.target.value })}
                              />
                            </div>

                            <div className="border-2 border-dashed rounded-lg p-4 text-center">
                              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Upload damage photos</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <Card className="bg-secondary">
                      <CardContent className="p-4">
                        <h4 className="mb-3">Extra Charges Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Late Fee:</span>
                            <span>{formatCurrency(returnData.lateFee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Charge:</span>
                            <span>{formatCurrency(returnData.fuelCharge)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cleaning Fee:</span>
                            <span>{formatCurrency(returnData.cleaningFee)}</span>
                          </div>
                          {damageReport.hasDamage && (
                            <div className="flex justify-between">
                              <span>Damage Cost:</span>
                              <span>{formatCurrency(parseInt(damageReport.estimatedCost) || 0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                            <span>Total Extra Charges:</span>
                            <span className="text-accent">{formatCurrency(calculateExtraCharges())}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600 flex-1"
                        onClick={() => handleCompleteReturn(booking.id)}
                      >
                        Complete Return
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedBooking(null)}>
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
