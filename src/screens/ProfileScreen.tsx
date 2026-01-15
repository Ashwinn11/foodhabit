import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../services/accountService';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
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
      'This will permanently delete:\n\n• Your profile and preferences\n• All data and history\n\nThis action cannot be undone.',
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
            } catch (error) {
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.name}>{getDisplayName()}</Text>
          {user?.email && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sign Out</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingRow, styles.dangerRow]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Text>
            </View>
            {isDeleting && <ActivityIndicator color={colors.pink} />}
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>FoodHabit v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  headerTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.black,
    paddingVertical: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.heading,
    color: colors.white,
  },
  name: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    marginTop: spacing.md,
  },
  email: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black + '66',
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  dangerRow: {
    backgroundColor: colors.pink + '15',
    borderColor: colors.pink + '40',
  },
  dangerText: {
    color: colors.pink,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  versionText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '40',
  },
});
