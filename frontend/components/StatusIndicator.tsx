import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring, withRepeat, withSequence, useSharedValue } from 'react-native-reanimated';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../constants/theme';

interface StatusIndicatorProps {
  status: 'safe' | 'danger' | 'warning' | 'info' | 'loading';
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  style?: ViewStyle;
  showIcon?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  title,
  subtitle,
  size = 'md',
  animated = true,
  style,
  showIcon = true,
}) => {
  const pulseAnim = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      pulseAnim.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 10 }),
          withSpring(0, { damping: 10 })
        ),
        -1,
        false
      );
    }
  }, [animated]);

  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          gradient: colors.gradientSuccess,
          icon: 'shield-checkmark',
          color: colors.success,
          shadow: shadows.successGlow,
        };
      case 'danger':
        return {
          gradient: colors.gradientError,
          icon: 'warning',
          color: colors.error,
          shadow: shadows.errorGlow,
        };
      case 'warning':
        return {
          gradient: colors.gradientWarning,
          icon: 'alert-circle',
          color: colors.warning,
          shadow: shadows.warningGlow,
        };
      case 'info':
        return {
          gradient: colors.gradientAccent,
          icon: 'information-circle',
          color: colors.info,
          shadow: shadows.primaryGlow,
        };
      case 'loading':
        return {
          gradient: colors.gradientPrimary,
          icon: 'refresh',
          color: colors.primary,
          shadow: shadows.primaryGlow,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { iconSize: 32, titleSize: fontSize.md, padding: spacing.md };
      case 'lg':
        return { iconSize: 72, titleSize: fontSize.xxl, padding: spacing.xl };
      case 'md':
      default:
        return { iconSize: 56, titleSize: fontSize.xl, padding: spacing.lg };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const pulseStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    return {
      transform: [{ scale: 1 + pulseAnim.value * 0.05 }],
      opacity: 0.9 + pulseAnim.value * 0.1,
    };
  });

  return (
    <LinearGradient
      colors={config.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { padding: sizeConfig.padding },
        config.shadow,
        style,
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <Animated.View style={[styles.iconContainer, pulseStyle]}>
            <View style={[styles.iconBg, { backgroundColor: colors.white + '20' }]}>
              <Ionicons
                name={config.icon as any}
                size={sizeConfig.iconSize}
                color={colors.white}
              />
            </View>
          </Animated.View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: sizeConfig.titleSize }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    borderRadius: borderRadius.full,
    padding: spacing.md,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    opacity: 0.9,
  },
});
