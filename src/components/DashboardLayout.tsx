
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarMain, 
  SidebarFooter, 
  SidebarItem 
} from './ui/sidebar';
import { 
  Home, Menu, X, UserPlus, BarChart2, List, Settings, Shield, LogOut, Dumbbell, UserCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { useMobile } from '../hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { admin, loading } = useAdmin();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/login');
    }
  }, [admin, loading, navigate]);
  
  useEffect(() => {
    // Close sidebar when navigating on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeTab, isMobile]);
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
  };
  
  if (loading || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const sidebarItems = [
    { 
      path: '/dashboard', 
      icon: <Home className="h-5 w-5" />, 
      label: 'דף הבית', 
      active: activeTab === 'dashboard',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/registration', 
      icon: <UserPlus className="h-5 w-5" />, 
      label: 'רישום מתאמנים', 
      active: activeTab === 'registration',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/trainee-entering', 
      icon: <Dumbbell className="h-5 w-5" />, 
      label: 'כניסה לחדר כושר', 
      active: activeTab === 'trainee-entering',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/medical-approvals', 
      icon: <UserCheck className="h-5 w-5" />, 
      label: 'אישורים רפואיים', 
      active: activeTab === 'medical-approvals',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/entries-history', 
      icon: <List className="h-5 w-5" />, 
      label: 'היסטוריית כניסות', 
      active: activeTab === 'entries-history',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/analytics', 
      icon: <BarChart2 className="h-5 w-5" />, 
      label: 'אנליטיקות', 
      active: activeTab === 'analytics',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" />, 
      label: 'הגדרות', 
      active: activeTab === 'settings',
      showFor: ['generalAdmin']
    }
  ];
  
  const filteredSidebarItems = sidebarItems.filter(item => 
    item.showFor.includes(admin.role)
  );
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed right-4 top-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      )}
      
      {/* Sidebar */}
      <Sidebar
        open={isMobile ? sidebarOpen : true}
        className={`${isMobile ? 'fixed inset-y-0 right-0 z-40' : 'sticky top-0 h-screen'} max-w-[250px] border-l`}
      >
        <SidebarHeader className="px-6 py-4 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold">
            מערכת אימ"ון
          </h1>
          <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {admin.role === 'generalAdmin' ? 'מנהל כללי' : 'מנהל חדר כושר'}
          </div>
        </SidebarHeader>
        
        <SidebarMain className="px-3 py-2">
          {filteredSidebarItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <SidebarItem active={item.active} className="mb-1">
                {item.icon}
                <span>{item.label}</span>
              </SidebarItem>
            </Link>
          ))}
        </SidebarMain>
        
        <SidebarFooter className="px-3 py-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-4 w-4" />
            התנתק
          </Button>
        </SidebarFooter>
      </Sidebar>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
