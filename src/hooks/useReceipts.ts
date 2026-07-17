// src/hooks/useReceipts.ts
import { useState, useEffect, useCallback } from 'react';
import { getReceipts, uploadReceipt, exportToCSV, exportToExcel } from '../services/api';

export interface Receipt {
  id: string;
  merchant: string;
  total: number;
  tax: number;
  category: string;
  business: string;
  notes: string;
  date: string;
  status: string;
  confidence: number;  // Changed to number
  needs_review: boolean;
}

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async (filters?: { business?: string; category?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReceipts(filters);
      setReceipts(data.receipts || []);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch receipts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(async (imageUri: string, business?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadReceipt(imageUri, business);
      // Refresh the list after upload
      await fetchReceipts();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReceipts]);

  const exportCSV = useCallback(async (business?: string) => {
    setLoading(true);
    try {
      const data = await exportToCSV(business);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportExcel = useCallback(async (business?: string) => {
    setLoading(true);
    try {
      const data = await exportToExcel(business);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to export Excel');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    upload,
    exportCSV,
    exportExcel,
  };
};
