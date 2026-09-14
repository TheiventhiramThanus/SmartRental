import { useState } from 'react';
import { MapPin, Calendar, Car, Shield, DollarSign, Satellite, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../ui/utils';
import { MovingCarAnimation } from '../hero/MovingCarAnimation';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion } from 'motion/react';

import { HowItWorks } from '../home/HowItWorks';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  const popularCars = [
    {
      id: 1,
      name: 'Tesla Model 3',
      image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhcnxlbnwxfHx8fDE3Njg5ODk2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      price: formatCurrency(24000),
      type: 'Electric',
      seats: 5
    },
    {
      id: 2,
      name: 'BMW 5 Series',
      image: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzY4OTYyNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      price: formatCurrency(36000),
      type: 'Luxury',
      seats: 5
    },
    {
      id: 3,
      name: 'Toyota RAV4',
      image: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXYlMjBjYXJ8ZW58MXx8fHwxNzY4OTU5NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      price: formatCurrency(19500),
      type: 'SUV',
      seats: 7
    },
    {
      id: 4,
      name: 'Porsche 911',
      image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY4OTczNjYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      price: formatCurrency(60000),
      type: 'Sports',
      seats: 2
    }
  ];

  const features = [
    {
      icon: Satellite,
      title: 'Real-Time GPS Tracking',
      description: 'Track your rental vehicle in real-time with our advanced IoT technology.'
    },
    {
      icon: DollarSign,
      title: 'Fair & Transparent Pricing',
      description: 'No hidden fees. Pay only for what you use with hourly or daily rates.'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All vehicles are regularly maintained and fully insured for your safety.'
    }
  ];

  const reviews = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Amazing service! The real-time tracking feature gave me peace of mind throughout my trip.',
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      rating: 5,
      text: 'Best car rental experience ever. The booking process was smooth and the car was in perfect condition.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      rating: 5,
      text: 'Transparent pricing and excellent customer service. Highly recommend SmartRental!',
      avatar: 'ER'
    }
  ];

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % popularCars.length);
  };

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + popularCars.length) % popularCars.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        >
            <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://images.unsplash.com/photo-1607261750900-00e36fe7f177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkcml2aW5nJTIwaGlnaHdheXxlbnwxfHx8fDE3Njg5NDA1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-highway-man-driving-a-car-at-sunset-1317-large.mp4" type="video/mp4" />
            </video>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-primary/60 to-black/80 z-[1]"></div>
        
        {/* Car Animation Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-[5] opacity-90 pointer-events-none">
          <MovingCarAnimation />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 drop-shadow-lg">
                Smart Vehicle Rentals<br />
                <span className="text-4xl md:text-5xl lg:text-6xl text-accent font-medium mt-2 block">with Real-Time Tracking</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4}>
            <p className="text-xl md:text-2xl mb-12 text-white/90 font-light tracking-wide max-w-3xl mx-auto">
                Experience the future of car rentals with IoT-enabled vehicles, tailored for your journey.
            </p>
          </ScrollReveal>

          {/* Quick Booking Form */}
          <ScrollReveal delay={0.6}>
            <Card className="max-w-5xl mx-auto mt-8 bg-white/95 backdrop-blur-xl text-left shadow-2xl border-white/20">
                <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-accent transition-colors">
                        <MapPin className="h-4 w-4" />
                        Pick-up Location
                    </label>
                    <Select>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-accent">
                        <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="downtown">Downtown</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                        <SelectItem value="north">North Station</SelectItem>
                        <SelectItem value="south">South Terminal</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-accent transition-colors">
                        <Calendar className="h-4 w-4" />
                        Pick-up Date
                    </label>
                    <Input type="date" min={new Date().toISOString().split('T')[0]} className="bg-gray-50 border-gray-200 focus:ring-accent" />
                    </div>

                    <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-accent transition-colors">
                        <Calendar className="h-4 w-4" />
                        Return Date
                    </label>
                    <Input type="date" min={new Date().toISOString().split('T')[0]} className="bg-gray-50 border-gray-200 focus:ring-accent" />
                    </div>

                    <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 group-hover:text-accent transition-colors">
                        <Car className="h-4 w-4" />
                        Vehicle Type
                    </label>
                    <Select>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-accent">
                        <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                        className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 font-semibold shadow-lg shadow-accent/20"
                        onClick={() => onNavigate('cars')}
                    >
                        Search Available Cars
                    </Button>
                </motion.div>
                </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
             <h2 className="text-center mb-16 text-4xl font-bold">Why Choose SmartRental?</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.2}>
                <Card className="text-center h-full hover:shadow-2xl transition-all duration-300 border-none bg-white/50 backdrop-blur dark:bg-gray-800/50 group">
                    <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-10 w-10 text-accent" />
                    </div>
                    <h3 className="mb-4 text-xl font-semibold group-hover:text-accent transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars Slider */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-center mb-16 text-4xl font-bold">Popular Vehicles</h2>
          </ScrollReveal>

          <div className="relative">
            <div className="flex items-center justify-between gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevCar}
                className="hidden md:flex flex-shrink-0 h-12 w-12 rounded-full hover:border-accent hover:text-accent transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                {[0, 1, 2].map((offset) => {
                  const index = (currentCarIndex + offset) % popularCars.length;
                  const car = popularCars[index];
                  return (
                    <ScrollReveal key={car.id} delay={offset * 0.1}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-none bg-gray-50 dark:bg-gray-800">
                        <div className="relative overflow-hidden h-56">
                            <img 
                                src={car.image} 
                                alt={car.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-white font-medium bg-accent px-3 py-1 rounded-full text-sm">Top Rated</span>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <h3 className="mb-2 text-2xl font-bold">{car.name}</h3>
                            <div className="flex items-center justify-between mb-6">
                            <span className="text-accent text-lg font-bold">{car.price}<span className="text-sm font-normal text-muted-foreground">/day</span></span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Car className="h-4 w-4" /> {car.seats} seats
                            </span>
                            </div>
                            <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => onNavigate('cars')}
                            >
                                Details
                            </Button>
                            <Button 
                                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20"
                                onClick={() => onNavigate('cars')}
                            >
                                Book Now
                            </Button>
                            </div>
                        </CardContent>
                        </Card>
                    </ScrollReveal>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextCar}
                className="hidden md:flex flex-shrink-0 h-12 w-12 rounded-full hover:border-accent hover:text-accent transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden justify-center gap-6 mt-8">
              <Button variant="outline" size="icon" onClick={prevCar} className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextCar} className="rounded-full">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-center mb-16 text-4xl font-bold">What Our Customers Say</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ScrollReveal key={index} delay={index * 0.15}>
                <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                    <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-white dark:ring-gray-800 shadow-sm">
                        {review.avatar}
                        </div>
                        <div>
                        <h4 className="font-bold text-lg">{review.name}</h4>
                        <div className="flex gap-1 mt-1">
                            {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                            ))}
                        </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground italic text-lg leading-relaxed">"{review.text}"</p>
                    </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
