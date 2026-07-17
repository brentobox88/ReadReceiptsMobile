// src/components/LockedFeature.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TIERS } from '../config/features';

interface LockedFeatureProps {
  featureName: string;
  featureKey: string;
  tier: 'free' | 'pro' | 'business';
  onUpgrade?: () => void;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({
  featureName,
  featureKey,
  tier,
  onUpgrade,
}) => {
  const tierInfo = TIERS[tier];
  
  return (
    <View style={styles.container}>
      <View style={styles.lockIcon}>
        <Ionicons name="lock-closed" size={32} color="#FF9800" />
      </View>
      <Text style={styles.title}>{featureName}</Text>
      <Text style={styles.subtitle}>
        Upgrade to {tierInfo.name} to unlock
      </Text>
      <Text style={styles.price}>{tierInfo.price}</Text>
      
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeText}>Upgrade Now</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    margin: 12,
    opacity: 0.85,
  },
  lockIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  learnMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  learnMoreText: {
    color: '#666',
    fontSize: 12,
  },
});

export default LockedFeature;
