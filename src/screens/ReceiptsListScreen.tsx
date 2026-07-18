// src/screens/ReceiptsListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../config/categories';

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
  notes?: string;
  category?: string;
  image_path?: string;
}

const ReceiptsListScreen = () => {
  const navigation = useNavigation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const API_URL = 'http://192.168.2.242:8000';

  const fetchReceipts = async () => {
    try {
      const response = await fetch(API_URL + '/receipts');
      const data = await response.json();
      if (data.receipts) {
        setReceipts(data.receipts);
        setFilteredReceipts(data.receipts);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      Alert.alert('Error', 'Failed to load receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const filterReceipts = (query: string, category: string | null) => {
    let filtered = receipts;
    
    if (query.trim() !== '') {
      filtered = filtered.filter(
        (receipt) =>
          receipt.merchant_name.toLowerCase().includes(query.toLowerCase()) ||
          receipt.merchant_address.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (category) {
      filtered = filtered.filter((receipt) => receipt.category === category);
    }
    
    setFilteredReceipts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterReceipts(text, filterCategory);
  };

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalVisible(true);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setModalVisible(false);
    (navigation as any).navigate('Confirmation', { receiptId: receipt.id });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return currency + ' ' + amount.toFixed(2);
  };

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => handleReceiptPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.merchantContainer}>
          {item.image_path && (
            <Image
              source={{ uri: item.image_path }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.merchantName}>{item.merchant_name || 'Unknown Merchant'}</Text>
          {item.notes && (
            <View style={styles.notesIndicator}>
              <Ionicons name="document-text-outline" size={12} color="#666" />
              <Text style={styles.notesText} numberOfLines={1}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(item.confidence_score || 0) },
          ]}
        >
          <Text style={styles.confidenceBadgeText}>
            {getConfidenceText(item.confidence_score || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.receiptDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.transaction_date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={[styles.detailText, styles.totalAmount]}>
            {formatCurrency(item.total_amount || 0, item.currency || '$')}
          </Text>
        </View>
      </View>

      <View style={styles.receiptFooter}>
        <View style={styles.detailItem}>
          <Ionicons name="document-text-outline" size={14} color="#999" />
          <Text style={styles.footerText}>{item.filename || 'receipt.jpg'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color="#999" />
          <Text style={styles.footerText}>
            {new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Receipts</Text>
        <Text style={styles.subtitle}>
          {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search receipts..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal style={styles.categoryFilters} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.categoryChip, !filterCategory && styles.categoryChipActive]}
          onPress={() => {
            setFilterCategory(null);
            filterReceipts(searchQuery, null);
          }}
        >
          <Text style={[styles.categoryChipText, !filterCategory && styles.categoryChipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, filterCategory === cat.id && styles.categoryChipActive]}
            onPress={() => {
              setFilterCategory(cat.id);
              filterReceipts(searchQuery, cat.id);
            }}
          >
            <Text style={[styles.categoryChipText, filterCategory === cat.id && styles.categoryChipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredReceipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No receipts found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Upload your first receipt from the Camera tab'}
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receipt Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedReceipt && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Merchant</Text>
                  <Text style={styles.modalValue}>{selectedReceipt.merchant_name || 'N/A'}</Text>
                </View>

                {selectedReceipt.merchant_address && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Address</Text>
                    <Text style={styles.modalValue}>{selectedReceipt.merchant_address}</Text>
                  </View>
                )}

                <View style={styles.modalRow}>
                  <View style={[styles.modalField, styles.modalHalfField]}>
                    <Text style={styles.modalLabel}>Date</Text>
                    <Text style={styles.modalValue}>{formatDate(selectedReceipt.transaction_date)}</Text>
                  </View>
                  <View style={[styles.modalField, styles.modalHalfField]}>
                    <Text style={styles.modalLabel}>Currency</Text>
                    <Text style={styles.modalValue}>{selectedReceipt.currency || '$'}</Text>
                  </View>
                </View>

                <View style={[styles.modalField, styles.modalTotalField]}>
                  <Text style={styles.modalTotalLabel}>Total</Text>
                  <Text style={styles.modalTotalValue}>
                    {formatCurrency(selectedReceipt.total_amount || 0, selectedReceipt.currency || '$')}
                  </Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Confidence Score</Text>
                  <View style={styles.modalConfidenceContainer}>
                    <View
                      style={[
                        styles.modalConfidenceBar,
                        { 
                          backgroundColor: getConfidenceColor(selectedReceipt.confidence_score || 0),
                          width: Math.round((selectedReceipt.confidence_score || 0) * 100) + '%'
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.modalConfidenceText}>
                    {getConfidenceText(selectedReceipt.confidence_score || 0)} 
                    ({Math.round((selectedReceipt.confidence_score || 0) * 100)}%)
                  </Text>
                </View>

                {selectedReceipt.notes && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Notes</Text>
                    <Text style={styles.modalValue}>{selectedReceipt.notes}</Text>
                  </View>
                )}

                {selectedReceipt.category && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Category</Text>
                    <Text style={styles.modalValue}>
                      {CATEGORIES.find(c => c.id === selectedReceipt.category)?.label || selectedReceipt.category}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewReceiptButton}
                  onPress={() => handleViewReceipt(selectedReceipt)}
                >
                  <Text style={styles.viewReceiptButtonText}>View Full Receipt</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  merchantContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  confidenceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  receiptDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  totalAmount: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalField: {
    marginBottom: 12,
  },
  modalHalfField: {
    flex: 1,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  modalTotalField: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  modalConfidenceContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  modalConfidenceBar: {
    height: '100%',
    borderRadius: 3,
  },
  modalConfidenceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewReceiptButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  viewReceiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReceiptsListScreen;






