import { useState } from 'react';
import { Car, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { signIn, signInWithGoogle, getDocument, updateDocument } from '../../firebase';

type DemoUser = {
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'customer';
  name: string;
  phone?: string;
  address?: string;
};

interface LoginPageProps {
  onLogin: (user: any) => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seedMsg, setSeedMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [fixMsg, setFixMsg] = useState('');

  const handleSeedUsers = async () => {
    try {
      setSeedMsg('Seeding demo data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Seed bookings in localStorage for the demo customer
      const demoBookings = [
        {
          id: 'bk-12345678',
          customerId: 'cust-123', // Matches the mock ID for customer@demo.com
          carName: 'BMW 5 Series',
          carImage: 'https://images.unsplash.com/photo-1687993320725-c4c2708ef074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzY4OTYyNzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
          pickupDate: '2024-03-15',
          pickupTime: '10:00 AM',
          returnDate: '2024-03-18',
          returnTime: '10:00 AM',
          status: 'Approved',
          estimatedCost: 108000
        },
        {
          id: 'bk-87654321',
          customerId: 'cust-123',
          carName: 'Toyota RAV4',
          carImage: 'https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXYlMjBjYXJ8ZW58MXx8fHwxNzY4OTU5NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
          pickupDate: '2024-02-10',
          pickupTime: '09:00 AM',
          returnDate: '2024-02-12',
          returnTime: '06:00 PM',
          status: 'Completed',
          estimatedCost: 39000
        }
      ];

      localStorage.setItem('bookings', JSON.stringify(demoBookings));
      setSeedMsg('Demo data seeded! Ready to login.');
    } catch (e) {
      setSeedMsg('Error seeding data');
      console.error(e);
    }
  };

  const handleFixDemoRoles = async () => {
    setFixMsg('Fixing demo user roles...');
    const demoUsers: DemoUser[] = [
      { email: 'admin@demo.com', password: 'admin123', role: 'admin', name: 'Admin User' },
      { email: 'staff@demo.com', password: 'staff123', role: 'staff', name: 'Staff User' },
    ];

    let successCount = 0;
    let errorMessages: string[] = [];

    for (const demo of demoUsers) {
      try {
        const firebaseUser = await signIn(demo.email, demo.password);
        await updateDocument('users', firebaseUser.uid, {
          name: demo.name,
          email: demo.email,
          role: demo.role,
          phone: demo.phone || '',
          address: demo.address || '',
        });
        successCount++;
      } catch (err: any) {
        errorMessages.push(`${demo.email}: ${err.message}`);
      }
    }

    if (successCount > 0 && errorMessages.length === 0) {
      setFixMsg(`Success: ${successCount} demo users fixed. Login with admin@demo.com / admin123`);
    } else if (successCount > 0) {
      setFixMsg(`Partial: fixed ${successCount}, errors: ${errorMessages.join(', ')}`);
    } else {
      setFixMsg(`Failed: ${errorMessages.join(', ')}. Make sure admin@demo.com and staff@demo.com are registered first.`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = await signIn(email, password);
      
      // Fetch user profile from Firestore
      let userProfile: any = await getDocument('users', firebaseUser.uid);
      
      // If user profile doesn't exist, create a basic one based on auth data
      if (!userProfile) {
        userProfile = {
           name: firebaseUser.displayName || email.split('@')[0],
           email: firebaseUser.email,
           role: 'customer',
           phone: '',
           address: ''
        };
        await updateDocument('users', firebaseUser.uid, userProfile);
      }

      // --- DEMO ROLE OVERRIDE ---
      // Always enforce correct roles for demo accounts regardless of Firestore data
      const demoRoleMap: Record<string, string> = {
        'admin@demo.com': 'admin',
        'staff@demo.com': 'staff',
        'customer@demo.com': 'customer',
      };
      const emailLower = (firebaseUser.email || '').toLowerCase();
      if (demoRoleMap[emailLower]) {
        const correctRole = demoRoleMap[emailLower];
        if (userProfile.role !== correctRole) {
          // Fix it in Firestore in the background
          updateDocument('users', firebaseUser.uid, { role: correctRole });
        }
        userProfile = { ...userProfile, role: correctRole };
      }
      // --- END DEMO ROLE OVERRIDE ---

      setSuccess('Login successful!');
      setTimeout(() => {
        onLogin({
          id: firebaseUser.uid,
          ...userProfile
        });
      }, 1000);


    } catch (err: any) {
      if (err.message && err.message.includes('auth/invalid-credential')) {
        setError('Invalid Email or Password.');
      } else {
        setError(err.message || 'Failed to login. Check your credentials.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      
      let userProfile = await getDocument('users', firebaseUser.uid);
      
      if (!userProfile) {
        userProfile = {
           name: firebaseUser.displayName || 'Google User',
           email: firebaseUser.email,
           role: 'customer'
        };
      }

      setSuccess('Login successful!');
      setTimeout(() => {
        onLogin({
          id: firebaseUser.uid,
          ...userProfile
        });
      }, 1000);

    } catch (err: any) {
      if (err.message && err.message.includes('auth/invalid-credential')) {
        setError('Invalid Email or Password.');
      } else {
        setError(err.message || 'Error signing in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Car className="h-8 w-8 text-accent" />
            <span className="text-2xl font-semibold">SmartRental</span>
          </div>

          <h2 className="text-center mb-2">Welcome Back</h2>
          <p className="text-center text-muted-foreground mb-6">
            Login to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-accent hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-accent hover:underline"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="mt-6 text-center border-t pt-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSeedUsers}
              className="text-xs text-muted-foreground hover:text-accent"
            >
              Create All Demo Users (Mock Data)
            </Button>
            {seedMsg && (
              <p className="text-xs text-green-600 mt-2 font-mono">
                {seedMsg}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFixDemoRoles}
              className="text-xs text-blue-500 hover:text-blue-700 w-full"
            >
              Fix Demo User Roles (Admin/Staff)
            </Button>
            {fixMsg && (
              <p className="text-xs mt-1 font-mono break-all" style={{ color: fixMsg.startsWith('Success') ? 'green' : fixMsg.startsWith('Partial') ? 'orange' : 'red' }}>
                {fixMsg}
              </p>
            )}
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <p className="text-sm font-semibold mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-2 text-muted-foreground">
              <div
                className="cursor-pointer hover:text-foreground hover:bg-black/5 p-1 rounded transition-colors"
                onClick={() => { setEmail('customer@demo.com'); setPassword('customer123'); }}
                title="Click to fill"
              >
                <strong>Customer:</strong> customer@demo.com / customer123
              </div>
              <div
                className="cursor-pointer hover:text-foreground hover:bg-black/5 p-1 rounded transition-colors"
                onClick={() => { setEmail('staff@demo.com'); setPassword('staff123'); }}
                title="Click to fill"
              >
                <strong>Staff:</strong> staff@demo.com / staff123
              </div>
              <div
                className="cursor-pointer hover:text-foreground hover:bg-black/5 p-1 rounded transition-colors"
                onClick={() => { setEmail('admin@demo.com'); setPassword('admin123'); }}
                title="Click to fill"
              >
                <strong>Admin:</strong> admin@demo.com / admin123
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
              (Click a user above to auto-fill)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
