// src/theme.ts - Dark Theme for ReadReceipts (Crypto Style)
export const colors = {
  dark: {
    background: '#0a0a0a',
    card: '#1a1a2e',
    cardBorder: 'rgba(255,255,255,0.06)',
    primary: '#00d4aa',
    primaryDark: '#00b894',
    secondary: '#ff6b6b',
    warning: '#ff9f43',
    text: '#ffffff',
    textSecondary: '#888888',
    textMuted: '#555555',
    buttonBackground: 'rgba(0, 212, 170, 0.15)',
    gradientStart: '#1a1a2e',
    gradientEnd: '#0a0a0a',
    glassBackground: 'rgba(26, 26, 46, 0.6)',
    glassBorder: 'rgba(255,255,255,0.08)',
    shadow: 'rgba(0, 212, 170, 0.08)',
  }
};

export const typography = {
  greeting: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
  balance: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  changePositive: {
    fontSize: 14,
    color: '#00d4aa',
    fontWeight: '600',
  },
  changeNegative: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  largeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};
