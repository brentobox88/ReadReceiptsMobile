// src/screens/SubscriptionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SubscriptionScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['10 receipts/month', 'Basic OCR', '24/7 support'],
      color: '#4CAF50',
      icon: 'leaf-outline',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      features: ['Unlimited receipts', 'Advanced AI', 'Export to CSV/PDF', 'Priority support'],
      color: '#2196F3',
      icon: 'star-outline',
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: '$29.99',
      period: '/month',
      features: ['Everything in Pro', 'Team sharing', 'API access', 'Custom reports'],
      color: '#9C27B0',
      icon: 'briefcase-outline',
    },
  ];

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    Alert.alert(
      'Subscribe',
      `You selected the ${plans.find(p => p.id === planId)?.name} plan.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedPlan(null) },
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'Subscription activated!') },
      ]
    );
  };

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
            <Text style={styles.headerTitle}>Subscription</Text>
            <Text style={styles.headerSubtitle}>Choose your plan</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={28} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.popular && styles.planCardPopular,
            ]}
            onPress={() => handleSubscribe(plan.id)}
            activeOpacity={0.7}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                <Ionicons name={plan.icon as any} size={24} color={plan.color} />
              </View>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPriceContainer}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
            </View>
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: plan.color }]}
              onPress={() => handleSubscribe(plan.id)}
            >
              <Text style={styles.subscribeButtonText}>
                {selectedPlan === plan.id ? 'Selected' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 16 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
  planCardSelected: { borderColor: '#4CAF50', borderWidth: 2 },
  planCardPopular: { borderColor: '#2196F3', borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -1, right: 16, backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 4, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  planName: { fontSize: 18, fontWeight: '600', color: '#333' },
  planPriceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { fontSize: 22, fontWeight: 'bold' },
  planPeriod: { fontSize: 14, color: '#999', marginLeft: 2 },
  planFeatures: { marginVertical: 12, gap: 6 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#555' },
  subscribeButton: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  subscribeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default SubscriptionScreen;
