import { Target, Eye, Satellite, DollarSign, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function AboutPage() {
  const values = [
    {
      icon: Satellite,
      title: 'Smart Pricing',
      description: 'Transparent and competitive pricing with no hidden fees. Pay only for what you use.'
    },
    {
      icon: Satellite,
      title: 'Real-Time Tracking',
      description: 'Advanced IoT technology enables real-time vehicle tracking for your peace of mind.'
    },
    {
      icon: Shield,
      title: 'Trusted Service',
      description: 'Over 10,000 satisfied customers and a 5-star average rating across all platforms.'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our dedicated support team is available round the clock to assist you.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">About SmartRental</h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Leading the future of vehicle rentals with innovative IoT technology and customer-first service
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2020, SmartRental emerged from a simple vision: to revolutionize the car rental industry through technology and transparency. We recognized that traditional car rental services were plagued with hidden fees, poor tracking, and unreliable service.
              </p>
              <p className="text-muted-foreground mb-4">
                By integrating cutting-edge IoT technology into every vehicle, we created a rental experience that's transparent, secure, and customer-focused. Our real-time tracking system not only provides peace of mind but also enables fair, distance-based pricing.
              </p>
              <p className="text-muted-foreground">
                Today, we serve thousands of customers across major cities, offering a fleet of well-maintained vehicles ranging from economy cars to luxury sedans. Our commitment to innovation and customer satisfaction drives everything we do.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1648178328042-b7c0f62e4181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3Njg5NjQ1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Our Fleet"
                className="rounded-lg shadow-xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide accessible, reliable, and technologically advanced vehicle rental services that empower our customers with transparency, flexibility, and peace of mind. We strive to make every journey safer and smarter through IoT innovation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the global leader in smart vehicle rentals, setting the industry standard for technology integration, customer service, and sustainable transportation. We envision a future where every rental experience is seamless, transparent, and environmentally responsible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-12">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="mb-3">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl mb-2 text-accent">500+</div>
              <div className="text-primary-foreground/80">Vehicles</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl mb-2 text-accent">10,000+</div>
              <div className="text-primary-foreground/80">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl mb-2 text-accent">50+</div>
              <div className="text-primary-foreground/80">Locations</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl mb-2 text-accent">5.0</div>
              <div className="text-primary-foreground/80">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-4">Meet Our Team</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our dedicated team of professionals works tirelessly to ensure your rental experience is exceptional
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'John Anderson', role: 'CEO & Founder', initials: 'JA' },
              { name: 'Sarah Mitchell', role: 'Head of Operations', initials: 'SM' },
              { name: 'David Lee', role: 'Chief Technology Officer', initials: 'DL' }
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-semibold mx-auto mb-4">
                    {member.initials}
                  </div>
                  <h4 className="mb-1">{member.name}</h4>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
