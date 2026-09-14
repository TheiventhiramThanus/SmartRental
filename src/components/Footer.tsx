import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logo from 'figma:asset/baf58d3a1acc8d150b33a0be0860033126efb7d0.png';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SmartRentalGPS Logo" className="h-[200px] w-auto object-contain" />
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Your trusted partner for smart vehicle rentals with real-time tracking and IoT technology.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-accent transition-colors" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-accent transition-colors" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-accent transition-colors" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-accent transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="hover:text-accent cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Our Fleet</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-accent cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Terms & Conditions</li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4">Services</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="hover:text-accent cursor-pointer transition-colors">Real-Time Tracking</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Hourly Rental</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Daily Rental</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Corporate Solutions</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Airport Pickup</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4">Contact Us</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>123 Smart Street, Tech City, TC 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@smartrentalgps.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} SmartRentalGPS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
