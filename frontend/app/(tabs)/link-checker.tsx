import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { detectionService, DetectionResult } from '../../utils/detectionService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export default function LinkCheckerScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleCheckLink = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const detectionResult = await detectionService.detectLink(url);
      setResult(detectionResult);
    } catch (error: any) {
      Alert.alert(
        'Detection Failed',
        error.response?.data?.error || 'Failed to analyze the link'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="link" size={48} color={colors.primary} />
          <Text style={styles.title}>Link Checker</Text>
          <Text style={styles.subtitle}>
            Paste a URL to check if it's safe or malicious
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="URL to Check"
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com"
            autoCapitalize="none"
            keyboardType="url"
            editable={!loading}
          />

          {!result ? (
            <Button
              title={loading ? 'Analyzing...' : 'Check Link'}
              onPress={handleCheckLink}
              disabled={loading}
              style={styles.button}
            />
          ) : (
            <Button
              title="Check Another Link"
              onPress={handleReset}
              variant="outline"
              style={styles.button}
            />
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing URL...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.resultCard,
                result.is_fraudulent ? styles.dangerCard : styles.successCard,
              ]}
            >
              <View style={styles.resultHeader}>
                <Ionicons
                  name={result.is_fraudulent ? 'warning' : 'shield-checkmark'}
                  size={48}
                  color={result.is_fraudulent ? colors.error : colors.success}
                />
                <Text style={styles.resultTitle}>
                  {result.is_fraudulent ? '⚠️ Fraudulent' : '✅ Safe'}
                </Text>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>URL:</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {result.url}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prediction:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      styles.predictionText,
                      result.is_fraudulent ? styles.dangerText : styles.successText,
                    ]}
                  >
                    {result.prediction.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Confidence:</Text>
                  <Text style={styles.detailValue}>
                    {(result.confidence * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>

              {result.is_fraudulent && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={styles.warningText}>
                    This link has been detected as potentially malicious. Do not visit or share
                    this URL.
                  </Text>
                </View>
              )}

              {!result.is_fraudulent && (
                <View style={styles.safeBox}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.safeText}>
                    This link appears to be safe based on our analysis.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultContainer: {
    marginTop: spacing.md,
  },
  resultCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
  },
  successCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.success,
  },
  dangerCard: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.error,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  resultDetails: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  predictionText: {
    fontWeight: fontWeight.bold,
  },
  successText: {
    color: colors.success,
  },
  dangerText: {
    color: colors.error,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  safeBox: {
    flexDirection: 'row',
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  safeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.success,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});
