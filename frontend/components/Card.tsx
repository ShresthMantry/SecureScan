import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient' | 'elevated';
  style?: ViewStyle;
  gradientColors?: string[];
  elevated?: boolean;
  blur?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  style,
  gradientColors,
  elevated = false,
  blur = false,
}) => {
  const renderCard = () => {
    switch (variant) {
      case 'gradient':
        return (
          <LinearGradient
            colors={gradientColors || colors.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              elevated && shadows.lg,
              style,
            ]}
          >
            {children}
          </LinearGradient>
        );
      
      case 'solid':
        return (
          <View
            style={[
              styles.card,
              styles.solidCard,
              elevated && shadows.lg,
              style,
            ]}
          >
            {children}
          </View>
        );
      
      case 'elevated':
        return (
          <View
            style={[
              styles.card,
              styles.elevatedCard,
              shadows.xl,
              style,
            ]}
          >
            {children}
          </View>
        );
      
      case 'glass':
      default:
        if (blur) {
          return (
            <BlurView
              intensity={20}
              tint="dark"
              style={[
                styles.card,
                styles.glassCard,
                elevated && shadows.md,
                style,
              ]}
            >
              {children}
            </BlurView>
          );
        }
        return (
          <View
            style={[
              styles.card,
              styles.glassCard,
              elevated && shadows.md,
              style,
            ]}
          >
            {children}
          </View>
        );
    }
  };

  return renderCard();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  glassCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solidCard: {
    backgroundColor: colors.backgroundCard,
  },
  elevatedCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});
