import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii, shadows, fonts } from '../theme';
import { GutAvatar, ScreenWrapper } from '../components';

export const InsightsScreen: React.FC = () => {
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <Text style={styles.title}>Gut Insights</Text>
        <View style={styles.subtitleRow}>
           <Ionicons name="bar-chart" size={20} color={colors.black + '99'} style={{marginRight: 6}} />
           <Text style={styles.subtitle}>Coming Soon!</Text>
        </View>
      </Animated.View>
      
      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.card}
        >
          <GutAvatar mood="happy" size={100} />
          <Text style={styles.cardTitle}>Track Your Trends</Text>
          <Text style={styles.cardText}>
            Soon you'll see beautiful charts showing your gut health patterns over time!
          </Text>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.featuresContainer}
        >
          <View style={[styles.featureCard, { backgroundColor: colors.pink + '15' }]}>
            <Ionicons name="trending-up" size={32} color={colors.pink} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Poop Frequency</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.blue + '15' }]}>
             <Ionicons name="restaurant" size={32} color={colors.blue} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Food Triggers</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.blue + '15' }]}>
             <Ionicons name="happy" size={32} color={colors.blue} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Mood Patterns</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.yellow + '15' }]}>
             <Ionicons name="trophy" size={32} color={colors.yellow} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>Health Goals</Text>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
  },
  subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.body,
    color: colors.black + '99',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black + '99',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: '47%',
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  featureIcon: {
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    textAlign: 'center',
  },
});
