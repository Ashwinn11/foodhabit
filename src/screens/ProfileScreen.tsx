import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

const conditionLabel = (c: string) => {
  if (c === 'ibs_d')    return 'IBS-D (Diarrhea)';
  if (c === 'ibs_c')    return 'IBS-C (Constipation)';
  if (c === 'bloating') return 'Bloating & Gas';
  return 'Gut Sensitivity';
};

export const ProfileScreen = () => {
  const { onboardingAnswers } = useAppStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setDisplayName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] || ''
      );
      setEmail(user.email ?? '');
    });
  }, []);

  return (
    <Screen padding={true}>
      <Text variant="title" style={styles.title}>Profile</Text>

      {/* User card — per plan: name + condition */}
      <Card elevated style={styles.card}>
        <View style={styles.row}>
          <Text variant="caption" style={styles.label}>Name</Text>
          <Text variant="body" style={styles.value}>{displayName || '—'}</Text>
        </View>
        {!!email && (
          <View style={styles.row}>
            <Text variant="caption" style={styles.label}>Email</Text>
            <Text variant="body" style={styles.value}>{email}</Text>
          </View>
        )}
        <View style={[styles.row, styles.lastRow]}>
          <Text variant="caption" style={styles.label}>Condition</Text>
          <Text variant="body" style={styles.value}>{conditionLabel(onboardingAnswers.condition)}</Text>
        </View>
      </Card>

      {/* Subscription card */}
      <Card elevated style={styles.card}>
        <View style={[styles.row, styles.lastRow]}>
          <Text variant="caption" style={styles.label}>Subscription</Text>
          <Text variant="body" style={[styles.value, { color: theme.colors.lime }]}>Pro (Active)</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Button label="Sign Out" onPress={() => authService.signOut()} variant="ghost" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxxl },
  card: {
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastRow: { borderBottomWidth: 0 },
  label: { width: 100, color: theme.colors.textSecondary },
  value: { flex: 1, color: theme.colors.textPrimary },
  footer: { marginTop: 'auto', paddingBottom: theme.spacing.sm },
});
