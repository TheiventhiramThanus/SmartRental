import { useState } from 'react';
import { LayoutDashboard, Car, DollarSign, User, LogOut, Calendar, Bell, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { CustomerOverviewPage } from './CustomerOverviewPage';
import { MyBookingsPage } from './MyBookingsPage';
import { MyBookingsTablePage } from './MyBookingsTablePage';
import { PaymentsPage } from './PaymentsPage';
import { ProfilePage } from './ProfilePage';
import { LiveTrackingPage } from './LiveTrackingPage';
import { NotificationsPage } from './NotificationsPage';
import { DocumentsPage } from './DocumentsPage';

interface CustomerDashboardProps {
  user: any;
  onLogout: () => void;
  onNavigateToPublic: (page: string) => void;
  onUpdateProfile: (user: any) => void;
}

export function CustomerDashboard({ user, onLogout, onNavigateToPublic, onUpdateProfile }: CustomerDashboardProps) {
  const [activePage, setActivePage] = useState('overview');
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleViewTracking = (bookingId: string) => {
    setTrackingBookingId(bookingId);
    setActivePage('tracking');
  };

  const handleNavigateFromOverview = (page: string) => {
    if (page === 'cars') {
      onNavigateToPublic('cars');
    } else {
      setActivePage(page);
    }
  };

  const renderContent = () => {
    if (activePage === 'tracking' && trackingBookingId) {
      return (
        <LiveTrackingPage
          bookingId={trackingBookingId}
          onBack={() => {
            setActivePage('bookings');
            setTrackingBookingId(null);
          }}
        />
      );
    }

    switch (activePage) {
      case 'overview':
        return <CustomerOverviewPage user={user} onNavigate={handleNavigateFromOverview} />;
      case 'bookings':
        return <MyBookingsTablePage user={user} onViewTracking={handleViewTracking} />;
      case 'payments':
        return <PaymentsPage user={user} />;
      case 'documents':
        return <DocumentsPage user={user} onUpdateProfile={onUpdateProfile} />;
      case 'notifications':
        return <NotificationsPage user={user} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateProfile={onUpdateProfile} />;
      default:
        return <CustomerOverviewPage user={user} onNavigate={handleNavigateFromOverview} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3>{user.name}</h3>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activePage === item.id ? 'default' : 'ghost'}
                      className={`w-full justify-start ${activePage === item.id ? 'bg-accent hover:bg-accent/90' : ''}`}
                      onClick={() => setActivePage(item.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onNavigateToPublic('home')}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Browse Cars
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}