import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, Users, DollarSign, LogOut, 
  TrendingUp, MapPin, Wrench, FileText, Bell, Menu, Calculator
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { OverviewPage } from './OverviewPage';
import { VehicleManagementPage } from './VehicleManagementPage';
import { UserManagementPage } from './UserManagementPage';
import { SmartRentalGPSPage } from './gps/SmartRentalGPSPage';
import { ManualBillingPage } from './gps/ManualBillingPage';
import { CustomerActivityPage } from './CustomerActivityPage';
import { ReportsPage } from './ReportsPage';
import { MaintenancePage } from './MaintenancePage';
import { StaffSalaryPage } from './StaffSalaryPage';
import { MaintenanceAlertsPage } from './MaintenanceAlertsPage';
import { getDocuments } from '../../firebase';

// The one vehicle that has GPS hardware installed
const GPS_VEHICLE_PLATE = 'WP-LUX-5678';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedVehicleForTracking, setSelectedVehicleForTracking] = useState<any>(null);
  const [selectedVehicleForBilling, setSelectedVehicleForBilling] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [gpsVehicle, setGpsVehicle] = useState<any>(null);

  // Fetch all vehicles once on mount so gpsVehicle is always available to all pages
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const data = await getDocuments('vehicles');
      setVehicles(data);
      const found = (data as any[]).find((v: any) => v.licensePlate === GPS_VEHICLE_PLATE);
      if (found) setGpsVehicle(found);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'billing', label: 'AI Billing', icon: Calculator },
    { id: 'activity', label: 'Customer Activity', icon: TrendingUp },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'salary', label: 'Staff Salary', icon: DollarSign },
    { id: 'alerts', label: 'Maintenance Alerts', icon: Bell },
  ];

  const renderContent = () => {
    switch (activePage) {

      case 'overview':
        return (
          <OverviewPage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );

      case 'tracking': {
        // BMW GPS tracking
        if (selectedVehicleForTracking) {
          return (
            <SmartRentalGPSPage
              vehicle={selectedVehicleForTracking}
              onBack={() => setSelectedVehicleForTracking(null)}
            />
          );
        }

        const gpsVehicles = vehicles.filter(v => v.licensePlate === GPS_VEHICLE_PLATE);

        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-800">Fleet Tracking</h2>
              <p className="text-gray-500">Live hardware GPS tracking for equipped vehicles.</p>
            </div>

            {isLoadingVehicles ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading GPS fleet...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gpsVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-200">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={vehicle.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
                          GPS ENABLED
                        </span>
                      </div>
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
                {gpsVehicles.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No GPS vehicles found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'billing': {
        if (selectedVehicleForBilling) {
          return (
            <ManualBillingPage
              vehicle={selectedVehicleForBilling}
              onBack={() => setSelectedVehicleForBilling(null)}
            />
          );
        }

        const billingVehicles = vehicles.filter(v => v.licensePlate !== GPS_VEHICLE_PLATE);

        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-800">AI Billing Engine</h2>
              <p className="text-gray-500">Calculate invoices using trip distances for non-GPS enabled vehicles.</p>
            </div>

            {isLoadingVehicles ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading fleet...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {billingVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-purple-100">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={vehicle.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          ⚡ AI BILLING
                        </span>
                      </div>
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
                          <span className="text-[10px] uppercase font-bold text-gray-400">Billing Mode</span>
                          <span className="text-xs font-mono text-purple-600">Start KM → End KM</span>
                        </div>
                        <Button
                          onClick={() => setSelectedVehicleForBilling(vehicle)}
                          className="gap-2" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white' }}
                        >
                          <Car className="w-4 h-4" />
                          Bill Vehicle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'activity':
        return (
          <CustomerActivityPage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );

      case 'vehicles':
        return (
          <VehicleManagementPage
            user={user}
            gpsVehicleId={gpsVehicle?.id}
          />
        );

      case 'users':
        return <UserManagementPage />;

      case 'reports':
        return (
          <ReportsPage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );

      case 'maintenance':
        return (
          <MaintenancePage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );

      case 'salary':
        return <StaffSalaryPage />;

      case 'alerts':
        return (
          <MaintenanceAlertsPage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );

      default:
        return (
          <OverviewPage
            gpsVehicleId={gpsVehicle?.id}
            gpsVehicleName={gpsVehicle?.name}
          />
        );
    }
  };

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Car className="h-8 w-8" />
        <span className="text-xl font-semibold">SmartRentalGPS</span>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-primary-foreground/10 rounded-lg">
        <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-semibold">Admin User</h4>
          <p className="text-xs text-primary-foreground/70">Administrator</p>
        </div>
      </div>

      {/* GPS Vehicle live badge — visible on every page */}
      {gpsVehicle && (
        <div className="mb-5 p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">GPS Connected</p>
              <p className="text-xs text-white font-semibold truncate">{gpsVehicle.name}</p>
              <p className="text-[10px] font-mono text-blue-300">{gpsVehicle.licensePlate}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 ${
                activePage === item.id ? 'bg-primary-foreground/20 font-semibold' : ''
              }`}
              onClick={() => {
                setActivePage(item.id);
                setMobileOpen(false);
                if (item.id === 'tracking') {
                  setSelectedVehicleForTracking(null);
                  setSelectedVehicleForBilling(null);
                }
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="border-t border-primary-foreground/20 mt-6 pt-6">
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
          <span className="font-semibold">SmartRentalGPS Admin</span>
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