import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Container } from '../components';
import { theme } from '../theme';

export default function SupportScreen({ navigation }: any) {
  const SUPPORT_EMAIL = 'support@gutscan.app';

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=GutScan Support Inquiry`);
  };

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
          Support
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

        <View style={styles.intro}>
          <Text variant="body" style={styles.paragraph}>
            Welcome to GutScan Support! We're here to help you get the most out of your food analysis experience. If you can't find the answer you're looking for, contact us at support@gutscan.app.
          </Text>
        </View>

        <Section title="Frequently Asked Questions">

          <SubSection title="Getting Started">
            <QAItem 
              question="How do I create an account?"
              answer="Download the app from the App Store or Google Play, tap 'Sign Up', and follow the prompts to create your account with email and password."
            />
            <QAItem 
              question="Is GutScan free to use?"
              answer="Yes! We offer a free tier with limited daily scans. Upgrade to premium for unlimited scans and advanced features."
            />
          </SubSection>

          <SubSection title="Scanning Food">
            <QAItem 
              question="How does the food scanning work?"
              answer="Take a clear photo of your food using the camera in the app. Our AI analyzes the image to identify ingredients and assess gut health impact."
            />
            <QAItem 
              question="What types of food can I scan?"
              answer="You can scan any prepared meal, dish, or individual food items. For best results, ensure good lighting and clear focus on the food."
            />
            <QAItem 
              question="Why is my scan not working?"
              answer="Make sure you have a stable internet connection and the app has camera permissions. If issues persist, try restarting the app or updating to the latest version."
            />
          </SubSection>

          <SubSection title="Account & Data">
            <QAItem 
              question="How do I delete my account?"
              answer="Go to Profile > Account Settings > Delete Account. Your data will be permanently removed within 30 days."
            />
            <QAItem 
              question="Is my data secure?"
              answer="Yes, we use industry-standard encryption and store data on secure servers. Review our Privacy Policy for full details."
            />
          </SubSection>

          <SubSection title="Subscriptions">
            <QAItem 
              question="How do I cancel my subscription?"
              answer="Manage subscriptions through your App Store or Google Play account settings. Cancellations take effect at the end of the current billing period."
            />
            <QAItem 
              question="Can I get a refund?"
              answer="Refunds are handled by Apple or Google according to their policies. Contact their support for assistance."
            />
          </SubSection>

          <SubSection title="Technical Issues">
            <QAItem 
              question="The app is crashing. What should I do?"
              answer="Update to the latest version, restart your device, and ensure you have enough storage space. If the problem continues, email us with your device details."
            />
            <QAItem 
              question="How do I update the app?"
              answer="Check the App Store or Google Play for updates, or enable automatic updates in your device settings."
            />
          </SubSection>

          <SubSection title="Health & Medical">
            <QAItem 
              question="Is GutScan a medical device?"
              answer="No, GutScan provides educational insights only. Consult healthcare professionals for medical advice. See our Terms of Service for the full medical disclaimer."
            />
            <QAItem 
              question="Can GutScan diagnose conditions?"
              answer="No, our app cannot diagnose health conditions. It analyzes food for potential gut health impacts based on general nutritional knowledge."
            />
          </SubSection>

        </Section>

        <Section title="Contact Us">
          <Text variant="body" style={styles.paragraph}>
            Have a question not covered here? We'd love to hear from you!
          </Text>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color={theme.colors.text.white} />
            <Text variant="body" style={styles.contactText}>
              Email Support
            </Text>
          </TouchableOpacity>
          
          <Text variant="body" style={[styles.paragraph, styles.contactInfo]}>
            Email: support@gutscan.app
          </Text>
          <Text variant="body" style={[styles.paragraph, styles.contactInfo]}>
            Subject: Support Inquiry
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            Response Time: We aim to respond within 24-48 hours during business days.
          </Text>
        </Section>

        <Section title="App Information">
          <Text variant="body" style={styles.paragraph}>
            App Versions & Compatibility
          </Text>
          <Text variant="body" style={styles.paragraph}>
            GutScan is available for iOS 12+ and Android 8+. For the best experience, use the latest app version.
          </Text>
        </Section>

        <Section title="Feedback">
          <Text variant="body" style={styles.paragraph}>
            We value your feedback! Help us improve by rating the app in the store or sending suggestions to support@gutscan.app.
          </Text>
        </Section>

        <View style={styles.footer}>
          <Ionicons name="heart" size={32} color={theme.colors.brand.teal} style={styles.footerIcon} />
          <Text variant="caption1" style={styles.footerText}>
            Thank you for using GutScan. We're committed to helping you make informed food choices for better gut health!
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

function QAItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View style={styles.qaItem}>
      <Text variant="body" weight="semiBold" style={styles.question}>
        Q: {question}
      </Text>
      <Text variant="body" style={styles.answer}>
        A: {answer}
      </Text>
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
  qaItem: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.md,
  },
  question: {
    color: theme.colors.text.white,
    marginBottom: theme.spacing.sm,
  },
  answer: {
    color: theme.colors.text.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.teal,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  contactText: {
    color: theme.colors.text.white,
    fontWeight: '600',
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