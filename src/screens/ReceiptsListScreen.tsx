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
import { LinearGradient } from 'expo-linear-gradient';
import FloatingScanButton from '../components/FloatingScanButton';

// Category definitions
const CATEGORIES = [
  { id: 'food', label: '?? Food', color: '#FF5722' },
  { id: 'transport', label: '?? Transport', color: '#2196F3' },
  { id: 'shopping', label: '??? Shopping', color: '#9C27B0' },
  { id: 'utilities', label: '?? Utilities', color: '#FFC107' },
  { id: 'entertainment', label: '?? Entertainment', color: '#E91E63' },
  { id: 'health', label: '?? Health', color: '#4CAF50' },
  { id: 'travel', label: '?? Travel', color: '#00BCD4' },
  { id: 'other', label: '?? Other', color: '#607D8B' },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const API_URL = 'https://readreceipts-api-irch.onrender.com';

  const fetchReceipts = async () => {
    try {
      const response = await fetch(API_URL + '/receipts');
      const data = await response.json();
      if (data.receipts) {
        setReceipts(data.receipts);
        filterReceipts(searchQuery, selectedCategory, data.receipts);
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

  const filterReceipts = (query: string, category: string | null, receiptData?: Receipt[]) => {
    const data = receiptData || receipts;
    let filtered = data;
    
    if (query.trim() !== '') {
      filtered = filtered.filter(
        (receipt) =>
          receipt.merchant_name.toLowerCase().includes(query.toLowerCase()) ||
          (receipt.merchant_address && receipt.merchant_address.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (category) {
      filtered = filtered.filter((receipt) => receipt.category === category);
    }
    
    setFilteredReceipts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterReceipts(text, selectedCategory);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    filterReceipts(searchQuery, categoryId);
  };

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalVisible(true);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setModalVisible(false);
    (navigation as any).navigate('Confirmation', { receiptId: receipt.id, imageUri: receipt.image_path });
  };

  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;
    
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
              const response = await fetch(API_URL + '/receipts/' + selectedReceipt.id, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                setModalVisible(false);
                Alert.alert('Success', 'Receipt deleted!');
                fetchReceipts();
              } else {
                Alert.alert('Error', 'Failed to delete receipt');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error');
            }
          }
        }
      ]
    );
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

  const getCategoryCount = (categoryId: string): number => {
    return receipts.filter(r => r.category === categoryId).length;
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
            <Image source={{ uri: item.image_path && item.image_path.startsWith("data:image") ? item.image_path : API_URL + "/" + item.image_path }} style={styles.thumbnailImage} resizeMode="cover" />
          )}
          <View>
            <Text style={styles.merchantName}>{item.merchant_name || 'Unknown Merchant'}</Text>
            <Text style={styles.receiptDate}>{formatDate(item.transaction_date)}</Text>
          </View>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(item.confidence_score || 0) + '20' }]}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(item.confidence_score || 0) }]}>
            {getConfidenceText(item.confidence_score || 0)}
          </Text>
        </View>
      </View>
      <View style={styles.receiptFooter}>
        <Text style={styles.receiptAmount}>
          {formatCurrency(item.total_amount || 0, item.currency || '$')}
        </Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
            </Text>
          </View>
        )}
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
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Receipts</Text>
            <Text style={styles.headerSubtitle}>
              {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="receipt" size={28} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search receipts..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilterContainer}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
            All ({receipts.length})
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => {
          const count = getCategoryCount(cat.id);
          if (count === 0) return null;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}>
                {cat.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredReceipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />}
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

      <FloatingScanButton />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receipt Details</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity onPress={handleDeleteReceipt} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color="#F44336" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
            {selectedReceipt && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Merchant</Text>
                  <Text style={styles.modalValue}>{selectedReceipt.merchant_name || 'N/A'}</Text>
                </View>
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Date</Text>
                  <Text style={styles.modalValue}>{formatDate(selectedReceipt.transaction_date)}</Text>
                </View>
                <View style={[styles.modalField, styles.modalTotalField]}>
                  <Text style={styles.modalTotalLabel}>Total</Text>
                  <Text style={styles.modalTotalValue}>
                    {formatCurrency(selectedReceipt.total_amount || 0, selectedReceipt.currency || '$')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.viewReceiptButton} onPress={() => handleViewReceipt(selectedReceipt)}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: '#333' },
  categoryFilterContainer: { maxHeight: 50, marginBottom: 4 },
  categoryFilterContent: { paddingHorizontal: 12, paddingVertical: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  categoryChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  categoryChipText: { fontSize: 13, color: '#666' },
  categoryChipTextActive: { color: '#fff' },
  listContainer: { padding: 12, paddingBottom: 20 },
  receiptCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  merchantContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  thumbnailImage: { width: 44, height: 44, borderRadius: 8, marginRight: 8 },
  merchantName: { fontSize: 16, fontWeight: '600', color: '#1A2332' },
  receiptDate: { fontSize: 12, color: '#6B7A8F', marginTop: 2 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  confidenceText: { fontSize: 10, fontWeight: '600' },
  receiptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  receiptAmount: { fontSize: 16, fontWeight: '700', color: '#1A2332' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#E8F5E9', borderRadius: 12 },
  categoryText: { fontSize: 11, color: '#4CAF50', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  deleteButton: { padding: 4 },
  modalBody: { padding: 20 },
  modalField: { marginBottom: 12 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase' },
  modalValue: { fontSize: 16, color: '#333', marginTop: 2 },
  modalTotalField: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 12, marginTop: 4, marginBottom: 16 },
  modalTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  modalTotalValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  viewReceiptButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  viewReceiptButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ReceiptsListScreen;







