// src/screens/ConfirmationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

interface ReceiptData {
  id: string;
  merchant_name: string;
  merchant_address: string;
  transaction_date: string;
  total_amount: number;
  tax_amount: number;
  subtotal: number;
  currency: string;
  confidence_score: number;
  line_items: any[];
  parsed_data: {
    supplier_name: string;
    supplier_address: string;
    receipt_date: string;
    purchase_time: string;
    total_amount: number;
    total_tax_amount: number;
    net_amount: number;
    currency: string;
    tip_amount: number;
    confidence_scores: Record<string, number>;
    entities_found: string[];
    raw_text: string;
  };
  status: string;
  created_at: string;
}

const ConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { receiptId, imageUri } = route.params as { receiptId: string; imageUri?: string };
  
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<any>({});

  // Fetch receipt details from backend
  useEffect(() => {
    fetchReceiptDetails();
  }, [receiptId]);

  const fetchReceiptDetails = async () => {
    try {
      const response = await fetch(http://10.0.0.229:8001/receipts/);
      const data = await response.json();
      setReceipt(data);
      setEditedReceipt(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      Alert.alert('Error', 'Failed to load receipt details');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      Alert.alert('Success', 'Receipt updated successfully');
      setIsEditing(false);
      fetchReceiptDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleConfirm = () => {
    navigation.navigate('ReceiptsList');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100) + '%';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading receipt details...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Receipt not found</Text>
      </View>
    );
  }

  // Get data from parsed_data if available, otherwise use main fields
  const parsed = receipt.parsed_data || {};
  const displayName = parsed.supplier_name || receipt.merchant_name || 'Unknown Merchant';
  const displayAddress = parsed.supplier_address || receipt.merchant_address || '';
  const displayDate = parsed.receipt_date || receipt.transaction_date || '';
  const displayTime = parsed.purchase_time || '';
  const displayTotal = parsed.total_amount || receipt.total_amount || 0;
  const displayTax = parsed.total_tax_amount || receipt.tax_amount || 0;
  const displaySubtotal = parsed.net_amount || receipt.subtotal || 0;
  const displayCurrency = parsed.currency || receipt.currency || '$';
  const displayTip = parsed.tip_amount || 0;
  const displayConfidence = receipt.confidence_score || 0;
  const confidenceScores = parsed.confidence_scores || {};
  const entitiesFound = parsed.entities_found || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📄 Review Receipt</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.receiptImage} />
      )}

      {/* Confidence Score */}
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>📊 Overall Confidence</Text>
        <View style={styles.confidenceBarContainer}>
          <View
            style={[
              styles.confidenceBar,
              { backgroundColor: getConfidenceColor(displayConfidence) },
              { width: getConfidencePercent(displayConfidence) }
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>{getConfidencePercent(displayConfidence)}</Text>
        {displayConfidence < 0.6 && (
          <Text style={styles.warningText}>⚠️ Low confidence - please verify this receipt</Text>
        )}
      </View>

      {/* Main Receipt Data */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>📋 Receipt Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Merchant</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={(text) => setEditedReceipt({ ...editedReceipt, merchant_name: text })}
            editable={isEditing}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={displayAddress}
            onChangeText={(text) => setEditedReceipt({ ...editedReceipt, merchant_address: text })}
            editable={isEditing}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={displayDate}
              onChangeText={(text) => setEditedReceipt({ ...editedReceipt, transaction_date: text })}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={displayTime}
              onChangeText={(text) => setEditedReceipt({ ...editedReceipt, purchase_time: text })}
              editable={isEditing}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Subtotal</Text>
            <TextInput
              style={styles.input}
              value={displaySubtotal.toString()}
              onChangeText={(text) => setEditedReceipt({ ...editedReceipt, subtotal: parseFloat(text) || 0 })}
              editable={isEditing}
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Tax</Text>
            <TextInput
              style={styles.input}
              value={displayTax.toString()}
              onChangeText={(text) => setEditedReceipt({ ...editedReceipt, tax_amount: parseFloat(text) || 0 })}
              editable={isEditing}
            />
          </View>
        </View>

        {displayTip > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Tip</Text>
            <TextInput
              style={styles.input}
              value={displayTip.toString()}
              onChangeText={(text) => setEditedReceipt({ ...editedReceipt, tip_amount: parseFloat(text) || 0 })}
              editable={isEditing}
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Total Amount</Text>
          <TextInput
            style={[styles.input, styles.totalInput]}
            value={displayTotal.toString()}
            onChangeText={(text) => setEditedReceipt({ ...editedReceipt, total_amount: parseFloat(text) || 0 })}
            editable={isEditing}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            value={displayCurrency}
            onChangeText={(text) => setEditedReceipt({ ...editedReceipt, currency: text })}
            editable={isEditing}
          />
        </View>
      </View>

      {/* Confidence Scores for Each Field */}
      {Object.keys(confidenceScores).length > 0 && (
        <View style={styles.confidenceDetailsContainer}>
          <Text style={styles.sectionTitle}>🎯 Field Confidence</Text>
          {Object.entries(confidenceScores).map(([field, score]) => (
            <View key={field} style={styles.confidenceRow}>
              <Text style={styles.confidenceField}>{field.replace(/_/g, ' ')}</Text>
              <View style={styles.confidenceMiniBarContainer}>
                <View
                  style={[
                    styles.confidenceMiniBar,
                    { backgroundColor: getConfidenceColor(score as number) },
                    { width: \% }
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>{Math.round((score as number) * 100)}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Extracted Entities */}
      {entitiesFound.length > 0 && (
        <View style={styles.entitiesContainer}>
          <Text style={styles.sectionTitle}>🔍 Extracted Fields</Text>
          <View style={styles.tagsContainer}>
            {entitiesFound.map((entity: string) => (
              <View key={entity} style={styles.tag}>
                <Text style={styles.tagText}>{entity.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Line Items */}
      {receipt.line_items && receipt.line_items.length > 0 && (
        <View style={styles.lineItemsContainer}>
          <Text style={styles.sectionTitle}>🛒 Line Items</Text>
          {receipt.line_items.map((item: any, index: number) => (
            <View key={index} style={styles.lineItemCard}>
              <Text style={styles.lineItemName}>{item.description || 'Item'}</Text>
              <View style={styles.lineItemRow}>
                <Text style={styles.lineItemDetail}>Qty: {item.quantity || 1}</Text>
                <Text style={styles.lineItemDetail}></Text>
                <Text style={styles.lineItemTotal}></Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Raw Text (expandable) */}
      {parsed.raw_text && (
        <View style={styles.rawTextContainer}>
          <Text style={styles.sectionTitle}>📝 Raw OCR Text</Text>
          <Text style={styles.rawText} numberOfLines={3}>
            {parsed.raw_text}
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Cancel Edit' : '✏️ Edit'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>💾 Save Changes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>✅ Confirm & Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
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
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
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
  warningText: {
    color: '#F44336',
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
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
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  totalInput: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  confidenceDetailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceField: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  confidenceMiniBarContainer: {
    flex: 2,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  confidenceMiniBar: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 45,
    textAlign: 'right',
  },
  entitiesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tagText: {
    fontSize: 12,
    color: '#2E7D32',
    textTransform: 'capitalize',
  },
  lineItemsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  lineItemCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lineItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lineItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  rawTextContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  rawText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmationScreen;

