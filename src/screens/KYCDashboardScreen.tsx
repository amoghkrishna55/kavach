import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import P2PService from '../utils/p2p/P2PService';
import type { P2PDevice, P2PMessage } from '../utils/p2p/P2PService';

const KYCDashboardScreen = () => {
  const navigation = useNavigation();
  const [consentText, setConsentText] = useState('');
  const [isConsentSubmitted, setIsConsentSubmitted] = useState(false);
  const [consentHistory, setConsentHistory] = useState<
    Array<{
      id: string;
      text: string;
      timestamp: Date;
      response?: string;
      deviceName?: string;
    }>
  >([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<P2PDevice[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<string>('');

  useEffect(() => {
    // Listen for device discovery
    const handleDevicesChanged = (devices: P2PDevice[]) => {
      setDiscoveredDevices(devices);
    };

    // Listen for incoming messages (certificate responses)
    const handleMessage = (message: P2PMessage) => {
      console.log('Received response in KYC Dashboard:', message);

      if (message.type === 'verification' || message.type === 'consent') {
        // Find the matching consent and add the response to history
        const consentToUpdate = currentConsent;
        if (consentToUpdate) {
          const newHistoryItem = {
            id: Date.now().toString(),
            text: consentToUpdate,
            timestamp: new Date(),
            response: message.message,
            deviceName: message.fromDevice,
          };

          setConsentHistory(prev => [newHistoryItem, ...prev]);
          setCurrentConsent(''); // Clear current consent
          setIsDiscovering(false); // Stop discovering

          Alert.alert(
            'Response Received',
            `Certificate received from ${message.fromDevice}`,
          );
        }
      }
    };

    P2PService.addDeviceListener(handleDevicesChanged);
    P2PService.addMessageListener(handleMessage);

    return () => {
      P2PService.removeDeviceListener(handleDevicesChanged);
      P2PService.removeMessageListener(handleMessage);
    };
  }, [currentConsent]);

  const handleConsentSubmission = async () => {
    if (!consentText.trim()) {
      Alert.alert('Error', 'Please enter consent text before submitting.');
      return;
    }

    setCurrentConsent(consentText.trim());
    setConsentText('');

    // Start P2P discovery to show devices immediately
    startDeviceDiscovery();
  };

  const startDeviceDiscovery = async () => {
    try {
      setIsDiscovering(true);

      // Initialize P2P Service
      const initialized = await P2PService.initialize();
      if (!initialized) {
        Alert.alert('Error', 'Failed to initialize P2P service');
        return;
      }

      // Start discovery
      await P2PService.startDiscovery();

      Alert.alert(
        'Discovering Devices',
        'Searching for Kavach devices to send consent for verification...',
      );
    } catch (error) {
      console.error('Failed to start device discovery:', error);
      Alert.alert('Error', 'Failed to start device discovery');
      setIsDiscovering(false);
    }
  };

  const resetConsent = () => {
    setConsentText('');
    setIsConsentSubmitted(false);
    setCurrentConsent('');
    setIsDiscovering(false);
    setDiscoveredDevices([]);
  };

  const handleDisconnectAll = async () => {
    try {
      Alert.alert(
        'Disconnect All',
        'This will disconnect from all devices and reset the P2P service. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              try {
                // Disconnect from P2P
                await P2PService.disconnect();

                // Reset all state
                setDiscoveredDevices([]);
                setIsDiscovering(false);
                setCurrentConsent('');
                setIsConsentSubmitted(false);

                Alert.alert(
                  'Success',
                  'Disconnected from all devices and reset P2P service',
                );
              } catch (error) {
                console.error('Failed to disconnect:', error);
                Alert.alert('Error', 'Failed to disconnect from devices');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }
  };

  const handleDeviceSelection = async (device: P2PDevice) => {
    if (!currentConsent) {
      Alert.alert('Error', 'No consent data to send');
      return;
    }

    try {
      // Connect to the selected device
      console.log('Connecting to device:', device.deviceName);
      await P2PService.connectToDevice(device);

      // Wait a moment for socket connection to stabilize
      console.log('Connection established, waiting for socket to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      // Verify connection status before sending
      console.log('Verifying connection status...');
      // Add connection verification here if available in P2PService

      // Send consent data
      const consentData = {
        consentText: currentConsent,
        timestamp: new Date().toISOString(),
        kycId: Date.now().toString(),
      };

      console.log('Sending consent data:', consentData);

      // Try sending with retry logic
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        attempts++;
        console.log(`Sending attempt ${attempts}/${maxAttempts}`);

        try {
          success = await P2PService.sendMessage(
            JSON.stringify(consentData),
            device,
            'consent',
          );

          if (!success && attempts < maxAttempts) {
            console.log(`Send failed, waiting before retry ${attempts + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } catch (sendError) {
          console.error(`Send attempt ${attempts} failed:`, sendError);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (success) {
        Alert.alert(
          'Consent Sent',
          `Consent has been sent to ${device.deviceName} for verification. Waiting for certificate response...`,
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to send consent after ${maxAttempts} attempts. Please check connection and try again.`,
        );
      }
    } catch (error) {
      console.error('Failed to send consent:', error);
      Alert.alert('Error', 'Failed to connect and send consent');
    }
  };

  const formatTimestamp = (date: Date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KYC Dashboard</Text>
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnectAll}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consent Declaration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consent Declaration</Text>
          <Text style={styles.cardDescription}>
            Please provide the consent to digitally verify your customer:
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Consent Statement *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="State your consent here..."
              value={consentText}
              onChangeText={setConsentText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleConsentSubmission}
            >
              <Text style={styles.submitButtonText}>Declare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetConsent}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {isConsentSubmitted && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                ✓ Consent submitted successfully
              </Text>
            </View>
          )}
        </View>

        {/* Device Discovery */}
        {isDiscovering && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Available Kavach Devices</Text>
            <Text style={styles.cardDescription}>
              Select a device to send your consent for verification:
            </Text>

            {discoveredDevices.length === 0 ? (
              <Text style={styles.noDevicesText}>
                Searching for Kavach devices... Make sure the target device has
                "Sign Consent" activated.
              </Text>
            ) : (
              <FlatList
                data={discoveredDevices}
                keyExtractor={item => item.deviceAddress}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => handleDeviceSelection(item)}
                  >
                    <Text style={styles.deviceName}>{item.deviceName}</Text>
                    <Text style={styles.deviceAddress}>
                      {item.deviceAddress}
                    </Text>
                    <Text style={styles.deviceStatus}>
                      Status: {item.status}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {/* Consent History */}
        {consentHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consent History</Text>
            {consentHistory.map((consent, index) => (
              <View key={consent.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyIndex}>#{index + 1}</Text>
                  <Text style={styles.historyTimestamp}>
                    {formatTimestamp(consent.timestamp)}
                  </Text>
                </View>
                <Text style={styles.historyText}>{consent.text}</Text>
                {consent.deviceName && (
                  <Text style={styles.deviceInfo}>
                    Verified by: {consent.deviceName}
                  </Text>
                )}
                {consent.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>
                      Certificate Response:
                    </Text>
                    <Text style={styles.responseText}>{consent.response}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2563eb',
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
  disconnectButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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

  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  successMessage: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noDevicesText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  deviceItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusVerified: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  deviceInfo: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
  responseContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
});

export default KYCDashboardScreen;
