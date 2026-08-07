// src/screens/ExportScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Receipt {
  id: string;
  merchant_name: string;
  merchant_address: string;
  transaction_date: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
  filename: string;
  created_at: string;
  confidence_score: number;
  status: string;
}

const ExportScreen = () => {
  const navigation = useNavigation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  const API_URL = 'https://readreceipts-api-irch.onrender.com';

  const fetchReceipts = async () => {
    try {
      const response = await fetch(API_URL + '/receipts');
      const data = await response.json();
      if (data.receipts) {
        setReceipts(data.receipts);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      Alert.alert('Error', 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  const generateCSV = (): string => {
    let csv = 'Merchant,Address,Date,Total,Tax,Currency,Confidence,Status,File\n';
    
    receipts.forEach((receipt) => {
      const merchant = (receipt.merchant_name || 'Unknown').replace(/,/g, ';');
      const address = (receipt.merchant_address || '').replace(/,/g, ';');
      const date = receipt.transaction_date || 'N/A';
      const total = receipt.total_amount || 0;
      const tax = receipt.tax_amount || 0;
      const currency = receipt.currency || '$';
      const confidence = Math.round((receipt.confidence_score || 0) * 100) + '%';
      const status = receipt.status || 'processed';
      const filename = receipt.filename || 'receipt.jpg';
      const notes = (receipt.notes || '').replace(/,/g, ';');
      
      csv += merchant + ',' + address + ',' + date + ',' + total + ',' + tax + ',' + currency + ',' + confidence + ',' + status + ',' + filename + '\n';
    });
    
    return csv;
  };

  const generateJSON = (): string => {
    const jsonData = receipts.map((receipt) => ({
      merchant: receipt.merchant_name || 'Unknown',
      address: receipt.merchant_address || '',
      date: receipt.transaction_date || 'N/A',
      total: receipt.total_amount || 0,
      tax: receipt.tax_amount || 0,
      currency: receipt.currency || '$',
      confidence: Math.round((receipt.confidence_score || 0) * 100) + '%',
      status: receipt.status || 'processed',
      filename: receipt.filename || 'receipt.jpg',
      notes: receipt.notes || '',
      id: receipt.id,
    }));
    return JSON.stringify(jsonData, null, 2);
  };

  const handleExport = async () => {
    if (receipts.length === 0) {
      Alert.alert('No Receipts', 'You have no receipts to export.');
      return;
    }

    setExporting(true);

    try {
      const fileName = 'receipts_export_' + new Date().toISOString().slice(0, 10);
      let fileContent: string;
      let mimeType: string;
      let fileExtension: string;

      if (selectedFormat === 'csv') {
        fileContent = generateCSV();
        mimeType = 'text/csv';
        fileExtension = '.csv';
      } else {
        fileContent = generateJSON();
        mimeType = 'application/json';
        fileExtension = '.json';
      }

      // Use new FileSystem API
      const cacheDir = Paths.cache;
      const file = new File(cacheDir, fileName + fileExtension);
      
      // Create the file and write content
      file.create({ overwrite: true });
      file.write(fileContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: mimeType,
          dialogTitle: 'Export Receipts',
        });
      } else {
        Alert.alert('Share not available', 'Sharing is not available on this device.');
      }

      setExporting(false);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export receipts.');
      setExporting(false);
    }
  };

  const getTotalAmount = (): number => {
    return receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  };

  const getAverageConfidence = (): number => {
    if (receipts.length === 0) return 0;
    const sum = receipts.reduce((sum, r) => sum + (r.confidence_score || 0), 0);
    return Math.round((sum / receipts.length) * 100);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Receipts</Text>
        <Text style={styles.subtitle}>
          Export your receipt data for accounting or analysis
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{receipts.length}</Text>
          <Text style={styles.statLabel}>Total Receipts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {receipts.length > 0 ? '$' + getTotalAmount().toFixed(2) : '.00'}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getAverageConfidence()}%</Text>
          <Text style={styles.statLabel}>Avg Confidence</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Format</Text>
        <View style={styles.formatContainer}>
          <TouchableOpacity
            style={[
              styles.formatButton,
              selectedFormat === 'csv' && styles.formatButtonActive,
            ]}
            onPress={() => setSelectedFormat('csv')}
          >
            <Ionicons 
              name="document-text-outline" 
              size={24} 
              color={selectedFormat === 'csv' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.formatButtonText,
              selectedFormat === 'csv' && styles.formatButtonTextActive,
            ]}>
              CSV
            </Text>
            <Text style={[
              styles.formatButtonSubtext,
              selectedFormat === 'csv' && styles.formatButtonTextActive,
            ]}>
              Excel compatible
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formatButton,
              selectedFormat === 'json' && styles.formatButtonActive,
            ]}
            onPress={() => setSelectedFormat('json')}
          >
            <Ionicons 
              name="code-outline" 
              size={24} 
              color={selectedFormat === 'json' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.formatButtonText,
              selectedFormat === 'json' && styles.formatButtonTextActive,
            ]}>
              JSON
            </Text>
            <Text style={[
              styles.formatButtonSubtext,
              selectedFormat === 'json' && styles.formatButtonTextActive,
            ]}>
              Developer friendly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Preview</Text>
        <View style={styles.previewContainer}>
          {receipts.length === 0 ? (
            <View style={styles.emptyPreview}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyPreviewText}>No receipts to export</Text>
              <TouchableOpacity
                style={styles.goToCameraButton}
                onPress={() => navigation.navigate('Scan' as never)}
              >
                <Text style={styles.goToCameraText}>Scan a Receipt</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewList}>
              <Text style={styles.previewHeader}>
                {selectedFormat === 'csv' ? 'CSV Preview (first 5 rows)' : 'JSON Preview (first item)'}
              </Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewText} numberOfLines={5}>
                  {selectedFormat === 'csv' 
                    ? generateCSV().split('\n').slice(0, 6).join('\n')
                    : generateJSON().split('\n').slice(0, 8).join('\n')
                  }
                  {'\n...'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.exportButton, receipts.length === 0 && styles.exportButtonDisabled]}
        onPress={handleExport}
        disabled={receipts.length === 0 || exporting}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.exportButtonContent}>
            <Ionicons name="download-outline" size={24} color="#fff" />
            <Text style={styles.exportButtonText}>
              Export as {selectedFormat.toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} will be exported
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  formatContainer: {
    flexDirection: 'row',
  },
  formatButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  formatButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  formatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  formatButtonTextActive: {
    color: '#fff',
  },
  formatButtonSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  emptyPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyPreviewText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  goToCameraButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  goToCameraText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewList: {
    flex: 1,
  },
  previewHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  previewContent: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 11,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    margin: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ExportScreen;











