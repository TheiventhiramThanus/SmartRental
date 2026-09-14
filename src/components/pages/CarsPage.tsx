import { useState, useEffect } from 'react';
import { Car, Users, Fuel, Gauge, Filter, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { formatCurrency } from '../ui/utils';
import { getDocuments } from '@/firebase';

interface CarsPageProps {
  onViewDetails?: (carId: string) => void;
}

export function CarsPage({ onViewDetails }: CarsPageProps) {
  // Price range updated for LKR (0 to 100,000)
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      try {
        setIsLoading(true);
        const vehicles = await getDocuments('vehicles');
        setCars(vehicles);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCars();
  }, []);

  const filteredCars = cars.filter(car => {
    const dailyRate = car.dailyRate || car.pricePerDay || 0;
    const priceMatch = dailyRate >= priceRange[0] && dailyRate <= priceRange[1];
    const typeMatch = selectedType === 'all' || car.type === selectedType;
    const fuelMatch = selectedFuel === 'all' || car.fuelType === selectedFuel;
    return priceMatch && typeMatch && fuelMatch;
  });

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-center mb-4">Our Fleet</h1>
          <p className="text-center text-primary-foreground/90 max-w-2xl mx-auto">
            Choose from our wide selection of well-maintained vehicles with real-time tracking
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5" />
                  <h3>Filters</h3>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium">Price Range (per day)</label>
                  <Slider
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>

                {/* Car Type */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium">Car Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Type */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium">Fuel Type</label>
                  <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Fuels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fuels</SelectItem>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPriceRange([0, 100000]);
                    setSelectedType('all');
                    setSelectedFuel('all');
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cars Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
                <p className="text-muted-foreground">Loading vehicle fleet...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Showing {filteredCars.length} of {cars.length} vehicles
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCars.map((car) => {
                    const dailyRate = car.dailyRate || car.pricePerDay || 0;
                    const isAvailable = car.status === 'Available' || car.available === true;

                    return (
                      <Card key={car.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                        <div className="relative h-56">
                          <img
                            src={car.image || 'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=1080'}
                            alt={car.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${isAvailable ? 'bg-green-500 text-white' :
                              car.status === 'Maintenance' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {car.status || (isAvailable ? 'Available' : 'Rented')}
                          </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="mb-1 text-lg font-bold">{car.name}</h3>
                              <span className="inline-block bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-semibold">
                                {car.type}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-accent">{formatCurrency(dailyRate)}</div>
                              <div className="text-xs text-muted-foreground">per day</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{car.seats} Seats</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              <span>{car.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              <span>{car.transmission}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              <span>{formatCurrency(car.pricePerKm || 0)}/km</span>
                            </div>
                          </div>

                          <div className="mt-auto flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              disabled={!isAvailable}
                              onClick={() => onViewDetails?.(car.id.toString())}
                            >
                              View Details
                            </Button>
                            <Button
                              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                              disabled={!isAvailable}
                              onClick={() => onViewDetails?.(car.id.toString())}
                            >
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredCars.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                    <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                      No cars match your current filters. Try resetting or adjusting your search.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceRange([0, 100000]);
                        setSelectedType('all');
                        setSelectedFuel('all');
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
