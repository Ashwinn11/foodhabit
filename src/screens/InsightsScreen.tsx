/**
 * Insights Screen
 * Whoop-inspired insights tab showing personalized health insights
 * Four insight types: Correlation, Milestone, Pattern, Educational
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text } from '../components';
import { Insight, InsightFilter } from '../types/insight';
import { InsightCard } from '../components/insights/InsightCard';
import { insightEngine } from '../services/insights/insightEngine';
import { mealService } from '../services/meal/mealService';

export default function InsightsScreen() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<InsightFilter>('all');
  const [mealCount, setMealCount] = useState(0);

  // Refresh insights when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadInsights();
      loadMealCount();
    }, [user?.id])
  );

  const loadInsights = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const fetchedInsights = await insightEngine.getInsights(user.id);
      setInsights(fetchedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMealCount = async () => {
    if (!user?.id) return;

    try {
      const count = await mealService.getTodayMealCount(user.id);
      setMealCount(count);
    } catch (error) {
      console.error('Error loading meal count:', error);
    }
  };

  const FilterButton = ({ filter, label }: { filter: InsightFilter; label: string }) => {
    const isActive = selectedFilter === filter;

    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setSelectedFilter(filter)}
      >
        <Text
          variant="label"
          style={{
            color: isActive ? theme.colors.background.primary : theme.colors.text.secondary,
            fontWeight: isActive ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Animated Ring Illustration */}
      <View style={styles.emptyIllustration}>
        <View style={[styles.emptyRing, styles.emptyRingOuter]} />
        <View style={[styles.emptyRing, styles.emptyRingMiddle]} />
        <View style={[styles.emptyRing, styles.emptyRingInner]} />
      </View>

      <Text variant="h4" style={styles.emptyTitle}>
        Building your insights
      </Text>

      <Text variant="body" color="secondary" style={styles.emptySubtitle}>
        Log meals for 3 days to start seeing personalized insights about your eating habits and
        health patterns.
      </Text>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((mealCount / 9) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <Text variant="caption" color="tertiary" style={styles.progressText}>
          {mealCount} of 9 meals logged
        </Text>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.brand.secondary + '20' }]}>
            <Text style={styles.featureIconText}>📊</Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.featureLabel}>
            Discover food-health correlations
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.brand.primary + '20' }]}>
            <Text style={styles.featureIconText}>🎯</Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.featureLabel}>
            Track milestones and streaks
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.colors.brand.tertiary + '20' }]}>
            <Text style={styles.featureIconText}>💡</Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.featureLabel}>
            Get personalized recommendations
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Container variant="grouped" scrollable={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4">Your Insights</Text>
          {insights.length > 0 && (
            <Text variant="label" color="secondary" style={styles.insightCount}>
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Filter Tabs */}
        {insights.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterButton filter="all" label="All" />
            <FilterButton filter="correlation" label="Nutrition" />
            <FilterButton filter="milestone" label="Milestones" />
            <FilterButton filter="pattern" label="Patterns" />
            <FilterButton filter="educational" label="Tips" />
          </ScrollView>
        )}

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {insights.length === 0 ? (
            <EmptyState />
          ) : (
            // Render insight cards
            insights
              .filter((insight) => selectedFilter === 'all' || insight.type === selectedFilter)
              .map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onPress={() => insightEngine.markInsightAsRead(insight.id)}
                  onActionPress={() => {
                    // TODO: Handle action based on action_type
                    console.log('Action pressed:', insight.action_type);
                  }}
                />
              ))
          )}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: r.adaptiveSpacing.lg,
    marginBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.main,
  },
  insightCount: {
    marginTop: theme.spacing.xs,
  },

  // Filter Tabs
  filterScrollView: {
    maxHeight: 50,
    marginBottom: theme.spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: r.adaptiveSpacing.lg,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    backgroundColor: theme.colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 94 : 76, // Clearance for floating tab
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: r.adaptiveSpacing.xl,
    paddingVertical: r.adaptiveSpacing['3xl'],
  },
  emptyIllustration: {
    width: r.scaleWidth(200),
    height: r.scaleWidth(200),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: r.adaptiveSpacing.xl,
    position: 'relative',
  },
  emptyRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 3,
    borderStyle: 'solid',
  },
  emptyRingOuter: {
    width: r.scaleWidth(200),
    height: r.scaleWidth(200),
    borderColor: theme.colors.brand.primary + '30',
  },
  emptyRingMiddle: {
    width: r.scaleWidth(150),
    height: r.scaleWidth(150),
    borderColor: theme.colors.brand.secondary + '30',
  },
  emptyRingInner: {
    width: r.scaleWidth(100),
    height: r.scaleWidth(100),
    borderColor: theme.colors.brand.tertiary + '30',
  },
  emptyTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: r.adaptiveSpacing.xl,
  },

  // Progress Indicator
  progressContainer: {
    width: '100%',
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    textAlign: 'center',
  },

  // Feature Highlights
  featuresContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: r.scaleWidth(56),
    height: r.scaleWidth(56),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIconText: {
    fontSize: r.adaptiveFontSize.xl,
  },
  featureLabel: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
