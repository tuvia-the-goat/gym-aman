
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from './ui/sidebar';
import { 
  Home, Menu, X, UserPlus, BarChart2, List, Settings, LogOut, Dumbbell, UserCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { admin, loading, bases } = useAdmin();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/login');
    }
  }, [admin, loading, navigate]);
  
  useEffect(() => {
    // Close sidebar when navigating on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      // Always open sidebar on desktop
      setSidebarOpen(true);
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

  // Get the gym name for gym admins
  const getGymName = () => {
    if (admin.role === 'gymAdmin' && admin.baseId) {
      const gym = bases.find(base => base._id === admin.baseId);
      return gym ? gym.name : '';
    }
    return '';
  };

  const sidebarItems = [
    { 
      path: '/dashboard', 
      icon: <Home className="h-5 w-5" />, 
      label: 'דף הבית', 
      active: activeTab === 'dashboard',
      showFor: ['generalAdmin', 'gymAdmin']
    },
    { 
      path: '/entries-history', 
      icon: <List className="h-5 w-5" />, 
      label: 'היסטוריית כניסות', 
      active: activeTab === 'entries',
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
      path: '/medical-approvals', 
      icon: <UserCheck className="h-5 w-5" />, 
      label: 'אישורים רפואיים', 
      active: activeTab === 'medical-approvals',
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
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        {/* Mobile Sidebar Toggle - only visible on mobile */}
        {true && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed right-4 top-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg md:hidden"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        )}
        
        {/* Sidebar - wider and always visible on desktop */}
        <Sidebar
          className={`
            ${isMobile ? 'fixed inset-y-0 right-0 z-40' : 'sticky top-0 h-screen'}
            ${isMobile && !sidebarOpen ? '-right-72' : 'right-0'}
            max-w-[280px] md:min-w-[250px] border-l transition-all duration-300
          `}
        >
          <SidebarHeader className="px-6 py-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold">
              מערכת אימ"ון
            </h1>
            <div className="mt-3 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {admin.role === 'generalAdmin' ? 'מנהל כללי' : `מנהל חדר כושר- בסיס ${getGymName()}`}
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-4">
            <SidebarMenu>
              {filteredSidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className={item.active ? "bg-accent text-accent-foreground text-base py-3" : "text-base py-3"}>
                    <Link to={item.path} className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="px-4 py-5">
            <Button 
              variant="outline" 
              className="w-full justify-start py-3 text-base" 
              onClick={handleLogout}
            >
              <LogOut className="ml-3 h-5 w-5" />
              התנתק
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        {/* Main Content - expanded with margins on desktop */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
