import { MapPin, Phone, Mail, Clock, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';

export function ContactPage() {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Smart Street', 'Tech City, TC 12345', 'United States']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@smartrental.com', 'support@smartrental.com']
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Friday: 8am - 8pm', 'Saturday: 9am - 6pm', 'Sunday: 10am - 4pm']
    }
  ];

  const locations = [
    { name: 'Downtown Office', address: '123 Smart Street, Tech City', phone: '+1 (555) 123-4567' },
    { name: 'Airport Location', address: '456 Airport Blvd, Tech City', phone: '+1 (555) 234-5678' },
    { name: 'North Station', address: '789 North Ave, Tech City', phone: '+1 (555) 345-6789' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-center mb-4">Contact Us</h1>
          <p className="text-center text-primary-foreground/90 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName">First Name</label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName">Last Name</label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email">Email Address</label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone">Phone Number</label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject">Subject</label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message">Message</label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                    />
                  </div>

                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="mb-2">{info.title}</h4>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Facebook className="h-5 w-5" />
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Twitter className="h-5 w-5" />
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Locations */}
        <div className="mb-12">
          <h2 className="text-center mb-8">Our Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="mb-3">{location.name}</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 flex-shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Map */}
        <Card className="overflow-hidden">
          <div className="w-full h-96 bg-muted flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Interactive Map</p>
              <p className="text-sm text-muted-foreground mt-2">
                Google Maps integration would be displayed here
              </p>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">What documents do I need to rent a car?</h4>
                <p className="text-muted-foreground">
                  You'll need a valid driver's license, a credit card in your name, and proof of insurance. International renters may need an International Driving Permit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">Can I modify or cancel my reservation?</h4>
                <p className="text-muted-foreground">
                  Yes, you can modify or cancel your reservation up to 24 hours before pickup without any charges. Changes within 24 hours may incur a fee.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">What is included in the rental price?</h4>
                <p className="text-muted-foreground">
                  The rental price includes basic insurance, unlimited mileage (on select plans), and 24/7 roadside assistance. Fuel is not included.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2">How does real-time tracking work?</h4>
                <p className="text-muted-foreground">
                  Our IoT-enabled vehicles allow you to track your rental in real-time through our mobile app, ensuring transparency and security throughout your rental period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
