import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ReceiptToast({ 
  merchant = "Test Store", 
  amount = "$24.99", 
  category = "food", 
  confidence = 0.95, 
  confidenceLevel = "high",
  onEdit = () => {}
}) {
  const slideAnim = new Animated.Value(150);
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Slide up animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Color based on confidence
  const getColor = () => {
    if (confidenceLevel === 'high') return { bg: '#10B981', text: '#065F46' };
    if (confidenceLevel === 'medium') return { bg: '#F59E0B', text: '#92400E' };
    return { bg: '#EF4444', text: '#991B1B' };
  };
  
  const colors = getColor();
  
  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      },
    ]}>
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <Ionicons 
          name={confidenceLevel === 'high' ? 'checkmark-circle' : 
                confidenceLevel === 'medium' ? 'alert-circle' : 'warning'} 
          size={20} 
          color="#FFF" 
        />
        <Text style={styles.headerText}>
          {confidenceLevel === 'high' ? '✓ Receipt Saved' :
           confidenceLevel === 'medium' ? '~ Review Suggested' : '? Needs Review'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.merchantContainer}>
            <Ionicons name="storefront" size={16} color="#666" style={styles.icon} />
            <Text style={styles.merchant} numberOfLines={1}>
              {merchant}
            </Text>
          </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        
        <View style={styles.row}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.bg + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.confidence}>{Math.round(confidence * 100)}% confidence</Text>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="create" size={16} color="#4A90E2" />
          <Text style={styles.editButtonText}>Edit details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 140,
    width: width - 40,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  headerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  merchant: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidence: {
    fontSize: 12,
    color: '#6B7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});
