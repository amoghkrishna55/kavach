import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type MockupSignedCertificateRouteProp = RouteProp<
  {
    MockupSignedCertificate: {
      consentData: {
        consentText: string;
        signedAt: string;
        status: string;
        consentId: string;
      };
    };
  },
  'MockupSignedCertificate'
>;

const MockupSignedCertificate = () => {
  const navigation = useNavigation();
  const route = useRoute<MockupSignedCertificateRouteProp>();
  const { consentData } = route.params;

  const certificateDetails = {
    certificateId: `CERT_${Date.now()}`,
    issuedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    issuer: 'Kavach Digital Identity System',
    algorithm: 'RSA-2048 with SHA-256',
    version: '1.0',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f3" />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Digital Certificate</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Certificate Status */}
        <View style={styles.statusBanner}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusEmoji}>✓</Text>
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Consent Signed Successfully</Text>
            <Text style={styles.statusSubtitle}>
              Digital signature verified and certificate issued
            </Text>
          </View>
        </View>

        {/* Certificate Header */}
        <View style={styles.certificateCard}>
          <View style={styles.certificateHeader}>
            <Text style={styles.certificateTitle}>
              Digital Consent Certificate
            </Text>
            <Text style={styles.certificateSubtitle}>
              This certificate verifies the digital consent signature
            </Text>
          </View>

          {/* Certificate Details */}
          <View style={styles.certificateBody}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certificate Information</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Certificate ID:</Text>
                <Text style={styles.detailValue}>
                  {certificateDetails.certificateId}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consent ID:</Text>
                <Text style={styles.detailValue}>{consentData.consentId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, styles.statusSigned]}>
                  SIGNED & VERIFIED ✓
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issued At:</Text>
                <Text style={styles.detailValue}>
                  {new Date(certificateDetails.issuedAt).toLocaleString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valid Until:</Text>
                <Text style={styles.detailValue}>
                  {new Date(certificateDetails.validUntil).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Version:</Text>
                <Text style={styles.detailValue}>
                  {certificateDetails.version}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Issuer Information</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issuer:</Text>
                <Text style={styles.detailValue}>
                  {certificateDetails.issuer}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Algorithm:</Text>
                <Text style={styles.detailValue}>
                  {certificateDetails.algorithm}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Consent Details</Text>

              <View style={styles.consentContainer}>
                <Text style={styles.consentLabel}>Original Consent Text:</Text>
                <View style={styles.consentTextBox}>
                  <Text style={styles.consentText}>
                    {consentData.consentText}
                  </Text>
                </View>
              </View>
            </View>

            {/* Digital Signature Section */}
            <View style={styles.signatureSection}>
              <Text style={styles.signatureTitle}>
                🔒 Digital Signature Verification
              </Text>

              <View style={styles.signatureDetails}>
                <View style={styles.signatureRow}>
                  <Text style={styles.signatureLabel}>Signature Status:</Text>
                  <View style={styles.signatureStatus}>
                    <Text style={styles.signatureStatusText}>VALID</Text>
                    <Text style={styles.signatureStatusIcon}>✓</Text>
                  </View>
                </View>

                <View style={styles.signatureRow}>
                  <Text style={styles.signatureLabel}>Signed At:</Text>
                  <Text style={styles.signatureValue}>
                    {new Date(consentData.signedAt).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.signatureRow}>
                  <Text style={styles.signatureLabel}>Hash Algorithm:</Text>
                  <Text style={styles.signatureValue}>SHA-256</Text>
                </View>

                <View style={styles.signatureRow}>
                  <Text style={styles.signatureLabel}>Key Length:</Text>
                  <Text style={styles.signatureValue}>2048 bits</Text>
                </View>
              </View>

              {/* Mock Signature Hash */}
              <View style={styles.hashContainer}>
                <Text style={styles.hashLabel}>Certificate Hash:</Text>
                <Text style={styles.hashValue}>
                  SHA256:
                  a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
                </Text>
              </View>
            </View>
          </View>

          {/* Certificate Footer */}
          <View style={styles.certificateFooter}>
            <Text style={styles.footerText}>
              This digital certificate is cryptographically signed and
              verifiable.
            </Text>
            <Text style={styles.footerSubtext}>
              Generated by Kavach Digital Identity System
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              /* In real app, would share certificate */
            }}
          >
            <Text style={styles.shareButtonText}>📤 Share Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => {
              /* In real app, would download PDF */
            }}
          >
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Notice */}
        <View style={styles.verificationNotice}>
          <Text style={styles.noticeTitle}>Verification Notice</Text>
          <Text style={styles.noticeText}>
            This certificate can be independently verified using the certificate
            ID and hash. The digital signature ensures authenticity and prevents
            tampering.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e3db',
    elevation: 2,
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e3db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#2c2419',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#2c2419',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusBanner: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  certificateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e8e3db',
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  certificateHeader: {
    backgroundColor: '#8b4513',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  certificateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  certificateSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  certificateBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e3db',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b5e4f',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c2419',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  statusSigned: {
    color: '#22c55e',
    fontWeight: '700',
  },
  consentContainer: {
    marginTop: 8,
  },
  consentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2419',
    marginBottom: 8,
  },
  consentTextBox: {
    backgroundColor: '#f8f6f3',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8b4513',
  },
  consentText: {
    fontSize: 15,
    color: '#2c2419',
    lineHeight: 22,
  },
  signatureSection: {
    backgroundColor: '#f8f6f3',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 16,
    textAlign: 'center',
  },
  signatureDetails: {
    marginBottom: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 13,
    color: '#6b5e4f',
    fontWeight: '500',
  },
  signatureValue: {
    fontSize: 13,
    color: '#2c2419',
    fontWeight: '600',
  },
  signatureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signatureStatusText: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '700',
    marginRight: 4,
  },
  signatureStatusIcon: {
    fontSize: 14,
  },
  hashContainer: {
    backgroundColor: '#2c2419',
    borderRadius: 8,
    padding: 12,
  },
  hashLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 10,
    color: '#d4c4a0',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  certificateFooter: {
    backgroundColor: '#e8e3db',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#2c2419',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6b5e4f',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#8b4513',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#6b5e4f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  verificationNotice: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    shadowColor: '#2c2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c2419',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#6b5e4f',
    lineHeight: 18,
  },
});

export default MockupSignedCertificate;
