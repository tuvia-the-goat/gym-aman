import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Admin, Base, Department, Trainee, Entry, AdminContextType } from '../types';
import { adminService, baseService, departmentService, traineeService, entryService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // טעינת נתונים מקומיים בעת טעינת האפליקציה
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  // טעינת נתונים מהשרת כאשר יש מנהל מחובר
  useEffect(() => {
    if (admin) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // טעינת בסיסים
          const basesData = await baseService.getBases();
          setBases(basesData);
          
          // טעינת מחלקות
          const departmentsData = await departmentService.getDepartments();
          setDepartments(departmentsData);
          
          // טעינת מתאמנים
          const traineesData = await traineeService.getTrainees();
          setTrainees(traineesData);
          
          // טעינת כניסות (מוגבל ל-100 האחרונות)
          const entriesData = await entryService.getEntries({ limit: 100 });
          setEntries(entriesData.entries);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            title: "שגיאה בטעינת נתונים",
            description: "אירעה שגיאה בעת טעינת הנתונים מהשרת",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [admin, toast]);

  // עדכון ה-localStorage כאשר המנהל משתנה
  useEffect(() => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    }
  }, [admin]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
        bases,
        setBases,
        departments,
        setDepartments,
        trainees,
        setTrainees,
        entries,
        setEntries,
        loading,
        setLoading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};