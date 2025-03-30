
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useToast } from '@/hooks/use-toast';

const AdminLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const admin = await authService.login(loginUsername, loginPassword);
      navigate('/dashboard');
      toast({
        title: "התחברות הצליחה",
        description: `ברוך הבא, ${loginUsername}!`,
      });
    } catch (error) {
      toast({
        title: "התחברות נכשלה",
        description: "שם משתמש או סיסמה שגויים",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass max-w-md mx-auto p-8 rounded-2xl animate-fade-up">
      <h3 className="text-xl font-bold mb-4 text-center">ט מנהלים</h3>
      <form onSubmit={handleAdminLogin} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            שם משתמש
          </label>
          <input
            id="username"
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            className="input-field"
            placeholder="הזן שם משתמש"
            required
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="input-field"
            placeholder="הזן סיסמה"
            required
            autoComplete="off"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
          transition duration-300 hover:bg-primary/90 hover:shadow-lg"
        >
          התחבר
        </button>
      </form>
    </div>
  );
};

export default AdminLoginForm;
