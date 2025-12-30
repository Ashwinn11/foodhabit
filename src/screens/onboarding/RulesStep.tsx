import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from '../../components';
import { HappyBalloon } from '../../components/mascots';
import { theme } from '../../theme';
interface RulesStepProps {
  onComplete: () => void;
}

export const RulesStep: React.FC<RulesStepProps> = ({ onComplete }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.mascotContainer}>
            <HappyBalloon size={200} />
          </View>
          <Text variant="title2" style={styles.title}>Let's Make This Work! 🎯</Text>
          <Text variant="body" style={styles.subtitle}>
            A few easy habits to help you feel your absolute best!
          </Text>
        </View>

        <View style={styles.rulesList}>
          <RuleItem idx={1} text="Scan your meals to see how they score 📸" />
          <RuleItem idx={2} text="Notice how different foods make you feel 💭" />
          <RuleItem idx={3} text="Keep your streak going - you got this! 🔥" />
        </View>

        {/* Medical Disclaimer - Required by Apple Guidelines 1.4.1 */}
        <View style={styles.disclaimerContainer}>
          <Text variant="caption2" style={styles.disclaimerText}>
            ⚕️ Medical Disclaimer: GutScan provides educational insights only and is not a medical device. Always consult with a qualified healthcare provider before making dietary changes or if you have health concerns.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="I'm Ready!" 
          onPress={onComplete} 
          variant="primary" 
          size="large" 
          fullWidth 
        />
      </View>
    </View>
  );
};

const RuleItem = ({ idx, text }: { idx: number; text: string }) => (
  <View style={styles.ruleItem}>
    <View style={styles.numberContainer}>
      <Text variant="headline" style={styles.number}>{idx}</Text>
    </View>
    <Text variant="body" style={styles.ruleText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
    overflow: 'visible',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    height: 120,
    overflow: 'visible',
  },
  title: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text.white,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  rulesList: {
    gap: theme.spacing.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  number: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ruleText: {
    color: theme.colors.text.white,
    flex: 1,
  },
  disclaimerContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 100, 0.3)',
  },
  disclaimerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
});
