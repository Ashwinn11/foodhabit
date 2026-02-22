import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../config/supabase';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const HomeScreen = ({ navigation }: any) => {
  const { onboardingAnswers } = useAppStore();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const full =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] || '';
        setFirstName(full.split(' ')[0]);
      }
    });
  }, []);

  const avoids = onboardingAnswers.knownTriggers?.length > 0
    ? onboardingAnswers.knownTriggers
    : ['garlic', 'dairy'];

  const safePicks = ['Rice', 'Chicken', 'Oatmeal'];

  return (
    <Screen padding={true} scroll={true}>
      {/* Greeting */}
      <Text variant="title" style={styles.greeting}>
        {getGreeting()}{firstName ? `, ${firstName}` : ''}
      </Text>

      {/* Avoid Today */}
      <View style={styles.section}>
        <Text variant="caption" style={styles.sectionLabel}>AVOID TODAY</Text>
        <View style={styles.chipRow}>
          {avoids.map((item: string, i: number) => (
            <Chip
              key={i}
              status="risky"
              label={item.charAt(0).toUpperCase() + item.slice(1)}
              icon={<Icon name="risky" size={14} />}
            />
          ))}
        </View>
      </View>

      {/* Safe Choices */}
      <View style={styles.section}>
        <Text variant="caption" style={styles.sectionLabel}>SAFE CHOICES</Text>
        <View style={styles.chipRow}>
          {safePicks.map((item, i) => (
            <Chip
              key={i}
              status="safe"
              label={item}
              icon={<Icon name="safe" size={14} />}
            />
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="SCAN FOOD"
          onPress={() => navigation.navigate('ScanFood')}
          variant="primary"
          leftIcon={<Icon name="camera" size={20} />}
        />
        <TouchableOpacity style={styles.logLink} onPress={() => navigation.navigate('MyGut')}>
          <Text variant="label" style={styles.logLinkText}>Log How I Feel →</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  greeting: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.giant,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  sectionLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  logLink: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  logLinkText: { color: theme.colors.coral },
});
