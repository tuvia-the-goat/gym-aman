
export interface Admin {
  _id: string;
  personalId: string;
  fullName: string;
  role: 'generalAdmin' | 'gymAdmin';
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
}

export interface Department {
  _id: string;
  name: string;
  baseId: string;
}

export interface MedicalApproval {
  approved: boolean;
  expirationDate?: string;
}

export type EntryStatus = 'success' | 'noMedicalApproval' | 'notRegistered';

export interface Entry {
  _id: string;
  traineeId: string;
  traineeFullName: string;
  traineePersonalId: string;
  departmentId: string;
  baseId: string;
  entryDate: string;
  entryTime: string;
  status?: EntryStatus;
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

// Adding MedicalFormScore type
export type MedicalFormScore = 'notRequired' | 'fullScore' | 'partialScore' | 'reserve';

export interface Trainee {
  _id: string;
  personalId: string;
  fullName: string;
  gender: 'male' | 'female';
  departmentId: string;
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
