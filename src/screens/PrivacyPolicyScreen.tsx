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

export default function PrivacyPolicyScreen({ navigation }: any) {
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
          Privacy Policy
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
            Last Updated: December 30, 2025
          </Text>
        </View>

        <View style={styles.intro}>
          <Text variant="body" style={styles.paragraph}>
            At GutScan, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <Section title="1. Information We Collect">
          <SubSection title="Personal Information">
            <Text variant="body" style={styles.paragraph}>
              When you create an account, we collect:
            </Text>
            <BulletPoint text="Email address" />
            <BulletPoint text="Name (optional)" />
            <BulletPoint text="Profile picture (optional)" />
            <BulletPoint text="Authentication credentials" />
          </SubSection>

          <SubSection title="Health and Dietary Information">
            <Text variant="body" style={styles.paragraph}>
              To provide personalized insights, we collect:
            </Text>
            <BulletPoint text="Food photos you upload" />
            <BulletPoint text="Dietary preferences and restrictions" />
            <BulletPoint text="Food sensitivities and triggers" />
            <BulletPoint text="Gut health goals" />
            <BulletPoint text="Scan history and results" />
          </SubSection>

          <SubSection title="Usage Data">
            <Text variant="body" style={styles.paragraph}>
              We automatically collect:
            </Text>
            <BulletPoint text="Device information (model, OS version)" />
            <BulletPoint text="App usage statistics" />
            <BulletPoint text="Crash reports and diagnostics" />
            <BulletPoint text="IP address and location data (if permitted)" />
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <Text variant="body" style={styles.paragraph}>
            We use the collected information to:
          </Text>
          <BulletPoint text="Provide and maintain our AI-powered food analysis service" />
          <BulletPoint text="Generate personalized gut health insights" />
          <BulletPoint text="Track your progress and maintain scan history" />
          <BulletPoint text="Send you notifications and reminders (if enabled)" />
          <BulletPoint text="Improve our AI models and app functionality" />
          <BulletPoint text="Provide customer support" />
          <BulletPoint text="Detect and prevent fraud or abuse" />
          <BulletPoint text="Comply with legal obligations" />
        </Section>

        <Section title="3. AI and Machine Learning">
          <View style={styles.aiDisclosureBox}>
            <Ionicons name="information-circle" size={24} color={theme.colors.brand.coral} style={{ marginBottom: theme.spacing.sm }} />
            <Text variant="body" weight="bold" style={[styles.paragraph, { color: theme.colors.brand.coral, marginBottom: theme.spacing.xs }]}>
              Important: Third-Party AI Processing
            </Text>
            <Text variant="body" style={styles.paragraph}>
              GutScan uses Google's Gemini AI, a third-party artificial intelligence service, to analyze your food images. By using our scanning feature, you explicitly consent to sharing your food photos with Google for AI processing.
            </Text>
          </View>
          
          <Text variant="body" style={styles.paragraph}>
            When you scan food with GutScan:
          </Text>
          <BulletPoint text="Your photos are transmitted to Google's Gemini AI services for real-time analysis" />
          <BulletPoint text="Google's AI analyzes images to identify ingredients, nutritional content, and potential gut health impacts" />
          <BulletPoint text="We receive analysis results but do not permanently store your original photos on our servers" />
          <BulletPoint text="Google may process your images according to their own privacy policy" />
          <BulletPoint text="You can withdraw consent by discontinuing use of the scanning feature" />
          
          <Text variant="body" style={[styles.paragraph, { marginTop: theme.spacing.md }]}>
            <Text weight="bold">Data Minimization: </Text>
            We only send food images to Google AI. We do not share your personal information, health history, or account details with the AI service.
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            <Text weight="bold">Anonymized Learning: </Text>
            We may use anonymized, aggregated scan data (without any identifying information) to improve our AI models and app functionality.
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            For more information about Google's AI data processing, please review{' '}
            <Text style={styles.contactInfo}>Google's Privacy Policy</Text>.
          </Text>
        </Section>

        <Section title="4. Data Storage and Security">
          <Text variant="body" style={styles.paragraph}>
            We implement industry-standard security measures:
          </Text>
          <BulletPoint text="Data is encrypted in transit using SSL/TLS" />
          <BulletPoint text="Passwords are hashed and never stored in plain text" />
          <BulletPoint text="Data is stored on secure Supabase servers" />
          <BulletPoint text="Regular security audits and updates" />
          <BulletPoint text="Access controls and authentication protocols" />
          <Text variant="body" style={[styles.paragraph, styles.securityNote]}>
            However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
          </Text>
        </Section>

        <Section title="5. Data Sharing and Disclosure">
          <Text variant="body" style={styles.paragraph}>
            We do not sell your personal information. We may share data with:
          </Text>
          
          <SubSection title="Service Providers">
            <BulletPoint text="Google (Gemini AI for food analysis)" />
            <BulletPoint text="Supabase (database and authentication)" />
            <BulletPoint text="Analytics providers (anonymized data only)" />
            <BulletPoint text="Payment processors (for subscriptions)" />
          </SubSection>

          <SubSection title="Legal Requirements">
            <Text variant="body" style={styles.paragraph}>
              We may disclose your information if required by law or to:
            </Text>
            <BulletPoint text="Comply with legal processes" />
            <BulletPoint text="Protect our rights and property" />
            <BulletPoint text="Prevent fraud or security issues" />
            <BulletPoint text="Protect user safety" />
          </SubSection>

          <SubSection title="Health Data Restrictions">
            <Text variant="body" style={styles.paragraph}>
              In compliance with Apple App Store guidelines, we strictly adhere to the following restrictions:
            </Text>
            <BulletPoint text="Health and dietary data is NEVER used for advertising or marketing purposes" />
            <BulletPoint text="Health data is NEVER disclosed to third parties for advertising or data mining" />
            <BulletPoint text="Health data is NOT stored in iCloud - only on secure Supabase servers" />
            <BulletPoint text="You maintain full control over your health data and can delete it at any time" />
            <BulletPoint text="No Protected Health Information (PHI) is included in push notifications" />
          </SubSection>
        </Section>

        <Section title="6. Your Privacy Rights">
          <Text variant="body" style={styles.paragraph}>
            You have the right to:
          </Text>
          <BulletPoint text="Access your personal data" />
          <BulletPoint text="Correct inaccurate information" />
          <BulletPoint text="Delete your account and data" />
          <BulletPoint text="Export your data" />
          <BulletPoint text="Opt-out of marketing communications" />
          <BulletPoint text="Withdraw consent for data processing" />
          <Text variant="body" style={styles.paragraph}>
            To exercise these rights, visit your Profile settings or contact us at support@gutscan.app.
          </Text>
        </Section>

        <Section title="7. Data Retention">
          <Text variant="body" style={styles.paragraph}>
            We retain your data for as long as your account is active or as needed to provide services. When you delete your account:
          </Text>
          <BulletPoint text="Personal data is permanently deleted within 30 days" />
          <BulletPoint text="Anonymized usage data may be retained for analytics" />
          <BulletPoint text="Legal or regulatory data may be retained as required" />
        </Section>

        <Section title="8. Children's Privacy">
          <Text variant="body" style={styles.paragraph}>
            GutScan is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
          </Text>
        </Section>

        <Section title="9. International Data Transfers">
          <Text variant="body" style={styles.paragraph}>
            Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </Text>
        </Section>

        <Section title="10. Cookies and Tracking">
          <Text variant="body" style={styles.paragraph}>
            We use cookies and similar technologies to:
          </Text>
          <BulletPoint text="Maintain your session" />
          <BulletPoint text="Remember your preferences" />
          <BulletPoint text="Analyze app usage" />
          <BulletPoint text="Improve user experience" />
          <Text variant="body" style={styles.paragraph}>
            You can control cookie preferences through your device settings.
          </Text>
        </Section>

        <Section title="11. Third-Party Links">
          <Text variant="body" style={styles.paragraph}>
            Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </Text>
        </Section>

        <Section title="12. Changes to This Policy">
          <Text variant="body" style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes via email or in-app notification. Your continued use of GutScan after changes constitutes acceptance of the updated policy.
          </Text>
        </Section>

        <Section title="13. Contact Us">
          <Text variant="body" style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy, please contact us:
          </Text>
          <Text variant="body" style={[styles.paragraph, styles.contactInfo]}>
            Email: support@gutscan.app
          </Text>
          <Text variant="body" style={[styles.paragraph, styles.contactInfo]}>
            Subject: Privacy Policy Inquiry
          </Text>
        </Section>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={32} color={theme.colors.brand.teal} style={styles.footerIcon} />
          <Text variant="caption1" style={styles.footerText}>
            Your privacy and data security are our top priorities. We are committed to protecting your information and being transparent about our practices.
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.subSection}>
      <Text variant="body" weight="semiBold" style={styles.subSectionTitle}>
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
  intro: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand.teal,
  },
  aiDisclosureBox: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.brand.coral,
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    color: theme.colors.brand.teal,
    marginBottom: theme.spacing.md,
  },
  subSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  subSectionTitle: {
    color: theme.colors.text.white,
    opacity: 0.95,
    marginBottom: theme.spacing.sm,
  },
  paragraph: {
    color: theme.colors.text.white,
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  securityNote: {
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
    opacity: 0.7,
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
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerIcon: {
    marginBottom: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.text.white,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});
