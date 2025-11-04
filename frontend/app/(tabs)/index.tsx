import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

export default function HomeScreen() {
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const scale1 = useSharedValue(0.9);
  const scale2 = useSharedValue(0.9);
  const scale3 = useSharedValue(0.9);
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    // Fade in animation
    fadeAnim.value = withTiming(1, { duration: 800 });
    
    // Stagger card entrance
    scale1.value = withSpring(1, { damping: 15 });
    setTimeout(() => {
      scale2.value = withSpring(1, { damping: 15 });
    }, 100);
    setTimeout(() => {
      scale3.value = withSpring(1, { damping: 15 });
    }, 200);

    // Continuous pulse animation for accent elements
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const card1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
  }));

  const card3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.5, 1], Extrapolate.CLAMP),
    transform: [
      {
        scale: interpolate(pulseAnim.value, [0, 1], [1, 1.05], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors.gradientBackground}
          style={StyleSheet.absoluteFillObject}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <Animated.View style={[styles.content, fadeStyle]}>
          {/* Header with glow effect */}
          <Animated.View style={[styles.header, pulseStyle]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.titleGradient}
            >
              <Text style={styles.title}>SecureScan</Text>
            </LinearGradient>
            <Text style={styles.subtitle}>AI-Powered Fraud Detection</Text>
          </Animated.View>

          {/* Premium Feature Cards */}
          <View style={styles.cardsContainer}>
          {/* Link Checker Card */}
          <Animated.View style={card1Style}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/link-checker')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.primaryCard]}
              >
                <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.iconGlow} />
                    <Ionicons name="shield-checkmark" size={48} color={colors.white} />
                  </View>
                  <Text style={styles.cardTitle}>Link Scanner</Text>
                  <Text style={styles.cardDescription}>
                    Analyze URLs instantly with AI-powered detection
                  </Text>
                  <View style={styles.cardFooter}>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </View>
                </BlurView>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* QR Scanner Card */}
          <Animated.View style={card2Style}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/qr-scanner')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.secondaryCard]}
              >
                <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.iconGlow} />
                    <Ionicons name="qr-code" size={48} color={colors.white} />
                  </View>
                  <Text style={styles.cardTitle}>QR Scanner</Text>
                  <Text style={styles.cardDescription}>
                    Scan and verify QR codes for hidden threats
                  </Text>
                  <View style={styles.cardFooter}>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </View>
                </BlurView>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Community Card */}
          <Animated.View style={card3Style}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/community')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.tertiaryCard]}
              >
                <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.iconGlow} />
                    <Ionicons name="people" size={48} color={colors.white} />
                  </View>
                  <Text style={styles.cardTitle}>Community</Text>
                  <Text style={styles.cardDescription}>
                    Share findings and stay updated with threats
                  </Text>
                  <View style={styles.cardFooter}>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </View>
                </BlurView>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <BlurView intensity={80} tint="dark" style={styles.footerBlur}>
            <Ionicons name="shield-outline" size={20} color={colors.accent} />
            <Text style={styles.footerText}>Protected by Advanced AI</Text>
          </BlurView>
        </View>
      </Animated.View>
    </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  content: {
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  titleGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.heavy,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  cardBlur: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  primaryCard: {
    minHeight: 180,
  },
  secondaryCard: {
    minHeight: 160,
  },
  tertiaryCard: {
    minHeight: 160,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    opacity: 0.2,
    transform: [{ scale: 1.3 }],
  },
  cardTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
