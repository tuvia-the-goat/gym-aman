import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { authService } from '../services/api';
const Index = () => {
  const navigate = useNavigate();
  const {
    admin,
    loading
  } = useAdmin();
  const [showGymEntryConfirm, setShowGymEntryConfirm] = useState(false);
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && admin) {
      navigate('/dashboard');
    }
  }, [admin, loading, navigate]);
  const handleGymEntryClick = () => {
    setShowGymEntryConfirm(true);
  };
  const handleGymEntryConfirm = () => {
    // Clear any admin data before proceeding to trainee entering
    authService.logout();

    // Navigate with replace to prevent back navigation
    navigate('/trainee-entering', {
      replace: true
    });
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <AlertDialog open={showGymEntryConfirm} onOpenChange={setShowGymEntryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מעבר למסך כניסה לחדר כושר</AlertDialogTitle>
            <AlertDialogDescription>
              אתה עומד לעבור למסך כניסה לחדר כושר. האם אתה בטוח שברצונך להמשיך?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleGymEntryConfirm}>המשך</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-lg w-full px-4 py-8 space-y-8 bg-background rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold">מערכת אימ"ון</h1>
        <p className="text-xl text-muted-foreground">מערכת ניהול חדר כושר</p>
        
        <div className="flex flex-col space-y-4">
          <Button size="lg" onClick={() => navigate('/login')} className="w-full">
            כניסה למערכת
          </Button>
          
          
        </div>
      </div>
    </div>;
};
export default Index;