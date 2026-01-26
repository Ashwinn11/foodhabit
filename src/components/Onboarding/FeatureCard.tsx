/**
 * Feature Card Component
 * Displays app features with icons in a visually appealing card
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { Typography } from '../Typography';
import { IconContainer } from '../IconContainer/IconContainer';

interface FeatureCardProps {
  icon: any; // Using any for Ionicons name to avoid type mismatches during transition
  title: string;
  description: string;
  color?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color = colors.pink,
}) => {
  return (
    <View style={styles.container}>
      <IconContainer
        name={icon}
        size={56}
        iconSize={28}
        color={color}
        variant="solid"
        shape="rounded"
        style={styles.iconMargin}
      />
      <View style={styles.content}>
        <Typography variant="bodyBold" style={styles.title}>
          {title}
        </Typography>
        <Typography variant="bodySmall" color={colors.mediumGray}>
          {description}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  iconMargin: {
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
});
