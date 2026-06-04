import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавление токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      // Не редиректим на странице логина — пусть форма покажет ошибку
      if (!isLoginRequest && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Equipment {
  id: number;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  purchase_date?: string;
  manufacturer: string;
  status: string;
  location: string;
  wear_percentage: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Repair {
  id: number;
  equipment_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  assigned_to?: number;
  completed_by?: number;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseTask {
  id: number;
  title: string;
  description: string;
  part_id?: number;
  equipment_id?: number;
  quantity: number;
  priority: string;
  status: string;
  estimated_cost: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_at: number;
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
};

// Equipment API
export const equipmentAPI = {
  getAll: () => api.get<Equipment[]>('/equipment'),
  getById: (id: number) => api.get<Equipment>(`/equipment/${id}`),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/equipment', data),
  update: (id: number, data: Partial<Equipment>) => api.put<Equipment>(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
  predictReplacements: () => api.get<Equipment[]>('/equipment/predict'),
};

// Repairs API
export const repairsAPI = {
  getAll: () => api.get<Repair[]>('/repairs'),
  getById: (id: number) => api.get<Repair>(`/repairs/${id}`),
  create: (data: Partial<Repair>) => api.post<Repair>('/repairs', data),
  update: (id: number, data: Partial<Repair>) => api.put<Repair>(`/repairs/${id}`, data),
  getByEquipment: (equipmentId: number) => api.get<Repair[]>(`/repairs/equipment/${equipmentId}`),
  getEquipmentCost: (equipmentId: number) => api.get<{ total_cost: number }>(`/repairs/equipment/${equipmentId}/cost`),
};

// Purchase API
export const purchaseAPI = {
  getTasks: () => api.get<PurchaseTask[]>('/purchase/tasks'),
  createTask: (data: Partial<PurchaseTask>) => api.post<PurchaseTask>('/purchase/tasks', data),
  updateTask: (id: number, data: Partial<PurchaseTask>) => api.put<PurchaseTask>(`/purchase/tasks/${id}`, data),
  generateAutoTasks: () => api.post('/purchase/tasks/generate'),
  getStats: () => api.get<{ pending_count: number; estimated_cost: number }>('/purchase/stats'),
};

export default api;
