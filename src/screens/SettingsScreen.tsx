import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii, shadows, fonts } from '../theme';
import { GutAvatar, ScreenWrapper } from '../components';
import { useGutStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';

const SettingsItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress: () => void;
  color?: string;
}> = ({ icon, title, value, onPress, color = colors.blue }) => (
  <Pressable style={styles.settingsItem} onPress={onPress}>
    <View style={[styles.settingsIconContainer, { backgroundColor: color + '15', borderColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.settingsTitle}>{title}</Text>
    {value ? (
      <Text style={styles.settingsValue}>{value}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={18} color={color} />
    )}
  </Pressable>
);

export const SettingsScreen: React.FC = () => {
  const { user: gutUser } = useGutStore();
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gut Buddy';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
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
      'This will permanently delete:\n\n• Your profile and preferences\n• All gut logs and history\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Are you absolutely sure?',
      'This action is irreversible. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await deleteAccount();
              if (result.success) {
                Alert.alert('Success', 'Your account has been deleted.');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account');
              }
            } catch (_error) {
              Alert.alert('Error', 'An unexpected error occurred. Please contact support.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  

  
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </Animated.View>
        
        {/* Profile Card */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.profileCard}
        >
          {user ? (
            <>
              <View style={styles.avatarContainer}>
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>{getInitials()}</Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{getDisplayName()}</Text>
                {user.email && (
                  <Text style={styles.profileEmail}>{user.email}</Text>
                )}
                <Text style={styles.profileStats}>
                  {gutUser.totalLogs} logs • {gutUser.streak} day streak
                </Text>
              </View>
            </>
          ) : (
            <>
              <GutAvatar mood={gutUser.avatarMood} size={70} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{gutUser.name}</Text>
                <Text style={styles.profileStats}>
                  {gutUser.totalLogs} logs • {gutUser.streak} day streak
                </Text>
              </View>
            </>
          )}
          <Pressable style={styles.editButton}>
            <Ionicons name="pencil" size={20} color={colors.pink} />
          </Pressable>
        </Animated.View>
        
        {/* Settings List */}
        <View style={styles.settingsList}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <SettingsItem 
            icon="notifications" 
            title="Daily Reminder" 
            value="7:00 PM"
            onPress={() => {}}
            color={colors.blue}
          />
          <SettingsItem 
            icon="notifications-off" 
            title="Mute All" 
            onPress={() => {}}
            color={colors.pink}
          />
        </View>

          {/* Goals */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.accountSection}
          >
            <Text style={styles.sectionTitle}>GOALS</Text>
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

          {/* Account */}
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={styles.accountSection}
          >
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <View style={[styles.settingsIconContainer, { backgroundColor: colors.blue + '15', borderColor: colors.blue }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.blue} />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled
              ]} 
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.pink} />
              ) : (
                <>
                  <View style={[styles.settingsIconContainer, { backgroundColor: colors.pink + '15', borderColor: colors.pink }]}>
                    <Ionicons name="trash-outline" size={20} color={colors.pink} />
                  </View>
                  <Text style={styles.deleteText}>Delete Account</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Gut Buddy v1.0.0</Text>
            <Text style={styles.footerSubtext}>Made with ❤️ and 💩</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
    ...shadows.sm,
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
});
