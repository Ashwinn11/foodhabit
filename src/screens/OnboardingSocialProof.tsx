import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ScanLine, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W  = SCREEN_W - theme.spacing.xl * 2 - 56;
const PROGRESS = TRACK_W * 0.85;

const FEATURES = [
  {
    Icon: ScanLine,
    color: theme.colors.coral,
    bg: 'rgba(224,93,76,0.12)',
    title: 'Scan any food or menu',
    sub: 'Type it or photograph it — instant verdict',
  },
  {
    Icon: AlertTriangle,
    color: theme.colors.amber,
    bg: 'rgba(245,201,122,0.12)',
    title: 'Detect your triggers',
    sub: 'AI learns your patterns from every log',
  },
  {
    Icon: CheckCircle,
    color: theme.colors.lime,
    bg: 'rgba(212,248,112,0.12)',
    title: 'Eat safely, every time',
    sub: 'Clear green/red verdict before every bite',
  },
];

export const OnboardingSocialProof = ({ navigation }: any) => {
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
        <Text variant="caption" style={styles.stepText}>6 of 7</Text>
      </View>

      {/* Stars + rating */}
      <View style={styles.starsRow}>
        {[0,1,2,3,4].map(i => <Text key={i} style={styles.star}>★</Text>)}
        <Text variant="caption" style={styles.rating}>4.9 · 2,400+ ratings</Text>
      </View>

      {/* Quote card with left-border accent */}
      <View style={styles.quoteCard}>
        <Text variant="body" style={styles.quoteText}>
          "Finally know what causes my bloating. My doctor couldn't figure this out in 3 years. GutBuddy did it in a week."
        </Text>
        <Text variant="caption" style={styles.quoteAuthor}>— Sarah M., IBS-D</Text>
      </View>

      <View style={styles.divider} />

      {/* Feature rows with SVG icons in tinted containers */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
              <f.Icon color={f.color} size={22} strokeWidth={2} />
            </View>
            <View style={styles.featureText}>
              <Text variant="label" style={styles.featureTitle}>{f.title}</Text>
              <Text variant="caption" style={styles.featureSub}>{f.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button label="That's me" onPress={() => navigation.navigate('OnboardingCustomPlan')} />
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
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: theme.spacing.xl,
  },
  star: { color: theme.colors.amber, fontSize: 24 },
  rating: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
  quoteCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.coral,
    paddingLeft: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  quoteText: {
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: theme.spacing.md,
  },
  quoteAuthor: { color: theme.colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: theme.spacing.xxxl,
  },
  features: { flex: 1, gap: theme.spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: { color: theme.colors.textPrimary, marginBottom: 3 },
  featureSub: {
    color: theme.colors.textSecondary,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});
