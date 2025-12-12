import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';
import { Container, Text, Card } from '../components';

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

  return (
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

      {/* Account Actions */}
      <View style={styles.section}>
        <Text variant="footnote" color="secondary" style={styles.sectionHeader}>
          ACCOUNT
        </Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            showChevron={false}
            iconColor={theme.colors.icon.primary}
          />
        </Card>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
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
  section: {
    marginBottom: theme.spacing.xl,
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
});
