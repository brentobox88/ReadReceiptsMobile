// src/components/CryptoHeader.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface CryptoHeaderProps {
  userName?: string;
  receiptCount?: number;
  totalSpent?: number;
  onProfilePress?: () => void;
}

export const CryptoHeader: React.FC<CryptoHeaderProps> = ({
  userName = 'User',
  receiptCount = 0,
  totalSpent = 0,
  onProfilePress,
}) => {
  return (
    <LinearGradient
      colors={['#1a1a2e', '#0a0a0a']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.balance}>
            
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Receipts</Text>
              <Text style={styles.statValue}>{receiptCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Confidence</Text>
              <Text style={styles.statValue}>--%</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
        >
          <LinearGradient
            colors={['rgba(0, 212, 170, 0.2)', 'rgba(0, 212, 170, 0.05)']}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={28} color={colors.dark.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 4,
  },
  balance: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
});

export default CryptoHeader;
