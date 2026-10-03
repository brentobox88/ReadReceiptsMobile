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
export const getBatchReceipts = async (batchId: string) => {
  const response = await axios.get(`${API_URL}/batches/${batchId}/receipts`);
  return response.data;
};

// Poll batch until complete
export const pollBatchUntilComplete = async (
  batchId: string,
  onProgress: (progress: BatchProgress) => void,
  maxAttempts: number = 30
): Promise<BatchProgress> => {
  for (let i = 0; i < maxAttempts; i++) {
    const progress = await getBatchProgress(batchId);
    onProgress(progress);

    if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'partial') {
      return progress;
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Batch processing timed out');
};
