// src/config/features.ts
export interface Feature {
  tier: 'free' | 'pro' | 'business';
  enabled: boolean;
  value?: number; // For limits like receipt count
  description: string;
}

export interface FeatureMap {
  [key: string]: Feature;
}

export const FEATURES: FeatureMap = {
  // === FREE TIER ===
  basicScanning: {
    tier: 'free',
    enabled: true,
    description: 'Scan receipts with Document AI'
  },
  receiptLimit: {
    tier: 'free',
    enabled: true,
    value: 50, // 50 receipts per month
    description: 'Monthly receipt limit'
  },
  csvExport: {
    tier: 'free',
    enabled: true,
    description: 'Export receipts as CSV'
  },
  viewReceipts: {
    tier: 'free',
    enabled: true,
    description: 'View all scanned receipts'
  },
  dashboard: {
    tier: 'free',
    enabled: true,
    description: 'Dashboard with spending overview'
  },
  profile: {
    tier: 'free',
    enabled: true,
    description: 'User profile and settings'
  },

  // === PRO TIER (Coming Soon) ===
  receiptNotes: {
    tier: 'pro',
    enabled: true,
    description: 'Add custom notes to receipts'
  },
  unlimitedScanning: {
    tier: 'pro',
    enabled: false,
    description: 'Unlimited receipt scanning'
  },
  categories: {
    tier: 'pro',
    enabled: false,
    description: 'Categorize receipts (Food, Transport, etc.)'
  },
  jsonExport: {
    tier: 'pro',
    enabled: false,
    description: 'Export receipts as JSON'
  },
  advancedSearch: {
    tier: 'pro',
    enabled: false,
    description: 'Advanced search with filters'
  },
  receiptNotes: {
    tier: 'pro',
    enabled: true,
    description: 'Add notes to receipts'
  },
  editReceipts: {
    tier: 'pro',
    enabled: false,
    description: 'Edit receipt data'
  },
  receiptImages: {
    tier: 'pro',
    enabled: false,
    description: 'Store receipt images'
  },

  // === BUSINESS TIER (Coming Soon) ===
  multiUser: {
    tier: 'business',
    enabled: false,
    description: 'Multi-user access and team management'
  },
  cloudBackup: {
    tier: 'business',
    enabled: false,
    description: 'Automatic cloud backup'
  },
  apiAccess: {
    tier: 'business',
    enabled: false,
    description: 'API access for integrations'
  },
  prioritySupport: {
    tier: 'business',
    enabled: false,
    description: 'Priority email support'
  },
};

export const TIERS = {
  free: {
    name: 'Free',
    price: '',
    description: 'Basic receipt scanning for individuals'
  },
  pro: {
    name: 'Pro',
    price: '.99/mo',
    description: 'Advanced features for power users'
  },
  business: {
    name: 'Business',
    price: '.99/mo',
    description: 'Team features for businesses'
  },
};

export const getDefaultTier = (): 'free' | 'pro' | 'business' => {
  return 'free';
};

export const isFeatureEnabled = (featureKey: string, userTier?: string): boolean => {
  const feature = FEATURES[featureKey];
  if (!feature) return false;
  
  const tier = userTier || getDefaultTier();
  return feature.tier === tier && feature.enabled;
};

export const getFeatureLimit = (featureKey: string): number | null => {
  const feature = FEATURES[featureKey];
  return feature?.value || null;
};




