import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Switch,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';
import { getUserProfile } from '../services/databaseService';
import { theme } from '../theme';
import { Text, Avatar } from '../components';

const PRIVACY_POLICY_URL = 'https://gutscan.app/privacy';
const TERMS_URL = 'https://gutscan.app/terms';
const SUPPORT_EMAIL = 'support@gutscan.app';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [totalScans, setTotalScans] = useState(0);
  const [gigiLevel, setGigiLevel] = useState(1);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setTotalScans(profile.total_scans || 0);
      setGigiLevel(profile.gigi_level || 1);
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
      'This will permanently delete:\n\n• Your profile and preferences\n• All scan history and photos\n• Your Gigi level progress\n• Any subscription data\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Are you absolutely sure?',
      'Type "DELETE" to confirm account deletion.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              const result = await deleteAccount();
              if (result.success) {
                Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              } else {
                Alert.alert('Error', `Failed to delete account: ${result.error}`);
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please contact support.');
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  const handleSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=GutScan Support`);
  };

  const handlePremium = () => {
    navigation.navigate('Paywall');
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title1" weight="bold" style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Avatar name={getDisplayName()} size={80} />
          <Text variant="title2" weight="bold" style={styles.name}>
            {getDisplayName()}
          </Text>
          {user?.email && (
            <Text variant="caption1" style={styles.email}>
              {user.email}
            </Text>
          )}
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="title3" weight="bold" style={styles.statValue}>{totalScans}</Text>
              <Text variant="caption1" style={styles.statLabel}>Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="title3" weight="bold" style={styles.statValue}>Lv. {gigiLevel}</Text>
              <Text variant="caption1" style={styles.statLabel}>Gigi Level</Text>
            </View>
          </View>
        </View>

        {/* Premium Section */}
        <TouchableOpacity style={styles.premiumCard} onPress={handlePremium}>
          <View style={styles.premiumContent}>
            <Ionicons name="star" size={24} color={theme.colors.brand.coral} />
            <View style={styles.premiumText}>
              <Text variant="headline" weight="semiBold" style={styles.premiumTitle}>Go Premium</Text>
              <Text variant="caption1" style={styles.premiumSubtitle}>Unlock unlimited scans & features</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.white} />
        </TouchableOpacity>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text variant="caption1" weight="semiBold" style={styles.sectionTitle}>PREFERENCES</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Daily Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#555', true: theme.colors.brand.teal }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : notificationsEnabled ? theme.colors.brand.teal : '#fff'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="caption1" weight="semiBold" style={styles.sectionTitle}>SUPPORT</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleSupport}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => openURL(PRIVACY_POLICY_URL)}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => openURL(TERMS_URL)}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text variant="caption1" weight="semiBold" style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Sign Out</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingRow, styles.dangerRow]} 
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={22} color={theme.colors.brand.coral} />
              <Text variant="body" style={[styles.settingLabel, { color: theme.colors.brand.coral }]}>
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionInfo}>
          <Text variant="caption1" style={styles.versionText}>
            GutScan v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    color: theme.colors.text.white,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  name: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.white,
  },
  email: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: theme.colors.text.white,
  },
  statLabel: {
    color: theme.colors.text.white,
    opacity: 0.6,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: theme.spacing.xl,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,118,100,0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.brand.coral,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  premiumText: {
    gap: 2,
  },
  premiumTitle: {
    color: theme.colors.text.white,
  },
  premiumSubtitle: {
    color: theme.colors.text.white,
    opacity: 0.7,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text.white,
    opacity: 0.5,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingLabel: {
    color: theme.colors.text.white,
  },
  dangerRow: {
    backgroundColor: 'rgba(255,118,100,0.1)',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    color: theme.colors.text.white,
    opacity: 0.3,
  },
});
