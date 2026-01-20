import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii, shadows, fonts } from '../theme/theme';
import { GutAvatar, ScreenWrapper, IconContainer, Typography, Card } from '../components';
import { useGutStore, useUIStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllNotifications } from '../services/notificationService';
import { RevenueCatService } from '../services/revenueCatService';

const SettingsItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress: () => void;
  color?: string;
}> = ({ icon, title, value, onPress, color = colors.blue }) => (
  <Card variant="white" style={styles.settingsItem} padding="lg">
    <Pressable style={styles.settingsItemInner} onPress={onPress}>
      <IconContainer
        name={icon}
        size={40}
        iconSize={20}
        color={color === colors.yellow ? colors.black : color}
        backgroundColor={color === colors.yellow ? colors.yellow : color + '15'}
        borderColor={color}
        borderWidth={1.5}
        shadow={false}
        style={{ marginRight: spacing.md }}
      />
      <Typography variant="bodyBold" style={styles.settingsTitle}>{title}</Typography>
      {value ? (
        <Typography variant="bodySmall" color={colors.black + '66'} style={{ marginRight: spacing.xs }}>
          {value}
        </Typography>
      ) : (
        <IconContainer
          name="chevron-forward"
          size={24}
          iconSize={18}
          color={color}
          backgroundColor="transparent"
          borderWidth={0}
          shadow={false}
        />
      )}
    </Pressable>
  </Card>
);

