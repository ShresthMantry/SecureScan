import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { StatusIndicator } from '../../components/StatusIndicator';
import { detectionService, DetectionResult } from '../../utils/detectionService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function LinkCheckerScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: animation.slow });
    scaleAnim.value = withSpring(1, animation.spring);

    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    setIsValidUrl(urlPattern.test(url.trim()));
  }, [url]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + pulseAnim.value * 0.3,
  }));

  const saveScanToHistory = async (scanResult: DetectionResult) => {
    try {
      const historyStr = await AsyncStorage.getItem('scanHistory');
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      const scanEntry = {
        type: 'URL',
        result: scanResult.prediction,
        threatType: scanResult.threat_type,
        confidence: scanResult.confidence,
        timestamp: new Date().toISOString(),
        data: scanResult.url,
      };
      
      history.unshift(scanEntry); // Add to beginning
      
      // Keep only last 100 scans
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem('scanHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save scan history:', error);
    }
  };

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
      
      // Save to history
      await saveScanToHistory(detectionResult);
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
            {/* Premium Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={colors.gradientAccent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconContainer}
              >
                <Ionicons name="link-outline" size={40} color={colors.white} />
              </LinearGradient>
              <Text style={styles.title}>Link Checker</Text>
              <Text style={styles.subtitle}>
                AI-powered URL fraud detection in real-time
              </Text>
            </View>

            {/* Modern Input Card */}
            <Card variant="elevated" style={styles.inputCard}>
              <Text style={styles.inputLabel}>Enter URL to Analyze</Text>
              
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={[colors.primary + '10', colors.primary + '05']}
                  style={styles.inputWrapper}
                >
                  <Ionicons
                    name={isValidUrl ? 'checkmark-circle' : 'globe-outline'}
                    size={24}
                    color={isValidUrl ? colors.success : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://example.com"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    keyboardType="url"
                    editable={!loading}
                    autoCorrect={false}
                  />
                  {url.length > 0 && (
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.textSecondary}
                      onPress={() => setUrl('')}
                      style={styles.clearIcon}
                    />
                  )}
                </LinearGradient>
              </View>

              {/* Real-time validation feedback */}
              {url.length > 0 && (
                <Animated.View style={[styles.validationFeedback, pulseStyle]}>
                  {isValidUrl ? (
                    <View style={styles.validFeedback}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.validText}>Valid URL format</Text>
                    </View>
                  ) : (
                    <View style={styles.invalidFeedback}>
                      <Ionicons name="alert-circle" size={16} color={colors.warning} />
                      <Text style={styles.invalidText}>Invalid URL format</Text>
                    </View>
                  )}
                </Animated.View>
              )}

              {/* Action Button */}
              {!result ? (
                <Button
                  title={loading ? 'Analyzing...' : 'Check Link'}
                  onPress={handleCheckLink}
                  disabled={loading || !isValidUrl}
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

              {/* Quick Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                <Text style={styles.infoText}>
                  We analyze URLs for phishing, malware, and other threats
                </Text>
              </View>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card variant="elevated" style={styles.loadingCard}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingTitle}>Analyzing URL</Text>
                  <Text style={styles.loadingSubtext}>Running ML analysis...</Text>
                  
                  <View style={styles.loadingSteps}>
                    <View style={styles.stepItem}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      <Text style={styles.stepText}>URL parsed</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.stepText}>Checking heuristics</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Ionicons name="ellipse-outline" size={18} color={colors.textTertiary} />
                      <Text style={[styles.stepText, styles.stepTextInactive]}>
                        ML model prediction
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* Results */}
            {result && (
              <View style={styles.resultContainer}>
                {/* Status Indicator */}
                <StatusIndicator
                  status={result.is_fraudulent ? 'danger' : 'safe'}
                  title={result.is_fraudulent ? 'Threat Detected!' : 'Link is Safe'}
                  subtitle={
                    result.is_fraudulent
                      ? `${result.threat_type || 'Malicious'} link identified`
                      : 'No threats found in this URL'
                  }
                  size="lg"
                  animated={true}
                />

                {/* Threat Type Badge */}
                {result.threat_type && (
                  <View style={styles.badgesContainer}>
                    <Badge
                      label={result.threat_type}
                      variant={result.threat_type === 'Benign' ? 'success' : 'error'}
                      size="md"
                      gradient={true}
                    />
                    <Badge
                      label={`${(result.confidence * 100).toFixed(0)}% Confidence`}
                      variant="info"
                      size="md"
                    />
                  </View>
                )}

                {/* URL Display Card */}
                <Card variant="elevated" style={styles.urlCard}>
                  <Text style={styles.sectionTitle}>Analyzed URL</Text>
                  <View style={styles.urlDisplay}>
                    <Ionicons name="link-outline" size={20} color={colors.primary} />
                    <Text style={styles.urlText} numberOfLines={3}>
                      {result.url}
                    </Text>
                  </View>
                </Card>

                {/* Stats Card */}
                <Card variant="elevated" style={styles.statsCard}>
                  <Text style={styles.sectionTitle}>Analysis Results</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Prediction</Text>
                      <Text
                        style={[
                          styles.statValue,
                          result.is_fraudulent ? styles.dangerText : styles.successText,
                        ]}
                      >
                        {result.prediction.toUpperCase()}
                      </Text>
                    </View>
                    {result.risk_score !== undefined && (
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Risk Score</Text>
                        <Text
                          style={[
                            styles.statValue,
                            result.risk_score > 50 ? styles.dangerText : styles.successText,
                          ]}
                        >
                          {result.risk_score}/100
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>

                {/* Warning Flags */}
                {result.warning_flags && result.warning_flags.length > 0 && (
                  <Card variant="solid" style={styles.warningCard}>
                    <View style={styles.warningHeader}>
                      <Ionicons name="alert-circle" size={24} color={colors.error} />
                      <Text style={styles.warningTitle}>Detected Issues</Text>
                    </View>
                    {result.warning_flags.map((flag: string, index: number) => (
                      <View key={index} style={styles.warningItem}>
                        <View style={styles.warningDot} />
                        <Text style={styles.warningText}>{flag}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Security Advice */}
                {result.is_fraudulent && (
                  <Card
                    variant="gradient"
                    gradientColors={colors.gradientError}
                    style={styles.adviceCard}
                  >
                    <Ionicons name="shield-checkmark-outline" size={32} color={colors.white} />
                    <Text style={styles.adviceTitle}>Security Recommendation</Text>
                    <Text style={styles.adviceText}>
                      {result.threat_type === 'Phishing' &&
                        'Do not enter any credentials or personal information. This link attempts to steal your data.'}
                      {result.threat_type === 'Malware' &&
                        'Do not visit this URL. It may download harmful software to your device.'}
                      {result.threat_type === 'Defacement' &&
                        'This website has been compromised. Avoid visiting this URL.'}
                      {(!result.threat_type || result.threat_type === 'Suspicious') &&
                        'This link has suspicious characteristics. Avoid visiting or sharing it.'}
                    </Text>
                  </Card>
                )}

                {!result.is_fraudulent && (
                  <Card
                    variant="gradient"
                    gradientColors={colors.gradientSuccess}
                    style={styles.adviceCard}
                  >
                    <Ionicons name="shield-checkmark" size={32} color={colors.white} />
                    <Text style={styles.adviceTitle}>✓ Secure Link</Text>
                    <Text style={styles.adviceText}>
                      This URL appears safe based on our analysis. No threats detected.
                    </Text>
                  </Card>
                )}
              </View>
            )}
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryGlow,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  inputCard: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    padding: spacing.md,
    paddingLeft: spacing.sm,
    minHeight: 52,
  },
  clearIcon: {
    marginRight: spacing.md,
  },
  validationFeedback: {
    marginBottom: spacing.md,
  },
  validFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.sm,
  },
  validText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  invalidFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.sm,
  },
  invalidText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: fontWeight.medium,
  },
  button: {
    marginTop: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.info,
    lineHeight: 18,
  },
  loadingCard: {
    marginBottom: spacing.lg,
  },
  loadingContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  loadingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loadingSteps: {
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  stepText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  stepTextInactive: {
    opacity: 0.5,
  },
  resultContainer: {
    gap: spacing.lg,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  urlCard: {
    gap: spacing.md,
  },
  urlDisplay: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsCard: {
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: fontWeight.semibold,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  successText: {
    color: colors.success,
  },
  dangerText: {
    color: colors.error,
  },
  warningCard: {
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  warningItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginTop: 6,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  adviceCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  adviceTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  adviceText: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },
});
