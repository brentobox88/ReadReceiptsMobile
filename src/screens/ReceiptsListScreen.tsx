// src/screens/ReceiptsListScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingScanButton from '../components/FloatingScanButton';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { FilterPill } from '../components/FilterPill';
import {
  ReceiptFilters,
  SortOption,
  DEFAULT_FILTERS,
  activeFilterCount,
  toQueryParams,
  CURRENCIES,
} from '../utils/filters';

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'fast-food' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'shopping', label: 'Shopping', icon: 'bag' },
  { id: 'utilities', label: 'Utilities', icon: 'bulb' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film' },
  { id: 'health', label: 'Health', icon: 'fitness' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'other', label: 'Other', icon: 'cube' },
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
  const [filters, setFilters] = useState<ReceiptFilters>(DEFAULT_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const [dateFromInput, setDateFromInput] = useState('');

  const [dateToInput, setDateToInput] = useState('');
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to' | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const filterCount = activeFilterCount(filters);

  const API_URL = 'https://readreceipts-api-sxyz.onrender.com';

  const fetchReceipts = async () => {
    try {
      const params = new URLSearchParams(toQueryParams(filters)).toString();
      const response = await fetch(`${API_URL}/receipts?${params}`);
      const data = await response.json();
      if (data.receipts) {
        setReceipts(data.receipts);
        filterReceipts(searchQuery, data.receipts);
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
    }, [filters])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const filterReceipts = (query: string, receiptData?: Receipt[]) => {
    const data = receiptData || receipts;
    let filtered = data;

    if (query.trim() !== '') {
      filtered = filtered.filter(
        (receipt) =>
          (receipt.merchant_name || '').toLowerCase().includes(query.toLowerCase()) ||
          (receipt.merchant_address && receipt.merchant_address.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredReceipts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterReceipts(text);
  };

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalVisible(true);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setModalVisible(false);
    (navigation as any).navigate('ReceiptDetail', { receiptId: receipt.id });
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FilterPill count={filterCount} onPress={() => { setDateFromInput(filters.startDate || ''); setDateToInput(filters.endDate || ''); setFilterSheetVisible(true); }} />
            <View style={styles.headerIcon}>
              <Ionicons name="receipt" size={28} color="#fff" />
            </View>
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

      {/* <FloatingScanButton /> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterSheetVisible}
        onRequestClose={() => setFilterSheetVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: '700' }}>Filters</Text>
                <Pressable onPress={() => setFilterSheetVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </Pressable>
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 }}>Sort by</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {([
                  { key: 'date_desc' as SortOption, label: 'Newest' },
                  { key: 'date_asc' as SortOption, label: 'Oldest' },
                  { key: 'amount_desc' as SortOption, label: 'Highest' },
                  { key: 'amount_asc' as SortOption, label: 'Lowest' },
                  { key: 'merchant_asc' as SortOption, label: 'A-Z' },
                ]).map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => setFilters({ ...filters, sort: s.key })}
                    style={[
                      { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f0f0f0' },
                      filters.sort === s.key && { backgroundColor: '#111' },
                    ]}
                  >
                    <Text style={{ color: filters.sort === s.key ? '#fff' : '#111', fontWeight: filters.sort === s.key ? '600' : '400' }}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 }}>Date range</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  onPress={() => setDatePickerMode(datePickerMode === 'from' ? null : 'from')}
                >
                  <Text style={{ color: dateFromInput ? '#111' : '#999', fontSize: 14 }}>{dateFromInput || 'From'}</Text>
                  <Ionicons name="calendar-outline" size={16} color="#999" />
                </Pressable>
                <Pressable
                  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  onPress={() => setDatePickerMode(datePickerMode === 'to' ? null : 'to')}
                >
                  <Text style={{ color: dateToInput ? '#111' : '#999', fontSize: 14 }}>{dateToInput || 'To'}</Text>
                  <Ionicons name="calendar-outline" size={16} color="#999" />
                </Pressable>
              </View>

              {datePickerMode && (
                <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, overflow: 'hidden' }}>
                  <Calendar
                    current={datePickerMode === 'from' ? (dateFromInput || undefined) : (dateToInput || undefined)}
                    onDayPress={(day: any) => {
                      if (datePickerMode === 'from') {
                        setDateFromInput(day.dateString);
                      } else {
                        setDateToInput(day.dateString);
                      }
                      setDatePickerMode(null);
                    }}
                    markedDates={{
                      ...(dateFromInput ? { [dateFromInput]: { selected: true, selectedColor: '#4CAF50' } } : {}),
                      ...(dateToInput ? { [dateToInput]: { selected: true, selectedColor: '#4CAF50' } } : {}),
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#4CAF50',
                      todayTextColor: '#4CAF50',
                      arrowColor: '#4CAF50',
                    }}
                  />
                  <Pressable
                    onPress={() => setDatePickerMode(null)}
                    style={{ padding: 12, alignItems: 'center', backgroundColor: '#f5f5f5' }}
                  >
                    <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
                  </Pressable>
                </View>
              )}

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setFilters({ ...filters, category: filters.category === c.id ? null : c.id })}
                    style={[
                      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f0f0f0', gap: 4 },
                      filters.category === c.id && { backgroundColor: '#111' },
                    ]}
                  >
                    <Ionicons name={c.icon as any} size={14} color={filters.category === c.id ? '#fff' : '#111'} />
                    <Text style={{ color: filters.category === c.id ? '#fff' : '#111', fontWeight: filters.category === c.id ? '600' : '400' }}>{c.label}</Text>
                  </Pressable>
                ))}
              </View>


              <Text style={{ fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 }}>Currency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CURRENCIES.map((cur) => (
                  <Pressable
                    key={cur}
                    onPress={() => setFilters({ ...filters, currency: filters.currency === cur ? null : cur })}
                    style={[
                      { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f0f0f0' },
                      filters.currency === cur && { backgroundColor: '#111' },
                    ]}
                  >
                    <Text style={{ color: filters.currency === cur ? '#fff' : '#111', fontWeight: filters.currency === cur ? '600' : '400' }}>{cur}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                <Pressable
                  onPress={() => { setFilters(DEFAULT_FILTERS); setDateFromInput(''); setDateToInput(''); }}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' }}
                >
                  <Text style={{ fontWeight: '600' }}>Reset</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setFilters({
                      ...filters,
                      startDate: dateFromInput.trim() || null,
                      endDate: dateToInput.trim() || null,
                    });
                    setFilterSheetVisible(false);
                  }}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#111', alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  listContainer: { padding: 12, paddingBottom: 20 },
  receiptCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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

