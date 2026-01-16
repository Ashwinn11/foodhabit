import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper, Typography, Card, IconContainer, BoxButton } from '../components';
import { colors, spacing } from '../theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <BoxButton 
          icon="chevron-back" 
          onPress={() => navigation.goBack()}
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
              size={64}
              iconSize={36}
              color={colors.pink}
              backgroundColor={colors.pink + '15'}
              borderWidth={0}
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
