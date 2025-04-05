// src/services/api.ts
import axios from 'axios';
import { Admin, Base, Department, Trainee, Entry } from '../types';

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
  
  // Create new trainee
  create: async (traineeData: {
    personalId: string,
    fullName: string,
    medicalProfile: '97' | '82' | '72' | '64' | '45' | '25',
    departmentId: string,
    phoneNumber: string,
    baseId: string,
    gender: 'male' | 'female',
    birthDate: string,
    orthopedicCondition: boolean
  }): Promise<Trainee> => {
    const response = await api.post('/trainees', traineeData);
    return response.data;
  },
  
  // Update trainee medical approval
  updateMedicalApproval: async (traineeId: string, approved: boolean): Promise<Trainee> => {
    const response = await api.put(`/trainees/${traineeId}/medical-approval`, { approved });
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
  
  // Create new entry
  create: async (entryData: {
    traineeId: string,
    entryDate: string,
    entryTime: string,
    traineeFullName: string,
    traineePersonalId: string,
    departmentId: string,
    baseId: string
  }): Promise<Entry> => {
    const response = await api.post('/entries', entryData);
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
