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

interface Receipt {
  id: string;
  merchant_name: string;
  merchant_address?: string;
  transaction_date?: string;
  total_amount: number;
  tax_amount?: number;
  currency: string;
  filename?: string;
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

  const API_URL = 'http://10.0.0.229:8000';

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

  // Quick stats
  const totalReceipts = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const avgConfidence = receipts.length > 0 
    ? receipts.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / receipts.length 
    : 0;
  const needsReview = receipts.filter(r => (r.confidence_score || 0) < 0.7).length;

  // Category breakdown
  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {};
    receipts.forEach((r) => {
      const category = r.category || 'uncategorized';
      breakdown[category] = (breakdown[category] || 0) + (r.total_amount || 0);
    });
    return breakdown;
  };

  const getCategoryLabel = (id: string) => {
    const categories: Record<string, string> = {
      'food': '🍔 Food & Dining',
      'transport': '🚗 Transport',
      'shopping': '🛍️ Shopping',
      'utilities': '💡 Utilities',
      'entertainment': '🎬 Entertainment',
      'health': '🏥 Health',
      'education': '📚 Education',
      'travel': '✈️ Travel',
      'office': '🏢 Office',
      'other': '📦 Other',
      'uncategorized': '📦 Uncategorized',
    };
    return categories[id] || id;
  };

  // Recent receipts (last 5)
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📄 Receipt Summary</Text>
        <Text style={styles.subtitle}>Quick overview of your receipts</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalReceipts}</Text>
          <Text style={styles.statLabel}>Total Receipts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}></Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round(avgConfidence * 100)}%</Text>
          <Text style={styles.statLabel}>Avg Confidence</Text>
        </View>
        <View style={[styles.statCard, needsReview > 0 ? styles.statCardWarning : null]}>
          <Text style={[styles.statNumber, needsReview > 0 ? styles.statNumberWarning : null]}>
            {needsReview}
          </Text>
          <Text style={styles.statLabel}>Need Review</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Spending by Category</Text>
        {Object.keys(getCategoryBreakdown()).length === 0 ? (
          <Text style={styles.emptyText}>No categories yet</Text>
        ) : (
          Object.entries(getCategoryBreakdown())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, total]) => {
              const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
              return (
                <View key={category} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{getCategoryLabel(category)}</Text>
                  <View style={styles.categoryBarContainer}>
                    <View
                      style={[
                        styles.categoryBar,
                        { width: Math.min(percentage, 100) + '%' }
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryAmount}></Text>
                </View>
              );
            })
        )}
      </View>

      {/* Recent Receipts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Recent Receipts</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Receipts' })}>
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
                <Text style={styles.receiptMerchant}>{receipt.merchant_name || 'Unknown'}</Text>
                <Text style={styles.receiptDate}>
                  {new Date(receipt.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.receiptRight}>
                <Text style={styles.receiptAmount}>
                  {receipt.currency || '$'}{receipt.total_amount.toFixed(2)}
                </Text>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(receipt.confidence_score || 0) }]}>
                  <Text style={styles.confidenceText}>{getConfidenceLabel(receipt.confidence_score || 0)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Export' })}
        >
          <Ionicons name="download-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Export Receipts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.scanButton]}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Scan' })}
        >
          <Ionicons name="camera-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Scan New</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
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
  statsGrid: {
    flexDirection: 'row',
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
  statCardWarning: {
    borderWidth: 2,
    borderColor: '#F44336',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statNumberWarning: {
    color: '#F44336',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    width: 120,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 70,
    textAlign: 'right',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  receiptLeft: {
    flex: 1,
  },
  receiptMerchant: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  receiptDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  receiptRight: {
    alignItems: 'flex-end',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
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
  actions: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  scanButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DashboardScreen;
