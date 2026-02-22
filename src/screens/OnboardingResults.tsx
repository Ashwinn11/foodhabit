import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { AnalysisResult } from '../services/fodmapService';

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W  = SCREEN_W - theme.spacing.xl * 2 - 56;
const PROGRESS = TRACK_W * 0.71;

export const OnboardingResults = ({ route, navigation }: any) => {
  const analysisData: AnalysisResult[] = route.params?.analysisData || [];
  const avoidFoods   = analysisData.filter(r => r.level === 'avoid' || r.level === 'caution');
  const safeFoods    = analysisData.filter(r => r.level === 'safe');
  const displayAvoid = avoidFoods.length > 0 ? avoidFoods.map(f => f.normalizedName) : ['Garlic', 'Dairy', 'Onion'];
  const displaySafe  = safeFoods.length  > 0 ? safeFoods.map(f => f.normalizedName)  : ['Rice', 'Chicken', 'Oatmeal'];

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  return (
    <Screen padding>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>5 of 7</Text>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>Your food{'\n'}safety map.</Text>
      <Text variant="body" style={styles.sub}>Based on your profile, here's what our AI found.</Text>

      <View style={styles.cards}>
        {/* AVOID card */}
        <View style={styles.avoidCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.coral }]} />
            <Text variant="caption" style={[styles.cardHeaderLabel, { color: theme.colors.coral }]}>AVOID</Text>
            <View style={styles.countBadge}>
              <Text variant="caption" style={styles.countText}>{displayAvoid.length}</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {displayAvoid.map((name, i) => (
              <Chip key={i} label={name} status="risky" />
            ))}
          </View>
        </View>

        {/* SAFE card */}
        <View style={styles.safeCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.lime }]} />
            <Text variant="caption" style={[styles.cardHeaderLabel, { color: theme.colors.lime }]}>SAFE FOR YOU</Text>
            <View style={[styles.countBadge, styles.countBadgeSafe]}>
              <Text variant="caption" style={[styles.countText, { color: theme.colors.lime }]}>{displaySafe.length}</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            {displaySafe.map((name, i) => (
              <Chip key={i} label={name} status="safe" />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Looks right" onPress={() => navigation.navigate('OnboardingSocialProof')} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.textPrimary, fontFamily: 'Inter_700Bold' },
  title: { marginBottom: theme.spacing.md },
  sub: { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxxl },
  cards: { flex: 1, gap: theme.spacing.md },
  avoidCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  safeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(212,248,112,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  cardHeaderLabel: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  countBadge: {
    backgroundColor: 'rgba(224,93,76,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  countBadgeSafe: { backgroundColor: 'rgba(212,248,112,0.12)' },
  countText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: theme.colors.coral,
    textTransform: 'none',
    letterSpacing: 0,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  footer: { marginTop: 'auto', paddingBottom: theme.spacing.sm },
});
