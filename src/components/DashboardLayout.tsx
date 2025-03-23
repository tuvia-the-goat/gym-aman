
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { baseService } from '@/services/api';
import { Base } from '@/types';
import { log } from 'console';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab }) => {
  const { bases, admin, setAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAllBasesAdmin = admin?.role === 'generalAdmin';
  const adminTypeClass = isAllBasesAdmin ? 'bg-admin' : 'bg-gymadmin';

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    navigate('/login');
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
  };

  const handleRegistrationScreen = () => {
    navigate('/registration');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`${adminTypeClass} text-white shadow-md px-6 py-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">מערכת ניהול חדרי כושר</h1>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end ml-4">
              <span className="font-medium">{admin?.username}</span>
              <span className="text-xs opacity-80">
                {isAllBasesAdmin ? 'מנהל כללי' : 'מנהל מכון'}
                {!isAllBasesAdmin && admin?.baseId && ` - בסיס ${getBasisName(admin.baseId)}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRegistrationScreen}
                className="px-4 py-2 bg-white text-gray-800 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                מסך הרשמה
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm transition-colors"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-6 py-4 border-b">
        <Tabs value={activeTab} className="w-full justify-start">
          <TabsList className="bg-secondary">
            <TabsTrigger 
              value="entries"
              onClick={() => navigate('/dashboard')}
              className="text-base"
            >
              היסטוריית כניסות
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              onClick={() => navigate('/dashboard/analytics')}
              className="text-base"
            >
              אנליטיקות
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              onClick={() => navigate('/dashboard/settings')}
              className="text-base"
            >
              הגדרות
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} מערכת ניהול חדרי כושר</p>
        </div>
      </footer>
    </div>
  );

  // Helper function to get basis name
   function getBasisName(baseId: string){   
    const base = bases.find((b: any) => b._id === baseId);    
    return base ? base.name : '';
  }
};

export default DashboardLayout;
