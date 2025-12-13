/**
 * GlassmorphismCard - Modern 2025 Component Usage Examples
 *
 * This file demonstrates various ways to use the new GlassmorphismCard component.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassmorphismCard, Text, Button } from '.';
import { theme } from '../theme';

/**
 * Example 1: Simple Stat Card
 * Perfect for displaying key metrics (Streak, Harmony Score, etc.)
 */
export function StatCard() {
  return (
    <GlassmorphismCard
      size="small"
      gradient="coral"
      padding="medium"
    >
      <Text variant="callout" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
        Current Streak
      </Text>
      <Text variant="largeTitle" style={{ color: theme.colors.brand.primary }}>
        7 Days
      </Text>
      <Text variant="caption1" color="secondary" style={{ marginTop: theme.spacing.sm }}>
        Keep it going!
      </Text>
    </GlassmorphismCard>
  );
}

/**
 * Example 2: Interactive Pressable Card
 * Perfect for navigation cards that users can tap
 */
export function NavigationCard() {
  return (
    <GlassmorphismCard
      size="medium"
      gradient="mint"
      pressable
      onPress={() => console.log('Navigate to food triggers')}
      showGlow={false}
      padding="large"
    >
      <Text variant="headline" style={{ marginBottom: theme.spacing.md }}>
        Your Food Triggers
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Based on your entries, here are your top trigger foods
      </Text>
      <Button
        title="View Analysis"
        onPress={() => {}}
        variant="secondary"
        size="small"
      />
    </GlassmorphismCard>
  );
}

/**
 * Example 3: Card with Glow Effect
 * Perfect for highlights, achievements, or important CTAs
 */
export function AchievementCard() {
  return (
    <GlassmorphismCard
      size="large"
      gradient="purple"
      showGlow
      glowColor={theme.colors.brand.secondary}
      blurIntensity="strong"
      padding="large"
    >
      <View style={{ alignItems: 'center' }}>
        <Text
          variant="largeTitle"
          style={{
            color: theme.colors.brand.secondary,
            marginBottom: theme.spacing.md,
          }}
        >
          🎉
        </Text>
        <Text
          variant="title2"
          style={{ marginBottom: theme.spacing.md, textAlign: 'center' }}
        >
          Day 3 Complete!
        </Text>
        <Text
          variant="body"
          color="secondary"
          style={{ textAlign: 'center' }}
        >
          You've logged 3 days. AI analysis coming soon.
        </Text>
      </View>
    </GlassmorphismCard>
  );
}

/**
 * Example 4: Light Glass Effect (Low Opacity)
 * Perfect for subtle background cards
 */
export function SubtleCard() {
  return (
    <GlassmorphismCard
      size="small"
      gradient="none"
      glassOpacity={0.5}
      blurIntensity="light"
      padding="medium"
      borderColor="rgba(255, 118, 100, 0.3)"
    >
      <Text variant="body" style={{ textAlign: 'center' }}>
        💡 Pro Tip: Track your meals consistently for better insights
      </Text>
    </GlassmorphismCard>
  );
}

/**
 * Example 5: Bento Grid Style (Multiple Cards)
 * Perfect for dashboard layout
 */
export function BentoDashboard() {
  return (
    <View style={styles.bentoContainer}>
      {/* Top row - wide card */}
      <View style={{ width: '100%', marginBottom: theme.spacing.lg }}>
        <GlassmorphismCard size="medium" gradient="coral" padding="medium">
          <Text variant="headline" style={{ marginBottom: theme.spacing.sm }}>
            This Week's Summary
          </Text>
          <Text variant="body" color="secondary">
            4/7 days logged · 12 meals tracked · 3 triggers identified
          </Text>
        </GlassmorphismCard>
      </View>

      {/* Bottom row - two small cards */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
        <View style={{ flex: 1 }}>
          <GlassmorphismCard size="small" gradient="mint" padding="medium">
            <Text variant="callout" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
              Energy
            </Text>
            <Text variant="title2">7.5/10</Text>
          </GlassmorphismCard>
        </View>
        <View style={{ flex: 1 }}>
          <GlassmorphismCard size="small" gradient="purple" padding="medium">
            <Text variant="callout" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
              Mood
            </Text>
            <Text variant="title2">Good 😊</Text>
          </GlassmorphismCard>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bentoContainer: {
    padding: theme.spacing['2xl'],
  },
});

/**
 * Usage Guide:
 *
 * Size Options:
 * - 'small': minHeight 100px (for stats, metrics)
 * - 'medium': minHeight 140px (default, flexible)
 * - 'large': minHeight 200px (for detailed content)
 *
 * Gradient Options:
 * - 'coral': Subtle coral tint (primary brand color)
 * - 'mint': Subtle mint tint (secondary color)
 * - 'purple': Subtle purple tint (tertiary color)
 * - 'none': No gradient overlay
 *
 * Blur Intensity:
 * - 'light': More transparent (60% opacity)
 * - 'medium': Balanced (80% opacity) - default
 * - 'strong': More opaque (95% opacity)
 *
 * Best Practices:
 * 1. Use gradient prop to add color without overwhelming
 * 2. Use showGlow for achievements or important highlights
 * 3. Combine size + padding for proper spacing
 * 4. Keep pressable cards simple (no complex interactions)
 * 5. Use different gradients to distinguish card types
 *
 * Accessibility:
 * - All interactive cards have proper haptic feedback
 * - Text colors meet WCAG AA contrast ratios
 * - Works with reduced motion preferences
 */
