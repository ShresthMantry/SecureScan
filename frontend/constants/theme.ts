// Premium Color Palette - Modern & Production Ready
export const colors = {
  // Primary gradient colors - Vibrant Blue/Purple
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Accent colors - Cyan/Teal
  accent: '#06B6D4', // Cyan
  accentLight: '#22D3EE',
  accentDark: '#0891B2',
  
  // Secondary - Purple/Pink
  secondary: '#A855F7', // Purple
  secondaryLight: '#C084FC',
  secondaryDark: '#9333EA',
  
  // Background layers - Deep Dark
  background: '#0F172A', // Slate 900
  backgroundLight: '#1E293B', // Slate 800
  backgroundCard: 'rgba(30, 41, 59, 0.6)', // Slate 800 with opacity
  
  // Surface with glassmorphism
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceLight: 'rgba(255, 255, 255, 0.1)',
  surfaceCard: 'rgba(30, 41, 59, 0.8)',
  surfaceHover: 'rgba(255, 255, 255, 0.15)',
  
  // Text colors
  text: '#F8FAFC', // Slate 50
  textSecondary: 'rgba(248, 250, 252, 0.7)',
  textTertiary: 'rgba(248, 250, 252, 0.5)',
  textMuted: 'rgba(248, 250, 252, 0.4)',
  
  // Status colors with modern palette
  success: '#10B981', // Emerald 500
  successLight: '#34D399',
  successDark: '#059669',
  error: '#EF4444', // Red 500
  errorLight: '#F87171',
  errorDark: '#DC2626',
  warning: '#F59E0B', // Amber 500
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  info: '#06B6D4', // Cyan 500
  infoLight: '#22D3EE',
  infoDark: '#0891B2',
  
  // Utility
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderDark: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(15, 23, 42, 0.95)',
  overlayLight: 'rgba(15, 23, 42, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradients (for LinearGradient)
  gradientPrimary: ['#6366F1', '#4F46E5', '#4338CA'], // Indigo gradient
  gradientAccent: ['#06B6D4', '#0891B2', '#0E7490'], // Cyan gradient
  gradientSecondary: ['#A855F7', '#9333EA', '#7E22CE'], // Purple gradient
  gradientBackground: ['#0F172A', '#1E293B', '#334155'], // Dark gradient
  gradientCard: ['rgba(30, 41, 59, 0.9)', 'rgba(30, 41, 59, 0.5)'],
  gradientSuccess: ['#10B981', '#059669', '#047857'], // Emerald gradient
  gradientError: ['#EF4444', '#DC2626', '#B91C1C'], // Red gradient
  gradientWarning: ['#F59E0B', '#D97706', '#B45309'], // Amber gradient
  gradientGlass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// Shadow presets for depth - Enhanced
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
  // Colored shadows for emphasis
  primaryGlow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  successGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  errorGlow: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  warningGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Animation timing & easing
export const animation = {
  fastest: 150,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
  // Spring configs
  spring: {
    damping: 15,
    stiffness: 150,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
  },
  springGentle: {
    damping: 20,
    stiffness: 120,
  },
};

// Glassmorphism effect
export const glass = {
  background: 'rgba(255, 255, 255, 0.05)',
  backgroundStrong: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  blur: 20,
  blurStrong: 30,
};
