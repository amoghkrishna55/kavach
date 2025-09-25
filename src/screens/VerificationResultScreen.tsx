import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type VerificationResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerificationResult'
>;

type VerificationResultScreenRouteProp = RouteProp<
  RootStackParamList,
  'VerificationResult'
>;

const VerificationResultScreen = () => {
  const navigation = useNavigation<VerificationResultScreenNavigationProp>();
  const route = useRoute<VerificationResultScreenRouteProp>();
  const { result } = route.params;
  const insets = useSafeAreaInsets();

  const handleDone = () => {
    navigation.goBack();
  };

  const { isValid, decodedData } = result;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.statusBadge,
              isValid ? styles.validBadge : styles.invalidBadge,
            ]}
          >
            <Text style={styles.statusIcon}>{isValid ? '✅' : '❌'}</Text>
            <Text style={styles.statusText}>
              {isValid ? 'Verification Successful' : 'Verification Failed'}
            </Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{decodedData.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Aadhaar</Text>
              <Text style={styles.infoValue}>{decodedData.aadhaar}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{decodedData.gender}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {decodedData.dob.day}/{decodedData.dob.month}/
                {decodedData.dob.year}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{decodedData.version}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Space for the bottom button + safe area
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  validBadge: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  invalidBadge: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 15,
  },
  infoItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  validText: {
    color: '#28a745',
  },
  invalidText: {
    color: '#dc3545',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VerificationResultScreen;
