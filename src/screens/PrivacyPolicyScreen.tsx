import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper, Typography, Card, IconContainer, BoxButton } from '../components';
import { colors, spacing } from '../theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <BoxButton 
          icon="chevron-back" 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          size={44}
          color={colors.blue}
        />
        <View style={styles.headerTitleContainer}>
          <Typography variant="h2">Privacy Policy</Typography>
          <Typography variant="bodySmall" color={colors.black + '66'}>
            Last updated: January 2026
          </Typography>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.iconSection}>
        <IconContainer
          name="shield-checkmark"
          size={56}
          iconSize={28}
          color={colors.pink}
          variant="solid"
          shadow={false}
        />
          </View>

          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Your Privacy Matters
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              Gut Buddy is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal health information.
            </Typography>
          </Card>
        </Animated.View>

        {/* Medical Disclaimer Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card variant="colored" color={colors.yellow} padding="lg" style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <IconContainer 
                name="warning" 
                size={24} 
                iconSize={16} 
                color={colors.black} 
                backgroundColor="transparent" 
                borderWidth={0} 
                shadow={false} 
              />
              <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.xs }}>
                MEDICAL DISCLAIMER
              </Typography>
            </View>
            <Typography variant="bodySmall" color={colors.black + 'CC'}>
              Gut Buddy is a tracking tool and does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>

          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              What We Collect
            </Typography>
            
            <Typography variant="bodyBold" style={{ marginTop: spacing.md }}>
              Health Data:
            </Typography>
            <Typography variant="body" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
              • Bowel movement logs (Bristol scale, symptoms, timestamps){'\n'}
              • Meal logs (food items, meal times){'\n'}
              • Water, fiber, probiotic, and exercise tracking{'\n'}
              • Health symptoms and medical tags
            </Typography>

            <Typography variant="bodyBold" style={{ marginTop: spacing.md }}>
              Account Data:
            </Typography>
            <Typography variant="body" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
              • Email address{'\n'}
              • Display name{'\n'}
              • Authentication credentials (securely managed by Supabase)
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              How We Use Your Data
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              • Provide personalized gut health insights{'\n'}
              • Calculate your Gut Health Score{'\n'}
              • Identify potential food triggers{'\n'}
              • Track your health patterns over time{'\n'}
              • Generate health reports for your doctor
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Storage & Security
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              • All data is stored locally on your device with encryption{'\n'}
              • Cloud backup via Supabase (optional){'\n'}
              • Your health data is never sold to third parties{'\n'}
              • We do not share your data with advertisers
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Your Rights
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              You have the right to access, export, and delete all your health data at any time from the Profile screen.
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Third-Party Services
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              We use Supabase for authentication and optional cloud backup:{'\n'}
              • Privacy Policy: supabase.com/privacy{'\n'}
              • Data: Email address, encrypted health logs (if backup enabled){'\n'}
              • Location: US-based servers{'\n'}
              • Purpose: Secure authentication and data sync across devices
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Data Retention
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              • Health logs: Retained until you delete them{'\n'}
              • Account data: Retained while your account is active{'\n'}
              • Deleted data: Permanently removed within 30 days{'\n'}
              • Backup data: Removed from cloud servers within 30 days of deletion
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Age Restrictions
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              You must be at least 13 years old to use Gut Buddy. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1100).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              International Privacy Laws
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              We comply with GDPR (EU), CCPA (California), and other applicable privacy laws. You have the right to:{'\n'}
              • Access your data{'\n'}
              • Correct inaccurate data{'\n'}
              • Request data deletion{'\n'}
              • Export your data{'\n'}
              • Withdraw consent{'\n'}
              • Lodge a complaint with supervisory authorities
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1200).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Data Breach Notification
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              In the unlikely event of a data breach affecting your personal information, we will notify you via email within 72 hours and provide details about the breach, affected data, and steps we're taking to address it.
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1300).springify()}>
          <Card variant="white" padding="lg" style={styles.section}>
            <Typography variant="h3" style={{ marginBottom: spacing.md }}>
              Contact Us
            </Typography>
            <Typography variant="body" color={colors.black + '99'}>
              If you have questions about this Privacy Policy or your data, please contact us at:
            </Typography>
            <Typography variant="bodyBold" color={colors.blue} style={{ marginTop: spacing.sm }}>
              privacy@gutbuddy.app
            </Typography>
          </Card>
        </Animated.View>

        <View style={styles.footer}>
          <Typography variant="bodyXS" color={colors.black} align="center">
            By using Gut Buddy, you agree to this Privacy Policy.
          </Typography>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingVertical: spacing['3xl'],
    opacity: 0.6,
  },
});
