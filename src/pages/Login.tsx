
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { authService } from '../services/api';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Login using API service
      const admin = await authService.login(username, password);
      
      // Set the admin in context
      setAdmin(admin);
      localStorage.setItem('admin', JSON.stringify(admin));
      
      // Check for trainees with expiring medical approval within a month
      if (admin?.baseId) {
        const expiringTrainees = trainees.filter(trainee => {
          if (trainee.baseId !== admin.baseId || !trainee.medicalClearance) return false;
          
          // Check if medical clearance is about to expire within a month
          if (!trainee.medicalClearanceDate) return false;
          
          const expirationDate = addMonths(parseISO(trainee.medicalClearanceDate), 12);
          const oneMonthFromNow = addMonths(new Date(), 1);
          
          return compareAsc(expirationDate, new Date()) >= 0 && compareAsc(expirationDate, oneMonthFromNow) <= 0;
        });
        
        if (expiringTrainees.length > 0) {
          toast({
            title: "התראה - אישורים רפואיים פגי תוקף",
            description: `יש ${expiringTrainees.length} מתאמנים שאישור רפואי שלהם יפוג בחודש הקרוב`,
            variant: "destructive"
          });
        }
      }
      
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

  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="glass max-w-md w-full p-8 rounded-2xl animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">מערכת אימ"ון</h1>
          <p className="text-muted-foreground">התחבר כדי להמשיך</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">
              שם משתמש
            </label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" placeholder="הזן שם משתמש" required autoComplete="off" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              סיסמה
            </label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="הזן סיסמה" required autoComplete="off" />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-3 rounded-lg font-medium shadow-md transition duration-300 hover:shadow-lg flex items-center justify-center" 
            disabled={loading}
          >
            {loading ? <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מתחבר...
              </span> : "התחבר"}
          </Button>
        </form>
      </div>
    </div>;
};

export default Login;
