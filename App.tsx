/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import VerificationResultScreen from './src/screens/VerificationResultScreen';

// Define the navigation types
export type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
  VerificationResult: {
    result: {
      isValid: boolean;
      decodedData: {
        name: string;
        aadhaar: string;
        gender: string;
        dob: {
          day: string;
          month: string;
          year: string;
        };
        version: string;
      };
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen
            name="VerificationResult"
            component={VerificationResultScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
