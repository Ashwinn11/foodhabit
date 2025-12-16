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
import { deleteAccount } from '../services/accountService';
import { theme } from '../theme';
import { Text, Card, IconButton, ListItem, Divider, InfoRow } from '../components';
import Avatar from '../components/Avatar';
import AchievementsWidget from '../components/AchievementsWidget';
import TabBar from '../components/TabBar';
import StatCard from '../components/StatCard';

type TabType = 'overview' | 'health' | 'settings';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [harmonyPoints, setHarmonyPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      if (!user?.id) return;

      const streak = await streakService.getUserStreak(user.id);
      if (streak) {
        setHarmonyPoints(streak.harmony_points);
        setCurrentStreak(streak.current_streak);
      }

      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        setEditName(profile.name || '');
        setEditAge((profile.age || '').toString());
      }

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
      'This action cannot be undone. All your data including:\n• Profile information\n• Health entries and logs\n• Achievements and streaks\n• Food triggers and analysis\n\nwill be permanently deleted. Are you absolutely sure?',
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
                  `Your account and all associated data (${result.deletedRecords} records) have been permanently deleted.`
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
    return editName || user?.user_metadata?.full_name || user?.email || 'User';
  };

  if (isLoadingStats && !userProfile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="largeTitle" weight="bold">Profile</Text>
        <IconButton
          icon="pencil-outline"
          onPress={() => setIsEditModalVisible(true)}
          color={theme.colors.brand.primary}
        />
      </View>

      {/* Profile Header - Compact */}
      <View style={styles.profileHeaderCompact}>
        <Avatar name={userProfile?.name || user?.user_metadata?.full_name || 'user'} size={64} />
        <View style={{ flex: 1, marginLeft: theme.spacing.lg }}>
          <Text variant="title3" weight="bold">{getDisplayName()}</Text>
          {user?.email && (
            <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
              {user.email}
            </Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <TabBar
        tabs={['Overview', 'Health', 'Settings']}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brand.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Stats Grid - Compact */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="flame"
                iconColor={theme.colors.brand.primary}
                value={currentStreak}
                label="Streak"
              />
              <StatCard
                icon="star"
                iconColor={theme.colors.brand.tertiary}
                value={harmonyPoints}
                label="Points"
              />
              <StatCard
                icon="document-text"
                iconColor={theme.colors.brand.secondary}
                value={totalEntries}
                label="Entries"
              />
            </View>

            {/* Achievements - Compact */}
            <AchievementsWidget compact />
          </View>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <View>
            {/* Health Profile */}
            {userProfile && (
              <Card style={styles.compactCard}>
              <Text variant="body" weight="bold" style={{ marginBottom: theme.spacing.md }}>Health Profile</Text>
              <InfoRow
                label="Condition"
                value={userProfile.condition || 'Not specified'}
              />
              <Divider spacing="medium" />
              <InfoRow
                label="Main Issue"
                value={userProfile.main_issue || 'Not specified'}
              />
            </Card>
            )}

            {/* Lifestyle Targets - Compact */}
            <Card style={styles.compactCard}>
              <Text variant="body" weight="bold" style={{ marginBottom: theme.spacing.md }}>Lifestyle Targets</Text>
              <View style={styles.targetRow}>
                <Ionicons name="happy-outline" size={20} color={theme.colors.brand.secondary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Stress</Text>
                <Text variant="body" weight="semiBold">≤ 5/10</Text>
              </View>
              <View style={styles.targetRow}>
                <Ionicons name="moon-outline" size={20} color={theme.colors.brand.tertiary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Sleep</Text>
                <Text variant="body" weight="semiBold">7-9h</Text>
              </View>
              <View style={styles.targetRow}>
                <Ionicons name="water-outline" size={20} color={theme.colors.brand.secondary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Water</Text>
                <Text variant="body" weight="semiBold">2-3L</Text>
              </View>
              <View style={styles.targetRow}>
                <Ionicons name="fitness-outline" size={20} color={theme.colors.brand.primary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Exercise</Text>
                <Text variant="body" weight="semiBold">30+ min</Text>
              </View>
            </Card>

            {/* Health Goals - Compact */}
            <Card style={styles.compactCard}>
              <Text variant="body" weight="bold" style={{ marginBottom: theme.spacing.md }}>Health Goals</Text>
              <View style={styles.targetRow}>
                <Ionicons name="heart-outline" size={20} color={theme.colors.brand.primary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Gut Score</Text>
                <Text variant="body" weight="semiBold">≥ 80</Text>
              </View>
              <View style={styles.targetRow}>
                <Ionicons name="trending-down-outline" size={20} color={theme.colors.brand.secondary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Symptoms</Text>
                <Text variant="body" weight="semiBold">-50%</Text>
              </View>
              <View style={styles.targetRow}>
                <Ionicons name="restaurant-outline" size={20} color={theme.colors.brand.tertiary} />
                <Text variant="caption" color="secondary" style={{ flex: 1, marginLeft: theme.spacing.sm }}>Triggers</Text>
                <Text variant="body" weight="semiBold">Top 5</Text>
              </View>
            </Card>
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View>
            {/* Data & Privacy */}
            <Card padding="none" style={styles.settingsCard}>
              <ListItem
                icon="download-outline"
                iconBgColor={theme.colors.brand.secondary}
                label="Export My Data"
                onPress={() => Alert.alert('Export Data', 'Your data will be exported as CSV.')}
              />
              <Divider />
              <ListItem
                icon="analytics-outline"
                iconBgColor={theme.colors.brand.tertiary}
                label="View Insights"
                onPress={() => Alert.alert('Coming Soon', 'Advanced insights coming soon!')}
              />
            </Card>

            {/* Support */}
            <Card padding="none" style={styles.settingsCard}>
              <ListItem
                icon="help-circle-outline"
                iconBgColor={theme.colors.brand.tertiary}
                label="Help & Support"
                onPress={() => Linking.openURL('mailto:support@foodhabit.app')}
              />
              <Divider />
              <ListItem
                icon="shield-outline"
                iconBgColor={theme.colors.brand.tertiary}
                label="Privacy Policy"
                onPress={() => Linking.openURL('https://foodhabit.app/privacy')}
              />
            </Card>

            {/* Account */}
            <Card padding="none" style={styles.settingsCard}>
              <ListItem
                icon="log-out-outline"
                iconBgColor={theme.colors.brand.primary}
                label="Sign Out"
                onPress={handleSignOut}
                showChevron={false}
              />
              <Divider />
              <ListItem
                icon={isDeletingAccount ? "ellipsis-horizontal-circle" : "trash-outline"}
                iconBgColor={theme.colors.brand.primary}
                label={isDeletingAccount ? "Deleting..." : "Delete Account"}
                onPress={handleDeleteAccount}
                showChevron={false}
                destructive
                disabled={isDeletingAccount}
              />
            </Card>

            {/* Version */}
            <View style={styles.versionInfo}>
              <Text variant="caption" color="secondary" align="center">GutHarmony v1.0.0</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.primary }}>Cancel</Text>
            </TouchableOpacity>
            <Text variant="title2" weight="bold">Edit Profile</Text>
            <TouchableOpacity onPress={handleEditProfile} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color={theme.colors.brand.primary} size="small" />
              ) : (
                <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.primary }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editForm}>
            <View style={styles.formSection}>
              <Text variant="caption" color="secondary" style={styles.inputLabel}>Full Name</Text>
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
              <Text variant="caption" color="secondary" style={styles.inputLabel}>Age</Text>
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
    paddingVertical: theme.spacing.lg,
  },
  profileHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.brand.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  compactCard: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingsCard: {
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
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
    backgroundColor: theme.colors.border.light,
  },
  versionInfo: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
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
    borderBottomColor: theme.colors.border.light,
  },
  editForm: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
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
    borderColor: theme.colors.border.light,
  },
});
