import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text, Card, Button } from '../components';

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

  return (
    <Container variant="grouped" scrollable>
      <View style={styles.header}>
        <Text variant="h1">Profile</Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text variant="h1" color="inverse" style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text variant="h4" style={styles.sectionTitle}>
          Account Information
        </Text>

        {user?.name && (
          <Card variant="elevated" padding="large" style={styles.infoCard}>
            <Text variant="labelSmall" color="secondary" style={styles.infoLabel}>
              Name
            </Text>
            <Text variant="body">{user.name}</Text>
          </Card>
        )}

        {user?.email && (
          <Card variant="elevated" padding="large" style={styles.infoCard}>
            <Text variant="labelSmall" color="secondary" style={styles.infoLabel}>
              Email
            </Text>
            <Text variant="body">{user.email}</Text>
          </Card>
        )}

        <Card variant="elevated" padding="large" style={styles.infoCard}>
          <Text variant="labelSmall" color="secondary" style={styles.infoLabel}>
            Sign-in Provider
          </Text>
          <Text variant="body">
            {user?.provider === 'apple' ? 'Apple' : 'Google'}
          </Text>
        </Card>

        <Card variant="elevated" padding="large" style={styles.infoCard}>
          <Text variant="labelSmall" color="secondary" style={styles.infoLabel}>
            User ID
          </Text>
          <Text variant="caption" color="tertiary" numberOfLines={1}>
            {user?.id}
          </Text>
        </Card>
      </View>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="destructive"
        size="large"
        fullWidth
        style={styles.signOutButton}
      />

      <View style={styles.footer}>
        <Text variant="caption" color="tertiary">
          Food Habit v1.0.0
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  avatarPlaceholder: {
    width: r.scaleWidth(120),
    height: r.scaleWidth(120),
    borderRadius: r.scaleWidth(60),
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  avatarText: {
    fontSize: r.adaptiveFontSize['4xl'],
  },
  infoSection: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    marginBottom: theme.spacing.sm,
  },
  signOutButton: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: r.adaptiveSpacing.xl,
  },
});
