export interface Admin {
  _id: string;
  personalId: string;
  fullName: string;
  role: "generalAdmin" | "gymAdmin";
  baseId?: string;
  email: string;
  password?: string;
  token?: string;
  username: string; // Added username property
}

export interface Base {
  _id: string;
  name: string;
  location: string; // Added location property
  isActive: boolean;
}

export interface Department {
  _id: string;
  name: string;
  baseId: string;
  numOfPeople: number;
}

export interface SubDepartment {
  _id: string;
  name: string;
  departmentId: string;
  numOfPeople: number;
}

export interface SubDepartmentCreateData {
  name: string;
  numOfPeople: number;
}

// src/types/socket.ts

export interface ServerToClientEvents {
  newEntry: (entry: Entry) => void;
  error: (error: string) => void;
}

export interface ClientToServerEvents {
  joinBase: (baseId: string) => void;
  leaveBase: (baseId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  baseId?: string;
  adminId?: string;
}

export interface MedicalApproval {
  approved: boolean;
  expirationDate?: string;
}

export type EntryStatus =
  | "success"
  | "noMedicalApproval"
  | "notRegistered"
  | "notAssociated";

export interface Entry {
  _id: string;
  traineeId: string;
  traineeFullName: string;
  traineePersonalId: string;
  departmentId: string;
  subDepartmentId?: string; // Add this line
  baseId: string;
  entryDate: string;
  entryTime: string;
  status?: EntryStatus;
}

export interface AdminContextType {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Adding MedicalFormScore type
export type MedicalFormScore =
  | "notRequired"
  | "fullScore"
  | "partialScore"
  | "reserve";

export interface Trainee {
  _id: string;
  personalId: string;
  fullName: string;
  gender: "male" | "female";
  departmentId: string;
  subDepartmentId?: string; // Add this line
  baseId: string;
  phoneNumber: string;
  email?: string;
  medicalProfile: string;
  birthDate?: string;
  medicalApproval: MedicalApproval;
  orthopedicCondition: boolean;
  medicalLimitation?: string;
  registrationDate: string;
  trainingDays?: string[];
  preferredTime?: string;
  lastEntryDate?: string;
  entryCount?: number;
  notes?: string;
  // Add missing properties
  medicalFormScore: MedicalFormScore;
  medicalCertificateProvided?: boolean;
}

export interface DepartmentService {
  getAll: () => Promise<Department[]>;
  create: (departmentData: {
    name: string;
    baseId: string;
    numOfPeople: number;
  }) => Promise<Department>;
  createWithSubDepartments: (data: {
    name: string;
    baseId: string;
    subDepartments: SubDepartmentCreateData[];
    numOfPeople: number;
  }) => Promise<{
    department: Department;
    subDepartments: SubDepartment[];
  }>;
  update: (
    departmentId: string,
    departmentData: {
      name: string;
      baseId: string;
      numOfPeople: number;
    }
  ) => Promise<Department>;
  delete: (departmentId: string) => Promise<void>;
  search: (query: string) => Promise<{
    departments: Department[];
    subDepartments: SubDepartment[];
  }>;
}
