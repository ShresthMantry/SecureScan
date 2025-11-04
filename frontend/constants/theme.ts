// Premium Color Palette with Gradients
export const colors = {
  // Primary gradient colors
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E74C3C',
  
  // Accent colors
  accent: '#4ECDC4',
  accentLight: '#6EE7E0',
  accentDark: '#3AB0A8',
  
  // Secondary
  secondary: '#FFD93D',
  secondaryLight: '#FFE66D',
  secondaryDark: '#F4C430',
  
  // Background layers
  background: '#0A0E27',
  backgroundLight: '#121630',
  backgroundCard: 'rgba(30, 39, 73, 0.6)',
  
  // Surface with glassmorphism
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceLight: 'rgba(255, 255, 255, 0.1)',
  surfaceCard: 'rgba(30, 39, 73, 0.8)',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  
  // Status colors with gradients
  success: '#6BCF7F',
  successLight: '#8CDFAB',
  error: '#FF6B6B',
  errorLight: '#FF8E8E',
  warning: '#FFD93D',
  warningLight: '#FFE66D',
  info: '#4ECDC4',
  infoLight: '#6EE7E0',
  
  // Utility
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  overlay: 'rgba(10, 14, 39, 0.9)',
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradients (for LinearGradient)
  gradientPrimary: ['#FF6B6B', '#E74C3C'],
  gradientAccent: ['#4ECDC4', '#3AB0A8'],
  gradientBackground: ['#0A0E27', '#1E2749'],
  gradientCard: ['rgba(30, 39, 73, 0.8)', 'rgba(30, 39, 73, 0.4)'],
  gradientSuccess: ['#6BCF7F', '#4CAF50'],
  gradientError: ['#FF6B6B', '#E74C3C'],
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

// Shadow presets for depth
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  colored: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation timing
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Glassmorphism effect
export const glass = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
  blur: 20,
};
