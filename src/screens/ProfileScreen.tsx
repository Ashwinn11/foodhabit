import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';
import { getUserProfile } from '../services/databaseService';
import { checkSubscriptionStatus } from '../services/revenueCatService';
import { theme } from '../theme';
import { Text, Avatar, Modal, Container } from '../components';

const SUPPORT_EMAIL = 'support@gutscan.app';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [totalScans, setTotalScans] = useState(0);
  const [gigiLevel, setGigiLevel] = useState(1);
  
  // Modal states
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

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

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const proceedToDeleteConfirm = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
        setShowDeleteConfirmModal(true);
    }, 300); // Small delay for smooth transition
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmModal(false);
    setIsDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        setShowDeleteSuccessModal(true);
      } else {
        setDeleteErrorMessage(`Failed to delete account: ${result.error}`);
        setShowDeleteErrorModal(true);
      }
    } catch (error) {
      setDeleteErrorMessage('An unexpected error occurred. Please contact support.');
      setShowDeleteErrorModal(true);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleContact = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=GutScan Support`);
  };

  const handleSupport = () => {
    navigation.navigate('Support');
  };

  const handlePremium = async () => {
    try {
      const hasSubscription = await checkSubscriptionStatus();
      if (hasSubscription) {
        // User already has subscription, do nothing
        return;
      }
      
      // Import RevenueCatUI
      const { default: RevenueCatUI, PAYWALL_RESULT } = await import('react-native-purchases-ui');
      
      // Present paywall directly
      const result = await RevenueCatUI.presentPaywall();
      
      // Handle result
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        console.log('User subscribed!');
        // Optionally refresh UI or show success message
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
    }
  };

  const handleManageSubscription = () => {
    // Open iOS subscription management settings
    // This is required by Apple App Store guidelines for subscription apps
    const url = 'https://apps.apple.com/account/subscriptions';
    Linking.openURL(url).catch(err => {
      console.error('Failed to open subscription management:', err);
    });
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  return (
    <Container 
      scrollable={true} 
      contentContainerStyle={styles.scrollContent}
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
          
          <TouchableOpacity style={styles.settingRow} onPress={handleManageSubscription}>
            <View style={styles.settingInfo}>
              <Ionicons name="card" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Manage Subscription</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text variant="caption1" weight="semiBold" style={styles.sectionTitle}>SUPPORT</Text>
           
           <TouchableOpacity style={styles.settingRow} onPress={handleSupport}>
             <View style={styles.settingInfo}>
               <Ionicons name="information-circle" size={22} color={theme.colors.text.white} />
               <Text variant="body" style={styles.settingLabel}>Support</Text>
             </View>
             <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
           </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('HowItWorks')}>
            <View style={styles.settingInfo}>
              <Ionicons name="bulb" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>How It Works</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('TermsOfService')}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={22} color={theme.colors.text.white} />
              <Text variant="body" style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.white} style={{ opacity: 0.5 }} />
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
      {/* Modals moved outside scrollview but inside container if needed, 
          actually they should be outside scrollview for better positioning */}
      
      {/* Sign Out Modal */}
      <Modal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        primaryButtonText="Sign Out"
        secondaryButtonText="Cancel"
        onPrimaryPress={confirmSignOut}
        onSecondaryPress={() => setShowSignOutModal(false)}
        onClose={() => setShowSignOutModal(false)}
        variant="error"
      />

      <Modal
        visible={showDeleteModal}
        title="Delete Account"
        message={'This will permanently delete:\n\n• Your profile and preferences\n• All scan history and photos\n• Your Gigi level progress\n• Any subscription data\n\nThis action cannot be undone.'}
        primaryButtonText="Delete Everything"
        secondaryButtonText="Cancel"
        onPrimaryPress={proceedToDeleteConfirm}
        onSecondaryPress={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        variant="error"
      />

      <Modal
        visible={showDeleteConfirmModal}
        title="Are you absolutely sure?"
        message="This action is irreversible. Are you sure you want to delete your account?"
        primaryButtonText="Yes, Delete My Account"
        secondaryButtonText="Cancel"
        onPrimaryPress={confirmDelete}
        onSecondaryPress={() => setShowDeleteConfirmModal(false)}
        onClose={() => setShowDeleteConfirmModal(false)}
        variant="error"
        loading={isDeletingAccount}
      />

      <Modal
        visible={showDeleteSuccessModal}
        title="Account Deleted"
        message="Your account has been permanently deleted."
        primaryButtonText="OK"
        onPrimaryPress={() => setShowDeleteSuccessModal(false)}
        onClose={() => setShowDeleteSuccessModal(false)}
        variant="info"
      />

      <Modal
        visible={showDeleteErrorModal}
        title="Error"
        message={deleteErrorMessage}
        primaryButtonText="OK"
        onPrimaryPress={() => setShowDeleteErrorModal(false)}
        onClose={() => setShowDeleteErrorModal(false)}
        variant="error"
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 40,
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
