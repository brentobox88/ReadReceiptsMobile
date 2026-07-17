// src/components/CryptoReceiptCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { colors, borderRadius, spacing } from '../theme';

const { width } = Dimensions.get('window');

interface ReceiptItem {
  id: string;
  merchant_name: string;
  merchant_address?: string;
  transaction_date: string;
  total_amount: number;
  currency: string;
  confidence_score: number;
}

interface CryptoReceiptCardProps {
  receipt: ReceiptItem;
  onPress?: () => void;
  index?: number;
}

export const CryptoReceiptCard: React.FC<CryptoReceiptCardProps> = ({
  receipt,
  onPress,
  index = 0,
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return colors.dark.primary;
    if (score >= 0.6) return '#ff9f43';
    return colors.dark.secondary;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown Merchant') return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={styles.card} elevated>
        <LinearGradient
          colors={[
            'rgba(26, 26, 46, 0.9)',
            'rgba(10, 10, 10, 0.9)',
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            {/* Left: Merchant Info */}
            <View style={styles.leftSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials(receipt.merchant_name)}</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName} numberOfLines={1}>
                  {receipt.merchant_name || 'Unknown Merchant'}
                </Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={12} color={colors.dark.textSecondary} />
                  <Text style={styles.dateText}>{formatDate(receipt.transaction_date)}</Text>
                </View>
              </View>
            </View>

            {/* Right: Amount */}
            <View style={styles.rightSection}>
              <Text style={styles.amount}>
                {receipt.currency || '$'}{receipt.total_amount.toFixed(2)}
              </Text>
              <View style={styles.confidenceContainer}>
                <View
                  style={[
                    styles.confidenceDot,
                    { backgroundColor: getConfidenceColor(receipt.confidence_score) },
                  ]}
                />
                <Text style={styles.confidenceText}>
                  {Math.round((receipt.confidence_score || 0) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: 0,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.primary,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 2,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    fontSize: 11,
    color: colors.dark.textSecondary,
  },
});

export default CryptoReceiptCard;
