// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For development on emulator
import { Config } from '../config';
const API_BASE_URL = Config.API_URL;;

// For physical device testing, use your computer's IP:
// const API_BASE_URL = 'http://192.168.x.x:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized - redirect to login');
    }
    return Promise.reject(error);
  }
);

export const uploadReceipt = async (imageUri: string, business?: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  } as any);
  
  if (business) {
    formData.append('business', business);
  }

  const response = await api.post('/upload', formData);
  return response.data;
};

export const getReceipts = async (filters?: { business?: string; category?: string }) => {
  const response = await api.get('/receipts', { params: filters });
  return response.data;
};

export const exportToCSV = async (business?: string) => {
  const response = await api.get('/export/csv', { 
    params: { business },
    responseType: 'blob',
  });
  return response.data;
};

export const exportToExcel = async (business?: string) => {
  const response = await api.get('/export/excel', { 
    params: { business },
    responseType: 'blob',
  });
  return response.data;
};

export const createTestReceipts = async () => {
  const response = await api.get('/test/receipts');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

