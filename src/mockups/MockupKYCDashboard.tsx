import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

const MockupKYCDashboard = () => {
  const navigation = useNavigation();
  const [consentText, setConsentText] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrData, setQrData] = useState('');

  const handleDeclareConsent = () => {
    if (!consentText.trim()) {
      Alert.alert('Error', 'Please enter consent text before declaring.');
      return;
    }

    // Generate mock QR data
    const mockConsentData = {
      consentId: `CONSENT_${Date.now()}`,
      consentText: consentText.trim(),
      timestamp: new Date().toISOString(),
      requester: 'KYC Dashboard',
      status: 'pending_signature',
    };

    setQrData(JSON.stringify(mockConsentData));
    setQrGenerated(true);
  };

  const handleQRPress = () => {
    // Navigate to signed certificate screen
    navigation.navigate(
      'MockupSignedCertificate' as never,
      {
        consentData: {
          consentText: consentText,
          signedAt: new Date().toISOString(),
          status: 'signed',
          consentId: `CONSENT_${Date.now()}`,
        },
      } as never,
    );
  };

  const resetConsent = () => {
    setConsentText('');
    setQrGenerated(false);
    setQrData('');
  };

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
        <Text style={styles.headerTitle}>KYC Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Consent Declaration</Text>
          <Text style={styles.instructionsText}>
            Enter the consent text below and click "Declare Consent" to generate
            a QR code for verification.
          </Text>
        </View>

        {/* Consent Input */}
        <View style={styles.consentCard}>
          <Text style={styles.consentTitle}>Consent Text</Text>
          <TextInput
            style={styles.consentInput}
            placeholder="Enter your consent declaration here..."
            value={consentText}
            onChangeText={setConsentText}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor="#6b5e4f"
          />

          <TouchableOpacity
            style={[
              styles.declareButton,
              !consentText.trim() && styles.declareButtonDisabled,
            ]}
            onPress={handleDeclareConsent}
            disabled={!consentText.trim()}
          >
            <Text style={styles.declareButtonText}>
              {qrGenerated ? '✓ Consent Declared' : 'Declare Consent'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        {qrGenerated && (
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Verification QR Code</Text>
            <Text style={styles.qrSubtitle}>
              Share this QR code for consent verification
            </Text>{' '}
            <TouchableOpacity
              style={styles.qrContainer}
              onPress={handleQRPress}
            >
              <QRCode
                value={qrData}
                size={200}
                backgroundColor="#ffffff"
                color="#2c2419"
              />
              {/* <View style={styles.qrOverlay}>
                <Text style={styles.qrOverlayText}>Tap to View Certificate</Text>
              </View> */}
            </TouchableOpacity>
            {/* <View style={styles.qrActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetConsent}
              >
                <Text style={styles.resetButtonText}>Reset Consent</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        )}

        {/* Status Card */}
        {/* <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Consent:</Text>
            <Text
              style={[
                styles.statusValue,
                qrGenerated && styles.statusValueActive,
              ]}
            >
              {qrGenerated ? 'Declared & Ready' : 'Not Declared'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>QR Code:</Text>
            <Text
              style={[
                styles.statusValue,
                qrGenerated && styles.statusValueActive,
              ]}
            >
              {qrGenerated ? 'Generated' : 'Not Generated'}
            </Text>
          </View>
        </View> */}
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
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b5e4f',
    lineHeight: 20,
  },
  consentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 12,
  },
  consentInput: {
    borderWidth: 2,
    borderColor: '#e8e3db',
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16,
    color: '#2c2419',
    backgroundColor: '#f8f6f3',
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  declareButton: {
    backgroundColor: '#8b4513',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  declareButtonDisabled: {
    backgroundColor: '#c49a6c',
    opacity: 0.6,
  },
  declareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6b5e4f',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  qrOverlay: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: '#2c2419',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resetButton: {
    backgroundColor: '#e8e3db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#2c2419',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b5e4f',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#c49a6c',
    fontWeight: '600',
  },
  statusValueActive: {
    color: '#22c55e',
  },
});

export default MockupKYCDashboard;
