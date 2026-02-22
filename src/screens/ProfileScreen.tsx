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
    <Screen padding scroll>

      {/* ── Avatar + Name + Email Header ── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text variant="title" style={styles.avatarInitials}>{initials}</Text>
        </View>
        {!!displayName && (
          <Text variant="body" style={styles.displayName}>{displayName}</Text>
        )}
        {!!email && (
          <Text style={styles.emailText}>{email}</Text>
        )}
      </View>

      {/* ── Profile Card ── */}
      <Card elevated style={styles.card}>
        <View style={styles.row}>
          <Text variant="caption" style={styles.rowLabel}>Condition</Text>
          <Text variant="body" style={styles.rowValue}>
            {conditionLabel(onboardingAnswers?.condition || '')}
          </Text>
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <Text variant="caption" style={styles.rowLabel}>Triggers</Text>
          <Text variant="body" style={styles.rowValue}>
            {triggers.length} identified
          </Text>
        </View>
      </Card>

      {/* ── Subscription Card ── */}
      <Card elevated style={styles.card}>
        <View style={[styles.row, styles.lastRow]}>
          <View style={styles.proRow}>
            <View style={styles.proDot} />
            <Text variant="label" style={styles.proLabel}>Pro · Active</Text>
          </View>
          <TouchableOpacity
            onPress={() => Purchases.showManageSubscriptions()}
            activeOpacity={0.7}
          >
            <Text variant="label" style={styles.manageLink}>Manage →</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ── Legal Links ── */}
      <View style={styles.legalRow}>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://gutbuddy.app/terms')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>Terms of Use</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}> · </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://gutbuddy.app/privacy')}
          activeOpacity={0.7}
        >
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Actions ── */}
      <View style={styles.actions}>
        <Button
          label="Sign Out"
          variant="ghost"
          onPress={() => authService.signOut()}
        />
        <Button
          label={isDeleting ? 'Deleting…' : 'Delete Account'}
          variant="danger"
          onPress={confirmDelete}
          disabled={isDeleting}
          loading={isDeleting}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Avatar header
  avatarSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xxxl,
    marginBottom: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(224,93,76,0.12)',
    borderWidth: 1.5,
    borderColor: theme.colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarInitials: {
    color: theme.colors.coral,
    lineHeight: undefined,
  },
  displayName: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emailText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },

  // Cards
  card: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.radii.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    color: theme.colors.textSecondary,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },

  // Subscription row
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  proDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.lime,
  },
  proLabel: {
    color: theme.colors.textPrimary,
  },
  manageLink: {
    color: theme.colors.coral,
  },

  // Legal
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.sm,
  },
  legalLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'none',
    letterSpacing: 0,
  },
  legalDot: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  // Bottom actions
  actions: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
});
