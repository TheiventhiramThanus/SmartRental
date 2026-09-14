import { useState } from 'react';
import { Car, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { supabase } from '../../utils/supabase/client';

interface ForgotPasswordPageProps {
  onLogin: (user: any) => void;
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onLogin, onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setStep('otp');
        setMessage('OTP sent to your email. Please check your inbox.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        const user = {
          id: data.session.user.id,
          email: data.session.user.email,
          role: data.session.user.user_metadata?.role || 'customer',
          name: data.session.user.user_metadata?.name || 'User',
        };
        onLogin(user);
      }
    } catch (err) {
      setError('Invalid OTP or verification failed.');
    } finally {
      setLoading(false);
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

          <h2 className="text-center mb-2">
            {step === 'email' ? 'Forgot Password?' : 'Enter OTP'}
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            {step === 'email' 
              ? 'Enter your email to receive a login OTP' 
              : `Enter the OTP sent to ${email}`}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp">One-Time Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 tracking-widest"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <div className="text-center mt-4">
                 <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
