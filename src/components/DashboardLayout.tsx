import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { authService, baseService } from "../services/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "./ui/sidebar";
import {
  Home,
  Menu,
  X,
  UserPlus,
  BarChart2,
  List,
  Settings,
  LogOut,
  Dumbbell,
  UserCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "../hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { admin, loading } = useAdmin();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const isMobile = useIsMobile();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTraineeEnteryConfirm, setShowTraineeEnteryConfirm] =
    useState(false);
  const [baseName, setBaseName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [clickSequence, setClickSequence] = useState<number[]>([]);
  const correctSequence = [0, 1, 1, 2, 2, 2]; // aman, hadraha, artech, hadraha, aman
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; tx: number; ty: number }>>([]);

  useEffect(() => {
    if (!loading && !admin) {
      navigate("/login");
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

  // Fetch base name when admin changes
  useEffect(() => {
    const fetchBaseName = async () => {
      if (admin?.role === "gymAdmin" && admin.baseId) {
        try {
          const base = await baseService.getById(admin.baseId);
          setBaseName(base.name);
        } catch (error) {
          console.error("Error fetching base name:", error);
          setBaseName("");
        }
      }
    };

    fetchBaseName();
  }, [admin]);

  const handleLogoClick = (index: number) => {
    const newSequence = [...clickSequence, index];
    setClickSequence(newSequence);

    // Check if the sequence matches
    if (newSequence.length === correctSequence.length) {
      const isCorrect = newSequence.every((value, i) => value === correctSequence[i]);
      if (isCorrect) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setClickSequence([]); // Reset sequence after popup
        }, 5000); // Extended from 3000 to 8000
      } else {
        setClickSequence([]); // Reset sequence if incorrect
      }
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleTraineeEntery = () => {
    setShowTraineeEnteryConfirm(true);
  };

  const handleLogout = () => {
    // Clear admin data and prevent back navigation
    authService.logout();

    // Navigate to login page
    navigate("/login", { replace: true });

    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
  };

  const handleTraineeNavigate = () => {
    // Clear admin data before navigating to trainee screen
    if (admin?.baseId) {
      localStorage.setItem("base", admin?.baseId);
    } else {
      localStorage.removeItem("base");
    }
    authService.logout();

    // Navigate to trainee entering page with replace to prevent back navigation
    navigate("/trainee-entering", { replace: true });

    toast({
      title: "המרה למסך הכניסה לחדר כושר",
      description: "להתראות!",
    });
  };

  const createParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      size: Math.random() * 10 + 5,
      tx: (Math.random() - 0.5) * 200,
      ty: (Math.random() - 0.5) * 200,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const Firework = ({ delay, x, y, color }: { delay: number; x: string; y: string; color: string }) => (
    <div 
      className="absolute animate-fireworks" 
      style={{ 
        left: x, 
        top: y, 
        animationDelay: `${delay}s`,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
      }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }}
    />
  );

  const FloatingShape = ({ delay, x, y, color, size, shape }: { 
    delay: number; 
    x: string; 
    y: string; 
    color: string;
    size: string;
    shape: 'circle' | 'square' | 'triangle';
  }) => (
    <div 
      className="absolute animate-bounce animate-glow"
      style={{ 
        left: x, 
        top: y, 
        animationDelay: `${delay}s`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '0',
        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
        opacity: 0.6,
      }}
    />
  );

  if (loading || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the gym name for gym admins
  const getGymName = () => {
    if (admin?.role === "gymAdmin") {
      return baseName;
    }
    return "";
  };

  const sidebarItems = [
    {
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      label: "דף הבית",
      active: activeTab === "dashboard",
      showFor: ["generalAdmin", "gymAdmin"],
    },
    {
      path: "/entries-history",
      icon: <List className="h-5 w-5" />,
      label: "היסטוריית כניסות",
      active: activeTab === "entries",
      showFor: ["generalAdmin", "gymAdmin"],
    },
    {
      path: "/analytics",
      icon: <BarChart2 className="h-5 w-5" />,
      label: "אנליטיקות",
      active: activeTab === "analytics",
      showFor: ["generalAdmin", "gymAdmin"],
    },
    {
      path: "/medical-approvals",
      icon: <UserCheck className="h-5 w-5" />,
      label: "אישורים רפואיים",
      active: activeTab === "medical-approvals",
      showFor: ["generalAdmin", "gymAdmin"],
    },
    {
      path: "/registration",
      icon: <UserPlus className="h-5 w-5" />,
      label: "רישום מתאמנים",
      active: activeTab === "registration",
      showFor: ["generalAdmin", "gymAdmin"],
    },
    {
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "הגדרות",
      active: activeTab === "settings",
      showFor: ["generalAdmin", "gymAdmin"],
    },
  ];

  const filteredSidebarItems = sidebarItems.filter((item) =>
    item.showFor.includes(admin.role)
  );

  return (
    <SidebarProvider>
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-end">
              האם אתה בטוח שברצונך להתנתק?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex items-end">
              לאחר ההתנתקות תועבר למסך הכניסה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start w-full gap-5">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>התנתק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showTraineeEnteryConfirm}
        onOpenChange={setShowTraineeEnteryConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-end">
              האם אתה בטוח שברצונך לעבור למסך הכניסה לחדר הכושר?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex items-end">
              מעבר למסך הכניסה ידרוש התנתקות ומעבר לתצוגת משתמש.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start w-full gap-5">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleTraineeNavigate}>
              מעבר למסך הכניסה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
          {/* Color wave background */}
          <div className="absolute inset-0 animate-color-wave opacity-20"></div>

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                '--tx': `${particle.tx}px`,
                '--ty': `${particle.ty}px`,
              } as React.CSSProperties}
            />
          ))}

          {/* Fireworks - Added more with different delays */}
          <Firework delay={0} x="20%" y="20%" color="rgba(255, 0, 0, 0.8)" />
          <Firework delay={0.3} x="80%" y="30%" color="rgba(0, 255, 0, 0.8)" />
          <Firework delay={0.6} x="40%" y="70%" color="rgba(0, 0, 255, 0.8)" />
          <Firework delay={0.9} x="70%" y="60%" color="rgba(255, 255, 0, 0.8)" />
          <Firework delay={1.2} x="30%" y="40%" color="rgba(255, 0, 255, 0.8)" />
          <Firework delay={1.5} x="60%" y="80%" color="rgba(0, 255, 255, 0.8)" />
          <Firework delay={2.0} x="25%" y="25%" color="rgba(255, 128, 0, 0.8)" />
          <Firework delay={2.3} x="75%" y="35%" color="rgba(128, 0, 255, 0.8)" />
          <Firework delay={2.6} x="45%" y="65%" color="rgba(0, 255, 128, 0.8)" />
          <Firework delay={2.9} x="65%" y="55%" color="rgba(255, 0, 128, 0.8)" />

          {/* Floating shapes - Added more with different delays */}
          <FloatingShape delay={0} x="10%" y="10%" color="#ff0000" size="20px" shape="circle" />
          <FloatingShape delay={0.5} x="90%" y="20%" color="#00ff00" size="25px" shape="square" />
          <FloatingShape delay={1} x="15%" y="80%" color="#0000ff" size="30px" shape="triangle" />
          <FloatingShape delay={1.5} x="85%" y="70%" color="#ffff00" size="15px" shape="circle" />
          <FloatingShape delay={2} x="50%" y="90%" color="#ff00ff" size="20px" shape="square" />
          <FloatingShape delay={2.5} x="20%" y="30%" color="#00ffff" size="25px" shape="triangle" />
          <FloatingShape delay={3} x="80%" y="40%" color="#ff8000" size="20px" shape="circle" />
          <FloatingShape delay={3.5} x="30%" y="60%" color="#8000ff" size="15px" shape="square" />

          <div className="relative">
            {/* Rotating sparkle ring */}
            <div className="absolute -inset-8 animate-rotate">
              <div className="w-full h-full border-4 border-dashed border-white/30 rounded-full animate-glow"></div>
            </div>

            {/* Sparkle effects */}
            <div className="absolute -inset-4 animate-sparkle">
              <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-400 rounded-full animate-glow"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-blue-400 rounded-full animate-glow"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-pink-400 rounded-full animate-glow"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full animate-glow"></div>
            </div>
            
            {/* Main popup */}
            <div className="animate-celebrate bg-gradient-to-br from-primary/90 to-primary p-8 rounded-2xl shadow-2xl animate-rainbow relative overflow-hidden animate-morph">
              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-shimmer"></div>
              
              <div className="animate-float relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4 text-center animate-pulse animate-neon">נוצר על ידי</h2>
                <p className="text-3xl text-white/90 text-center animate-neon">העמיתים, בן אטב וטחן</p>
                <p className="text-1xl text-white/90 text-center animate-neon mt-2 animate-float animate-delayed-fade-in">*וצביקה גם</p>
              </div>
            </div>

            {/* Additional decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-sparkle animate-glow"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full animate-sparkle animate-glow"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-pink-400 rounded-full animate-sparkle animate-glow"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-sparkle animate-glow"></div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden w-full">

        
        {/* Sidebar - wider and always visible on desktop */}
        <Sidebar
          className={`
            ${
              isMobile
                ? "fixed inset-y-0 right-0 z-40"
                : "sticky top-0 h-screen"
            }
            ${isMobile && !sidebarOpen ? "-right-72" : "right-0"}
            max-w-[280px] md:min-w-[250px] border-l transition-all duration-300
          `}
        >
          <SidebarHeader className="px-6 py-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold">מערכת אימ"ון</h1>
            <div className="mt-3 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {admin.role === "generalAdmin"
                ? "מנהל כללי"
                : `מנהל חדר כושר-  ${baseName}`}
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-4">
            <SidebarMenu>
              {filteredSidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={
                      item.active
                        ? "bg-accent text-accent-foreground text-base py-3"
                        : "text-base py-3"
                    }
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-base py-3 mt-7">
                  <button
                    onClick={handleTraineeEntery}
                    className="flex items-center gap-3"
                  >
                    <Dumbbell className="h-5 w-5" />
                    <span>מסך כניסה לחדר כושר</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="px-4 py-5">
            <div className="flex justify-center gap-4 mb-4 relative">
              <img 
                src="/amanLogo.png" 
                alt="Aman Logo" 
                className="h-10 cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => handleLogoClick(0)}
              />
              <img 
                src="/artechLogo.png" 
                alt="Artech Logo" 
                className="h-10 cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => handleLogoClick(2)}
              />
              <img 
                src="/hadrahaLogo.png" 
                alt="Hadraha Logo" 
                className="h-10 cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => handleLogoClick(1)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full py-3 text-base"
              onClick={handleLogoutConfirm}
            >
              <LogOut className="mr-3 h-5 w-5" />
              התנתק
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content - expanded with margins on desktop */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
