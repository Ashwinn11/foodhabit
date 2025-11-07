import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text, Card } from '../components';

export default function HomeScreen() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Container variant="grouped" scrollable>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <Text variant="h5" color="secondary">
            {getGreeting()}
          </Text>
          {user?.user_metadata?.name && (
            <Text variant="h5" style={styles.userNameText}>
              {user.user_metadata.name as string}
            </Text>
          )}
        </View>
      </View>

      <Card variant="filled" padding="large" style={styles.welcomeCard}>
        <Text variant="h4" weight="semiBold" style={styles.welcomeTitle}>
          Welcome to Food Habit
        </Text>
        <Text variant="body" color="secondary" style={styles.welcomeText}>
          Track your eating habits, discover patterns, and build healthier routines.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text variant="h4" style={styles.sectionTitle}>
          Quick Stats
        </Text>

        <View style={styles.statsGrid}>
          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              0
            </Text>
            <Text variant="label" color="secondary" align="center" style={styles.statLabel}>
              Meals Logged
            </Text>
          </Card>

          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              0
            </Text>
            <Text variant="label" color="secondary" align="center" style={styles.statLabel}>
              Days Tracked
            </Text>
          </Card>
        </View>
      </View>

      <View style={styles.placeholderSection}>
        <Text variant="body" color="tertiary">
          More features coming soon
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userNameText: {
    color: theme.colors.brand.primary,
  },
  welcomeCard: {
    marginBottom: r.adaptiveSpacing['2xl'],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.primary,
  },
  welcomeTitle: {
    color: theme.colors.brand.primary,
    marginBottom: theme.spacing.md,
  },
  welcomeText: {
    lineHeight: 24,
  },
  section: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.brand.primary,
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    marginTop: theme.spacing.xs,
  },
  placeholderSection: {
    alignItems: 'center',
    paddingVertical: r.adaptiveSpacing['3xl'],
  },
});
