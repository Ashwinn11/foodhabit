import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly to us, including your health profile (conditions, symptoms, trigger foods), meal logs, and gut health journal entries. We also collect authentication information when you sign in with Apple or Google.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use your health information solely to provide personalized gut health insights and food safety recommendations. Your data is never sold to third parties. We use anonymized, aggregated data to improve our AI food analysis.`,
  },
  {
    title: 'Data Storage and Security',
    body: `Your data is stored securely on Supabase infrastructure with industry-standard encryption. We use row-level security to ensure only you can access your personal health data.`,
  },
  {
    title: 'Health Data',
    body: `GutBuddy collects sensitive health information including digestive symptoms and conditions. This data is used exclusively to provide personalized recommendations and is never shared with third parties, advertisers, or insurance companies.`,
  },
  {
    title: 'Account Deletion',
    body: `You can delete your account and all associated data at any time from the Profile screen. Account deletion is permanent and irreversible. All your meals, gut logs, and health profile data will be permanently removed.`,
  },
  {
    title: 'Third-Party Services',
    body: `We use the following third-party services: Supabase (database and authentication), RevenueCat (subscription management), and OpenAI (food analysis AI). Each service has their own privacy policy governing their data practices.`,
  },
  {
    title: 'Contact Us',
    body: `If you have questions about this Privacy Policy or your data, please contact us at privacy@gutbuddy.app`,
  },
];

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Icon name="ChevronLeft" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text variant="h3">Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" color={theme.colors.textTertiary} style={styles.updated}>
          Last updated: January 2026
        </Text>

        <Text variant="body" color={theme.colors.textSecondary} style={styles.intro}>
          GutBuddy ("we", "our", or "us") is committed to protecting your privacy. This policy
          explains how we collect, use, and protect your personal and health information.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text variant="h3">{section.title}</Text>
            <Text variant="body" color={theme.colors.textSecondary} style={styles.sectionBody}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },
  updated: {
    marginBottom: theme.spacing.xs,
  },
  intro: {
    lineHeight: 24,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionBody: {
    lineHeight: 24,
  },
});
