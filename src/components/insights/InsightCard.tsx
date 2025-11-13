/**
 * Insight Card Component
 * Displays different types of insights (Correlation, Milestone, Pattern, Educational)
 * Whoop-inspired design with actionable CTAs
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, r, haptics } from '../../theme';
import { Text, Card } from '../index';
import {
  Insight,
  CorrelationInsight,
  MilestoneInsight,
  PatternInsight,
  EducationalInsight,
} from '../../types/insight';

interface InsightCardProps {
  insight: Insight;
  onPress?: () => void;
  onActionPress?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onPress, onActionPress }) => {
  const getBadgeColor = () => {
    switch (insight.type) {
      case 'correlation':
        return theme.colors.brand.secondary; // Mint green
      case 'milestone':
        return theme.colors.brand.primary; // Coral
      case 'pattern':
        return theme.colors.brand.tertiary; // Lavender
      case 'educational':
        return theme.colors.neutral[500]; // Gray
      default:
        return theme.colors.text.secondary;
    }
  };

  const getBadgeLabel = () => {
    switch (insight.type) {
      case 'correlation':
        return 'NUTRITION IMPACT';
      case 'milestone':
        return 'ACHIEVEMENT';
      case 'pattern':
        return 'EATING PATTERN';
      case 'educational':
        return 'NUTRITION TIP';
      default:
        return 'INSIGHT';
    }
  };

  const handlePress = () => {
    haptics.patterns.cardTap();
    onPress?.();
  };

  const handleActionPress = () => {
    haptics.patterns.buttonPress();
    onActionPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Card variant="elevated" padding="large" style={styles.card}>
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: getBadgeColor() + '20' }]}>
          <Text
            variant="caption"
            style={{
              color: getBadgeColor(),
              fontWeight: '600',
              fontSize: 10,
            }}
          >
            {getBadgeLabel()}
          </Text>
        </View>

        {/* Title and Subtitle */}
        <Text variant="h5" style={styles.title}>
          {insight.title}
        </Text>
        <Text variant="label" color="secondary" style={styles.subtitle}>
          {insight.subtitle}
        </Text>

        {/* Type-specific content */}
        {insight.type === 'milestone' && <MilestoneContent insight={insight as MilestoneInsight} />}
        {insight.type === 'correlation' && <CorrelationContent insight={insight as CorrelationInsight} />}
        {insight.type === 'pattern' && <PatternContent insight={insight as PatternInsight} />}
        {insight.type === 'educational' && <EducationalContent insight={insight as EducationalInsight} />}

        {/* Description */}
        <Text variant="body" color="secondary" style={styles.description}>
          {insight.description}
        </Text>

        {/* Action Button */}
        {insight.actionable && insight.action_label && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getBadgeColor() }]}
            onPress={handleActionPress}
          >
            <Text
              variant="button"
              style={{
                color: theme.colors.background.primary,
                fontSize: r.adaptiveFontSize.sm,
              }}
            >
              {insight.action_label}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Milestone-specific content
 */
const MilestoneContent: React.FC<{ insight: MilestoneInsight }> = ({ insight }) => {
  return (
    <View style={styles.milestoneContent}>
      {/* Large number display */}
      <View style={styles.milestoneValueContainer}>
        <Text
          variant="h1"
          style={[styles.milestoneValue, { color: theme.colors.brand.primary }]}
        >
          {insight.milestone_value}
        </Text>
        <Text variant="label" color="secondary">
          {insight.milestone_type === 'streak' ? 'days' : 'meals'}
        </Text>
      </View>

      {/* Encouragement message */}
      {insight.encouragement_message && (
        <Text variant="caption" color="secondary" style={styles.encouragement}>
          {insight.encouragement_message}
        </Text>
      )}
    </View>
  );
};

/**
 * Correlation-specific content
 */
const CorrelationContent: React.FC<{ insight: CorrelationInsight }> = ({ insight }) => {
  return (
    <View style={styles.correlationContent}>
      {/* Improvement indicator */}
      <View style={styles.improvementBadge}>
        <Text
          variant="h3"
          style={[styles.improvementValue, { color: theme.colors.brand.secondary }]}
        >
          +{insight.metric_improvement}
        </Text>
        <Text variant="caption" color="secondary">
          points improvement
        </Text>
      </View>

      {/* Timeframe */}
      <Text variant="caption" color="tertiary" style={styles.timeframe}>
        Based on {insight.timeframe_days} days of data
      </Text>
    </View>
  );
};

/**
 * Pattern-specific content
 */
const PatternContent: React.FC<{ insight: PatternInsight }> = ({ insight }) => {
  return (
    <View style={styles.patternContent}>
      {/* Metric impact */}
      <View style={styles.metricImpact}>
        <View style={styles.metricRow}>
          <Text variant="caption" color="secondary">
            With pattern:
          </Text>
          <Text
            variant="h6"
            style={[styles.metricValue, { color: theme.colors.brand.secondary }]}
          >
            {insight.metric_impact.average_with_pattern}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text variant="caption" color="secondary">
            Without pattern:
          </Text>
          <Text variant="h6" style={styles.metricValue}>
            {insight.metric_impact.average_without_pattern}
          </Text>
        </View>
      </View>

      {/* Improvement percentage */}
      <Text variant="caption" style={[styles.improvement, { color: theme.colors.brand.secondary }]}>
        {insight.metric_impact.improvement_percentage}% improvement
      </Text>
    </View>
  );
};

/**
 * Educational-specific content
 */
const EducationalContent: React.FC<{ insight: EducationalInsight }> = ({ insight }) => {
  return (
    <View style={styles.educationalContent}>
      {/* Fact highlight */}
      <View style={styles.factBox}>
        <Text variant="body" style={styles.fact}>
          {insight.fact}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.md,
  },

  // Header
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
  },

  // Description
  description: {
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.lg,
  },

  // Action Button
  actionButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },

  // Milestone Content
  milestoneContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  milestoneValueContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  milestoneValue: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  encouragement: {
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Correlation Content
  correlationContent: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  improvementBadge: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  improvementValue: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  timeframe: {
    fontStyle: 'italic',
  },

  // Pattern Content
  patternContent: {
    marginBottom: theme.spacing.lg,
  },
  metricImpact: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontWeight: '600',
  },
  improvement: {
    textAlign: 'center',
    fontWeight: '600',
  },

  // Educational Content
  educationalContent: {
    marginBottom: theme.spacing.lg,
  },
  factBox: {
    backgroundColor: theme.colors.neutral[100],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.tertiary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  fact: {
    fontWeight: '500',
    lineHeight: theme.typography.body.lineHeight,
  },
});
