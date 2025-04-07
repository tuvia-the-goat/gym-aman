
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { admin, loading } = useAdmin();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && admin) {
      navigate('/dashboard');
    }
  }, [admin, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-lg w-full px-4 py-8 space-y-8 bg-background rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold">מערכת אימ"ון</h1>
        <p className="text-xl text-muted-foreground">מערכת ניהול חדר כושר</p>
        
        <div className="flex flex-col space-y-4">
          <Button size="lg" onClick={() => navigate('/login')} className="w-full">
            כניסה למערכת
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/trainee-entering')} className="w-full">
            כניסה לחדר כושר
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
