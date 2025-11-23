import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Animation values
  const fadeAnim = useSharedValue(0);
  const stat1Scale = useSharedValue(0.8);
  const stat2Scale = useSharedValue(0.8);
  const stat3Scale = useSharedValue(0.8);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: animation.slow });
    stat1Scale.value = withDelay(100, withSpring(1, animation.spring));
    stat2Scale.value = withDelay(200, withSpring(1, animation.spring));
    stat3Scale.value = withDelay(300, withSpring(1, animation.spring));
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const stat1Style = useAnimatedStyle(() => ({
    transform: [{ scale: stat1Scale.value }],
  }));

  const stat2Style = useAnimatedStyle(() => ({
    transform: [{ scale: stat2Scale.value }],
  }));

  const stat3Style = useAnimatedStyle(() => ({
    transform: [{ scale: stat3Scale.value }],
  }));

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={colors.gradientBackground}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={colors.gradientPrimary}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="person-outline" size={56} color={colors.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Not Logged In</Text>
            <Text style={styles.emptyText}>
              Please login to view your profile and access all features
            </Text>
            <Button
              title="Login to Continue"
              onPress={() => router.push('/login')}
              style={styles.emptyButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMemberDays = () => {
    const joinDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientBackground}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={fadeStyle}>
            {/* Profile Header with Avatar */}
            <Card variant="gradient" gradientColors={colors.gradientPrimary} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <LinearGradient
                  colors={[colors.white + '30', colors.white + '10']}
                  style={styles.avatarLarge}
                >
                  <Text style={styles.avatarText}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <Badge
                  label={`Member for ${getMemberDays()} days`}
                  variant="info"
                  size="sm"
                  style={styles.memberBadge}
                />
              </View>
            </Card>

            {/* Stats Dashboard */}
            <View style={styles.statsContainer}>
              <Animated.View style={[styles.statCardWrapper, stat1Style]}>
                <Card variant="elevated" style={styles.statCard}>
                  <LinearGradient
                    colors={colors.gradientSuccess}
                    style={styles.statIcon}
                  >
                    <Ionicons name="shield-checkmark" size={24} color={colors.white} />
                  </LinearGradient>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </Card>
              </Animated.View>

              <Animated.View style={[styles.statCardWrapper, stat2Style]}>
                <Card variant="elevated" style={styles.statCard}>
                  <LinearGradient
                    colors={colors.gradientSecondary}
                    style={styles.statIcon}
                  >
                    <Ionicons name="chatbubbles" size={24} color={colors.white} />
                  </LinearGradient>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </Card>
              </Animated.View>

              <Animated.View style={[styles.statCardWrapper, stat3Style]}>
                <Card variant="elevated" style={styles.statCard}>
                  <LinearGradient
                    colors={colors.gradientError}
                    style={styles.statIcon}
                  >
                    <Ionicons name="warning" size={24} color={colors.white} />
                  </LinearGradient>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Threats</Text>
                </Card>
              </Animated.View>
            </View>

            {/* Account Information */}
            <Animated.View entering={SlideInRight.delay(200).duration(500)}>
              <Card variant="elevated" style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <LinearGradient colors={colors.gradientPrimary} style={styles.infoIconBg}>
                      <Ionicons name="person-outline" size={20} color={colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>{user.username}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <LinearGradient colors={colors.gradientAccent} style={styles.infoIconBg}>
                      <Ionicons name="mail-outline" size={20} color={colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <LinearGradient colors={colors.gradientSecondary} style={styles.infoIconBg}>
                      <Ionicons name="calendar-outline" size={20} color={colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={SlideInRight.delay(300).duration(500)}>
              <Card variant="elevated" style={styles.actionsCard}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <Button
                  title="View My Posts"
                  onPress={() => router.push('/my-posts')}
                  variant="secondary"
                  style={styles.actionButton}
                />

                <Button
                  title="Logout"
                  onPress={handleLogout}
                  variant="danger"
                  style={styles.actionButton}
                />
              </Card>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>SecureScan v1.0.0</Text>
              <Text style={styles.footerSubtext}>
                Protecting you from online fraud with AI
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.lg,
    ...shadows.xl,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  username: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.9,
  },
  memberBadge: {
    marginTop: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: fontWeight.semibold,
  },
  infoCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: fontWeight.semibold,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionsCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
