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
import Avatar from '../components/Avatar';
import AchievementsWidget from '../components/AchievementsWidget';
import GridCard from '../components/GridCard';

type TabType = 'overview' | 'health' | 'settings';

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
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
    )}
  </TouchableOpacity>
);

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
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
            await signOut();
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
        <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
          <Ionicons name="pencil-outline" size={24} color={theme.colors.brand.primary} />
        </TouchableOpacity>
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
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            variant="body"
            weight={activeTab === 'overview' ? 'bold' : 'regular'}
            style={{ color: activeTab === 'overview' ? theme.colors.brand.primary : theme.colors.text.secondary }}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'health' && styles.tabActive]}
          onPress={() => setActiveTab('health')}
        >
          <Text
            variant="body"
            weight={activeTab === 'health' ? 'bold' : 'regular'}
            style={{ color: activeTab === 'health' ? theme.colors.brand.primary : theme.colors.text.secondary }}
          >
            Health
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text
            variant="body"
            weight={activeTab === 'settings' ? 'bold' : 'regular'}
            style={{ color: activeTab === 'settings' ? theme.colors.brand.primary : theme.colors.text.secondary }}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

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
              <GridCard>
                <Ionicons name="flame" size={24} color={theme.colors.brand.primary} />
                <Text variant="title2" weight="bold" style={{ marginTop: theme.spacing.sm, color: theme.colors.brand.primary }}>
                  {currentStreak}
                </Text>
                <Text variant="caption" color="secondary">Streak</Text>
              </GridCard>
              <GridCard>
                <Ionicons name="star" size={24} color={theme.colors.brand.tertiary} />
                <Text variant="title2" weight="bold" style={{ marginTop: theme.spacing.sm, color: theme.colors.brand.tertiary }}>
                  {harmonyPoints}
                </Text>
                <Text variant="caption" color="secondary">Points</Text>
              </GridCard>
              <GridCard>
                <Ionicons name="document-text" size={24} color={theme.colors.brand.secondary} />
                <Text variant="title2" weight="bold" style={{ marginTop: theme.spacing.sm, color: theme.colors.brand.secondary }}>
                  {totalEntries}
                </Text>
                <Text variant="caption" color="secondary">Entries</Text>
              </GridCard>
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
                <View style={styles.infoRow}>
                  <Text variant="caption" color="secondary">Condition</Text>
                  <Text variant="body" weight="semiBold">{userProfile.condition || 'Not specified'}</Text>
                </View>
                <View style={[styles.divider, { marginVertical: theme.spacing.md }]} />
                <View style={styles.infoRow}>
                  <Text variant="caption" color="secondary">Main Issue</Text>
                  <Text variant="body" weight="semiBold">{userProfile.main_issue || 'Not specified'}</Text>
                </View>
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
              <SettingsRow
                icon="download-outline"
                label="Export My Data"
                onPress={() => Alert.alert('Export Data', 'Your data will be exported as CSV.')}
                iconColor={theme.colors.brand.secondary}
              />
              <View style={styles.divider} />
              <SettingsRow
                icon="analytics-outline"
                label="View Insights"
                onPress={() => Alert.alert('Coming Soon', 'Advanced insights coming soon!')}
                iconColor={theme.colors.brand.tertiary}
              />
            </Card>

            {/* Support */}
            <Card padding="none" style={styles.settingsCard}>
              <SettingsRow
                icon="help-circle-outline"
                label="Help & Support"
                onPress={() => Linking.openURL('mailto:support@foodhabit.app')}
                iconColor={theme.colors.brand.tertiary}
              />
              <View style={styles.divider} />
              <SettingsRow
                icon="shield-outline"
                label="Privacy Policy"
                onPress={() => Linking.openURL('https://foodhabit.app/privacy')}
                iconColor={theme.colors.brand.tertiary}
              />
            </Card>

            {/* Account */}
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
