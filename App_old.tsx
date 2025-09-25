/**
 * Kavach - WiFi P2P Device Discovery App
 * Automatically detects nearby phones using the same app
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#007AFF"
      />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  // const [encodedData, setEncodedData] = useState<ArrayBuffer | null>(null);
  // const [signature, setSignature] = useState<string>('');
  // const [signatureWithData, setSignatureWithData] = useState<Uint8Array | null>(
  //   null,
  // );
  const [pemFileStatus, setPemFileStatus] = useState<string>('Checking...');

  useEffect(() => {
    const initializePemFile = async () => {
      try {
        const data = await getStoredPemFile();
        if (data) {
          setPemFileStatus('PEM file found in storage.');
          console.log(data);
        } else {
          const fetchedData = await fetchAndStorePemFile();
          setPemFileStatus('PEM file fetched and stored.');
          console.log(fetchedData);
        }
      } catch (e) {
        setPemFileStatus('Error retrieving PEM file.');
        console.error('Error retrieving PEM file:', e);
      }
    };

    initializePemFile();
  }, []);

  //   useEffect(() => {
  //     let version = 1 as DecodedVersion;
  //     let gender = 'Male' as DecodedGender;
  //     let aadhaar = 123456789012;
  //     let dob = { day: 1, month: 1, year: 2000 };
  //     let name = 'Aryan Kumar';
  //     let private_key = `-----BEGIN PRIVATE KEY-----
  // MC4CAQAwBQYDK2VwBCIEIEmLPOpujqNBu0l2FTpShxFGMww3uZC/qZniqgnWqCUt
  // -----END PRIVATE KEY-----`;

  //     const encoder = new Encoder();
  //     let encoded = encoder.encodeData(version, gender, aadhaar, dob, name); // this returns ArrayBuffer

  //     console.log(encoded);
  //     setEncodedData(encoded);

  //     // Signing the data
  //     const signer = new Signer(private_key);
  //     const signatureBuffer = signer.sign(
  //       Buffer.from(encoded).toString('base64'),
  //     ); // Returns 64 byte signature
  //     const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');
  //     console.log('Signature:', signatureBase64);
  //     setSignature(signatureBase64);

  //     // Signature + Data
  //     let signatureWithEncodedData = new Uint8Array(
  //       signatureBuffer.byteLength + encoded.byteLength,
  //     );
  //     signatureWithEncodedData.set(new Uint8Array(signatureBuffer), 0);
  //     signatureWithEncodedData.set(
  //       new Uint8Array(encoded),
  //       signatureBuffer.byteLength,
  //     );
  //     console.log(signatureWithEncodedData);
  //     setSignatureWithData(signatureWithEncodedData);
  //   }, []);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* <WiFiP2PManager appIdentifier="Kavach" /> */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{pemFileStatus}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
  },
});

export default App;
