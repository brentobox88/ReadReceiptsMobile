// src/components/GlassCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { colors, borderRadius, spacing } from '../theme';

const { width } = Dimensions.get('window');

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  onPress?: () => void;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  gradient = false,
  onPress,
  elevated = true,
}) => {
  const CardContent = () => (
    <BlurView
      blurType="dark"
      blurAmount={20}
      reducedTransparencyFallbackColor="rgba(26, 26, 46, 0.8)"
      style={[styles.card, elevated && styles.elevated, style]}
    >
      {gradient ? (
        <LinearGradient
          colors={['rgba(0, 212, 170, 0.15)', 'rgba(26, 26, 46, 0.8)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      ) : (
        children
      )}
    </BlurView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export const GlassStatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
  style?: ViewStyle;
}> = ({ title, value, icon, change, positive = true, style }) => {
  return (
    <GlassCard style={[styles.statCard, style]} elevated>
      <View style={styles.statHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        {change && (
          <Text style={[styles.change, positive ? styles.positive : styles.negative]}>
            {change}
          </Text>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: 'rgba(0, 212, 170, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statCard: {
    padding: spacing.md,
    minWidth: (width - 48) / 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  positive: {
    color: colors.dark.primary,
  },
  negative: {
    color: colors.dark.secondary,
  },
});

export default GlassCard;
