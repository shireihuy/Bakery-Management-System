import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Loader2, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onToggleMode: () => void;
  onBackToHome?: () => void;
}

export default function LoginPage({ onToggleMode, onBackToHome }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      
      {/* Back to Home Button */}
      {onBackToHome && (
        <Button
          variant="ghost"
          className="absolute top-6 left-6 z-20 text-green-700 hover:text-green-900 hover:bg-green-100"
          onClick={onBackToHome}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      )}
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your Matcha Bakery account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-green-600">Don't have an account? </span>
              <button
                type="button"
                onClick={onToggleMode}
                className="text-green-900 hover:underline"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-green-200">
            <p className="text-sm text-green-600 mb-3">Demo accounts:</p>
            <div className="space-y-1 text-xs text-green-700">
              <p>Admin: admin@bakery.com / admin123</p>
              <p>Manager: manager@bakery.com / manager123</p>
              <p>Baker: baker@bakery.com / baker123</p>
              <p>Cashier: cashier@bakery.com / cashier123</p>
              <p>Customer: customer@bakery.com / customer123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}