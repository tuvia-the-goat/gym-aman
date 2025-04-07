
export type UserRole = 'generalAdmin' | 'gymAdmin';

export interface Admin {
  _id: string;
  username: string;
  password?: string; // Optional as we don't always want to include the password
  role: UserRole;
  baseId?: string; // Only for gymAdmin
}

export interface Base {
  _id: string;
  name: string;
  location: string;
}

export interface MainFramework {
  _id: string;
  name: string;
  baseId: string;
}

export interface SecondaryFramework {
  _id: string;
  name: string;
  mainFrameworkId: string;
}

export type MedicalFormScore = 'notRequired' | 'fullScore' | 'partialScore' | 'reserve';

export interface Trainee {
  _id: string;
  personalId: string; // 7 digits
  fullName: string;
  medicalProfile: '97' | '82' | '72' | '64' | '45' | '25';
  mainFrameworkId: string;
  secondaryFrameworkId?: string;
  phoneNumber: string; // 10 digits, starting with 05
  medicalApproval: {
    approved: boolean;
    expirationDate: string | null;
  };
  baseId: string;
  // New fields
  gender: 'male' | 'female';
  birthDate: string;
  orthopedicCondition: boolean;
  // Additional new fields
  medicalFormScore: MedicalFormScore;
  medicalCertificateProvided?: boolean;
  medicalLimitation?: string;
}

export type EntryStatus = 'success' | 'noMedicalApproval' | 'notRegistered';

export interface Entry {
  _id: string;
  traineeId: string;
  entryDate: string;
  entryTime: string;
  traineeFullName: string;
  traineePersonalId: string;
  mainFrameworkId: string;
  baseId: string;
  status: EntryStatus; // New field to track entry status
  createdAt?: string; // From MongoDB timestamp
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
  mainFrameworks: MainFramework[];
  setMainFrameworks: (mainFrameworks: MainFramework[]) => void;
  secondaryFrameworks: SecondaryFramework[];
  setSecondaryFrameworks: (secondaryFrameworks: SecondaryFramework[]) => void;
  trainees: Trainee[];
  setTrainees: (trainees: Trainee[]) => void;
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Add FullTraineeDataPoint type for Analytics.tsx
export interface FullTraineeDataPoint {
  _id: string;
  age: number;
  fullName: string;
  gender: 'male' | 'female';
  medicalProfile: string;
  mainFrameworkName: string;
  departmentName?: string; // Optional now for backward compatibility
}
