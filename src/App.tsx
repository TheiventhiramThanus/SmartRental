import { useState, useEffect } from 'react';
import { onAuthChange, logOut, getDocument, getDocuments, limit } from './firebase';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { CarsPage } from './components/pages/CarsPage';
import { BlogPage } from './components/pages/BlogPage';
import { ContactPage } from './components/pages/ContactPage';
import { CarDetailsPage } from './components/pages/CarDetailsPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { EnhancedStaffDashboard } from './components/staff/EnhancedStaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Chatbot } from './components/Chatbot';
import { seedAllData } from './firebase/seedData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  // Handle Firebase Auth
  useEffect(() => {
    const DEMO_ROLES: Record<string, string> = {
      'admin@demo.com': 'admin',
      'staff@demo.com': 'staff',
      'customer@demo.com': 'customer',
    };

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full profile from Firestore
        let userProfile: any = await getDocument('users', firebaseUser.uid);
        
        if (!userProfile) {
          // Fallback if profile doesn't exist yet
          userProfile = {
            email: firebaseUser.email,
            role: 'customer',
            name: firebaseUser.displayName || 'User',
          };
        }

        // Always enforce correct role for demo accounts
        const emailLower = (firebaseUser.email || '').toLowerCase();
        if (DEMO_ROLES[emailLower]) {
          userProfile = { ...userProfile, role: DEMO_ROLES[emailLower] };
        }

        const fullUser = { id: firebaseUser.uid, ...userProfile };
        setUser(fullUser);
        // Keep localStorage in sync with correct role
        localStorage.setItem('currentUser', JSON.stringify(fullUser));
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => unsubscribe();
  }, []);


  // Handle initial route and browser navigation
  useEffect(() => {
    // Check for existing session first
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Apply demo role overrides on cached user too
      const DEMO_ROLES: Record<string, string> = {
        'admin@demo.com': 'admin',
        'staff@demo.com': 'staff',
        'customer@demo.com': 'customer',
      };
      const emailLower = (parsed.email || '').toLowerCase();
      if (DEMO_ROLES[emailLower]) {
        parsed.role = DEMO_ROLES[emailLower];
      }
      setUser(parsed);
    }


    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      if (hash) {
        // If it's a car details page like #car-details/123
        if (hash.startsWith('car-details/')) {
          const carId = hash.split('/')[1];
          setSelectedCarId(carId);
          setCurrentPage('car-details');
        } else {
          setCurrentPage(hash);
        }
      } else {
        // Default to home if no hash
        setCurrentPage('home');
      }
    };

    // Initial check
    handleHashChange();

    // Auto-seed database if needed
    const checkAndSeed = async () => {
      try {
        const vehicles = await getDocuments('vehicles', limit(1));
        if (vehicles.length === 0) {
          console.log('📭 Database is empty. Starting auto-seed...');
          await seedAllData();
          console.log('✅ Firebase database auto-seeded successfully');
        }
      } catch (error: any) {
        // If it's a permission error, we still want to log it
        console.error('❌ Firebase check/auto-seeding failed:', error);
      }
    };

    checkAndSeed();

    // Listen for hash changes (back/forward button)
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync currentPage with URL hash and update document title
  useEffect(() => {
    // Don't overwrite hash if it's the initial load or back button
    // This is tricky with the above useEffect. 
    // Instead, let's make the hash the source of truth if we want "independent refresh".

    // Update document title
    const pageTitles: Record<string, string> = {
      'home': 'Home - SmartRentalGPS',
      'about': 'About Us - SmartRentalGPS',
      'cars': 'Our Fleet - SmartRentalGPS',
      'blog': 'Blog - SmartRentalGPS',
      'contact': 'Contact Us - SmartRentalGPS',
      'login': 'Login - SmartRentalGPS',
      'register': 'Register - SmartRentalGPS',
      'forgot-password': 'Forgot Password - SmartRentalGPS',
      'customer-dashboard': 'Dashboard - SmartRentalGPS',
      'staff-dashboard': 'Staff Portal - SmartRentalGPS',
      'admin-dashboard': 'Admin Console - SmartRentalGPS',
      'car-details': 'Vehicle Details - SmartRentalGPS'
    };
    document.title = pageTitles[currentPage] || 'SmartRentalGPS';

    // Update URL hash without triggering hashchange event loop if possible, 
    // but since we listen to hashchange, setting it might re-trigger. 
    // We'll check if it's already correct.
    let targetHash = currentPage;
    if (currentPage === 'car-details' && selectedCarId) {
      targetHash = `car-details/${selectedCarId}`;
    }

    if (window.location.hash.slice(1) !== targetHash) {
      window.history.pushState(null, '', `#${targetHash}`);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedCarId]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Navigate based on role
    if (userData.role === 'customer') {
      setCurrentPage('customer-dashboard');
    } else if (userData.role === 'staff') {
      setCurrentPage('staff-dashboard');
    } else if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
    }
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    // Navigate based on the actual role assigned during registration
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (userData.role === 'staff') {
      setCurrentPage('staff-dashboard');
    } else {
      setCurrentPage('customer-dashboard');
    }
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('home');
  };

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleNavigateToCarDetails = (carId: string) => {
    setSelectedCarId(carId);
    setCurrentPage('car-details');
  };

  const handleBookingComplete = () => {
    if (user) {
      setCurrentPage('customer-dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  const renderPage = () => {
    // Authentication pages
    if (currentPage === 'login') {
      return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
    }

    if (currentPage === 'register') {
      return <RegisterPage onRegister={handleRegister} onNavigate={setCurrentPage} />;
    }

    if (currentPage === 'forgot-password') {
      return <ForgotPasswordPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
    }

    // Role-based dashboards
    if (currentPage === 'customer-dashboard' && user?.role === 'customer') {
      return (
        <CustomerDashboard
          user={user}
          onLogout={handleLogout}
          onNavigateToPublic={setCurrentPage}
          onUpdateProfile={handleUpdateProfile}
        />
      );
    }

    if (currentPage === 'staff-dashboard' && user?.role === 'staff') {
      return <EnhancedStaffDashboard user={user} onLogout={handleLogout} />;
    }

    if (currentPage === 'admin-dashboard' && user?.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }

    // Public pages with navigation and footer
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onLogin={() => setCurrentPage('login')}
          onDashboard={() => {
            if (user?.role === 'customer') setCurrentPage('customer-dashboard');
            else if (user?.role === 'staff') setCurrentPage('staff-dashboard');
            else if (user?.role === 'admin') setCurrentPage('admin-dashboard');
          }}
        />
        <main className="flex-1">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'cars' && <CarsPage onViewDetails={handleNavigateToCarDetails} />}
          {currentPage === 'blog' && <BlogPage />}
          {currentPage === 'contact' && <ContactPage />}
          {currentPage === 'car-details' && selectedCarId && (
            <CarDetailsPage
              carId={selectedCarId}
              user={user}
              onNavigate={setCurrentPage}
              onBookingComplete={handleBookingComplete}
            />
          )}
        </main>
        <Footer />
      </div>
    );
  };

  return (
    <>
      {renderPage()}
      <Chatbot user={user} />
    </>
  );
}