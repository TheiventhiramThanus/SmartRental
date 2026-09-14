import { Car, Users, Fuel, Gauge, MapPin, Calendar, Clock, Upload, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '../ui/utils';
import { getDocument, addDocument } from '../../firebase';
import { useEffect, useState } from 'react';

interface CarDetailsPageProps {
  carId: string;
  user: any;
  onNavigate: (page: string) => void;
  onBookingComplete: () => void;
}

export function CarDetailsPage({ carId, user, onNavigate, onBookingComplete }: CarDetailsPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [car, setCar] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    licenseFile: null as File | null
  });

  useEffect(() => {
    async function fetchCar() {
      try {
        setIsLoading(true);
        const carData = await getDocument('vehicles', carId);
        setCar(carData);
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCar();
  }, [carId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookingData({ ...bookingData, licenseFile: e.target.files[0] });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!car) return;

    try {
      // Calculate estimated cost
      const pickup = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
      const returnDate = new Date(`${bookingData.returnDate}T${bookingData.returnTime}`);
      const durationMs = returnDate.getTime() - pickup.getTime();
      const totalHours = Math.max(0, durationMs / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const overHours = Math.ceil(totalHours % 24);

      const dailyRate = car.pricePerDay || car.dailyRate || 0;
      const hourlyRate = car.pricePerHour || (dailyRate / 8); // Average 8 hours usage per day as base for hourly

      const daysFee = days * dailyRate;
      const overHoursFee = overHours * hourlyRate;
      const totalAmount = daysFee + overHoursFee;

      // Create booking
      const booking = {
        carId: car.id,
        carName: car.name,
        carImage: car.image || car.imageUrl,
        customerId: user.id,
        customerName: user.name,
        pickupDate: bookingData.pickupDate,
        pickupTime: bookingData.pickupTime,
        returnDate: bookingData.returnDate,
        returnTime: bookingData.returnTime,
        estimatedCost: totalAmount,
        breakdown: {
          days,
          daysFee,
          overHours,
          overHoursFee
        },
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDocument('bookings', booking);

      // Create initial payment record
      await addDocument('payments', {
        bookingId: docRef.id,
        customerId: user.id,
        customerName: user.name,
        carName: car.name,
        amount: totalAmount,
        breakdown: {
          days,
          daysFee,
          overHours,
          overHoursFee
        },
        status: 'Pending',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
        invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}`
      });

      alert('Booking request submitted successfully! Your "My Bookings" page will be updated automatically.');
      onBookingComplete();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to submit booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => onNavigate('cars')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cars
        </Button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
            <p className="text-muted-foreground">Loading vehicle details...</p>
          </div>
        ) : !car ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
            <Button onClick={() => onNavigate('cars')}>Return to Fleet</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Car Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <img
                  src={car.image || car.imageUrl}
                  alt={car.name}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="mb-2">{car.name}</h1>
                      <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full">
                        {car.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl text-accent">{formatCurrency(car.pricePerDay || car.dailyRate || 0)}</div>
                      <div className="text-sm text-muted-foreground">per day</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{car.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm text-muted-foreground">Seats</div>
                        <div>{car.seats}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm text-muted-foreground">Fuel</div>
                        <div>{car.fuelType}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm text-muted-foreground">Trans.</div>
                        <div>{car.transmission}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm text-muted-foreground">Year</div>
                        <div>{car.year || '2023'}</div>
                      </div>
                    </div>
                  </div>

                  {car.features && (
                    <div className="border-t pt-6">
                      <h3 className="mb-4">Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {car.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6 mt-6">
                    <h3 className="mb-4">Pricing Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Per Day:</span>
                        <span className="font-semibold">{formatCurrency(car.pricePerDay || car.dailyRate || 0)}</span>
                      </div>
                      {car.pricePerHour && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Per Hour:</span>
                          <span className="font-semibold">{formatCurrency(car.pricePerHour)}</span>
                        </div>
                      )}
                      {car.pricePerKm && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Per Kilometer:</span>
                          <span className="font-semibold">{formatCurrency(car.pricePerKm)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h3 className="mb-6">Book This Vehicle</h3>

                  {!user ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Please login to book this vehicle
                      </p>
                      <Button
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => onNavigate('login')}
                      >
                        Login to Book
                      </Button>
                    </div>
                  ) : (!user.licenseUploaded || !user.nicUploaded) ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">
                        <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <h4 className="font-bold mb-1">Documents Required</h4>
                        <p className="text-xs">
                          You must upload your **National ID (NIC)** and **Driver's License** to your profile before you can book a vehicle.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
                        onClick={() => onNavigate('customer-dashboard')}
                      >
                        Go to Documents Page
                      </Button>
                      <p className="text-[10px] text-muted-foreground italic">
                        Once uploaded, return here to complete your booking.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Pickup Date
                        </label>
                        <Input
                          type="date"
                          value={bookingData.pickupDate}
                          onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      {/* ... other form fields ... */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Pickup Time
                        </label>
                        <Input
                          type="time"
                          value={bookingData.pickupTime}
                          onChange={(e) => setBookingData({ ...bookingData, pickupTime: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Return Date
                        </label>
                        <Input
                          type="date"
                          value={bookingData.returnDate}
                          onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                          min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Return Time
                        </label>
                        <Input
                          type="time"
                          value={bookingData.returnTime}
                          onChange={(e) => setBookingData({ ...bookingData, returnTime: e.target.value })}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                      >
                        Submit Booking Request
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Your booking will be reviewed by our staff
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
