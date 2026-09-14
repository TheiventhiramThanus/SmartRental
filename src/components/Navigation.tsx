import image_baf58d3a1acc8d150b33a0be0860033126efb7d0 from 'figma:asset/baf58d3a1acc8d150b33a0be0860033126efb7d0.png';
import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import logo from 'figma:asset/baf58d3a1acc8d150b33a0be0860033126efb7d0.png';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: any;
  onLogin?: () => void;
  onDashboard?: () => void;
}

export function Navigation({ currentPage, onNavigate, user, onLogin, onDashboard }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'About', page: 'about' },
    { name: 'Cars', page: 'cars' },
    { name: 'Blog', page: 'blog' },
    { name: 'Contact', page: 'contact' },
  ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <img src={image_baf58d3a1acc8d150b33a0be0860033126efb7d0} alt="SmartRentalGPS Logo" className="h-[200px] w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`hover:text-accent transition-colors ${
                  currentPage === link.page ? 'text-accent' : ''
                }`}
              >
                {link.name}
              </button>
            ))}
            
            {user ? (
              <>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white border-none"
                  onClick={onDashboard}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center cursor-pointer">
                  {user.name.charAt(0)}
                </div>
              </>
            ) : (
              <>
                <Button 
                  className="bg-white hover:bg-gray-100 text-primary border-none rounded-lg px-6"
                  onClick={onLogin}
                >
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => onNavigate('cars')}
                >
                  Book Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left hover:text-accent transition-colors ${
                    currentPage === link.page ? 'text-accent' : ''
                  }`}
                >
                  {link.name}
                </button>
              ))}
              
              {user ? (
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white border-none w-full"
                  onClick={() => {
                    onDashboard?.();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 w-full"
                    onClick={() => {
                      onLogin?.();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground w-full"
                    onClick={() => {
                      onNavigate('cars');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Book Now
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
