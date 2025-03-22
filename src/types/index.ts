
export type UserRole = 'allBasesAdmin' | 'gymAdmin';

export interface Admin {
  _id: string;
  username: string;
  password: string;
  role: UserRole;
  baseId?: string; // Only for gymAdmin
}

export interface Base {
  _id: string;
  name: string;
  location: string;
  departments: Department[];
}

export interface Department {
  _id: string;
  name: string;
  baseId: string;
}

export interface Trainee {
  _id: string;
  personalId: string; // 7 digits
  fullName: string;
  medicalProfile: '97' | '82' | '72' | '64' | '45' | '25';
  departmentId: string;
  phoneNumber: string; // 10 digits, starting with 05
  medicalApproval: {
    approved: boolean;
    expirationDate: string | null;
  };
  baseId: string; // Reference to the base through department
}

export interface Entry {
  _id: string;
  traineeId: string;
  entryDate: string;
  entryTime: string;
  traineeFullName: string;
  traineePersonalId: string;
  departmentId: string;
  baseId: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface LineChartData {
  name: string;
  value: number;
}

export interface AdminContextType {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
  bases: Base[];
  setBases: (bases: Base[]) => void;
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
  trainees: Trainee[];
  setTrainees: (trainees: Trainee[]) => void;
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
