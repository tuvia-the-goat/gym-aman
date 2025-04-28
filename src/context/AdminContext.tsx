// src/context/AdminContext.tsx update

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  Admin,
  Base,
  Department,
  SubDepartment,
  Trainee,
  Entry,
  AdminContextType,
} from "../types";
import {
  authService,
  baseService,
  departmentService,
  subDepartmentService,
  traineeService,
  entryService,
  initializeSystem,
} from "../services/api";
import { socketService } from "../services/socket"; // Import socket service

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
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
        const storedAdmin = localStorage.getItem("admin");

        if (storedAdmin) {
          try {
            // Verify token is valid
            const verifiedAdmin = await authService.verify();
            console.log({ verifiedAdmin });

            setAdmin(JSON.parse(storedAdmin));
          } catch (error) {
            console.error("Invalid token, clearing stored data");
            localStorage.removeItem("token");
            localStorage.removeItem("admin");
          }
        }

        // Fetch initial data
        const [
          basesData,
          departmentsData,
          subDepartmentsData,
          traineesData,
          entriesData,
        ] = await Promise.all([
          baseService.getAll(),
          departmentService.getAll(),
          subDepartmentService.getAll(),
          traineeService.getAll(),
          entryService.getAll(),
        ]);

        setBases(basesData);
        setDepartments(departmentsData);
        setSubDepartments(subDepartmentsData);
        setTrainees(traineesData);
        setEntries(entriesData);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    // Initialize socket
    socketService.init();

    // Set up the event listener for new entries
    const cleanup = socketService.onNewEntry((newEntry) => {
      // Add the new entry to the state
      setEntries((prevEntries) => [newEntry, ...prevEntries]);
    });

    // Clean up on unmount
    return () => {
      cleanup();
      socketService.disconnect();
    };
  }, []);

  // Join base-specific room if admin is a gym admin
  useEffect(() => {
    if (admin?.role === "gymAdmin" && admin.baseId) {
      socketService.joinBase(admin.baseId);
    }

    return () => {
      if (admin?.role === "gymAdmin" && admin.baseId) {
        socketService.leaveBase(admin.baseId);
      }
    };
  }, [admin]);

  // Update admin in localStorage when state changes
  useEffect(() => {
    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
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
        subDepartments,
        setSubDepartments,
        trainees,
        setTrainees,
        entries,
        setEntries,
        loading,
        setLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
