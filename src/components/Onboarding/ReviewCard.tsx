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
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  review: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
  star: {
    marginRight: 2,
  },
  stars: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
