import axios from 'axios';

// קביעת URL בסיסי
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// יצירת מופע Axios קונפיגורציה
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// הוספת Interceptor להוספת טוקן הרשאה
api.interceptors.request.use(
  (config) => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    
    if (admin?.token) {
      config.headers.Authorization = `Bearer ${admin.token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // בדיקה אם יש שגיאת אימות (401)
    if (error.response && error.response.status === 401) {
      // בדיקה אם השגיאה לא הגיעה מניסיון התחברות
      if (!error.config.url.includes('/login')) {
        // ניקוי מידע המשתמש והפניה להתחברות מחדש
        localStorage.removeItem('admin');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Service API - Admins
export const adminService = {
  login: async (username, password) => {
    const response = await api.post('/admins/login', { username, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/admins/profile');
    return response.data;
  },
  
  getAdmins: async () => {
    const response = await api.get('/admins');
    return response.data;
  },
  
  createAdmin: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },
  
  updateAdmin: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },
  
  deleteAdmin: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },
};

// Service API - Bases
export const baseService = {
  getBases: async () => {
    const response = await api.get('/bases');
    return response.data;
  },
  
  getBaseById: async (id) => {
    const response = await api.get(`/bases/${id}`);
    return response.data;
  },
  
  createBase: async (baseData) => {
    const response = await api.post('/bases', baseData);
    return response.data;
  },
  
  updateBase: async (id, baseData) => {
    const response = await api.put(`/bases/${id}`, baseData);
    return response.data;
  },
  
  deleteBase: async (id) => {
    const response = await api.delete(`/bases/${id}`);
    return response.data;
  },
  
  getBaseDepartments: async (id) => {
    const response = await api.get(`/bases/${id}/departments`);
    return response.data;
  },
};

// Service API - Departments
export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },
  
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },
  
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },
  
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },
  
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Service API - Trainees
export const traineeService = {
  getTrainees: async (params = {}) => {
    const response = await api.get('/trainees', { params });
    return response.data;
  },
  
  getTraineeById: async (id) => {
    const response = await api.get(`/trainees/${id}`);
    return response.data;
  },
  
  getTraineeByPersonalId: async (personalId) => {
    const response = await api.get(`/trainees/personal/${personalId}`);
    return response.data;
  },
  
  createTrainee: async (traineeData) => {
    const response = await api.post('/trainees', traineeData);
    return response.data;
  },
  
  updateTrainee: async (id, traineeData) => {
    const response = await api.put(`/trainees/${id}`, traineeData);
    return response.data;
  },
  
  deleteTrainee: async (id) => {
    const response = await api.delete(`/trainees/${id}`);
    return response.data;
  },
  
  updateMedicalApproval: async (id, approvalData) => {
    const response = await api.put(`/trainees/${id}/medical-approval`, approvalData);
    return response.data;
  },
  
  getTraineeEntries: async (id) => {
    const response = await api.get(`/trainees/${id}/entries`);
    return response.data;
  },
};

// Service API - Entries
export const entryService = {
  getEntries: async (params = {}) => {
    const response = await api.get('/entries', { params });
    return response.data;
  },
  
  getEntryById: async (id) => {
    const response = await api.get(`/entries/${id}`);
    return response.data;
  },
  
  createEntry: async (entryData) => {
    const response = await api.post('/entries', entryData);
    return response.data;
  },
  
  deleteEntry: async (id) => {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  },
  
  getEntriesStats: async (params = {}) => {
    const response = await api.get('/entries/stats', { params });
    return response.data;
  },
  
  checkEntry: async (traineeId, date) => {
    const response = await api.get('/entries/check', { 
      params: { traineeId, date } 
    });
    return response.data;
  },
};

export default api;