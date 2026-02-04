import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper, Typography, Card, IconContainer, BoxButton } from '../components';
import { colors, spacing } from '../theme';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <Card variant="white" padding="lg" style={styles.section}>
    <Typography variant="bodyBold" style={{ marginBottom: spacing.xs }}>
      {question}
    </Typography>
    <Typography variant="bodySmall" color={colors.black + '99'}>
      {answer}
    </Typography>
  </Card>
);

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gutbuddy.app');
  };

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
          <Typography variant="h2">Help & Support</Typography>
          <Typography variant="bodySmall" color={colors.black + '66'}>
            We're here to help you!
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
          name="chatbubbles"
          size={56}
          iconSize={28}
          color={colors.blue}
          variant="solid"
          shadow={false}
        />
          </View>

          <Typography variant="h3" style={{ marginBottom: spacing.md, marginLeft: spacing.xs }}>
            Frequently Asked Questions
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <FAQItem 
            question="How is my Gut Health Score calculated?" 
            answer="Your score is based on the Bristol Stool Scale, symptom frequency, regularity of logs, and the absence of medical red flags (like blood or mucus)." 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <FAQItem 
            question="How does trigger detection work?" 
            answer="Our algorithm analyzes what you eat 2-24 hours before you log symptoms or unhealthy stool types. It weights recent meals higher to identify peak suspects." 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <FAQItem 
            question="Is my data shared with anyone?" 
            answer="No. All your health data is stored securely and is never sold to third parties or shared with advertisers. You have full control over your data." 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card variant="colored" color={colors.pink} padding="lg" style={styles.contactCard}>
            <Typography variant="h3" color={colors.pink} style={{ marginBottom: spacing.sm }}>
              Still have questions?
            </Typography>
            <Typography variant="body" color={colors.pink} style={{ marginBottom: spacing.lg }}>
              Our team is happy to help with any technical issues or feedback!
            </Typography>
            <Pressable style={styles.emailButton} onPress={handleEmailSupport}>
              <Typography variant="bodyBold" color={colors.white}>Email Support</Typography>
            </Pressable>
          </Card>
        </Animated.View>

        <View style={styles.footer}>
          <Typography variant="bodyXS" color={colors.black} align="center">
            Gut Buddy v1.0.0
          </Typography>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contactCard: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing['4xl'],
    paddingHorizontal: spacing.lg,
  },
  emailButton: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: 12,
    elevation: 4,
    paddingVertical: spacing.md,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  footer: {
    opacity: 0.6,
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xl,
  },
  section: {
    marginBottom: spacing.sm,
  },
});
