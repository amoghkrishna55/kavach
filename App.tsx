/**
 * Kavach - WiFi P2P Device Discovery App
 * Automatically detects nearby phones using the same app
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import WiFiP2PManager from './src/components/WiFiP2PManager';

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

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <WiFiP2PManager appIdentifier="Kavach" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
