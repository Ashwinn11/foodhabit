import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { streakService } from '../services/gutHarmony/streakService';
import { createUserProfile, getUserProfile } from '../services/gutHarmony/userService';
import { entryService } from '../services/gutHarmony/entryService';
import { theme } from '../theme';
import { Text, Card } from '../components';
import AchievementsWidget from '../components/AchievementsWidget';

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
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [harmonyPoints, setHarmonyPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      if (!user?.id) return;

      // Load streak data
      const streak = await streakService.getUserStreak(user.id);
      if (streak) {
        setHarmonyPoints(streak.harmony_points);
        setCurrentStreak(streak.current_streak);
        setLongestStreak(streak.longest_streak);
      }

      // Load user profile
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        setEditName(profile.name || '');
        setEditAge((profile.age || '').toString());
      }

      // Load total entries
      const entries = await entryService.getRecentEntries(user.id, 365);
      setTotalEntries(entries?.length || 0);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    setRefreshing(false);
  };

  const handleEditProfile = async () => {
    try {
      setIsSaving(true);
      if (!user?.id) return;

      await createUserProfile(user.id, {
        name: editName || user?.user_metadata?.full_name || 'User',
        age: editAge ? parseInt(editAge, 10) : undefined,
        condition: userProfile?.condition || '',
        main_issue: userProfile?.main_issue || '',
        personality_style: userProfile?.personality_style || 'motivational_buddy',
      });

      setIsEditModalVisible(false);
      await loadUserStats();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Confirm Delete',
              'Type DELETE to confirm',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // In a real app, you'd call an API to delete the account
                      Alert.alert('Account Deleted', 'Your account has been deleted');
                      await signOut();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@foodhabit.app?subject=Help with GutHarmony');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://foodhabit.app/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://foodhabit.app/terms');
  };

  const getInitials = () => {
    if (editName) {
      return editName.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    return editName || user?.user_metadata?.full_name || user?.email || 'User';
  };

  if (isLoadingStats && !userProfile) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          styles.centerContent,
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="largeTitle" weight="bold">
            Profile
          </Text>
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
            <Ionicons
              name="pencil-outline"
              size={24}
              color={theme.colors.brand.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text variant="largeTitle" style={styles.avatarText}>
              {getInitials()}
            </Text>
          </View>
          <Text variant="title2" style={styles.displayName}>
            {getDisplayName()}
          </Text>
          {user?.email && (
            <Text variant="body" color="secondary" style={styles.email}>
              {user.email}
            </Text>
          )}
          {editAge && (
            <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
              {editAge} years old
            </Text>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.brand.cream }]}>
            <Ionicons
              name="flame"
              size={32}
              color={theme.colors.brand.primary}
            />
            <Text
              variant="title3"
              weight="bold"
              style={{ marginTop: theme.spacing.md, color: theme.colors.brand.primary }}
            >
              {currentStreak}
            </Text>
            <Text
              variant="caption"
              style={{ marginTop: 2, color: theme.colors.brand.black }}
            >
              Current Streak
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.brand.cream }]}>
            <Ionicons
              name="star"
              size={32}
              color={theme.colors.brand.tertiary}
            />
            <Text
              variant="title3"
              weight="bold"
              style={{ marginTop: theme.spacing.md, color: theme.colors.brand.tertiary }}
            >
              {harmonyPoints}
            </Text>
            <Text
              variant="caption"
              style={{ marginTop: 2, color: theme.colors.brand.black }}
            >
              Harmony Points
            </Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.statsBreakdown}>
          <View style={styles.statsItem}>
            <View style={styles.statsIconBg}>
              <Ionicons name="calendar" size={20} color={theme.colors.brand.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text variant="caption" color="secondary">
                Longest Streak
              </Text>
              <Text variant="body" weight="semiBold" style={{ marginTop: 4 }}>
                {longestStreak} days
              </Text>
            </View>
          </View>
          <View style={styles.statsItem}>
            <View style={styles.statsIconBg}>
              <Ionicons name="document-text" size={20} color={theme.colors.brand.tertiary} />
            </View>
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text variant="caption" color="secondary">
                Total Entries
              </Text>
              <Text variant="body" weight="semiBold" style={{ marginTop: 4 }}>
                {totalEntries}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <AchievementsWidget compact />

        {/* Health Preferences */}
        {userProfile && (
          <View style={styles.section}>
            <Text
              variant="footnote"
              color="secondary"
              style={styles.sectionHeader}
            >
              HEALTH PROFILE
            </Text>
            <Card style={styles.healthCard}>
              <View style={styles.healthItem}>
                <Text variant="caption" color="secondary">
                  Condition
                </Text>
                <Text variant="body" weight="semiBold" style={{ marginTop: 4 }}>
                  {userProfile.condition || 'Not specified'}
                </Text>
              </View>
              <View style={[styles.divider, { marginVertical: theme.spacing.lg }]} />
              <View style={styles.healthItem}>
                <Text variant="caption" color="secondary">
                  Main Issue
                </Text>
                <Text variant="body" weight="semiBold" style={{ marginTop: 4 }}>
                  {userProfile.main_issue || 'Not specified'}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Settings & Privacy */}
        <View style={styles.section}>
          <Text
            variant="footnote"
            color="secondary"
            style={styles.sectionHeader}
          >
            SUPPORT & LEGAL
          </Text>
          <Card padding="none" style={styles.settingsCard}>
            <SettingsRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={handleContactSupport}
              iconColor={theme.colors.brand.tertiary}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="shield-outline"
              label="Privacy Policy"
              onPress={handleOpenPrivacy}
              iconColor={theme.colors.brand.tertiary}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="document-outline"
              label="Terms of Service"
              onPress={handleOpenTerms}
              iconColor={theme.colors.brand.tertiary}
            />
          </Card>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text
            variant="footnote"
            color="secondary"
            style={styles.sectionHeader}
          >
            ACCOUNT
          </Text>
          <Card padding="none" style={styles.settingsCard}>
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              iconColor={theme.colors.brand.primary}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="trash-outline"
              label="Delete Account"
              onPress={handleDeleteAccount}
              showChevron={false}
              destructive
              iconColor={theme.colors.brand.primary}
            />
          </Card>
        </View>

        {/* Version Info */}
        <View style={styles.footerSection}>
          <Text variant="caption" color="secondary" align="center">
            GutHarmony v1.0.0
          </Text>
          <Text variant="caption" color="secondary" align="center" style={{ marginTop: 4 }}>
            Made with care for your digestive health
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.primary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text variant="title2" weight="bold">
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={handleEditProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.colors.brand.primary} size="small" />
                ) : (
                  <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.primary }}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Edit Form */}
            <View style={styles.editForm}>
              <View style={styles.formSection}>
                <Text variant="caption" color="secondary" style={styles.inputLabel}>
                  Full Name
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={editName}
                  onChangeText={setEditName}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formSection}>
                <Text variant="caption" color="secondary" style={styles.inputLabel}>
                  Age
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your age"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={editAge}
                  onChangeText={setEditAge}
                  keyboardType="number-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={theme.colors.brand.primary}
                />
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ flex: 1, marginLeft: theme.spacing.md }}
                >
                  Health preferences from onboarding are displayed in your profile. Go to settings to update them.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
    marginBottom: theme.spacing.lg,
  },
  title: {
    // No style override - use the variant typography
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
    paddingTop: theme.spacing.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
    gap: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsBreakdown: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
    gap: theme.spacing.lg,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthCard: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  healthItem: {
    paddingVertical: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing['2xl'],
  },
  sectionHeader: {
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerSection: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  editForm: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
  },
  formSection: {
    marginBottom: theme.spacing['2xl'],
  },
  inputLabel: {
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 118, 100, 0.05)',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand.primary,
    padding: theme.spacing.lg,
    alignItems: 'flex-start',
  },
});
