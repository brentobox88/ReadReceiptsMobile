// src/screens/ReportsScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import FloatingScanButton from "../components/FloatingScanButton";
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
// import { useAuth } from '../context/AuthContext'; // DISABLED FOR DEMO

const { width } = Dimensions.get('window');

// FadeIn component using built-in Animated
const FadeInView = (props: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[props.style, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }]}
    >
      {props.children}
    </Animated.View>
  );
};

// Staggered card component
const StaggeredCard = (props: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: props.index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: props.index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacity,
        transform: [{ translateY: translateY }],
        flex: 1,
        minWidth: '30%',
      }}
    >
      {props.children}
    </Animated.View>
  );
};

interface FinancialData {
  income: number;
  expenses: number;
  taxes: number;
  netProfit: number;
  receiptCount: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
  taxBreakdown: {
    type: string;
    amount: number;
  }[];
  categoryBreakdown: {
    name: string;
    amount: number;
    color: string;
  }[];
  trends: {
    revenue: number;
    expenses: number;
    net: number;
  };
  topMerchants: {
    name: string;
    amount: number;
  }[];
}

const ReportsScreen = () => {
  const navigation = useNavigation();
  // const { user } = useAuth(); // DISABLED FOR DEMO
  const user = { email: 'demo@readreceipts.com' };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<FinancialData | null>(null);
  const [showContent, setShowContent] = useState(false);
  
  const API_URL = 'https://readreceipts-api-irch.onrender.com';

  useEffect(() => {
    if (data && !loading) {
      setTimeout(() => setShowContent(true), 150);
    }
  }, [data, loading]);

  const fetchReport = async () => {
    setLoading(true);
    setShowContent(false);
    try {
      const response = await fetch(API_URL + '/receipts');
      const result = await response.json();
      
      if (result.receipts) {
        const processed = processReceiptData(result.receipts);
        setData(processed);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processReceiptData = (receipts: any[]): FinancialData => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTaxes = 0;
    const monthlyMap: { [key: string]: { income: number; expenses: number } } = {};
    const taxMap: { [key: string]: number } = {};
    const categoryMap: { [key: string]: number } = {};
    const merchantMap: { [key: string]: number } = {};
    
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9E9E9E', '#9C27B0', '#00BCD4', '#FF5722'];

    receipts.forEach((receipt: any) => {
      const amount = receipt.total_amount || 0;
      const tax = receipt.total_tax_amount || 0;
      const category = receipt.category || 'Uncategorized';
      const merchant = receipt.supplier_name || 'Unknown';
      
      const isIncome = ['income', 'salary', 'payment', 'refund'].includes(category.toLowerCase());
      
      if (isIncome) {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
      
      totalTaxes += tax;
      
      if (receipt.receipt_date) {
        const date = new Date(receipt.receipt_date);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { income: 0, expenses: 0 };
        }
        
        if (isIncome) {
          monthlyMap[monthKey].income += amount;
        } else {
          monthlyMap[monthKey].expenses += amount;
        }
      }
      
      if (tax > 0) {
        const taxType = receipt.tax_type || 'Sales Tax';
        taxMap[taxType] = (taxMap[taxType] || 0) + tax;
      }
      
      categoryMap[category] = (categoryMap[category] || 0) + amount;
      merchantMap[merchant] = (merchantMap[merchant] || 0) + amount;
    });

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Object.keys(monthlyMap)
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map((month) => ({
        month,
        income: monthlyMap[month].income,
        expenses: monthlyMap[month].expenses,
      }));

    const taxBreakdown = Object.keys(taxMap).map((type) => ({
      type,
      amount: taxMap[type],
    }));

    const categoryBreakdown = Object.keys(categoryMap)
      .sort((a, b) => categoryMap[b] - categoryMap[a])
      .slice(0, 6)
      .map((name, index) => ({
        name,
        amount: categoryMap[name],
        color: colors[index % colors.length],
      }));

    const topMerchants = Object.keys(merchantMap)
      .sort((a, b) => merchantMap[b] - merchantMap[a])
      .slice(0, 5)
      .map((name) => ({
        name,
        amount: merchantMap[name],
      }));

    const trends = {
      revenue: monthlyData.length > 1 ? 
        ((monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 2].income) / 
         (monthlyData[monthlyData.length - 2].income || 1) * 100) : 0,
      expenses: monthlyData.length > 1 ?
        ((monthlyData[monthlyData.length - 1].expenses - monthlyData[monthlyData.length - 2].expenses) /
         (monthlyData[monthlyData.length - 2].expenses || 1) * 100) : 0,
      net: monthlyData.length > 1 ?
        (((monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 1].expenses) -
          (monthlyData[monthlyData.length - 2].income - monthlyData[monthlyData.length - 2].expenses)) /
         ((monthlyData[monthlyData.length - 2].income - monthlyData[monthlyData.length - 2].expenses) || 1) * 100) : 0,
    };

    return {
      income: totalIncome,
      expenses: totalExpenses,
      taxes: totalTaxes,
      netProfit: totalIncome - totalExpenses,
      receiptCount: receipts.length,
      monthlyData,
      taxBreakdown,
      categoryBreakdown,
      trends,
      topMerchants,
    };
  };

  useFocusEffect(
    useCallback(() => {
      fetchReport();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const formatCurrency = (amount: number) => {
    return '$' + amount.toFixed(2);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return 'arrow-up-circle';
    if (value < 0) return 'arrow-down-circle';
    return 'remove-circle';
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return '#4CAF50';
    if (value < 0) return '#F44336';
    return '#FF9800';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Generating report...</Text>
      </View>
    );
  }

  if (!data || data.receiptCount === 0) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#4CAF50', '#2196F3']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Reports</Text>
              <Text style={styles.headerSubtitle}>Financial insights</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="stats-chart" size={28} color="#fff" />
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No receipts yet</Text>
          <Text style={styles.emptySubtext}>Upload receipts to see insights</Text>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => navigation.navigate('Scan' as never)}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.scanButtonText}>Scan a Receipt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const barChartData = {
    labels: data.monthlyData.map((d) => d.month),
    datasets: [
      {
        data: data.monthlyData.map((d) => d.income),
        color: (opacity = 1) => 'rgba(76, 175, 80, ' + opacity + ')',
      },
      {
        data: data.monthlyData.map((d) => d.expenses),
        color: (opacity = 1) => 'rgba(244, 67, 54, ' + opacity + ')',
      },
    ],
  };

  const pieChartData = data.categoryBreakdown.map((item) => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    legendFontColor: '#333',
  }));

  if (!showContent) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading data...</Text>
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
      <FadeInView>
        <LinearGradient
          colors={['#4CAF50', '#2196F3']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Reports</Text>
              <Text style={styles.headerSubtitle}>Financial insights</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="stats-chart" size={28} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </FadeInView>

      <View style={styles.summaryGrid}>
        <StaggeredCard index={0}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Ionicons name="arrow-up-circle" size={20} color="#4CAF50" />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCurrency(data.income)}
            </Text>
          </View>
        </StaggeredCard>
        <StaggeredCard index={1}>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Ionicons name="arrow-down-circle" size={20} color="#F44336" />
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCurrency(data.expenses)}
            </Text>
          </View>
        </StaggeredCard>
        <StaggeredCard index={2}>
          <View style={[styles.summaryCard, styles.profitCard]}>
            <Ionicons name="cash-outline" size={20} color={data.netProfit >= 0 ? '#4CAF50' : '#F44336'} />
            <Text style={styles.summaryLabel}>Net Profit</Text>
            <Text style={[
              styles.summaryValue,
              data.netProfit >= 0 ? styles.profitText : styles.lossText
            ]}>
              {formatCurrency(data.netProfit)}
            </Text>
          </View>
        </StaggeredCard>
        <StaggeredCard index={3}>
          <View style={[styles.summaryCard, styles.taxCard]}>
            <Ionicons name="receipt-outline" size={20} color="#FF9800" />
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={[styles.summaryValue, styles.taxText]}>
              {formatCurrency(data.taxes)}
            </Text>
          </View>
        </StaggeredCard>
        <StaggeredCard index={4}>
          <View style={[styles.summaryCard, styles.receiptCard]}>
            <Ionicons name="document-text-outline" size={20} color="#2196F3" />
            <Text style={styles.summaryLabel}>Receipts</Text>
            <Text style={[styles.summaryValue, styles.receiptText]}>
              {data.receiptCount}
            </Text>
          </View>
        </StaggeredCard>
      </View>

      <FadeInView>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <BarChart
            data={barChartData}
            width={width - 32}
            height={200}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => 'rgba(0, 0, 0, ' + opacity + ')',
              labelColor: (opacity = 1) => 'rgba(0, 0, 0, ' + opacity + ')',
              style: { borderRadius: 16 },
              barPercentage: 0.7,
            }}
            style={styles.chart}
            fromZero
          />
        </View>
      </FadeInView>

      {data.categoryBreakdown.length > 0 && (
        <FadeInView>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <PieChart
              data={pieChartData}
              width={width - 32}
              height={180}
              chartConfig={{
                color: (opacity = 1) => 'rgba(0, 0, 0, ' + opacity + ')',
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </FadeInView>
      )}

      {data.taxBreakdown.length > 0 && (
        <FadeInView>
          <View style={styles.taxContainer}>
            <Text style={styles.chartTitle}>Tax Breakdown</Text>
            {data.taxBreakdown.map((tax, index) => {
              const barWidth = (tax.amount / data.taxes) * 100;
              const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
              return (
                <View key={index} style={styles.taxItem}>
                  <Text style={styles.taxType}>{tax.type}</Text>
                  <View style={styles.taxBarContainer}>
                    <View 
                      style={[
                        styles.taxBarFill, 
                        { 
                          width: Math.max(barWidth, 5) + '%',
                          backgroundColor: colors[index % colors.length]
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.taxAmount}>{formatCurrency(tax.amount)}</Text>
                </View>
              );
            })}
            <View style={styles.taxTotal}>
              <Text style={styles.taxTotalLabel}>Total Tax</Text>
              <Text style={styles.taxTotalAmount}>{formatCurrency(data.taxes)}</Text>
            </View>
          </View>
        </FadeInView>
      )}

      {data.topMerchants.length > 0 && (
        <FadeInView>
          <View style={styles.merchantsContainer}>
            <Text style={styles.chartTitle}>Top Merchants</Text>
            {data.topMerchants.map((merchant, index) => {
              const maxAmount = data.topMerchants[0]?.amount || 1;
              const percentage = (merchant.amount / maxAmount) * 100;
              return (
                <View key={index} style={styles.merchantItem}>
                  <Text style={styles.merchantName}>
                    {index + 1}. {merchant.name}
                  </Text>
                  <View style={styles.merchantBar}>
                    <View style={[styles.merchantBarFill, { width: percentage + '%' }]} />
                  </View>
                  <Text style={styles.merchantAmount}>{formatCurrency(merchant.amount)}</Text>
                </View>
              );
            })}
          </View>
        </FadeInView>
      )}

      <FadeInView>
        <View style={styles.trendsContainer}>
          <Text style={styles.chartTitle}>Monthly Trends</Text>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Revenue</Text>
            <View style={styles.trendValue}>
              <Ionicons 
                name={getTrendIcon(data.trends.revenue)} 
                size={20} 
                color={getTrendColor(data.trends.revenue)} 
              />
              <Text style={[styles.trendText, { color: getTrendColor(data.trends.revenue) }]}>
                {(data.trends.revenue > 0 ? '+' : '') + data.trends.revenue.toFixed(1) + '%'}
              </Text>
            </View>
          </View>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Expenses</Text>
            <View style={styles.trendValue}>
              <Ionicons 
                name={getTrendIcon(-data.trends.expenses)} 
                size={20} 
                color={getTrendColor(-data.trends.expenses)} 
              />
              <Text style={[styles.trendText, { color: getTrendColor(-data.trends.expenses) }]}>
                {(data.trends.expenses > 0 ? '+' : '') + (-data.trends.expenses).toFixed(1) + '%'}
              </Text>
            </View>
          </View>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Net Profit</Text>
            <View style={styles.trendValue}>
              <Ionicons 
                name={getTrendIcon(data.trends.net)} 
                size={20} 
                color={getTrendColor(data.trends.net)} 
              />
              <Text style={[styles.trendText, { color: getTrendColor(data.trends.net) }]}>
                {(data.trends.net > 0 ? '+' : '') + data.trends.net.toFixed(1) + '%'}
              </Text>
            </View>
          </View>
        </View>
      </FadeInView>

      <TouchableOpacity 
        style={styles.exportButton} 
        onPress={() => navigation.navigate('Export' as never)}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.exportButtonText}>Export Full Report</Text>
      </TouchableOpacity>
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
    color: '#6B7A8F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2332',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7A8F',
    marginTop: 4,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  profitCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  taxCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  receiptCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7A8F',
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  incomeText: { color: '#4CAF50' },
  expenseText: { color: '#F44336' },
  profitText: { color: '#4CAF50' },
  lossText: { color: '#F44336' },
  taxText: { color: '#FF9800' },
  receiptText: { color: '#9C27B0' },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
  taxContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taxType: {
    flex: 1,
    fontSize: 13,
    color: '#1A2332',
  },
  taxBarContainer: {
    flex: 2,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  taxBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  taxAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2332',
    minWidth: 60,
    textAlign: 'right',
  },
  taxTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  taxTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2332',
  },
  taxTotalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  merchantsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  merchantName: {
    flex: 1,
    fontSize: 13,
    color: '#1A2332',
  },
  merchantBar: {
    flex: 2,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  merchantBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  merchantAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2332',
  },
  trendsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendLabel: {
    fontSize: 13,
    color: '#1A2332',
  },
  trendValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReportsScreen;










