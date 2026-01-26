/**
 * Review Card Component
 * Displays user reviews with rating stars
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadows } from '../../theme';
import { Typography } from '../Typography';
import { IconContainer } from '../IconContainer/IconContainer';

interface ReviewCardProps {
  name: string;
  rating: number;
  review: string;
  date?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  rating,
  review,
  date,
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Typography variant="bodyBold" color={colors.white}>
            {name.charAt(0).toUpperCase()}
          </Typography>
        </View>
        <View style={styles.headerContent}>
          <Typography variant="bodyBold">{name}</Typography>
          <View style={styles.stars}>
            {stars.map((filled, index) => (
              <IconContainer
                key={index}
                name={filled ? 'star' : 'star-outline'}
                size={18}
                iconSize={14}
                color={colors.yellow}
                variant="transparent"
                shadow={false}
                style={styles.star}
              />
            ))}
          </View>
        </View>
        {date && (
          <Typography variant="caption" color={colors.mediumGray}>
            {date}
          </Typography>
        )}
      </View>
      <Typography variant="body" color={colors.mediumGray} style={styles.review}>
        "{review}"
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  star: {
    marginRight: 2,
  },
  review: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
