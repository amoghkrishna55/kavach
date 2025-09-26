import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Encoder, Signer } from '@ba3a-g/kavach';
import type { DecodedGender, DecodedVersion } from '@ba3a-g/kavach';
import { Buffer } from 'buffer';
import { fetchAndStorePemFile, getStoredPemFile } from '../utils/keys';
import ScannerScreen from './ScannerScreen';
import KYCDashboardScreen from './KYCDashboardScreen';
import ShowAadhaarDataScreen from './ShowAadhaarDataScreen';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'data' | 'scan'>('data');

  const navigateToScanner = () => {
    navigation.navigate('Scanner' as never);
  };

  const navigateToDeviceDiscovery = () => {
    navigation.navigate('DeviceDiscovery' as never);
  };

  const navigateToP2PMessaging = () => {
    navigation.navigate('ShowAadhaarData' as never);
  };

  const navigateToP2PTest = () => {
    navigation.navigate('KYCDashboard' as never);
  };

  const renderDataTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.title}>Kavach</Text>

      {/* P2P Features Section */}
      <View style={styles.p2pSection}>
        {/* <TouchableOpacity
          style={styles.p2pButton}
          onPress={navigateToDeviceDiscovery}
        >
          <Text style={styles.p2pButtonIcon}>🔍</Text>
          <View style={styles.p2pButtonContent}>
            <Text style={styles.p2pButtonTitle}>Device Discovery</Text>
            <Text style={styles.p2pButtonDescription}>
              Find nearby Kavach devices
            </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.p2pButton}
          onPress={navigateToP2PMessaging}
        >
          <Text style={styles.p2pButtonIcon}>💬</Text>
          <View style={styles.p2pButtonContent}>
            <Text style={styles.p2pButtonTitle}>Aadhaar Info</Text>
            <Text style={styles.p2pButtonDescription}>Verify KYC data</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.p2pButton} onPress={navigateToP2PTest}>
          <Text style={styles.p2pButtonIcon}>🔧</Text>
          <View style={styles.p2pButtonContent}>
            <Text style={styles.p2pButtonTitle}>Offline KYC</Text>
            <Text style={styles.p2pButtonDescription}>
              Test native module availability
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {activeTab === 'data' ? (
        renderDataTab()
      ) : (
        // renderDataTab()
        <ScannerScreen />
      )}
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
  // P2P Section Styles
  p2pSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#86868b',
    marginBottom: 20,
    lineHeight: 20,
  },
  p2pButton: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8ed',
  },
  p2pButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  p2pButtonContent: {
    flex: 1,
  },
  p2pButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 2,
  },
  p2pButtonDescription: {
    fontSize: 12,
    color: '#86868b',
  },
});

export default HomeScreen;
