import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Gigi } from '../../components';
import { theme } from '../../theme';

interface ResultsStepProps {
  onComplete: () => void;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({ onComplete }) => {
  useEffect(() => {
    // Simulate calculation
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Gigi emotion="happy-clap" size="lg" />
        <Text variant="title2" style={styles.title}>
          Analyzing your gut profile...
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Building your personalized plan based on your unique needs.
        </Text>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} style={styles.loader} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.text.white,
  },
  subtitle: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
});
