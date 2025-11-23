import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  gradient = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.success, gradient: colors.gradientSuccess };
      case 'error':
        return { bg: colors.error, gradient: colors.gradientError };
      case 'warning':
        return { bg: colors.warning, gradient: colors.gradientWarning };
      case 'info':
        return { bg: colors.info, gradient: colors.gradientAccent };
      case 'secondary':
        return { bg: colors.secondary, gradient: colors.gradientSecondary };
      case 'primary':
      default:
        return { bg: colors.primary, gradient: colors.gradientPrimary };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: spacing.xs, fontSize: fontSize.xs };
      case 'lg':
        return { padding: spacing.md, fontSize: fontSize.md };
      case 'md':
      default:
        return { padding: spacing.sm, fontSize: fontSize.sm };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const content = (
    <View style={styles.content}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { fontSize: sizeStyles.fontSize },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={variantColors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.badge,
          { padding: sizeStyles.padding },
          style,
        ]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantColors.bg + '30', padding: sizeStyles.padding },
        { borderColor: variantColors.bg + '60', borderWidth: 1 },
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
