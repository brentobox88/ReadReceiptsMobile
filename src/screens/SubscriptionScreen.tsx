// src/screens/SubscriptionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';
import { TIERS } from '../config/features';

const SubscriptionScreen = () => {
  const { tier, upgradeToPro, upgradeToBusiness, downgradeToFree } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string>(tier);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: TIERS.free.price,
      features: ['50 receipts/month', 'Basic scanning', 'CSV export', 'Dashboard'],
      current: tier === 'free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: TIERS.pro.price,
      features: ['Unlimited receipts', 'Categories', 'JSON export', 'Advanced search', 'Edit receipts'],
      current: tier === 'pro',
      recommended: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: TIERS.business.price,
      features: ['Multi-user', 'Cloud backup', 'API access', 'Priority support'],
      current: tier === 'business',
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === tier) {
      Alert.alert('Already Subscribed', 'You are already on this plan.');
      return;
    }
    
    Alert.alert(
      'Confirm Upgrade',
      'Are you sure you want to switch to the ' + planId + ' plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (planId === 'pro') upgradeToPro();
            else if (planId === 'business') upgradeToBusiness();
            else downgradeToFree();
            setSelectedTier(planId);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade to unlock more features</Text>
      </View>

      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            plan.recommended && styles.recommendedCard,
            plan.current && styles.currentCard,
          ]}
          onPress={() => handleSelectPlan(plan.id)}
          activeOpacity={0.8}
        >
          {plan.recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Most Popular</Text>
            </View>
          )}
          
          {plan.current && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>✓ Current Plan</Text>
            </View>
          )}

          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <View style={styles.featuresContainer}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={plan.current ? '#4CAF50' : '#666'}
                />
                <Text style={[styles.featureText, plan.current && styles.currentFeatureText]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.selectButton,
              plan.current && styles.currentButton,
              plan.recommended && !plan.current && styles.recommendedButton,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
            disabled={plan.current}
          >
            <Text style={[
              styles.selectButtonText,
              plan.current && styles.currentButtonText,
            ]}>
              {plan.current ? 'Active Plan' : 'Select'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <Text style={styles.footerText}>
        All plans include a 14-day free trial. Cancel anytime.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
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
  planCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedCard: {
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  currentCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  featuresContainer: {
    marginTop: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  currentFeatureText: {
    color: '#333',
  },
  selectButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  recommendedButton: {
    backgroundColor: '#FF9800',
  },
  currentButton: {
    backgroundColor: '#4CAF50',
  },
  selectButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  currentButtonText: {
    color: '#fff',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    padding: 20,
  },
});

export default SubscriptionScreen;









