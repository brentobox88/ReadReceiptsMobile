// src/screens/ConfirmationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DOCUMENT_TYPES = [
  { id: 'expense', label: '📄 Expense' },
  { id: 'invoice', label: '📊 Income' },
  { id: 'tax', label: '🧾 Tax' },
];

const CATEGORIES = [
  { id: 'food', label: '🍔 Food' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'utilities', label: '💡 Utilities' },
  { id: 'entertainment', label: '🎬 Entertainment' },
  { id: 'health', label: '🏥 Health' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'other', label: '📌 Other' },
];

const ConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { receiptId, imageUri } = route.params as { receiptId?: string; imageUri?: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [total, setTotal] = useState('');
  const [tax, setTax] = useState('');
  const [documentType, setDocumentType] = useState('expense');
  const [category, setCategory] = useState('');

  const API_URL = 'https://readreceipts-api-irch.onrender.com';

  useEffect(() => {
    if (receiptId) {
      fetchReceiptDetails();
    } else {
      setLoading(false);
    }
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      const response = await fetch(API_URL + '/receipts/' + receiptId);
      const data = await response.json();
      setReceipt(data);
      setMerchant(data.merchant_name || '');
      setDate(data.transaction_date || '');
      setTotal(data.total_amount?.toString() || '');
      setTax(data.tax_amount?.toString() || '');
      setDocumentType(data.document_type || 'expense');
      setCategory(data.category || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        merchant_name: merchant,
        transaction_date: date,
        total_amount: parseFloat(total) || 0,
        tax_amount: parseFloat(tax) || 0,
        document_type: documentType,
        category: category,
      };

      const response = await fetch(API_URL + '/receipts/' + receiptId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Receipt updated!');
        setIsEditing(false);
        fetchReceiptDetails();
      } else {
        Alert.alert('Error', 'Failed to update receipt');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipt...</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <Ionicons name={isEditing ? 'close' : 'pencil'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.receiptImage} resizeMode="cover" />
        )}

        {receipt ? (
          <View style={styles.card}>
            {isEditing ? (
              <>
                <Text style={styles.label}>Merchant</Text>
                <TextInput
                  style={styles.input}
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="Merchant name"
                />
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
                <Text style={styles.label}>Total Amount</Text>
                <TextInput
                  style={styles.input}
                  value={total}
                  onChangeText={setTotal}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Tax Amount</Text>
                <TextInput
                  style={styles.input}
                  value={tax}
                  onChangeText={setTax}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Document Type</Text>
                <View style={styles.chipContainer}>
                  {DOCUMENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.chip, documentType === type.id && styles.chipActive]}
                      onPress={() => setDocumentType(type.id)}
                    >
                      <Text style={[styles.chipText, documentType === type.id && styles.chipTextActive]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipContainer}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, category === cat.id && styles.chipActive]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Merchant</Text>
                  <Text style={styles.value}>{receipt.merchant_name || 'Unknown'}</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>{receipt.merchant_address || 'N/A'}</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{formatDate(receipt.transaction_date)}</Text>
                </View>
                <View style={[styles.field, styles.totalField]}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {(receipt.currency || '$') + (receipt.total_amount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Tax</Text>
                  <Text style={styles.value}>
                    {(receipt.currency || '$') + (receipt.tax_amount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Document Type</Text>
                  <Text style={styles.value}>
                    {DOCUMENT_TYPES.find(t => t.id === receipt.document_type)?.label || 'Expense'}
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Category</Text>
                  <Text style={styles.value}>
                    {CATEGORIES.find(c => c.id === receipt.category)?.label || 'Uncategorized'}
                  </Text>
                </View>
                {receipt.confidence_score && (
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence Score</Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(receipt.confidence_score) + '20' }]}>
                      <Text style={[styles.confidenceText, { color: getConfidenceColor(receipt.confidence_score) }]}>
                        {getConfidenceText(receipt.confidence_score)}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              <Text style={styles.successTitle}>Upload Successful!</Text>
              <Text style={styles.successSubtext}>Receipt ID: {receiptId}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Receipts' })}
          >
            <Text style={styles.buttonText}>View All Receipts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Scan' })}
          >
            <Text style={styles.buttonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 8, fontSize: 14, color: '#666' },
  header: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backButton: { padding: 4 },
  editButton: { padding: 4 },
  content: { flex: 1, padding: 16 },
  receiptImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 16, color: '#333' },
  totalField: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  confidenceContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  confidenceLabel: { fontSize: 12, color: '#999' },
  confidenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  confidenceText: { fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 8, backgroundColor: '#f9f9f9' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: 'transparent', marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipText: { fontSize: 14, color: '#333' },
  chipTextActive: { color: '#fff' },
  saveButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successContainer: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
  successSubtext: { fontSize: 14, color: '#666', marginTop: 4 },
  buttonContainer: { gap: 10, marginVertical: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: '#4CAF50' },
  secondaryButton: { backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ConfirmationScreen;
