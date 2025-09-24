import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  subscribeOnPeersUpdates,
  subscribeOnThisDeviceChanged,
  getAvailablePeers,
  connect,
  cancelConnect,
  createGroup,
  removeGroup,
  getConnectionInfo,
  getGroupInfo,
  sendFile,
  receiveFile,
  type Device,
  type GroupInfo,
  type WifiP2pInfo,
} from 'react-native-wifi-p2p';

interface WiFiP2PManagerProps {
  appIdentifier?: string;
}

const WiFiP2PManager: React.FC<WiFiP2PManagerProps> = ({
  appIdentifier = 'Kavach',
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    initializeWiFiP2P();
    return () => {
      cleanup();
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        'android.permission.ACCESS_WIFI_STATE' as any,
        'android.permission.CHANGE_WIFI_STATE' as any,
        'android.permission.ACCESS_NETWORK_STATE' as any,
        'android.permission.CHANGE_NETWORK_STATE' as any,
      ];

      // For Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        permissions.push('android.permission.NEARBY_WIFI_DEVICES' as any);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const initializeWiFiP2P = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'This app needs location and WiFi permissions to discover nearby devices.',
        );
        return;
      }

      // Initialize WiFi P2P
      await initialize();
      setIsInitialized(true);

      // Subscribe to device changes
      subscribeOnThisDeviceChanged(groupInfo => {
        console.log('Group info changed:', groupInfo);
        setGroupInfo(groupInfo);
      });

      // Subscribe to peer updates
      subscribeOnPeersUpdates(({ devices }) => {
        console.log('Peers updated:', devices);
        // Filter devices to only show those running the same app
        const filteredDevices = filterAppDevices(devices);
        setDiscoveredDevices(filteredDevices);
      });

      console.log('WiFi P2P initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WiFi P2P:', error);
      Alert.alert(
        'Error',
        'Failed to initialize WiFi P2P. Please check your WiFi settings.',
      );
    }
  };

  // Filter devices to identify those running the same app
  const filterAppDevices = (devices: Device[]): Device[] => {
    return devices.filter(device => {
      // You can implement custom logic here to identify your app
      // For example, check device name pattern or use service discovery
      return device.deviceName.includes(appIdentifier) || device.deviceAddress; // For now, show all devices
    });
  };

  const startDiscovery = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'WiFi P2P not initialized');
      return;
    }

    try {
      setIsDiscovering(true);
      await startDiscoveringPeers();
      console.log('Started discovering peers');

      // Auto-refresh available devices
      setTimeout(async () => {
        try {
          const result = await getAvailablePeers();
          console.log('Available devices:', result.devices);
        } catch (error) {
          console.error('Error getting available devices:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting discovery:', error);
      setIsDiscovering(false);
      Alert.alert('Error', 'Failed to start device discovery');
    }
  };

  const stopDiscovery = async () => {
    try {
      await stopDiscoveringPeers();
      setIsDiscovering(false);
      console.log('Stopped discovering peers');
    } catch (error) {
      console.error('Error stopping discovery:', error);
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      console.log('Attempting to connect to:', device.deviceName);
      await connect(device.deviceAddress);

      // Check connection info after a brief delay
      setTimeout(async () => {
        try {
          const connectionInfo = await getConnectionInfo();
          console.log('Connection info:', connectionInfo);
          setIsGroupOwner(connectionInfo.isGroupOwner);

          if (connectionInfo.isGroupOwner) {
            const groupInfo = await getGroupInfo();
            setGroupInfo(groupInfo);
            // Note: There's no getClientList in this library version
            // You can implement client tracking through other means
          }
        } catch (error) {
          console.error('Error getting connection info:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert(
        'Connection Failed',
        `Could not connect to ${device.deviceName}`,
      );
    }
  };

  const disconnectFromDevice = async () => {
    try {
      await removeGroup();
      setConnectedDevices([]);
      setIsGroupOwner(false);
      setGroupInfo(null);
      console.log('Disconnected from group');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const cleanup = async () => {
    try {
      if (isDiscovering) {
        await stopDiscoveringPeers();
      }
      await removeGroup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const renderDevice = ({ item: device }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(device)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.deviceName}</Text>
        <Text style={styles.deviceAddress}>{device.deviceAddress}</Text>
        <Text style={styles.deviceStatus}>
          Status: {device.status} | Group Owner:{' '}
          {device.isGroupOwner ? 'Yes' : 'No'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderConnectedDevice = ({ item: device }: { item: Device }) => (
    <View style={styles.connectedDeviceItem}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.deviceName}</Text>
        <Text style={styles.deviceAddress}>{device.deviceAddress}</Text>
        <Text style={styles.connectedStatus}>✅ Connected</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>test</Text>

      {/* Group Info */}
      {groupInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          <Text style={styles.deviceText}>
            Network: {groupInfo.networkName} | Owner:{' '}
            {groupInfo.owner.deviceName}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isDiscovering && styles.buttonActive]}
          onPress={isDiscovering ? stopDiscovery : startDiscovery}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>
            {isDiscovering ? 'Stop Discovery' : 'Start Discovery'}
          </Text>
        </TouchableOpacity>

        {connectedDevices.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectFromDevice}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Connected Devices {isGroupOwner && '(You are Group Owner)'}
          </Text>
          <FlatList
            data={connectedDevices}
            keyExtractor={item => item.deviceAddress}
            renderItem={renderConnectedDevice}
            style={styles.list}
          />
        </View>
      )}

      {/* Discovered Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Nearby Kavach Devices ({discoveredDevices.length})
        </Text>
        {discoveredDevices.length === 0 ? (
          <Text style={styles.emptyText}>
            {isInitialized
              ? isDiscovering
                ? 'Searching for nearby devices...'
                : 'Tap "Start Discovery" to find nearby devices'
              : 'Initializing WiFi P2P...'}
          </Text>
        ) : (
          <FlatList
            data={discoveredDevices}
            keyExtractor={item => item.deviceAddress}
            renderItem={renderDevice}
            style={styles.list}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deviceText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  disconnectButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    maxHeight: 200,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  connectedDeviceItem: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  connectedStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default WiFiP2PManager;
