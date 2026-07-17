import axios from 'axios';

// Choose one based on your testing environment:
// For Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:8000';
// For iOS Simulator:
// const API_BASE_URL = 'http://localhost:8000';
// For Physical Device:
// const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};

export const uploadReceipt = async (imageUri: string) => {
  try {
    const formData = new FormData();
    const file = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    };
    
    formData.append('file', file as any);
    
    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const getReceipts = async () => {
  try {
    const response = await api.get('/receipts/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    throw error;
  }
};

export default api;
