
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Admin, Base, Department, Trainee, Entry, AdminContextType } from '../types';
import { 
  authService, 
  baseService, 
  departmentService, 
  traineeService, 
  entryService,
  initializeSystem
} from '../services/api';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from server
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Initialize system (creates default data if needed)
        await initializeSystem();
        
        // Check if there's a stored token/admin in localStorage
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
          try {
            // Verify token is valid
            const verifiedAdmin = await authService.verify();
            setAdmin(JSON.parse(storedAdmin));
          } catch (error) {
            console.error('Invalid token, clearing stored data');
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
          }
        }
        
        // Fetch initial data
        const [basesData, departmentsData, traineesData, entriesData] = await Promise.all([
          baseService.getAll(),
          departmentService.getAll(),
          traineeService.getAll(),
          entryService.getAll()
        ]);
        
        
        
        setBases(basesData);
        setDepartments(departmentsData);
        setTrainees(traineesData);
        setEntries(entriesData);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Update admin in localStorage when state changes
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
