// src/api/batches.ts
import axios from 'axios';

const API_URL = 'https://readreceipts-api-sxyz.onrender.com';

export interface BatchResponse {
  success: boolean;
  batch_id: string;
  name: string;
  status: string;
}

export interface BatchProgress {
  id: string;
  name: string;
  status: string;
  total_files: number;
  processed_files: number;
  failed_files: number;
  progress_percent: number;
  total_amount: number;
  avg_confidence: number;
  progress?: {
    total: number;
    completed: number;
    failed: number;
    processing: number;
    progress_percent: number;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
  };
}

export interface BatchReceipt {
  id: string;
  filename: string;
  status: string;
  merchant: string | null;
  total: number;
  category: string | null;
  confidence: number;
  error: string | null;
  processed_at: string | null;
}

// Create a new batch
export const createBatch = async (name?: string): Promise<BatchResponse> => {
  const response = await axios.post(
    `${API_URL}/batches`,
    null,
    { params: { name: name || `Batch ${new Date().toLocaleDateString()}` } }
  );
  return response.data;
};

// Upload files to a batch
export const uploadToBatch = async (batchId: string, files: any[]) => {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append('files', {
      uri: file.uri,
      type: 'image/jpeg',
      name: file.name || `receipt_${Date.now()}_${index}.jpg`,
    } as any);
  });

  const response = await axios.post(
    `${API_URL}/batches/${batchId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

// Get batch progress
export const getBatchProgress = async (batchId: string): Promise<BatchProgress> => {
  const response = await axios.get(`${API_URL}/batches/${batchId}`);
  return response.data;
};

// Get batch receipts
export const getBatchReceipts = async (batchId: string): Promise<{ batch_id: string; receipts: BatchReceipt[] }> => {
  const response = await axios.get(`${API_URL}/batches/${batchId}/receipts`);
  return response.data;
};

// Check whether a batch is in a terminal state
export const isBatchComplete = (status: string): boolean => {
  return ['completed', 'failed', 'partial'].includes(status);
};