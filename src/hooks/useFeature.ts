// src/hooks/useFeature.ts
import { useSubscription } from '../context/SubscriptionContext';
import { FEATURES, isFeatureEnabled, getFeatureLimit } from '../config/features';

export const useFeature = (featureKey?: string) => {
  const { tier, isFeatureAvailable } = useSubscription();
  
  // If a specific feature key is provided, return info about that feature
  if (featureKey) {
    const feature = FEATURES[featureKey];
    return {
      isAvailable: isFeatureAvailable(featureKey),
      isLocked: !isFeatureAvailable(featureKey),
      tier: feature?.tier || 'free',
      feature,
      getLimit: () => getFeatureLimit(featureKey),
    };
  }
  
  // Otherwise return the check function
  return {
    isFeatureAvailable,
    tier,
    checkFeature: isFeatureAvailable,
  };
};

// Legacy hook for backwards compatibility
export const useFeatureCheck = () => {
  const { isFeatureAvailable, tier } = useSubscription();
  
  return {
    checkFeature: isFeatureAvailable,
    tier,
  };
};
