import { Search, CalendarCheck, Key, Car } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: '1. Browse & Select',
      description: 'Choose from our wide range of premium vehicles.'
    },
    {
      icon: CalendarCheck,
      title: '2. Book Online',
      description: 'Select your dates and book instantly with our secure system.'
    },
    {
      icon: Key,
      title: '3. Pick Up',
      description: 'Pick up your car or get it delivered to your location.'
    },
    {
      icon: Car,
      title: '4. Enjoy the Ride',
      description: 'Hit the road with confidence and 24/7 support.'
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center mb-12 text-3xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg z-10 relative">
                <step.icon className="h-8 w-8" />
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-accent/30 -z-0" />
              )}
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
