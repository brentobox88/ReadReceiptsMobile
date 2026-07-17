// src/utils/fileUtils.ts - Expo Compatible Version
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export const saveAndShareFile = async (fileData: Blob, fileName: string, mimeType: string) => {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(fileData);
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64Content = base64Data.split(',')[1];
          
          // Save to documents directory using Expo FileSystem
          const fileUri = FileSystem.documentDirectory + fileName;
          await FileSystem.writeAsStringAsync(fileUri, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            console.log('Sharing is not available on this device');
            resolve(fileUri);
            return;
          }
          
          // Share the file
          await Sharing.shareAsync(fileUri, {
            mimeType: mimeType,
            dialogTitle: 'Export Receipts',
          });
          
          resolve(fileUri);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
    });
  } catch (error) {
    console.error('Failed to save and share file:', error);
    throw error;
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
