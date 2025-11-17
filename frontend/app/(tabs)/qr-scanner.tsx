import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { detectionService, DetectionResult } from '../../utils/detectionService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export default function QRScannerScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

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

  const handleScanQR = async (uri: string) => {
    setLoading(true);
    setResult(null);

    try {
      const detectionResult = await detectionService.detectQR(uri);
      setResult(detectionResult);
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="qr-code" size={48} color={colors.primary} />
          <Text style={styles.title}>QR Scanner</Text>
          <Text style={styles.subtitle}>
            Upload a QR code image to check if it's safe
          </Text>
        </View>

        {!imageUri && !loading && (
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
              <Ionicons name="cloud-upload-outline" size={64} color={colors.primary} />
              <Text style={styles.uploadText}>Upload QR Code</Text>
              <Text style={styles.uploadSubtext}>Tap to select an image</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scanning QR Code...</Text>
            <Text style={styles.loadingSubtext}>Extracting and analyzing URL</Text>
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
                  {result.is_fraudulent ? '⚠️ Fraudulent QR Code' : '✅ Safe QR Code'}
                </Text>
              </View>

              <View style={styles.resultDetails}>
                {result.qr_type && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>QR Type:</Text>
                    <Text style={styles.detailValue}>
                      {result.qr_type === 'payment' ? '💳 Payment QR' : result.qr_type === 'url' ? '🔗 URL QR' : 'Other'}
                    </Text>
                  </View>
                )}

                {result.qr_type === 'payment' && result.payment_info ? (
                  <>
                    {result.payment_info.payee_name && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payee Name:</Text>
                        <Text style={styles.detailValue}>
                          {result.payment_info.payee_name}
                        </Text>
                      </View>
                    )}
                    {result.payment_info.payee_address && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>UPI ID:</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                          {result.payment_info.payee_address}
                        </Text>
                      </View>
                    )}
                    {result.payment_info.amount && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Amount:</Text>
                        <Text style={[styles.detailValue, styles.predictionText]}>
                          ₹{result.payment_info.amount}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Extracted URL:</Text>
                    <Text style={styles.detailValue} numberOfLines={3}>
                      {result.url || result.qr_data}
                    </Text>
                  </View>
                )}

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

                {result.threat_type && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Threat Type:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        styles.predictionText,
                        result.threat_type.includes('Benign') || result.threat_type.includes('Legitimate') ? styles.successText : styles.dangerText,
                      ]}
                    >
                      {result.threat_type}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Confidence:</Text>
                  <Text style={styles.detailValue}>
                    {(result.confidence * 100).toFixed(2)}%
                  </Text>
                </View>

                {result.risk_score !== undefined && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Risk Score:</Text>
                    <Text style={[
                      styles.detailValue,
                      result.risk_score > 50 ? styles.dangerText : styles.successText
                    ]}>
                      {result.risk_score}/100
                    </Text>
                  </View>
                )}
              </View>

              {result.warning_flags && result.warning_flags.length > 0 && (
                <View style={styles.warningFlagsContainer}>
                  <Text style={styles.warningFlagsTitle}>⚠️ Warning Flags:</Text>
                  {result.warning_flags.map((flag: string, index: number) => (
                    <View key={index} style={styles.warningFlagItem}>
                      <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                      <Text style={styles.warningFlagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {result.is_fraudulent && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={styles.warningText}>
                    {result.qr_type === 'payment' 
                      ? '⚠️ Fraudulent Payment QR! This appears to be a scam. Do not make any payment through this QR code. Common scams include fake police/officer accounts, lottery scams, and urgent payment requests.'
                      : result.threat_type === 'Phishing' 
                      ? '⚠️ Phishing Attack Detected! This QR code leads to a site attempting to steal your personal information. Do not visit or enter any credentials.'
                      : result.threat_type === 'Malware'
                      ? '☢️ Malware Detected! This QR code may download harmful software to your device. Do not visit this URL.'
                      : '⚠️ This QR code has been detected as potentially malicious. Do not scan or use this code.'}
                  </Text>
                </View>
              )}

              {!result.is_fraudulent && result.prediction !== 'unknown' && (
                <View style={styles.safeBox}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.safeText}>
                    This QR code appears to be safe based on our analysis.
                  </Text>
                </View>
              )}

              {result.prediction === 'unknown' && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.accent} />
                  <Text style={styles.infoText}>
                    This QR code contains data that is neither a URL nor a payment request. Unable to analyze for fraud.
                  </Text>
                </View>
              )}

              <Button
                title="Scan Another QR Code"
                onPress={handleReset}
                variant="outline"
                style={styles.resetButton}
              />
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
  uploadContainer: {
    marginVertical: spacing.xxl,
  },
  uploadButton: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  uploadText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  uploadSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
    backgroundColor: colors.surfaceCard,
    borderColor: colors.success,
  },
  dangerCard: {
    backgroundColor: colors.surfaceCard,
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
    textAlign: 'center',
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
  warningFlagsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  warningFlagsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  warningFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  warningFlagText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  safeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.success,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
});
