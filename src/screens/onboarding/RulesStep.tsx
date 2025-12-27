import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
interface RulesStepProps {
  onComplete: () => void;
}

export const RulesStep: React.FC<RulesStepProps> = ({ onComplete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Gigi emotion="happy" size="md" />
        <Text variant="title2" style={styles.title}>House Rules</Text>
        <Text variant="body" style={styles.subtitle}>
          To get the best results, follow these simple habits.
        </Text>
      </View>

      <View style={styles.rulesList}>
        <RuleItem idx={1} text="Log every meal before you eat" />
        <RuleItem idx={2} text="Track symptoms daily" />
        <RuleItem idx={3} text="Check in with Gigi weekly" />
      </View>

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
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
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
  footer: {
    marginTop: theme.spacing['3xl'],
  },
});
