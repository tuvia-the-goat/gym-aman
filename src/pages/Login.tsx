import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '../services/api';
import { Dumbbell, LogIn, User, Lock } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { addMonths, compareAsc, parseISO } from 'date-fns';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {
    setAdmin,
    loading,
    setLoading,
    trainees
  } = useAdmin();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Prevent back navigation after logout
  useEffect(() => {
    // Clear any existing admin data on login page mount
    authService.logout();

    // Block navigation with browser back button
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Login using API service
      const admin = await authService.login(username, password);

      // Set the admin in context
      setAdmin(admin);
      localStorage.setItem('admin', JSON.stringify(admin));

      // Navigate to dashboard
      navigate('/dashboard');
      toast({
        title: "התחברות הצליחה",
        description: `ברוך הבא, ${username}!`
      });
    } catch (error) {
      toast({
        title: "התחברות נכשלה",
        description: "שם משתמש או סיסמה שגויים",
        variant: "destructive"
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-background">
      <div className="w-full max-w-md">
      <div className="flex justify-center gap-6 mb-10">
                  <img src="/amanLogo.png" alt="Aman Logo" className="h-16" />
                  <img src="/artechLogo.png" alt="Artech Logo" className="h-16" />
                  <img src="/hadrahaLogo.png" alt="Hadraha Logo" className="h-16" />
                </div>
        <div className="glass p-8 rounded-2xl mb-40 animate-fade-up shadow-lg border border-border/30">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Dumbbell className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">מערכת אימ"ון</h1>
            <p className="text-muted-foreground">כניסת מנהלים, התחבר כדי להמשיך</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                שם משתמש
              </label>
              <div className="relative">
                <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="pr-10" placeholder="הזן שם משתמש" required autoComplete="off" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                סיסמה
              </label>
              <div className="relative">
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" placeholder="הזן סיסמה" required autoComplete="off" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מתחבר...
                </span> : <span className="flex items-center justify-center">
                  <LogIn className="ml-2 h-5 w-5" />
                  התחבר
                </span>}
            </Button>
          </form>
          
          
        </div>
      </div>
    </div>;
};
export default Login;