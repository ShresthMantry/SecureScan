import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
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
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { StatusIndicator } from '../../components/StatusIndicator';
import { detectionService, DetectionResult } from '../../utils/detectionService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

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

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + pulseAnim.value * 0.4,
    transform: [{ scale: 1 + pulseAnim.value * 0.02 }],
  }));

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload QR codes');
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        await handleScanQR(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const saveScanToHistory = async (scanResult: DetectionResult) => {
    try {
      const historyStr = await AsyncStorage.getItem('scanHistory');
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      const scanEntry = {
        type: 'QR',
        result: scanResult.prediction,
        threatType: scanResult.threat_type || scanResult.qr_type,
        confidence: scanResult.confidence,
        timestamp: new Date().toISOString(),
        data: scanResult.qr_data || scanResult.url,
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

  const handleScanQR = async (uri: string) => {
    setLoading(true);
    setResult(null);

    try {
      const detectionResult = await detectionService.detectQR(uri);
      setResult(detectionResult);
      
      // Save to history
      await saveScanToHistory(detectionResult);
    } catch (error: any) {
      Alert.alert(
        'Detection Failed',
        error.response?.data?.error || 'Failed to analyze the QR code'
      );
      setImageUri(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={fadeStyle}>
            {/* Premium Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconContainer}
              >
                <Ionicons name="qr-code-outline" size={40} color={colors.white} />
              </LinearGradient>
              <Text style={styles.title}>QR Code Scanner</Text>
              <Text style={styles.subtitle}>
                Advanced fraud detection powered by AI
              </Text>
            </View>

            {/* Upload Area */}
            {!imageUri && !loading && (
              <Animated.View style={[styles.uploadContainer, pulseStyle]}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} tint="dark" style={styles.uploadBlur}>
                    <LinearGradient
                      colors={[colors.primary + '20', colors.primary + '10']}
                      style={styles.uploadGradient}
                    >
                      <View style={styles.uploadIconContainer}>
                        <LinearGradient
                          colors={colors.gradientPrimary}
                          style={styles.uploadIconBg}
                        >
                          <Ionicons name="cloud-upload-outline" size={48} color={colors.white} />
                        </LinearGradient>
                      </View>
                      
                      <Text style={styles.uploadTitle}>Upload QR Code</Text>
                      <Text style={styles.uploadText}>
                        Tap to select an image from your gallery
                      </Text>
                      
                      <View style={styles.uploadFeatures}>
                        <View style={styles.featureItem}>
                          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                          <Text style={styles.featureText}>AI-Powered Detection</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="flash" size={16} color={colors.warning} />
                          <Text style={styles.featureText}>Instant Analysis</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Loading State */}
            {loading && (
              <Card variant="elevated" style={styles.loadingCard}>
                <View style={styles.loadingContent}>
                  <View style={styles.scannerFrame}>
                    <LinearGradient colors={colors.gradientPrimary} style={styles.scannerCorner} />
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                  
                  <Text style={styles.loadingTitle}>Analyzing QR Code</Text>
                  <Text style={styles.loadingSubtext}>Our AI is checking for threats...</Text>
                  
                  <View style={styles.loadingSteps}>
                    <View style={styles.stepItem}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      <Text style={styles.stepText}>Image processed</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.stepText}>Running ML analysis</Text>
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* Results */}
            {result && (
              <View style={styles.resultContainer}>
                <StatusIndicator
                  status={result.is_fraudulent ? 'danger' : 'safe'}
                  title={result.is_fraudulent ? 'Threat Detected!' : 'QR Code is Safe'}
                  subtitle={
                    result.is_fraudulent
                      ? `${result.threat_type || 'Malicious'} threat identified`
                      : 'No threats found in this QR code'
                  }
                  size="lg"
                  animated={true}
                />

                {/* Badges */}
                {result.qr_type && (
                  <View style={styles.badgesContainer}>
                    <Badge
                      label={
                        result.qr_type === 'payment'
                          ? '💳 Payment QR'
                          : result.qr_type === 'url'
                          ? '🔗 URL QR'
                          : 'Other Type'
                      }
                      variant={result.qr_type === 'payment' ? 'info' : 'primary'}
                      size="md"
                      gradient={true}
                    />
                    {result.threat_type && (
                      <Badge
                        label={result.threat_type}
                        variant={result.is_fraudulent ? 'error' : 'success'}
                        size="md"
                      />
                    )}
                  </View>
                )}

                {/* Details Card */}
                <Card variant="elevated" style={styles.detailsCard}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  
                  {/* Payment Info */}
                  {result.qr_type === 'payment' && result.payment_info && (
                    <View style={styles.infoSection}>
                      {result.payment_info.payee_name && (
                        <View style={styles.infoRow}>
                          <Ionicons name="person-outline" size={20} color={colors.primary} />
                          <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Payee Name</Text>
                            <Text style={styles.infoValue}>{result.payment_info.payee_name}</Text>
                          </View>
                        </View>
                      )}
                      {result.payment_info.payee_address && (
                        <View style={styles.infoRow}>
                          <Ionicons name="at-outline" size={20} color={colors.primary} />
                          <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>UPI ID</Text>
                            <Text style={styles.infoValue} numberOfLines={2}>
                              {result.payment_info.payee_address}
                            </Text>
                          </View>
                        </View>
                      )}
                      {result.payment_info.amount && (
                        <View style={styles.infoRow}>
                          <Ionicons name="cash-outline" size={20} color={colors.primary} />
                          <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Amount</Text>
                            <Text style={[styles.infoValue, styles.amountText]}>
                              ₹{result.payment_info.amount}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* URL Info */}
                  {result.qr_type === 'url' && (result.url || result.qr_data) && (
                    <View style={styles.infoSection}>
                      <View style={styles.infoRow}>
                        <Ionicons name="link-outline" size={20} color={colors.primary} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Extracted URL</Text>
                          <Text style={styles.infoValue} numberOfLines={3}>
                            {result.url || result.qr_data}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Confidence</Text>
                      <Text style={styles.statValue}>
                        {(result.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                    {result.risk_score !== undefined && (
                      <View style={styles.statItem}>
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
                      <Text style={styles.warningTitle}>Warning Flags</Text>
                    </View>
                    {result.warning_flags.map((flag: string, index: number) => (
                      <View key={index} style={styles.warningItem}>
                        <View style={styles.warningDot} />
                        <Text style={styles.warningText}>{flag}</Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Action Advice */}
                {result.is_fraudulent && (
                  <Card
                    variant="gradient"
                    gradientColors={colors.gradientError}
                    style={styles.adviceCard}
                  >
                    <Ionicons name="warning" size={32} color={colors.white} />
                    <Text style={styles.adviceTitle}>⚠️ Security Alert</Text>
                    <Text style={styles.adviceText}>
                      {result.qr_type === 'payment'
                        ? 'Fraudulent Payment QR! This appears to be a scam. Do not make any payment through this QR code.'
                        : result.threat_type === 'Phishing'
                        ? 'Phishing Attack Detected! This QR code leads to a site attempting to steal your personal information.'
                        : result.threat_type === 'Malware'
                        ? 'Malware Detected! This QR code may download harmful software to your device.'
                        : 'This QR code has been detected as potentially malicious.'}
                    </Text>
                  </Card>
                )}

                {/* Reset Button */}
                <Button
                  title="Scan Another QR Code"
                  onPress={handleReset}
                  variant="outline"
                  style={styles.resetButton}
                />
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
  uploadContainer: {
    marginVertical: spacing.xl,
  },
  uploadButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  uploadBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  uploadGradient: {
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 280,
    justifyContent: 'center',
  },
  uploadIconContainer: {
    marginBottom: spacing.md,
  },
  uploadIconBg: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryGlow,
  },
  uploadTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  uploadText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  uploadFeatures: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  loadingCard: {
    marginVertical: spacing.xl,
  },
  loadingContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  scannerFrame: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg,
    opacity: 0.3,
  },
  loadingTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingSteps: {
    gap: spacing.sm,
    width: '100%',
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
  resultContainer: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailsCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoSection: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    gap: spacing.xs,
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
  amountText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
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
    color: colors.text,
    fontWeight: fontWeight.bold,
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
    ...shadows.errorGlow,
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
  resetButton: {
    marginTop: spacing.sm,
  },
});
