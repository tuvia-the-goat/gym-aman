
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Admin, Base, Department, Trainee, Entry, AdminContextType } from '../types';

// Initialize with default data
const initialBases: Base[] = [
  {
    id: '1',
    name: 'גלילות',
    location: 'מרכז',
    departments: [],
  },
];

const initialDepartments: Department[] = [
  {
    id: '1',
    name: 'ארטק',
    baseId: '1',
  },
];

const initialAdmins: Admin[] = [
  {
    id: '1',
    username: 'allBasesAdmin',
    password: '12345',
    role: 'allBasesAdmin',
  },
  {
    id: '2',
    username: 'gymAdmin',
    password: '12345',
    role: 'gymAdmin',
    baseId: '1', // גלילות
  },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bases, setBases] = useState<Base[]>(initialBases);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if there's a stored admin in localStorage
  React.useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    
    // Load initial data from localStorage if it exists
    const storedBases = localStorage.getItem('bases');
    if (storedBases) {
      setBases(JSON.parse(storedBases));
    } else {
      localStorage.setItem('bases', JSON.stringify(initialBases));
    }
    
    const storedDepartments = localStorage.getItem('departments');
    if (storedDepartments) {
      setDepartments(JSON.parse(storedDepartments));
    } else {
      localStorage.setItem('departments', JSON.stringify(initialDepartments));
    }
    
    const storedTrainees = localStorage.getItem('trainees');
    if (storedTrainees) {
      setTrainees(JSON.parse(storedTrainees));
    } else {
      localStorage.setItem('trainees', JSON.stringify([]));
    }
    
    const storedEntries = localStorage.getItem('entries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      localStorage.setItem('entries', JSON.stringify([]));
    }
    
    // Store admins if not already stored
    const storedAdmins = localStorage.getItem('admins');
    if (!storedAdmins) {
      localStorage.setItem('admins', JSON.stringify(initialAdmins));
    }
  }, []);

  // Update localStorage when state changes
  React.useEffect(() => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin));
    }
  }, [admin]);

  React.useEffect(() => {
    localStorage.setItem('bases', JSON.stringify(bases));
  }, [bases]);

  React.useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  React.useEffect(() => {
    localStorage.setItem('trainees', JSON.stringify(trainees));
  }, [trainees]);

  React.useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

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
