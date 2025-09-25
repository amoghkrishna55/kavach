import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { verifySignature } from '../utils/keys';

const ScannerScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const device = useCameraDevice('back');

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
      // if (scanned || codes.length === 0) return;

      handleBarCodeScanned(codes[0].value || '');
      setScanned(true);
    },
  });

  const handleBarCodeScanned = async (data: string) => {
    setScanned(true);

    try {
      const result = await verifySignature(data);

      const decodedInfo = result.decodedData;
      const displayText = `
Signature Valid: ${result.isValid ? '✅ Yes' : '❌ No'}

Personal Information:
👤 Name: ${decodedInfo.name}
🆔 Aadhaar: ${decodedInfo.aadhaar}
⚧ Gender: ${decodedInfo.gender}
📅 DOB: ${decodedInfo.dob.day}/${decodedInfo.dob.month}/${decodedInfo.dob.year}
📊 Version: ${decodedInfo.version}
      `;

      Alert.alert(
        result.isValid
          ? 'Verification Successful ✅'
          : 'Verification Failed ❌',
        displayText,
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error verifying signature:', error);
      Alert.alert(
        'Verification Error ⚠️',
        'Failed to verify the QR code. Please try again.',
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={goBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // if (!device) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.message}>No camera device available</Text>
  //       <TouchableOpacity style={styles.button} onPress={goBack}>
  //         <Text style={styles.buttonText}>Go Back</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}

      <View style={styles.content}>
        <View style={styles.scannerContainer}>
          {device && (
            <Camera
              style={styles.smallCamera}
              device={device}
              isActive={!scanned}
              codeScanner={codeScanner}
            />
          )}

          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>

        <Text style={styles.instructions}>
          {scanned ? 'Processing QR code...' : 'Align QR code within the frame'}
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  scannerContainer: {
    position: 'relative',
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  smallCamera: {
    width: 250,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanFrame: {
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
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const ScannerScreens = () => {
  return <></>;
};

export default ScannerScreen;
