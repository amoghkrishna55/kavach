import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

const MockupAadhaarVerification = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [consentSigned, setConsentSigned] = useState(false);
  const device = useCameraDevice('back');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (isScanning && codes.length > 0 && codes[0].value) {
        handleQRScanned(codes[0].value);
      }
    },
  });

  const handleQRScanned = (data: string) => {
    setIsScanning(false);

    try {
      const parsedData = JSON.parse(data);
      setScannedData(parsedData);

      // Animate the consent card appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code does not contain valid consent data.',
      );
      setIsScanning(true);
    }
  };

  const handleAcceptConsent = () => {
    setConsentSigned(true);
    Alert.alert(
      'Consent Signed',
      'The consent has been successfully signed and verified!',
      [
        {
          text: 'OK',
          onPress: () => {
            // In a real app, this would navigate to a success screen
          },
        },
      ],
    );
  };

  const handleRejectConsent = () => {
    Alert.alert(
      'Consent Rejected',
      'The consent has been rejected. Returning to scanner.',
      [
        {
          text: 'OK',
          onPress: () => {
            setScannedData(null);
            setIsScanning(true);
            setConsentSigned(false);
            fadeAnim.setValue(0);
          },
        },
      ],
    );
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsScanning(true);
    setConsentSigned(false);
    fadeAnim.setValue(0);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>No access to camera</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f3" />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Declare Consent</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isScanning && !scannedData && (
          <View style={styles.scannerSection}>
            <Text style={styles.scannerTitle}>Scan Consent QR Code</Text>
            <Text style={styles.scannerSubtitle}>
              Point your camera at the QR code
            </Text>

            <View style={styles.cameraContainer}>
              {device && (
                <Camera
                  style={styles.camera}
                  device={device}
                  isActive={isScanning}
                  codeScanner={codeScanner}
                />
              )}

              {/* Scanner Overlay */}
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <View style={styles.scannerCorners}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {scannedData && (
          <Animated.View style={[styles.consentSection, { opacity: fadeAnim }]}>
            {/* Consent Details */}
            <View style={styles.consentCard}>
              <Text style={styles.consentTitle}>Consent Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consent ID:</Text>
                <Text style={styles.detailValue}>{scannedData.consentId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp:</Text>
                <Text style={styles.detailValue}>
                  {new Date(scannedData.timestamp).toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, styles.statusPending]}>
                  {scannedData.status}
                </Text>
              </View>

              <View style={styles.consentTextContainer}>
                <Text style={styles.consentTextLabel}>Consent Text:</Text>
                <Text style={styles.consentText}>
                  {scannedData.consentText}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {!consentSigned && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleRejectConsent}
                >
                  <Text style={styles.rejectButtonText}>Reject Consent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAcceptConsent}
                >
                  <Text style={styles.acceptButtonText}>Sign Consent</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Success State */}
            {consentSigned && (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Text style={styles.successEmoji}>✓</Text>
                </View>
                <Text style={styles.successTitle}>
                  Consent Signed Successfully!
                </Text>
                <Text style={styles.successMessage}>
                  The consent has been digitally signed and verified. The
                  transaction is now complete.
                </Text>

                <View style={styles.successActions}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetScanner}
                  >
                    <Text style={styles.resetButtonText}>Scan Another QR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How it works</Text>
          <Text style={styles.instructionsText}>
            1. Scan the QR code generated{'\n'}
            2. Review the consent details{'\n'}
            3. Sign or reject the consent{'\n'}
            4. Get verification confirmation
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e3db',
    elevation: 2,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e3db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#2c2419',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2419',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#2c2419',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8b4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerSection: {
    marginVertical: 20,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c2419',
    textAlign: 'center',
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 14,
    color: '#6b5e4f',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2c2419',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerCorners: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#22c55e',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  consentSection: {
    marginTop: 20,
  },
  consentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b5e4f',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c2419',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  statusPending: {
    color: '#f59e0b',
  },
  consentTextContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f6f3',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b4513',
  },
  consentTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2419',
    marginBottom: 8,
  },
  consentText: {
    fontSize: 15,
    color: '#2c2419',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#22c55e',
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
    color: '#ffffff',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#6b5e4f',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successActions: {
    width: '100%',
  },
  resetButton: {
    backgroundColor: '#8b4513',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8b4513',
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b5e4f',
    lineHeight: 20,
  },
});

export default MockupAadhaarVerification;
