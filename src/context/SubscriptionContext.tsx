// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FEATURES, getDefaultTier, isFeatureEnabled } from '../config/features';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Tier = 'free' | 'pro' | 'business';

interface SubscriptionContextType {
  tier: Tier;
  setTier: (tier: Tier) => void;
  isLoading: boolean;
  isFeatureAvailable: (featureKey: string) => boolean;
  getFeatureLimit: (featureKey: string) => number | null;
  getFeatureValue: (featureKey: string) => any;
  upgradeToPro: () => void;
  upgradeToBusiness: () => void;
  downgradeToFree: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<Tier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const savedTier = await AsyncStorage.getItem('userTier');
      if (savedTier) {
        setTier(savedTier as Tier);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTier = async (newTier: Tier) => {
    try {
      await AsyncStorage.setItem('userTier', newTier);
      setTier(newTier);
    } catch (error) {
      console.error('Error saving tier:', error);
    }
  };

  const isFeatureAvailable = (featureKey: string): boolean => {
    return isFeatureEnabled(featureKey, tier);
  };

  const getFeatureLimit = (featureKey: string): number | null => {
    const feature = FEATURES[featureKey];
    return feature?.value || null;
  };

  const getFeatureValue = (featureKey: string): any => {
    const feature = FEATURES[featureKey];
    return feature || null;
  };

  const upgradeToPro = () => saveTier('pro');
  const upgradeToBusiness = () => saveTier('business');
  const downgradeToFree = () => saveTier('free');

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier: saveTier,
        isLoading,
        isFeatureAvailable,
        getFeatureLimit,
        getFeatureValue,
        upgradeToPro,
        upgradeToBusiness,
        downgradeToFree,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
