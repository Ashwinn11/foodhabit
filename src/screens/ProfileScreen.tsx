import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { BottomSheet } from '../components/BottomSheet';
import { Skeleton } from '../components/Skeleton';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import { useAppStore } from '../store/useAppStore';

const CONDITIONS = [
  'IBS-D', 'IBS-C', 'IBS-M', 'GERD', 'Celiac Disease', "Crohn's Disease",
  'Lactose Intolerant', 'SIBO', 'Gastroparesis', 'Just Bloating / Unsure',
];

const SYMPTOMS = [
  'Bloating', 'Gas', 'Cramping', 'Diarrhea', 'Constipation', 'Nausea',
  'Heartburn', 'Acid Reflux', 'Brain Fog', 'Fatigue', 'Urgency',
];

type EditSheet = 'condition' | 'symptoms' | 'triggers' | null;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const answers = useAppStore((s) => s.onboardingAnswers);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSheet, setEditSheet] = useState<EditSheet>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editConditions, setEditConditions] = useState<string[]>([]);
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);
  const [editTriggers, setEditTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState('');

  // Subscription
  const [subscription, setSubscription] = useState<{ plan: string; renewal: string } | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadSubscription();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', authUser.id)
          .maybeSingle();
        setUser({
          name: data?.full_name || authUser.email?.split('@')[0] || 'You',
          email: data?.email || authUser.email || '',
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      let Purchases: any;
      try { Purchases = require('react-native-purchases').default; } catch {}
      if (Purchases) {
        const info = await Purchases.getCustomerInfo();
        const activeEntitlement = Object.values(info.entitlements.active)[0] as any;
        if (activeEntitlement) {
          setSubscription({
            plan: activeEntitlement.productIdentifier?.includes('yearly') ? 'Pro Yearly' : 'Pro Monthly',
            renewal: activeEntitlement.expirationDate
              ? new Date(activeEntitlement.expirationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Active',
          });
        }
      }
    } catch {
      // silent
    } finally {
      setSubLoading(false);
    }
  };

  const openEditSheet = (type: EditSheet) => {
    if (type === 'condition') {
      setEditConditions(answers.condition?.split(', ').filter(Boolean) ?? []);
    } else if (type === 'symptoms') {
      setEditSymptoms(answers.symptoms ?? []);
    } else if (type === 'triggers') {
      setEditTriggers(answers.knownTriggers ?? []);
    }
    setEditSheet(type);
  };

  const saveEdit = async () => {
    const updates: any = {};
    if (editSheet === 'condition') updates.condition = editConditions.join(', ');
    if (editSheet === 'symptoms') updates.symptoms = editSymptoms;
    if (editSheet === 'triggers') updates.knownTriggers = editTriggers;

    updateOnboardingAnswers(updates);

    try {
      await authService.completeOnboarding({ ...answers, ...updates });
      showToast('Profile updated', 'success');
    } catch {
      showToast('Could not save changes', 'error');
    }

    setEditSheet(null);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out of GutBuddy?',
      "You'll need to sign in again to access your data.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await authService.signOut();
            } catch {
              showToast('Sign out failed. Try again.', 'error');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await authService.deleteAccount();
            } catch {
              showToast("Couldn't delete account. Please try again or contact support.", 'error');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const appVersion = Constants.expoConfig?.version ?? '1.0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="h3" style={styles.pageTitle}>My Profile</Text>

        {/* User section */}
        <Card variant="bordered" style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text variant="h2" color={theme.colors.primaryForeground}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              {loading ? (
                <>
                  <Skeleton width="60%" height={18} />
                  <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
                </>
              ) : (
                <>
                  <Text variant="h3">{user?.name}</Text>
                  <Text variant="body" color={theme.colors.textSecondary}>{user?.email}</Text>
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Health Profile */}
        <View style={styles.section}>
          <Text variant="label" color={theme.colors.textTertiary} style={styles.sectionTitle}>
            My Health Profile
          </Text>
          <Card variant="bordered" style={styles.listCard}>
            <ProfileRow
              label="My Condition"
              value={answers.condition || 'Not set'}
              onPress={() => openEditSheet('condition')}
            />
            <View style={styles.divider} />
            <ProfileRow
              label="My Symptoms"
              value={answers.symptoms?.join(', ') || 'Not set'}
              onPress={() => openEditSheet('symptoms')}
            />
            <View style={styles.divider} />
            <ProfileRow
              label="My Triggers"
              value={answers.knownTriggers?.join(', ') || 'None set'}
              onPress={() => openEditSheet('triggers')}
            />
          </Card>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text variant="label" color={theme.colors.textTertiary} style={styles.sectionTitle}>
            My Plan
          </Text>
          <Card variant="bordered" style={styles.listCard}>
            {subLoading ? (
              <View style={styles.rowPad}>
                <Skeleton height={16} width="50%" />
              </View>
            ) : subscription ? (
              <>
                <ProfileRow label="Plan" value={subscription.plan} />
                <View style={styles.divider} />
                <ProfileRow label="Renewal" value={subscription.renewal} />
                <View style={styles.divider} />
                <ProfileRow
                  label="Manage Subscription"
                  onPress={() =>
                    Linking.openURL('https://apps.apple.com/account/subscriptions')
                  }
                  showChevron
                />
              </>
            ) : (
              <ProfileRow label="Plan" value="No active subscription" />
            )}
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text variant="label" color={theme.colors.textTertiary} style={styles.sectionTitle}>
            Account
          </Text>
          <Card variant="bordered" style={styles.listCard}>
            <ProfileRow
              label="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
              showChevron
            />
            <View style={styles.divider} />
            <ProfileRow
              label="Terms of Service"
              onPress={() => Linking.openURL('https://gutbuddy.app/terms')}
              showChevron
            />
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowPad} onPress={handleDeleteAccount} disabled={deleting}>
              <Text
                variant="body"
                color={deleting ? theme.colors.textTertiary : theme.colors.danger}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowPad} onPress={handleSignOut} disabled={signingOut}>
              <Text
                variant="body"
                color={signingOut ? theme.colors.textTertiary : theme.colors.text}
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Version */}
        <Text variant="caption" color={theme.colors.textTertiary} align="center" style={styles.version}>
          GutBuddy v{appVersion}
        </Text>
      </ScrollView>

      {/* Edit Condition Sheet */}
      <BottomSheet visible={editSheet === 'condition'} onClose={() => setEditSheet(null)} snapHeight="65%">
        <View style={styles.editSheet}>
          <Text variant="h3">Edit Condition</Text>
          <ScrollView contentContainerStyle={styles.editChips}>
            {CONDITIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                variant="selectable"
                size="md"
                selected={editConditions.includes(c)}
                onPress={() =>
                  setEditConditions((prev) =>
                    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                  )
                }
              />
            ))}
          </ScrollView>
          <Button variant="primary" size="lg" onPress={saveEdit} fullWidth>Save</Button>
        </View>
      </BottomSheet>

      {/* Edit Symptoms Sheet */}
      <BottomSheet visible={editSheet === 'symptoms'} onClose={() => setEditSheet(null)} snapHeight="65%">
        <View style={styles.editSheet}>
          <Text variant="h3">Edit Symptoms</Text>
          <ScrollView contentContainerStyle={styles.editChips}>
            {SYMPTOMS.map((s) => (
              <Chip
                key={s}
                label={s}
                variant="selectable"
                size="md"
                selected={editSymptoms.includes(s)}
                onPress={() =>
                  setEditSymptoms((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                  )
                }
              />
            ))}
          </ScrollView>
          <Button variant="primary" size="lg" onPress={saveEdit} fullWidth>Save</Button>
        </View>
      </BottomSheet>

      {/* Edit Triggers Sheet */}
      <BottomSheet visible={editSheet === 'triggers'} onClose={() => setEditSheet(null)} snapHeight="65%">
        <View style={styles.editSheet}>
          <Text variant="h3">Edit Triggers</Text>
          <Input
            placeholder="Add a trigger food..."
            value={triggerInput}
            onChangeText={setTriggerInput}
            onSubmitEditing={() => {
              const t = triggerInput.trim();
              if (t && !editTriggers.includes(t)) {
                setEditTriggers((prev) => [...prev, t]);
              }
              setTriggerInput('');
            }}
            returnKeyType="done"
          />
          <ScrollView contentContainerStyle={styles.editChips}>
            {editTriggers.map((t) => (
              <Chip
                key={t}
                label={t}
                variant="dismissible"
                size="md"
                onDismiss={() => setEditTriggers((prev) => prev.filter((x) => x !== t))}
              />
            ))}
          </ScrollView>
          <Button variant="primary" size="lg" onPress={saveEdit} fullWidth>Save</Button>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const ProfileRow: React.FC<{
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}> = ({ label, value, onPress, showChevron }) => (
  <TouchableOpacity
    style={styles.rowPad}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <Text variant="body">{label}</Text>
    <View style={styles.rowRight}>
      {value && (
        <Text
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.rowValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {(onPress || showChevron) && (
        <Icon name="ChevronRight" size={16} color={theme.colors.textTertiary} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  pageTitle: {
    marginBottom: theme.spacing.xs,
  },
  userCard: {},
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.md,
  },
  rowPad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    minHeight: 52,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  rowValue: {
    maxWidth: 180,
    textAlign: 'right',
  },
  version: {
    paddingTop: theme.spacing.sm,
  },
  editSheet: {
    flex: 1,
    gap: theme.spacing.md,
  },
  editChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    flex: 1,
    alignContent: 'flex-start',
  },
});
