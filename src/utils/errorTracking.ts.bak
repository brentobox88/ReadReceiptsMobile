// src/utils/errorTracking.ts
import { Platform } from 'react-native';

// Simple error tracking without external dependencies
export const logError = (error: Error | string, context?: any) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  console.error('❌ Error:', errorMessage);
  
  if (context) {
    console.error('📋 Context:', context);
  }
  
  // You can add Sentry or other error tracking here later
  // For now, we'll just log to console
};

export const logInfo = (message: string, data?: any) => {
  console.log('📝', message);
  if (data) {
    console.log('📊 Data:', data);
  }
};

export const logWarning = (message: string, data?: any) => {
  console.warn('⚠️', message);
  if (data) {
    console.warn('📊 Data:', data);
  }
};

export const logApiError = (endpoint: string, error: any, status?: number) => {
  console.error(❌ API Error on :, error.message || error);
  if (status) {
    console.error(📋 Status: );
  }
};
