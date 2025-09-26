import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import P2PService from '../utils/p2p/P2PService';
import type { P2PDevice, P2PMessage } from '../utils/p2p/P2PService';
import { Signer } from '@ba3a-g/kavach';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { Buffer } from 'buffer';
import {
  getStoredAadharData,
  getAadharData,
  storeAadharData,
  type AadharUser,
} from '../utils/aadhar';

const ShowAadhaarDataScreen = () => {
  const navigation = useNavigation();
  const [isP2PActive, setIsP2PActive] = useState(false);
  const [receivedConsent, setReceivedConsent] = useState<string>('');
  const [senderDevice, setSenderDevice] = useState<string>('');
  const [connectionStatus, setConnectionStatus] =
    useState<string>('Not Connected');

  // Aadhaar data state
  const [aadharData, setAadharData] = useState<AadharUser | null>(null);
  const [isLoadingAadhar, setIsLoadingAadhar] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [signatureQrData, setSignatureQrData] = useState<string>('');

  useEffect(() => {
    // Load stored Aadhaar data on mount
    loadAadharData();

    // Listen for incoming messages
    const handleMessage = (message: P2PMessage) => {
      console.log('Received message in Aadhaar screen:', message);

      if (message.type === 'consent') {
        try {
          const consentData = JSON.parse(message.message);
          setReceivedConsent(consentData.consentText || message.message);
          setSenderDevice(message.fromDevice);
          setConnectionStatus('Consent Received');
        } catch (error) {
          // If not JSON, treat as plain text
          setReceivedConsent(message.message);
          setSenderDevice(message.fromDevice);
          setConnectionStatus('Consent Received');
        }
      }
    };

    const handleConnection = (device: P2PDevice, connected: boolean) => {
      if (connected) {
        setConnectionStatus(`Connected to ${device.deviceName}`);
      } else {
        setConnectionStatus('Disconnected');
      }
    };

    P2PService.addMessageListener(handleMessage);
    P2PService.addConnectionListener(handleConnection);

    return () => {
      P2PService.removeMessageListener(handleMessage);
      P2PService.removeConnectionListener(handleConnection);
    };
  }, []);

  const handleSignConsent = async () => {
    try {
      setConnectionStatus('Starting P2P...');

      // Initialize P2P Service
      const initialized = await P2PService.initialize();
      if (!initialized) {
        Alert.alert('Error', 'Failed to initialize P2P service');
        return;
      }

      // Start discovery to make this device discoverable
      await P2PService.startDiscovery();
      setIsP2PActive(true);
      setConnectionStatus('Ready to receive consent (Discoverable)');

      Alert.alert(
        'Ready',
        'This device is now discoverable as a Kavach device. Waiting for consent requests from KYC dashboard devices.',
      );
    } catch (error) {
      console.error('Failed to start P2P:', error);
      Alert.alert('Error', 'Failed to start P2P service');
      setConnectionStatus('Error starting P2P');
    }
  };

  const handleStopP2P = async () => {
    try {
      await P2PService.stopDiscovery();
      setIsP2PActive(false);
      setConnectionStatus('Not Connected');
      Alert.alert('Stopped', 'P2P service stopped');
    } catch (error) {
      console.error('Failed to stop P2P:', error);
    }
  };

  const generateSignatureQR = (signatureWithEncodedData: number[]) => {
    try {
      // Convert number array to Buffer and then to base64
      const buffer = Buffer.from(signatureWithEncodedData);
      const base64String = buffer.toString('base64');
      setSignatureQrData(base64String);
      console.log(
        'Generated QR data for signature:',
        base64String.substring(0, 50) + '...',
      );
    } catch (error) {
      console.error('Failed to generate signature QR:', error);
      setSignatureQrData('');
    }
  };

  const loadAadharData = async () => {
    try {
      setIsLoadingAadhar(true);
      const storedData = await getStoredAadharData();
      if (storedData) {
        setAadharData(storedData);
        // Generate QR code for signature
        if (storedData.signatureWithEncodedData) {
          generateSignatureQR(storedData.signatureWithEncodedData);
        }
        console.log('Loaded Aadhaar data from storage:', storedData.name);
      } else {
        console.log('No Aadhaar data found in storage');
      }
    } catch (error) {
      console.error('Failed to load Aadhaar data:', error);
    } finally {
      setIsLoadingAadhar(false);
    }
  };

  const fetchAadharData = async () => {
    if (!aadhaarInput.trim()) {
      Alert.alert('Error', 'Please enter Aadhaar number');
      return;
    }

    if (aadhaarInput.length !== 12) {
      Alert.alert('Error', 'Aadhaar number must be 12 digits');
      return;
    }

    try {
      setIsLoadingAadhar(true);
      const fetchedData = await getAadharData(aadhaarInput.trim());
      setAadharData(fetchedData);
      // Generate QR code for signature
      if (fetchedData.signatureWithEncodedData) {
        generateSignatureQR(fetchedData.signatureWithEncodedData);
      }
      setAadhaarInput('');
      Alert.alert('Success', 'Aadhaar data fetched and stored successfully');
    } catch (error) {
      console.error('Failed to fetch Aadhaar data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch Aadhaar data. Please check the number and try again.',
      );
    } finally {
      setIsLoadingAadhar(false);
    }
  };

  const handleProcessConsent = async () => {
    if (!receivedConsent) {
      Alert.alert('No Consent', 'No consent data received yet');
      return;
    }

    try {
      // Simulate processing consent and generating certificate
      setConnectionStatus('Processing consent...');
      const private_key = (await AsyncStorage.getItem('private_key')) as string;

      const signer = new Signer(private_key);
      const certificateResponse = signer.sign(receivedConsent);

      // Send certificate back to KYC dashboard
      const success = await P2PService.sendMessage(
        JSON.stringify(certificateResponse),
        undefined, // Send to connected device
        'verification',
      );

      if (success) {
        setConnectionStatus('Certificate sent successfully');
        Alert.alert('Certificate Sent');

        // Reset the received consent after processing
        setReceivedConsent('');
        setSenderDevice('');
      } else {
        setConnectionStatus('Failed to send certificate');
        Alert.alert(
          'Error',
          'Failed to send certificate back to KYC dashboard',
        );
      }
    } catch (error) {
      console.error('Failed to process consent:', error);
      setConnectionStatus('Error processing consent');
      Alert.alert(
        'Error',
        'Failed to process consent and generate certificate',
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      // Stop P2P discovery and cleanup
      await P2PService.stopDiscovery();
      P2PService.cleanup();

      setIsP2PActive(false);
      setReceivedConsent('');
      setSenderDevice('');
      setConnectionStatus('Disconnected');
      Alert.alert('Disconnected', 'All P2P connections have been reset');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      Alert.alert('Error', 'Failed to disconnect properly');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Show Aadhaar Data</Text>
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connection Status</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isP2PActive ? '#10b981' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>
        </View>

        {/* Aadhaar Data Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aadhaar Information</Text>

          {!aadharData ? (
            <View>
              <Text style={styles.cardDescription}>
                Enter your Aadhaar number to fetch and display your information:
              </Text>

              <TextInput
                style={styles.aadhaarInput}
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaarInput}
                onChangeText={setAadhaarInput}
                keyboardType="numeric"
                maxLength={12}
              />

              <TouchableOpacity
                style={[
                  styles.fetchButton,
                  isLoadingAadhar && styles.fetchButtonDisabled,
                ]}
                onPress={fetchAadharData}
                disabled={isLoadingAadhar}
              >
                <Text style={styles.fetchButtonText}>
                  {isLoadingAadhar ? 'Fetching...' : 'Fetch Aadhaar Data'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Name:</Text>
                <Text style={styles.dataValue}>{aadharData.name}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Gender:</Text>
                <Text style={styles.dataValue}>{aadharData.gender}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Aadhaar:</Text>
                <Text style={styles.dataValue}>
                  {aadharData.aadhaar.replace(
                    /(\d{4})(\d{4})(\d{4})/,
                    '$1 $2 $3',
                  )}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Date of Birth:</Text>
                <Text style={styles.dataValue}>
                  {`${aadharData.dob.day}/${aadharData.dob.month}/${aadharData.dob.year}`}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Public Key:</Text>
                <Text style={styles.dataValueSmall} numberOfLines={2}>
                  {aadharData.userPublicKey}
                </Text>
              </View>

              <View style={styles.dataColumn}>
                <Text style={styles.dataLabel}>PEM Certificate:</Text>
                <ScrollView
                  style={styles.certificateContainer}
                  horizontal={true}
                >
                  <Text style={styles.certificateText}>
                    {aadharData.pemCertificate}
                  </Text>
                </ScrollView>
              </View>

              <View style={styles.dataColumn}>
                <Text style={styles.dataLabel}>Digital Signature QR:</Text>
                <View style={styles.qrContainer}>
                  {signatureQrData ? (
                    <QRCode
                      value={signatureQrData}
                      size={200}
                      color="black"
                      backgroundColor="white"
                    />
                  ) : (
                    <Text style={styles.qrPlaceholder}>
                      No signature data available
                    </Text>
                  )}
                </View>
                <Text style={styles.qrDescription}>
                  Scan this QR code to verify the digital signature
                </Text>
              </View>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setAadharData(null);
                  setAadhaarInput('');
                  setSignatureQrData('');
                }}
              >
                <Text style={styles.clearButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Consent Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aadhaar KYC</Text>
          <Text style={styles.cardDescription}>
            Click "Sign Consent" to make this device available for receiving
            consent requests from recognised authorities.
          </Text>

          {!isP2PActive ? (
            <TouchableOpacity
              style={styles.signButton}
              onPress={handleSignConsent}
            >
              <Text style={styles.signButtonText}>🔐 Sign Consent</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={handleStopP2P}>
              <Text style={styles.stopButtonText}>Stop P2P Service</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Received Consent Card */}
        {receivedConsent ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Received Consent</Text>
            <Text style={styles.senderInfo}>From: {senderDevice}</Text>

            <View style={styles.consentContainer}>
              <Text style={styles.consentLabel}>Consent Data:</Text>
              <Text style={styles.consentText}>{receivedConsent}</Text>
            </View>

            <TouchableOpacity
              style={styles.processButton}
              onPress={handleProcessConsent}
            >
              <Text style={styles.processButtonText}>
                Process Consent & Generate Certificate
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Waiting for Consent</Text>
            <Text style={styles.waitingText}>
              {isP2PActive
                ? 'Device is discoverable. Waiting for consent requests...'
                : 'Start P2P service to receive consent requests'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#059669',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  signButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  signButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  senderInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  consentContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    marginBottom: 16,
  },
  consentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  consentText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  processButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  aadhaarInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  fetchButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  fetchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  fetchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  dataColumn: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 100,
    marginRight: 12,
  },
  dataValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  dataValueSmall: {
    fontSize: 12,
    color: '#1f2937',
    flex: 1,
    fontFamily: 'monospace',
  },
  certificateContainer: {
    maxHeight: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  certificateText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrPlaceholder: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 32,
  },
  qrDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ShowAadhaarDataScreen;
