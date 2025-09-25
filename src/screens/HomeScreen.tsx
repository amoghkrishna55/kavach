import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Encoder, Signer } from '../utils/crypto';
import type { DecodedGender, DecodedVersion } from '../utils/crypto';
import { Buffer } from 'buffer';
import { fetchAndStorePemFile, getStoredPemFile } from '../utils/keys';
import ScannerScreen from './ScannerScreen';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'data' | 'scan'>('data');
  const [encodedData, setEncodedData] = useState<ArrayBuffer | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [signatureWithData, setSignatureWithData] = useState<Uint8Array | null>(
    null,
  );
  const [pemFileStatus, setPemFileStatus] = useState<string>('Checking...');
  const [storedPemContent, setStoredPemContent] = useState<string>('');

  useEffect(() => {
    const initializePemFile = async () => {
      try {
        const data = await getStoredPemFile();
        if (data) {
          setPemFileStatus('PEM file found in storage.');
        } else {
          const fetchedData = await fetchAndStorePemFile();
          setPemFileStatus('PEM file fetched and stored.');
        }
      } catch (e) {
        setPemFileStatus('Error retrieving PEM file.');
        console.error('Error retrieving PEM file:', e);
      }
    };

    initializePemFile();

    // Crypto operations
    let version = 1 as DecodedVersion;
    let gender = 'Male' as DecodedGender;
    let aadhaar = 123456789012;
    let dob = { day: 1, month: 1, year: 2000 };
    let name = 'Aryan Kumar';
    let private_key = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIEmLPOpujqNBu0l2FTpShxFGMww3uZC/qZniqgnWqCUt
-----END PRIVATE KEY-----`;

    const encoder = new Encoder();
    let encoded = encoder.encodeData(version, gender, aadhaar, dob, name);

    console.log(encoded);
    setEncodedData(encoded);

    // Signing the data
    const signer = new Signer(private_key);
    const signatureBuffer = signer.sign(
      Buffer.from(encoded).toString('base64'),
    );
    const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');
    console.log('Signature:', signatureBase64);
    setSignature(signatureBase64);

    // Signature + Data
    let signatureWithEncodedData = new Uint8Array(
      signatureBuffer.byteLength + encoded.byteLength,
    );
    signatureWithEncodedData.set(new Uint8Array(signatureBuffer), 0);
    signatureWithEncodedData.set(
      new Uint8Array(encoded),
      signatureBuffer.byteLength,
    );
    console.log(signatureWithEncodedData);
    setSignatureWithData(signatureWithEncodedData);
  }, []);

  const navigateToScanner = () => {
    navigation.navigate('Scanner' as never);
  };

  const renderDataTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.title}>Kavach</Text>

      <View style={styles.section}>
        <Text style={styles.label}>PEM File Status:</Text>
        <Text style={styles.value}>{pemFileStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Encoded Data:</Text>
        <Text style={styles.value}>
          {encodedData
            ? `ArrayBuffer(${encodedData.byteLength} bytes)`
            : 'Loading...'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Signature (Base64):</Text>
        <Text style={styles.value} numberOfLines={0}>
          {signature || 'Loading...'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Signature + Data:</Text>
        <Text style={styles.value}>
          {signatureWithData
            ? `Uint8Array(${signatureWithData.length} bytes)`
            : 'Loading...'}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {activeTab === 'data' ? renderDataTab() : <ScannerScreen />}
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'data' && styles.activeTab]}
          onPress={() => setActiveTab('data')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'data' && styles.activeTabText,
            ]}
          >
            📊 Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
          onPress={() => setActiveTab('scan')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'scan' && styles.activeTabText,
            ]}
          >
            🔍 Scan Aadhaar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Bottom Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 20, // Safe area padding for bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8e8e93',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  // Content Styles
  tabContent: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Data Tab Styles
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  // Scan Tab Styles
  scannerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 5,
    paddingLeft: 10,
  },
  // Camera Frame Styles
  cameraFrame: {
    position: 'relative',
    width: 250,
    height: 250,
    marginVertical: 20,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cameraText: {
    fontSize: 48,
    marginBottom: 10,
  },
  cameraLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scanFrameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#007AFF',
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#007AFF',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#007AFF',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#007AFF',
  },
});

export default HomeScreen;
