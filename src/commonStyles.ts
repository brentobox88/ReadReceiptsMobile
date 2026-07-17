// src/commonStyles.ts - Reusable styles for crypto-inspired UI
import { StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.dark.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positive: {
    color: colors.dark.primary,
  },
  negative: {
    color: colors.dark.secondary,
  },
  textPrimary: {
    color: colors.dark.text,
  },
  textSecondary: {
    color: colors.dark.textSecondary,
  },
  textMuted: {
    color: colors.dark.textMuted,
  },
});
