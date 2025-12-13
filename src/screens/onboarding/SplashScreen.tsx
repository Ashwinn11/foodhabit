import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '../../components';
import { Button } from '../../components';
import { theme } from '../../theme';

interface SplashScreenProps {
  onContinue: () => void;
}

export default function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <View style={styles.container}>
      {/* Gutto Mascot - using emoji for now */}
      <View style={styles.mascotContainer}>
        <Text variant="h1" style={styles.mascot}>
          💛
        </Text>
      </View>

      {/* App Title */}
      <Text variant="h1" style={styles.title}>
        Gut Harmony
      </Text>

      {/* Subtitle */}
      <Text variant="body" style={styles.subtitle} color="secondary">
        Track Your Digestive Health
      </Text>

      {/* Promise Statement */}
      <View style={styles.promiseBox}>
        <Text variant="h4" style={styles.promiseTitle}>
          Meet Your Gut Buddy!
        </Text>
        <Text variant="body" style={styles.promiseText}>
          "Hey! I'm Gutto 👋 Ready to feel amazing?"
        </Text>
      </View>

      {/* CTA Button */}
      <Button
        title="Let's Get Started"
        onPress={onContinue}
        variant="primary"
        size="large"
        fullWidth
        style={styles.button}
      />

      {/* Footer */}
      <Text variant="caption" style={styles.footer} color="secondary">
        By continuing, you agree to our Terms of Service
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  mascotContainer: {
    marginBottom: theme.spacing.xl,
  },
  mascot: {
    fontSize: 80,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  promiseBox: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.primary,
  },
  promiseTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  promiseText: {
    color: theme.colors.text.secondary,
  },
  button: {
    marginBottom: theme.spacing.lg,
  },
  footer: {
    textAlign: 'center',
  },
});
