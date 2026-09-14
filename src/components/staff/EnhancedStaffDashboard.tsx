import { useState } from 'react';
import { ClipboardList, Car, FileText, Wrench, DollarSign, LogOut, Navigation, CheckSquare, Plus, Menu, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { SmartRentalGPSPage } from '../admin/gps/SmartRentalGPSPage';
import { getDocuments } from '../../firebase';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { EnhancedBookingRequestsPage } from './EnhancedBookingRequestsPage';
import { EnhancedPickupHandoverPage } from './EnhancedPickupHandoverPage';
import { EnhancedVehicleReturnsPage } from './EnhancedVehicleReturnsPage';
import { EnhancedActiveRentalsPage } from './EnhancedActiveRentalsPage';
import { EnhancedStaffPaymentsPage } from './EnhancedStaffPaymentsPage';
import { StaffMaintenancePage } from './StaffMaintenancePage';
import { ManualBookingPage } from './ManualBookingPage';

interface EnhancedStaffDashboardProps {
  user: any;
  onLogout: () => void;
}

export function EnhancedStaffDashboard({ user, onLogout }: EnhancedStaffDashboardProps) {
  const [activePage, setActivePage] = useState('requests');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedVehicleForTracking, setSelectedVehicleForTracking] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  useEffect(() => {
    if (activePage === 'tracking') {
      fetchVehicles();
    }
  }, [activePage]);

  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const data = await getDocuments('vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const menuItems = [
    { id: 'requests', label: 'Booking Requests', icon: ClipboardList },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'pickup', label: 'Pickup & Handover', icon: CheckSquare },
    { id: 'active', label: 'Active Rentals', icon: Navigation },
    { id: 'returns', label: 'Returns & Damage', icon: Car },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'manual', label: 'Manual Booking', icon: Plus },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'requests':
        return <EnhancedBookingRequestsPage user={user} />;
      case 'tracking':
        if (selectedVehicleForTracking) {
          return (
            <SmartRentalGPSPage 
              vehicle={selectedVehicleForTracking} 
              onBack={() => setSelectedVehicleForTracking(null)} 
            />
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-800">Fleet Tracking Selection</h2>
              <p className="text-gray-500">Select a vehicle to view real-time live location and tracking details.</p>
            </div>

            {isLoadingVehicles ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading vehicle fleet...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-secondary/50">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={vehicle.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={
                          vehicle.status === 'Available' ? 'bg-green-500' :
                          vehicle.status === 'Rented' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-800">{vehicle.name}</h3>
                        <p className="text-sm text-gray-500">{vehicle.licensePlate} • {vehicle.model}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Tracking Path</span>
                          <span className="text-xs font-mono text-blue-600">/tracking/{vehicle.id}</span>
                        </div>
                        <Button 
                          onClick={() => setSelectedVehicleForTracking(vehicle)}
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Track Vehicle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {vehicles.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No vehicles found in the system</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'pickup':
        return <EnhancedPickupHandoverPage user={user} />;
      case 'active':
        return <EnhancedActiveRentalsPage user={user} />;
      case 'returns':
        return <EnhancedVehicleReturnsPage user={user} />;
      case 'payments':
        return <EnhancedStaffPaymentsPage user={user} />;
      case 'maintenance':
        return <StaffMaintenancePage user={user} />;
      case 'manual':
        return <ManualBookingPage user={user} />;
      default:
        return <EnhancedBookingRequestsPage user={user} />;
    }
  };

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Car className="h-8 w-8" />
        <span className="text-xl font-semibold">SmartRental</span>
      </div>

      <div className="flex items-center gap-3 mb-8 p-3 bg-primary-foreground/10 rounded-lg">
        <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
          {user.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm">{user.name}</h4>
          <p className="text-xs text-primary-foreground/70">Staff Member</p>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 ${
                activePage === item.id ? 'bg-primary-foreground/20' : ''
              }`}
              onClick={() => {
                setActivePage(item.id);
                setMobileOpen(false);
                if (item.id === 'tracking') {
                  setSelectedVehicleForTracking(null);
                }
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-8">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <span className="font-semibold">SmartRental Staff</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-primary text-primary-foreground border-none w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-primary text-primary-foreground flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}