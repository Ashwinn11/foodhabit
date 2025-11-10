import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text, Card } from '../components';
import { EditMyBodyModal } from '../components/modals/EditMyBodyModal';
import { profileService } from '../services/profile/profileService';
import { UserProfile } from '../types/profile';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  iconColor?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  onPress,
  showChevron = true,
  destructive = false,
  iconColor = theme.colors.icon.primary
}) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsRowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.colors.brand.white}
        />
      </View>
      <Text
        variant="body"
        style={StyleSheet.flatten([
          styles.settingsLabel,
          ...(destructive ? [styles.destructiveText] : []),
        ])}
      >
        {label}
      </Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.primary} />
    )}
  </TouchableOpacity>
);


export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const profileData = await profileService.getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMyBodySave = async () => {
    // Reload profile data after save
    await loadProfileData();
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Account deletion feature coming soon. Please contact support if you need to delete your account immediately.',
      [{ text: 'OK' }]
    );
  };

  const openTermsOfService = () => {
    Linking.openURL('https://yourapp.com/terms');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openHelp = () => {
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

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        </View>
      </Container>
    );
  }

  return (
    <>
      <Container variant="grouped" scrollable>
        <View style={styles.header}>
          <Text variant="h6" color="secondary" style={styles.title}>Profile</Text>
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

        {/* My Body Data Section */}
        <View style={styles.section}>
          <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
            MY BODY DATA
          </Text>
          <Card variant="elevated" padding="none" style={styles.settingsCard}>
            <SettingsRow
              icon="body-outline"
              label="Edit My Body Data"
              onPress={() => setEditModalVisible(true)}
              showChevron={true}
              iconColor={theme.colors.brand.primary}
            />
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
            iconColor={theme.colors.icon.secondary}
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
            iconColor={theme.colors.icon.primary}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={openTermsOfService}
            iconColor={theme.colors.icon.tertiary}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={openPrivacyPolicy}
            iconColor={theme.colors.icon.tertiary}
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
            iconColor={theme.colors.icon.primary}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            showChevron={false}
            destructive
            iconColor={theme.colors.icon.primary}
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

      {/* Edit My Body Modal */}
      {profile && user?.id && (
        <EditMyBodyModal
          visible={editModalVisible}
          profile={profile}
          userId={user.id}
          onClose={() => setEditModalVisible(false)}
          onSave={handleEditMyBodySave}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    // No style override - use the variant typography
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: r.adaptiveSpacing['3xl'],
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
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  avatarText: {
    color: theme.colors.brand.white,
    ...theme.typography.button,
  },
  displayName: {
    marginBottom: theme.spacing.xs,
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
  // Settings Card Styles
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  destructiveText: {
    color: theme.colors.brand.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.main,
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
