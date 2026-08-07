// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  category?: string;
}

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const totalReceipts = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const avgConfidence = receipts.length > 0 
    ? receipts.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / receipts.length 
    : 0;
  const needsReview = receipts.filter(r => (r.confidence_score || 0) < 0.7).length;

  const recentReceipts = [...receipts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceLabel = (score: number) => {
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
    return (currency || '$') + amount.toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back</Text>
            <Text style={styles.headerTitle}>Receipt Summary</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptCount}>{totalReceipts}</Text>
            <Text style={styles.receiptCountLabel}>Receipts</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}></Text>
            <Text style={styles.headerStatLabel}>Total Spent</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{Math.round(avgConfidence * 100)}%</Text>
            <Text style={styles.headerStatLabel}>Avg Confidence</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStatItem}>
            <Text style={[styles.headerStatValue, needsReview > 0 ? styles.warningText : null]}>
              {needsReview}
            </Text>
            <Text style={styles.headerStatLabel}>Needs Review</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => (navigation as any).navigate('Scan')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="camera" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.quickActionLabel}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => (navigation as any).navigate('Receipts')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="receipt" size={24} color="#2196F3" />
          </View>
          <Text style={styles.quickActionLabel}>Receipts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => (navigation as any).navigate('Reports')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="stats-chart" size={24} color="#FF9800" />
          </View>
          <Text style={styles.quickActionLabel}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => (navigation as any).navigate('Export')}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="download" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.quickActionLabel}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Receipts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Receipts')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentReceipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No receipts yet</Text>
            <Text style={styles.emptySubtext}>Scan your first receipt from the Camera tab</Text>
          </View>
        ) : (
          recentReceipts.map((receipt) => (
            <TouchableOpacity
              key={receipt.id}
              style={styles.receiptItem}
              onPress={() => (navigation as any).navigate('Confirmation', { receiptId: receipt.id })}
            >
              <View style={styles.receiptLeft}>
                <View style={[styles.receiptIcon, { backgroundColor: getConfidenceColor(receipt.confidence_score || 0) + '20' }]}>
                  <Ionicons name="receipt" size={16} color={getConfidenceColor(receipt.confidence_score || 0)} />
                </View>
                <View>
                  <Text style={styles.receiptMerchant}>{receipt.merchant_name || 'Unknown'}</Text>
                  <Text style={styles.receiptDate}>{formatDate(receipt.transaction_date)}</Text>
                </View>
              </View>
              <View style={styles.receiptRight}>
                <Text style={styles.receiptAmount}>
                  {formatCurrency(receipt.total_amount || 0, receipt.currency || '$')}
                </Text>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(receipt.confidence_score || 0) + '20' }]}>
                  <Text style={[styles.confidenceText, { color: getConfidenceColor(receipt.confidence_score || 0) }]}>
                    {getConfidenceLabel(receipt.confidence_score || 0)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    alignItems: 'center',
  },
  receiptCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  receiptCountLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  warningText: {
    color: '#FFC107',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: -20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  receiptIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  receiptMerchant: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  receiptDate: {
    fontSize: 12,
    color: '#666',
  },
  receiptRight: {
    alignItems: 'flex-end',
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DashboardScreen;
