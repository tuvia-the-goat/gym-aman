
// src/services/api.ts
import axios from 'axios';
import { Admin, Base, Department, Trainee, Entry, EntryStatus, MedicalFormScore, SubDepartment } from '../types';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Login admin
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    console.log('Login response:', response.data);

    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    
    return response.data.admin;
  },
  
  // Verify admin token
  verify: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      throw error;
    }
  },
  
  // Logout admin
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  }
};

export const subDepartmentService = {
  // Get all subDepartments
  getAll: async (): Promise<SubDepartment[]> => {
    const response = await api.get('/subDepartments');
    return response.data;
  },
  
  // Create new subDepartment
  create: async (subDepartmentData: { name: string, departmentId: string }): Promise<SubDepartment> => {
    const response = await api.post('/subDepartments', subDepartmentData);
    return response.data;
  },
  
  // Get subDepartments by departmentId
  getByDepartment: async (departmentId: string): Promise<SubDepartment[]> => {
    const response = await api.get(`/subDepartments/department/${departmentId}`);
    return response.data;
  }
};

// Base Services
export const baseService = {
  // Get all bases
  getAll: async (): Promise<Base[]> => {
    const response = await api.get('/bases');
    return response.data;
  },
  
  // Create new base
  create: async (baseData: { name: string, location: string }): Promise<Base> => {
    const response = await api.post('/bases', baseData);
    return response.data;
  }
};

// Department Services
export const departmentService = {
  // Get all departments
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data;
  },
  
  // Create new department
  create: async (departmentData: { name: string, baseId: string }): Promise<Department> => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  }
};

// Trainee Services
export const traineeService = {
  // Get all trainees
  getAll: async (): Promise<Trainee[]> => {
    const response = await api.get('/trainees');
    return response.data;
  },
  
  // Create new trainee with subDepartmentId
  create: async (traineeData: {
    personalId: string,
    fullName: string,
    medicalProfile: '97' | '82' | '72' | '64' | '45' | '25',
    departmentId: string,
    subDepartmentId?: string, // Add this line
    phoneNumber: string,
    baseId: string,
    gender: 'male' | 'female',
    birthDate: string,
    orthopedicCondition: boolean,
    medicalFormScore: MedicalFormScore,
    medicalCertificateProvided?: boolean,
    medicalLimitation?: string,
    medicalApproval?: {
      approved: boolean,
      expirationDate: string | null
    }
  }): Promise<Trainee> => {
    const response = await api.post('/trainees', traineeData);
    return response.data;
  },
  
  // Update trainee medical approval
  updateMedicalApproval: async (traineeId: string, medicalApprovalData: {
    approved: boolean,
    expirationDate: string | null,
    medicalFormScore?: MedicalFormScore,
    medicalCertificateProvided?: boolean,
    medicalLimitation?: string,
    orthopedicCondition?: boolean
  }): Promise<Trainee> => {
    const response = await api.put(`/trainees/${traineeId}/medical-approval`, medicalApprovalData);
    return response.data;
  },
  
  // Update trainee profile
  updateProfile: async (traineeId: string, profileData: Partial<Trainee>): Promise<Trainee> => {
    const response = await api.put(`/trainees/${traineeId}`, profileData);
    return response.data;
  }
};

// Entry Services
export const entryService = {
  // Get all entries
  getAll: async (): Promise<Entry[]> => {
    const response = await api.get('/entries');
    return response.data;
  },
  
  // Create new entry with subDepartmentId
  create: async (entryData: {
    traineeId: string,
    entryDate: string,
    entryTime: string,
    traineeFullName: string,
    traineePersonalId: string,
    departmentId: string,
    subDepartmentId?: string, // Add this line
    baseId: string,
    status: EntryStatus
  }): Promise<Entry> => {
    const response = await api.post('/entries', entryData);
    return response.data;
  },

  // Create entry for non-registered user
  createNonRegistered: async (entryData: {
    entryDate: string,
    entryTime: string,
    traineePersonalId: string,
    baseId: string,
    status: EntryStatus
  }): Promise<Entry> => {
    const response = await api.post('/entries/non-registered', entryData);
    return response.data;
  }
};

// Admin Services
export const adminService = {
  // Create new admin
  create: async (adminData: {
    username: string,
    password: string,
    role: 'generalAdmin' | 'gymAdmin',
    baseId?: string
  }): Promise<Admin> => {
    const response = await api.post('/admins', adminData);
    return response.data;
  }
};

// System initialization
export const initializeSystem = async () => {
  try {
    const response = await api.get('/initialize');
    return response.data;
  } catch (error) {
    console.error('Error initializing system:', error);
    throw error;
  }
};
