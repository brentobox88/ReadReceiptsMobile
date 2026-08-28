// src/screens/BatchConfirmationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReceiptResult {
  id: string;
  merchant_name: string;
  total_amount: number;
  currency: string;
  success: boolean;
  error?: string;
}

const BatchConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { results } = route.params as { results: ReceiptResult[] };

  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const successfulReceipts = results.filter(r => r.success);
  const failedReceipts = results.filter(r => !r.success);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedReceipts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedReceipts(newSet);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedReceipts(new Set());
    } else {
      setSelectedReceipts(new Set(successfulReceipts.map(r => r.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleViewReceipt = (receiptId: string) => {
    (navigation as any).navigate('Confirmation', { receiptId });
  };

  const handleScanMore = () => {
    (navigation as any).navigate('Camera');
  };

  const renderReceiptItem = ({ item }: { item: ReceiptResult }) => (
    <TouchableOpacity
      style={[styles.receiptCard, item.success && styles.successCard, !item.success && styles.failedCard]}
      onPress={() => item.success && handleViewReceipt(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.receiptInfo}>
          <Text style={styles.merchantName}>
            {item.success ? item.merchant_name || 'Unknown Merchant' : 'Upload Failed'}
          </Text>
          {item.success && (
            <Text style={styles.receiptAmount}>
              {item.currency || '$'} {item.total_amount?.toFixed(2) || '0.00'}
            </Text>
          )}
          {!item.success && (
            <Text style={styles.errorText}>{item.error || 'Error processing receipt'}</Text>
          )}
        </View>
        {item.success && (
          <TouchableOpacity
            style={[styles.selectButton, selectedReceipts.has(item.id) && styles.selectButtonActive]}
            onPress={() => toggleSelect(item.id)}
          >
            {selectedReceipts.has(item.id) ? (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#ccc" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Batch Upload Results</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{successfulReceipts.length}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.failedStat]}>
            {failedReceipts.length}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {successfulReceipts.length > 0 && (
        <View style={styles.selectAllContainer}>
          <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
            <Ionicons
              name={selectAll ? 'checkbox' : 'square-outline'}
              size={24}
              color="#4CAF50"
            />
            <Text style={styles.selectAllText}>Select All ({successfulReceipts.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderReceiptItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No receipts uploaded</Text>
          </View>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleScanMore}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>Scan More</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Receipts' })}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
          <Text style={styles.buttonText}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  failedStat: {
    color: '#F44336',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  failedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  receiptAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  selectButton: {
    padding: 4,
  },
  selectButtonActive: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
});

export default BatchConfirmationScreen;

