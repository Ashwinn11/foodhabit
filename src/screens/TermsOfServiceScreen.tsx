import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Container } from '../components';
import { theme } from '../theme';

export default function TermsOfServiceScreen({ navigation }: any) {
  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.white} />
        </TouchableOpacity>
        <Text variant="title2" weight="bold" style={styles.headerTitle}>
          Terms of Service
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lastUpdated}>
          <Text variant="caption1" style={styles.lastUpdatedText}>
            Last Updated: December 29, 2025
          </Text>
        </View>

        <Section title="1. Acceptance of Terms">
          <Text variant="body" style={styles.paragraph}>
            By accessing and using GutScan ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the App.
          </Text>
        </Section>

        <Section title="2. Description of Service">
          <Text variant="body" style={styles.paragraph}>
            GutScan is a food analysis application that uses AI technology to analyze food images and provide gut health insights. The App provides:
          </Text>
          <BulletPoint text="AI-powered food recognition and analysis" />
          <BulletPoint text="Gut health scoring based on ingredients" />
          <BulletPoint text="Personalized dietary recommendations" />
          <BulletPoint text="Food sensitivity tracking" />
          <BulletPoint text="Health insights and progress tracking" />
        </Section>

        <Section title="3. User Accounts">
          <Text variant="body" style={styles.paragraph}>
            To use certain features of the App, you must create an account. You agree to:
          </Text>
          <BulletPoint text="Provide accurate and complete information" />
          <BulletPoint text="Maintain the security of your account credentials" />
          <BulletPoint text="Notify us immediately of any unauthorized access" />
          <BulletPoint text="Be responsible for all activities under your account" />
        </Section>

        <Section title="4. Medical Disclaimer">
          <Text variant="body" style={styles.paragraph}>
            <Text weight="bold" style={styles.important}>IMPORTANT: </Text>
            GutScan is not a medical device and does not provide medical advice. The information provided by the App is for educational and informational purposes only. You should:
          </Text>
          <BulletPoint text="Consult with qualified healthcare professionals for medical advice" />
          <BulletPoint text="Not use the App as a substitute for professional medical care" />
          <BulletPoint text="Seek immediate medical attention for serious health concerns" />
          <BulletPoint text="Verify all dietary recommendations with your healthcare provider" />
        </Section>

        <Section title="5. Subscription and Payments">
          <Text variant="body" style={styles.paragraph}>
            GutScan offers both free and premium subscription tiers:
          </Text>
          <BulletPoint text="Free tier includes limited daily scans" />
          <BulletPoint text="Premium subscriptions provide unlimited scans and advanced features" />
          <BulletPoint text="Subscriptions auto-renew unless cancelled 24 hours before renewal" />
          <BulletPoint text="Refunds are subject to Apple App Store or Google Play Store policies" />
          <BulletPoint text="We reserve the right to modify pricing with notice" />
        </Section>

        <Section title="6. User Content and Data">
          <Text variant="body" style={styles.paragraph}>
            When you upload photos or provide information to the App:
          </Text>
          <BulletPoint text="You retain ownership of your content" />
          <BulletPoint text="You grant us a license to process and analyze your data" />
          <BulletPoint text="We may use anonymized data to improve our services" />
          <BulletPoint text="You can delete your data at any time through account settings" />
        </Section>

        <Section title="7. Acceptable Use">
          <Text variant="body" style={styles.paragraph}>
            You agree not to:
          </Text>
          <BulletPoint text="Use the App for any illegal purposes" />
          <BulletPoint text="Attempt to reverse engineer or hack the App" />
          <BulletPoint text="Upload malicious content or spam" />
          <BulletPoint text="Violate any applicable laws or regulations" />
          <BulletPoint text="Interfere with other users' access to the App" />
        </Section>

        <Section title="8. Intellectual Property">
          <Text variant="body" style={styles.paragraph}>
            All content, features, and functionality of GutScan, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of GutScan and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </Section>

        <Section title="9. Limitation of Liability">
          <Text variant="body" style={styles.paragraph}>
            To the maximum extent permitted by law, GutScan shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the App, including but not limited to health outcomes, dietary decisions, or data loss.
          </Text>
        </Section>

        <Section title="10. Changes to Terms">
          <Text variant="body" style={styles.paragraph}>
            We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes via email or in-app notification. Continued use of the App after changes constitutes acceptance of the modified terms.
          </Text>
        </Section>

        <Section title="11. Termination">
          <Text variant="body" style={styles.paragraph}>
            We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the App will immediately cease.
          </Text>
        </Section>

        <Section title="12. Governing Law">
          <Text variant="body" style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which GutScan operates, without regard to its conflict of law provisions.
          </Text>
        </Section>

        <Section title="13. Contact Information">
          <Text variant="body" style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text variant="body" style={[styles.paragraph, styles.contactInfo]}>
            Email: support@gutscan.app
          </Text>
        </Section>

        <View style={styles.footer}>
          <Text variant="caption1" style={styles.footerText}>
            By using GutScan, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="headline" weight="bold" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletPoint}>
      <Text variant="body" style={styles.bullet}>•</Text>
      <Text variant="body" style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.text.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  lastUpdated: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  lastUpdatedText: {
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    color: theme.colors.brand.teal,
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    color: theme.colors.text.white,
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  important: {
    color: theme.colors.brand.coral,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  bullet: {
    color: theme.colors.brand.teal,
    marginRight: theme.spacing.sm,
    fontSize: 20,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    color: theme.colors.text.white,
    opacity: 0.9,
    lineHeight: 24,
  },
  contactInfo: {
    color: theme.colors.brand.teal,
    fontFamily: theme.fontFamily.medium,
  },
  footer: {
    marginTop: theme.spacing['2xl'],
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: theme.colors.text.white,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});
