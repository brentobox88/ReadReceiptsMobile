// src/screens/ConfirmationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CategorySelector, ImageDisplay } from '../components';
import { useFeatureCheck } from '../hooks/useFeature';
import { getCategoryLabel } from '../config/categories';

const ConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { receiptId, imageUri } = route.params as { receiptId: string; imageUri?: string };
  
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const { checkFeature } = useFeatureCheck();

  const API_URL = 'https://readreceipts-api-irch.onrender.com';

  useEffect(() => {
    fetchReceiptDetails();
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      const url = API_URL + '/receipts/' + receiptId;
      const response = await fetch(url);
      const data = await response.json();
      setReceipt(data);
      if (data.notes) {
        setNotes(data.notes);
      }
      if (data.category) {
        setSelectedCategory(data.category);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      Alert.alert('Error', 'Failed to load receipt details');
      setLoading(false);
    }
  };

  const handleConfirmWithNotes = async () => {
    try {
      const url = API_URL + '/receipts/' + receiptId;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes, category: selectedCategory }),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Receipt saved successfully');
        (navigation as any).navigate('MainTabs', { screen: 'Receipts' });
      } else {
        const result = await response.json();
        Alert.alert('Error', result.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'Failed to save notes. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipt details...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Receipt not found</Text>
      </View>
    );
  }

  const parsed = receipt.parsed_data || {};
  
  const merchant = parsed.supplier_name || receipt.merchant_name || 'N/A';
  const address = parsed.supplier_address || receipt.merchant_address || 'N/A';
  const date = parsed.receipt_date || receipt.transaction_date || 'N/A';
  const time = parsed.purchase_time || 'N/A';
  const subtotal = parsed.net_amount || receipt.subtotal || 0;
  const tip = parsed.tip_amount || 0;
  const total = parsed.total_amount || receipt.total_amount || 0;
  const currency = parsed.currency || receipt.currency || '$';

  const confidence = receipt.confidence_score || 0;
  const confidencePercent = Math.round(confidence * 100);
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Receipt</Text>

      <ImageDisplay imageUri={imageUri} />

      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence Score</Text>
        <View style={styles.confidenceBarContainer}>
          <View
            style={[
              styles.confidenceBar,
              { backgroundColor: getConfidenceColor(confidence) },
              { width: confidencePercent + '%' }
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>{confidencePercent}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Receipt Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Merchant</Text>
          <Text style={styles.value}>{merchant}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{address}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{currency} {subtotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Tip</Text>
            <Text style={styles.value}>{currency} {tip.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.field, styles.totalField]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{currency} {total.toFixed(2)}</Text>
        </View>

        {true && (
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons name="pricetag-outline" size={20} color="#666" />
            <Text style={styles.categoryButtonText}>
              {selectedCategory ? getCategoryLabel(selectedCategory) : 'Add Category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {checkFeature('receiptNotes') && (
          <View style={styles.notesField}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this receipt..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </View>

      <CategorySelector
        visible={categoryModalVisible}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setCategoryModalVisible(false)}
      />

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmWithNotes}
      >
        <Text style={styles.buttonText}>Confirm & Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  confidenceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    flex: 1,
    marginRight: 8,
  },
  totalField: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  notesField: {
    marginTop: 8,
    marginBottom: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmationScreen;








