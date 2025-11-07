import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';

export default function HomeScreen() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          {user?.name && (
            <Text style={styles.userName}>{user.name}</Text>
          )}
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Food Habit</Text>
          <Text style={styles.welcomeText}>
            Track your eating habits, discover patterns, and build healthier routines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Meals Logged</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
          </View>
        </View>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>
            More features coming soon
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: r.adaptiveSpacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.typography.h5,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  welcomeCard: {
    backgroundColor: theme.colors.primary[50],
    padding: r.adaptiveSpacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  welcomeTitle: {
    ...theme.typography.h4,
    color: theme.colors.primary[900],
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    ...theme.typography.body,
    color: theme.colors.primary[800],
    lineHeight: 24,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    padding: r.adaptiveSpacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  placeholderSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
