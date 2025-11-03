import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SecureScan</Text>
        <Text style={styles.subtitle}>Protect yourself from fraud</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.primaryCard]}
          onPress={() => router.push('/(tabs)/link-checker')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="link" size={40} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>Check Link</Text>
          <Text style={styles.cardDescription}>
            Verify if a URL is safe or malicious
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.secondaryCard]}
          onPress={() => router.push('/(tabs)/qr-scanner')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={40} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>Scan QR Code</Text>
          <Text style={styles.cardDescription}>
            Scan or upload a QR code to check for fraud
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.tertiaryCard]}
          onPress={() => router.push('/(tabs)/community')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={40} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>Community</Text>
          <Text style={styles.cardDescription}>
            Share findings and discuss with others
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Stay safe online with AI-powered fraud detection
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  cardsContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryCard: {
    backgroundColor: colors.primary,
  },
  secondaryCard: {
    backgroundColor: colors.surface,
  },
  tertiaryCard: {
    backgroundColor: colors.cardBackground,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
