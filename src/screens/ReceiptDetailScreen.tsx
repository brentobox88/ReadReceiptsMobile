// src/screens/ReceiptDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://readreceipts-api-sxyz.onrender.com';

interface Receipt {
  id: string;
  merchant_name: string | null;
  merchant_address: string | null;
  transaction_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  filename: string;
  image_path: string | null;
  created_at: string;
  processed_at: string | null;
  confidence_score: number;
  status: string;
  category: string | null;
  line_items: string | string[] | null;
  document_type: string | null;
  notes: string | null;
  error_message: string | null;
}

const ReceiptDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { receiptId } = route.params || {};

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchReceipt = async () => {
    if (!receiptId) {
      setError('No receipt ID provided');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/receipts/${receiptId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setReceipt(data.receipt || data);
      setError(null);
    } catch (e: any) {
      console.error('Failed to fetch receipt:', e);
      setError(e.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [receiptId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/receipts/${receiptId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                Alert.alert('Deleted', 'Receipt deleted successfully');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete receipt');
              }
            } catch {
              Alert.alert('Error', 'Network error');
            }
          },
        },
      ]
    );
  };

  const handleRetry = async () => {
    Alert.alert(
      'Retry Processing',
      'This will reset the receipt so you can re-upload the image. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            setRetrying(true);
            try {
              const response = await fetch(
                `${API_URL}/receipts/${receiptId}/retry`,
                { method: 'POST' }
              );
              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert(
                  'Reset Complete',
                  'The receipt is ready to be re-uploaded. Return to the Batch tab and upload the image again.'
                );
                // Refresh the receipt to show the new queued state
                await fetchReceipt();
              } else {
                Alert.alert('Error', data.error || 'Retry failed');
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Network error');
            } finally {
              setRetrying(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (s: string | null) => {
    if (!s) return 'N/A';
    try {
      return new Date(s).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return s;
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    const a = amount ?? 0;
    return `${currency || '$'} ${a.toFixed(2)}`;
  };

  const renderLineItems = (items: string | string[] | null) => {
    if (!items) return null;
    if (Array.isArray(items)) {
      return items.map((item, i) => (
        <Text key={i} style={styles.lineItemRow}>• {item}</Text>
      ));
    }
    return <Text style={styles.lineItems}>{items}</Text>;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipt…</Text>
      </View>
    );
  }

  if (error || !receipt) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error || 'Receipt not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUri = receipt.image_path
    ? receipt.image_path.startsWith('http')
      ? receipt.image_path
      : `${API_URL}/${receipt.image_path}`
    : null;

  const isFailed = receipt.status === 'failed';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.backIcon}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {isFailed && (
          <View style={styles.failedBanner}>
            <Ionicons name="alert-circle" size={32} color="#F44336" />
            <View style={styles.failedBannerText}>
              <Text style={styles.failedBannerTitle}>Processing Failed</Text>
              <Text style={styles.failedBannerMessage}>
                {receipt.error_message || 'Something went wrong while reading this receipt.'}
              </Text>
            </View>
          </View>
        )}

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.receiptImage} resizeMode="contain" />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.merchant}>{receipt.merchant_name || 'Unknown Merchant'}</Text>
          {receipt.merchant_address ? (
            <Text style={styles.address}>{receipt.merchant_address}</Text>
          ) : null}
          <Text style={styles.date}>{formatDate(receipt.transaction_date)}</Text>
        </View>

        {!isFailed && (
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Subtotal</Text>
              <Text style={styles.fieldValue}>
                {formatCurrency(receipt.subtotal, receipt.currency)}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tax</Text>
              <Text style={styles.fieldValue}>
                {formatCurrency(receipt.tax_amount, receipt.currency)}
              </Text>
            </View>
            <View style={[styles.field, styles.totalField]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(receipt.total_amount, receipt.currency)}
              </Text>
            </View>
          </View>
        )}

        {!isFailed && receipt.line_items ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Items</Text>
            {renderLineItems(receipt.line_items)}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Status</Text>
            <Text style={[styles.fieldValue, styles.statusText]}>{receipt.status}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Confidence</Text>
            <Text style={styles.fieldValue}>
              {Math.round((receipt.confidence_score || 0) * 100)}%
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>File</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {receipt.filename || 'N/A'}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Uploaded</Text>
            <Text style={styles.fieldValue}>{formatDate(receipt.created_at)}</Text>
          </View>
          {receipt.category ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text style={styles.fieldValue}>{receipt.category}</Text>
            </View>
          ) : null}
        </View>

        {isFailed && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Retry Processing</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorText: { marginTop: 12, fontSize: 16, color: '#F44336', textAlign: 'center' },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontWeight: '600' },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backIcon: { padding: 4, width: 32 },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 40 },

  failedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  failedBannerText: { flex: 1, marginLeft: 12 },
  failedBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#C62828' },
  failedBannerMessage: { fontSize: 13, color: '#B71C1C', marginTop: 4 },

  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptImage: { width: '100%', height: 400, borderRadius: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  merchant: { fontSize: 22, fontWeight: 'bold', color: '#1A2332' },
  address: { fontSize: 14, color: '#6B7A8F', marginTop: 4 },
  date: { fontSize: 14, color: '#6B7A8F', marginTop: 8 },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: { fontSize: 14, color: '#6B7A8F' },
  fieldValue: { fontSize: 14, color: '#1A2332', fontWeight: '500', flex: 1, textAlign: 'right' },
  totalField: { borderBottomWidth: 0, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A2332' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A2332', marginBottom: 8 },
  lineItems: { fontSize: 14, color: '#333', lineHeight: 20 },
  lineItemRow: { fontSize: 14, color: '#333', lineHeight: 22 },
  statusText: { textTransform: 'capitalize' },

  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ReceiptDetailScreen;