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
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Extracted URL:</Text>
                  <Text style={styles.detailValue} numberOfLines={3}>
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
                    This QR code contains a potentially malicious URL. Do not visit or scan this
                    code again.
                  </Text>
                </View>
              )}

              {!result.is_fraudulent && (
                <View style={styles.safeBox}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.safeText}>
                    This QR code appears to be safe based on our analysis.
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
    backgroundColor: colors.cardBackground,
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
  resetButton: {
    marginTop: spacing.sm,
  },
});