export const ProfileScreen: React.FC = () => {
  const { user: gutUser, getGutHealthScore, getStats } = useGutStore();
  const healthScore = getGutHealthScore();
  const stats = getStats();
  const navigation = useNavigation<any>();
  const { showAlert, showConfirm } = useUIStore();
  const { notificationSettings, setNotificationSettings } = useGutStore();
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useFocusEffect(
    useCallback(() => {
      checkPremiumStatus();
    }, [])
  );

  const checkPremiumStatus = async () => {
    const premium = await RevenueCatService.isPremium();
    setIsPremium(premium);
    setCheckingPremium(false);
  };
  
  const handleGoPremium = async () => {
    await RevenueCatService.presentPaywall();
    checkPremiumStatus();
  };

  const handleToggleDailyReminder = async () => {
    if (!notificationSettings.enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setNotificationSettings({ enabled: true });
        await scheduleDailyReminder(notificationSettings.reminderTime.hour, notificationSettings.reminderTime.minute);
        showAlert('Notifications Enabled', 'We will remind you daily to check in!');
      } else {
        showAlert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } else {
      setNotificationSettings({ enabled: false });
      await cancelAllNotifications();
      showAlert('Notifications Disabled', 'Daily reminders have been turned off.');
    }
  };

  const handleMuteAll = async () => {
    setNotificationSettings({ enabled: false });
    await cancelAllNotifications();
    showAlert('Muted', 'All notifications have been silenced.');
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const m = minute < 10 ? `0${minute}` : minute;
    return `${h}:${m} ${ampm}`;
  };
  
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gut Buddy';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleSignOut = () => {
    showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        await signOut();
      },
      'Sign Out'
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Delete Account',
      'This will permanently delete:\n\n• Your profile and preferences\n• All gut logs and history\n\nThis action cannot be undone. Are you sure?',
      async () => {
        setIsDeleting(true);
        try {
          const result = await deleteAccount();
          if (result.success) {
            showAlert('Success', 'Your account has been deleted.', 'success');
          } else {
            showAlert('Error', result.error || 'Failed to delete account', 'error');
          }
        } catch (_error) {
          showAlert('Error', 'An unexpected error occurred. Please contact support.', 'error');
        } finally {
          setIsDeleting(false);
        }
      },
      'Delete My Account'
    );
  };
  
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Typography variant="h2">Profile</Typography>
          <Typography variant="body" color={colors.black + '99'}>Customize your experience</Typography>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card 
            variant="white"
            style={styles.profileCard}
            padding="lg"
          >
          {user ? (
            <>
              <View style={styles.avatarContainer}>
                <View style={styles.initialsAvatar}>
                  <Typography variant="h2" color={colors.white}>{getInitials()}</Typography>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Typography variant="h3">{getDisplayName()}</Typography>
                {user.email && (
                  <Typography variant="bodySmall" color={colors.black + '66'}>{user.email}</Typography>
                )}
                <Typography variant="body" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
                  {stats.totalPoops} logs • {stats.longestStreak} day streak
                </Typography>
              </View>
            </>
          ) : (
            <>
              <GutAvatar score={healthScore.score} size={70} />
              <View style={styles.profileInfo}>
                <Typography variant="h3">{gutUser.name}</Typography>
                <Typography variant="body" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
                  {stats.totalPoops} logs • {stats.longestStreak} day streak
                </Typography>
              </View>
            </>
          )}
        </Card>
        </Animated.View>

        {/* Premium Banner or Status */}
        {!checkingPremium && (
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            {isPremium ? (
               <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl, flexDirection: 'row', justifyContent: 'center' }}>
                  <View style={styles.premiumBadgeLarge}>
                    <IconContainer
                      name="star"
                      size={16}
                      iconSize={10}
                      color={colors.black}
                      backgroundColor="transparent"
                      borderWidth={0}
                      shadow={false}
                      style={{ marginRight: 4 }}
                    />
                    <Typography variant="bodySmall" style={styles.premiumBadgeTextLarge}>PREMIUM MEMBER</Typography>
                  </View>
               </View>
            ) : (
              <Pressable onPress={handleGoPremium} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
                <Card 
                  variant="colored" 
                  color={colors.yellow} 
                  style={{ backgroundColor: colors.yellow + '40', borderWidth: 2 }}
                  padding="lg"
                  shadow="md"
                >
                  <View style={styles.premiumContent}>
                    <IconContainer
                      name="star"
                      size={48}
                      iconSize={24}
                      color={colors.black}
                      backgroundColor={colors.yellow}
                      borderWidth={0}
                      shadow={true}
                      style={{ marginRight: spacing.md }}
                    />
                    <View style={{ flex: 1 }}>
                      <Typography variant="h3">Go Premium</Typography>
                      <Typography variant="bodySmall" color={colors.black + '80'}>
                        Unlock unlimited history & insights
                      </Typography>
                    </View>
                    <IconContainer
                      name="arrow-forward"
                      size={32}
                      iconSize={16}
                      color={colors.black}
                      backgroundColor="transparent"
                      borderWidth={0}
                      shadow={false}
                    />
                  </View>
                </Card>
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* Subscription Management */}
        {isPremium && (
          <Animated.View 
            entering={FadeInDown.delay(275).springify()}
            style={styles.accountSection}
          >
             <SettingsItem 
              icon="card-outline" 
              title="Manage Subscription" 
              onPress={async () => {
                const url = await RevenueCatService.manageSubscription();
                if (url) {
                  Linking.openURL(url);
                } else {
                  showAlert('Subscription', 'No managed subscription found. Please check your App Store settings.');
                }
              }}
              color={colors.blue}
            />
          </Animated.View>
        )}

        {/* Goals */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.accountSection}
        >
          <Typography variant="caption" color={colors.black + '66'} style={styles.sectionTitle}>GOALS</Typography>
          <SettingsItem 
            icon="water" 
            title="Water Intake" 
            value="2.5L"
            onPress={() => {}}
            color={colors.blue}
          />
          <SettingsItem 
            icon="leaf" 
            title="Fiber Target" 
            value="30g"
            onPress={() => {}}
            color={colors.yellow}
          />
        </Animated.View>
        
        {/* Notifications */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.settingsList}
        >
          <Typography variant="caption" color={colors.black + '66'} style={styles.sectionTitle}>NOTIFICATIONS</Typography>
          <SettingsItem 
            icon={notificationSettings.enabled ? "notifications" : "notifications-outline"} 
            title="Daily Reminder" 
            value={notificationSettings.enabled ? formatTime(notificationSettings.reminderTime.hour, notificationSettings.reminderTime.minute) : "Off"}
            onPress={handleToggleDailyReminder}
            color={notificationSettings.enabled ? colors.blue : colors.black + '40'}
          />
          <SettingsItem 
            icon="notifications-off" 
            title="Mute All" 
            onPress={handleMuteAll}
            color={colors.pink}
          />
        </Animated.View>

        {/* About */}
        <Animated.View 
          entering={FadeInDown.delay(500).springify()}
          style={styles.accountSection}
        >
          <Typography variant="caption" color={colors.black + '66'} style={styles.sectionTitle}>ABOUT</Typography>
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title="Privacy Policy" 
            onPress={() => navigation.navigate('PrivacyPolicy')}
            color={colors.blue}
          />
          <SettingsItem 
            icon="information-circle-outline" 
            title="Help & Support" 
            onPress={() => navigation.navigate('HelpSupport')}
            color={colors.blue}
          />
        </Animated.View>

        {/* Account */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          style={styles.accountSection}
        >
          <Typography variant="caption" color={colors.black + '66'} style={styles.sectionTitle}>ACCOUNT</Typography>
          

          <Card variant="white" style={styles.signOutButton} padding="md">
            <Pressable style={styles.settingsItemInner} onPress={handleSignOut}>
              <IconContainer
                name="log-out-outline"
                size={40}
                iconSize={20}
                color={colors.blue}
                backgroundColor={colors.blue + '15'}
                borderColor={colors.blue}
                borderWidth={1.5}
                shadow={false}
                style={{ marginRight: spacing.md }}
              />
              <Typography variant="bodyBold">Sign Out</Typography>
            </Pressable>
          </Card>
          
          <Card variant="colored" color={colors.pink} style={styles.deleteCard} padding="md">
            <Pressable 
              style={styles.settingsItemInner}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.pink} />
              ) : (
                <>
                  <IconContainer
                    name="trash-outline"
                    size={40}
                    iconSize={20}
                    color={colors.pink}
                    backgroundColor={colors.pink + '15'}
                    borderColor={colors.pink}
                    borderWidth={1.5}
                    shadow={false}
                    style={{ marginRight: spacing.md }}
                  />
                  <Typography variant="bodyBold" color={colors.pink}>Delete Account</Typography>
                </>
              )}
            </Pressable>
          </Card>
        </Animated.View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Typography variant="bodyXS" color={colors.black + '40'}>Gut Buddy v1.0.0</Typography>
            <Typography variant="bodyXS" color={colors.black + '40'} style={{ marginTop: 4 }}>
              Made with love and care
            </Typography>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.heading,
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.black + '99',
    fontFamily: fonts.body,
    marginTop: spacing.xs,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii['2xl'],
    marginBottom: spacing.xl,
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  initialsAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 28,
    fontFamily: fonts.heading,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  profileName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  profileEmail: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: 2,
  },
  profileStats: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '99',
    marginTop: spacing.xs,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pink + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsList: {
    paddingHorizontal: spacing.lg,
  },
  settingsItem: {
    marginBottom: spacing.sm,
  },
  settingsItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: spacing.md,
  },
  settingsTitle: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  settingsValue: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginRight: spacing.xs,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1.5,
  },
  accountSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black + '66',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  signOutButton: {
    marginBottom: spacing.sm,
  },
  deleteCard: {
    marginBottom: spacing.sm,
  },
  signOutIcon: {
    marginRight: spacing.md,
  },
  signOutText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink + '15',
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.pink + '40',
    ...shadows.sm,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteIcon: {
    marginRight: spacing.md,
  },
  deleteText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.pink,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    marginBottom: 80,
  },
  footerText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '40',
  },
  footerSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '40',
    marginTop: 4,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.black + '10',
  },
  premiumBadgeLarge: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.black + '15',
    ...shadows.sm,
  },
  premiumBadgeTextLarge: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    letterSpacing: 1,
  },
});
