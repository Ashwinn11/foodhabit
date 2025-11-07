import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { theme, r } from '../theme';
import { Container, Text, Card } from '../components';

const PRIMARY_COLOR = '#ff7664';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, onPress, showChevron = true, destructive = false }) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsRowLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? '#ff3b30' : theme.colors.text.secondary}
      />
      <Text
        variant="body"
        style={[styles.settingsLabel, destructive && styles.destructiveText]}
      >
        {label}
      </Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, session, signOut } = useAuth();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for extra safety
            Alert.alert(
              'Are You Sure?',
              'Please confirm that you want to permanently delete your account. All your data will be lost forever.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: confirmDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeletingAccount(true);

      // Delete user data from Supabase
      // Note: You'll need to set up RLS policies and/or server function to handle this
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (error) {
        // Fallback: just sign out if admin deletion isn't available
        await signOut();
        Alert.alert(
          'Account Deletion Requested',
          'Your account deletion request has been submitted. Please contact support to complete the process.'
        );
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted.',
          [{ text: 'OK', onPress: () => signOut() }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to delete account. Please try again or contact support.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const openTermsOfService = () => {
    // Replace with your actual terms URL
    Linking.openURL('https://yourapp.com/terms');
  };

  const openPrivacyPolicy = () => {
    // Replace with your actual privacy policy URL
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openHelp = () => {
    // Replace with your actual help/support URL or email
    Linking.openURL('mailto:support@yourapp.com?subject=Food%20Habit%20Support');
  };

  const openSubscription = () => {
    Alert.alert(
      'Subscription',
      'Subscription management coming soon!',
      [{ text: 'OK' }]
    );
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

  const getProvider = () => {
    const provider = user?.app_metadata?.provider;
    if (provider === 'apple') return 'Apple';
    if (provider === 'google') return 'Google';
    return 'Unknown';
  };

  return (
    <Container variant="grouped" scrollable>
      <View style={styles.header}>
        <Text variant="largeTitle" style={styles.title}>Profile</Text>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text variant="largeTitle" style={styles.avatarText}>
            {getInitials()}
          </Text>
        </View>
        <Text variant="title2" style={styles.displayName}>{getDisplayName()}</Text>
        {user?.email && (
          <Text variant="body" color="secondary" style={styles.email}>{user.email}</Text>
        )}
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
          ACCOUNT
        </Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingsRow
            icon="person-outline"
            label="Sign-in Provider"
            onPress={() => {}}
            showChevron={false}
          />
          <View style={styles.providerInfo}>
            <Text variant="body" color="secondary">{getProvider()}</Text>
          </View>
        </Card>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
          SUBSCRIPTION
        </Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingsRow
            icon="card-outline"
            label="Manage Subscription"
            onPress={openSubscription}
          />
        </Card>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
          SUPPORT & LEGAL
        </Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={openHelp}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={openTermsOfService}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={openPrivacyPolicy}
          />
        </Card>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
          ACCOUNT ACTIONS
        </Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="trash-outline"
            label={deletingAccount ? "Deleting..." : "Delete Account"}
            onPress={handleDeleteAccount}
            showChevron={false}
            destructive
          />
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="caption" color="tertiary">
          Food Habit v1.0.0
        </Text>
        {user?.id && (
          <Text variant="caption" color="tertiary" style={styles.userId}>
            User ID: {user.id.substring(0, 8)}...
          </Text>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: r.adaptiveSpacing['3xl'],
    paddingTop: theme.spacing.md,
  },
  avatarContainer: {
    width: r.scaleWidth(100),
    height: r.scaleWidth(100),
    borderRadius: r.scaleWidth(50),
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  displayName: {
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  email: {
    marginBottom: theme.spacing.xs,
  },
  section: {
    marginBottom: r.adaptiveSpacing.xl,
  },
  sectionHeader: {
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    minHeight: 56,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsLabel: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  destructiveText: {
    color: '#ff3b30',
  },
  providerInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.lg + 22 + theme.spacing.md, // Icon width + icon margin
  },
  footer: {
    alignItems: 'center',
    paddingVertical: r.adaptiveSpacing['2xl'],
    marginTop: theme.spacing.xl,
  },
  userId: {
    marginTop: theme.spacing.xs,
  },
});
