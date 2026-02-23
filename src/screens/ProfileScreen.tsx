import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Purchases from 'react-native-purchases';
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

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export const ProfileScreen = () => {
  const { onboardingAnswers } = useAppStore();
  const [displayName, setDisplayName]   = useState('');
  const [email, setEmail]               = useState('');
  const [isDeleting, setIsDeleting]     = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
    } catch (e: any) {
      setIsDeleting(false);
      Alert.alert('Error', e?.message || 'Failed to delete account. Please try again.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const triggers = onboardingAnswers?.knownTriggers || [];
  const initials = getInitials(displayName);

  return (
    <Screen padding={false} scroll>
      <View style={styles.header}>
        <Text variant="display">Profile.</Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Manage your account and gut health profile.
        </Text>
      </View>

      <View style={styles.content}>
        {/* ── Avatar Section ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text variant="title" color={theme.colors.secondary}>{initials}</Text>
          </View>
          <View>
            {!!displayName && (
              <Text variant="subtitle" weight="bold">{displayName}</Text>
            )}
            {!!email && (
              <Text variant="bodySmall" color={theme.colors.text.tertiary}>{email}</Text>
            )}
          </View>
        </View>

        {/* ── Profile Stats Card ── */}
        <Card variant="glass" padding="xl" style={styles.card} glow>
          <View style={styles.row}>
            <Text variant="label" color={theme.colors.text.tertiary}>Condition</Text>
            <Text variant="body" weight="medium">
              {conditionLabel(onboardingAnswers?.condition || '')}
            </Text>
          </View>
          <View style={[styles.row, styles.lastRow]}>
            <Text variant="label" color={theme.colors.text.tertiary}>Triggers</Text>
            <Text variant="body" weight="medium">
              {triggers.length} identified
            </Text>
          </View>
        </Card>

        {/* ── Subscription Card ── */}
        <Card variant="surface" padding="lg" style={styles.card}>
          <View style={styles.proHeader}>
            <View style={styles.proTitleRow}>
              <View style={styles.proDot} />
              <Text variant="body" weight="bold">Pro Access Active</Text>
            </View>
            <TouchableOpacity onPress={() => Purchases.showManageSubscriptions()}>
              <Text variant="label" color={theme.colors.secondary}>Manage →</Text>
            </TouchableOpacity>
          </View>
          <Text variant="bodySmall" color={theme.colors.text.tertiary} style={{ marginTop: 4 }}>
            Enjoy unlimited scans and deep gut health insights.
          </Text>
        </Card>

        {/* ── Legal & About ── */}
        <View style={styles.legalSection}>
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.app/terms')} style={styles.legalLinkRow}>
            <Text variant="label" color={theme.colors.text.tertiary}>Terms of Service</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.app/privacy')} style={styles.legalLinkRow}>
            <Text variant="label" color={theme.colors.text.tertiary}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <Button
            label="Sign Out"
            variant="ghost"
            onPress={() => authService.signOut()}
            style={styles.signOutBtn}
          />
          <Button
            label={isDeleting ? 'Deleting…' : 'Delete Account Permanently'}
            variant="danger"
            onPress={confirmDelete}
            disabled={isDeleting}
            loading={isDeleting}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.xl, // Reduced from giant
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.colossal,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.giant,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.secondary + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.secondary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  proDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  legalSection: {
    marginTop: theme.spacing.giant,
    marginBottom: theme.spacing.giant,
    backgroundColor: theme.colors.surfaceElevated + '30',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  legalLinkRow: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
    signOutBtn: {
      borderColor: theme.colors.divider,
    },
  });
  