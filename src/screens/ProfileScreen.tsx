import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';
import { theme } from '../theme';
import { Text } from '../components';
import Avatar from '../components/Avatar';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => await signOut(),
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Your account will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              const result = await deleteAccount();

              if (result.success) {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been permanently deleted.'
                );
              } else {
                Alert.alert(
                  'Error',
                  `Failed to delete account: ${result.error}`
                );
              }
            } catch (error) {
              console.error('Account deletion error:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred while deleting your account. Please try again or contact support.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Avatar 
            name={getDisplayName()} 
            size={100} 
          />
          <Text variant="largeTitle" weight="bold" style={styles.name}>
            {getDisplayName()}
          </Text>
          {user?.email && (
            <Text variant="body" color="secondary" style={styles.email}>
              {user.email}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text variant="body" weight="semiBold" style={{ color: theme.colors.text.primary }}>
              Sign Out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.primary }}>
              {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionInfo}>
          <Text variant="caption" color="secondary" align="center">
            GutHarmony v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['3xl'],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  name: {
    marginTop: theme.spacing.lg,
  },
  email: {
    marginTop: theme.spacing.xs,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  signOutButton: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
  },
  versionInfo: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
});
