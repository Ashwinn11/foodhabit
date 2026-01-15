import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, fontSizes, radii, shadows, fonts } from '../theme';
import { GutAvatar, ScreenWrapper, StatCard, IconContainer } from '../components';
import { useGutStore } from '../store';

export const InsightsScreen: React.FC = () => {
  const { gutMoments, meals, getStats, getTodayWater } = useGutStore();
  const stats = getStats();
  const todayWater = getTodayWater();
  
  // Calculate most common Bristol type
  const getMostCommonBristol = () => {
    if (gutMoments.length === 0) return '-';
    const counts: { [key: number]: number } = {};
    gutMoments.forEach(m => {
      if (m.bristolType) {
        counts[m.bristolType] = (counts[m.bristolType] || 0) + 1;
      }
    });
    const maxType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return maxType ? `Type ${maxType[0]}` : '-';
  };
  
  // Calculate symptom frequency
  const getSymptomStats = () => {
    if (gutMoments.length === 0) return { bloating: 0, gas: 0, cramping: 0, nausea: 0 };
    
    const counts = {
      bloating: gutMoments.filter(m => m.symptoms.bloating).length,
      gas: gutMoments.filter(m => m.symptoms.gas).length,
      cramping: gutMoments.filter(m => m.symptoms.cramping).length,
      nausea: gutMoments.filter(m => m.symptoms.nausea).length,
    };
    
    return counts;
  };
  
  const symptomStats = getSymptomStats();
  
  // Get mood distribution
  const getMoodStats = () => {
    if (gutMoments.length === 0) return {};
    const counts: { [key: string]: number } = {};
    gutMoments.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    return counts;
  };
  
  const moodStats = getMoodStats();
  const totalMoods = Object.values(moodStats).reduce((a, b) => a + b, 0);
  
  // Get avatar mood based on recent trends
  const getAvatarMood = () => {
    if (gutMoments.length === 0) return 'okay';
    const recent = gutMoments.slice(0, 5);
    const happyCount = recent.filter(m => m.mood === 'happy' || m.mood === 'amazing').length;
    if (happyCount >= 3) return 'happy';
    if (happyCount >= 1) return 'okay';
    return 'bloated';
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Gut Insights</Text>
          <View style={styles.subtitleRow}>
             <IconContainer
               name="bar-chart"
               size={24}
               iconSize={18}
               color={colors.black + '99'}
               backgroundColor="transparent"
               borderWidth={0}
               shadow={false}
               style={{ marginRight: 6 }}
             />
             <Text style={styles.subtitle}>Your health at a glance</Text>
          </View>
        </Animated.View>
        
        <View style={styles.content}>
          {/* Overview Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.overviewCard}
          >
            <GutAvatar mood={getAvatarMood()} size={80} />
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>{stats.totalPoops}</Text>
                <Text style={styles.overviewLabel}>Total Logs</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>{stats.longestStreak}</Text>
                <Text style={styles.overviewLabel}>Day Streak</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>{meals.length}</Text>
                <Text style={styles.overviewLabel}>Meals</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Weekly Stats */}
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <IconContainer 
                name="calendar" 
                size={32} 
                iconSize={18}
                color={colors.blue}
                borderColor={colors.blue}
                shape="circle"
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="AVG/DAY"
                value={stats.avgFrequency}
                unit="x"
                color={colors.yellow}
                style={styles.statCard}
              />
              <StatCard
                label="COMMON"
                value={getMostCommonBristol()}
                color={colors.pink}
                style={styles.statCard}
              />
              <StatCard
                label="WATER"
                value={todayWater}
                unit="cups"
                color={colors.blue}
                icon="water"
                style={styles.statCard}
              />
            </View>
          </Animated.View>
          
          {/* Mood Distribution */}
          {totalMoods > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <IconContainer 
                  name="happy" 
                  size={32} 
                  iconSize={18}
                  color={colors.pink}
                  borderColor={colors.pink}
                  shape="circle"
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={styles.sectionTitle}>Mood Breakdown</Text>
              </View>
              <View style={styles.moodBreakdown}>
                {Object.entries(moodStats).map(([mood, count]) => (
                  <View key={mood} style={styles.moodBar}>
                    <Text style={styles.moodLabel}>{mood}</Text>
                    <View style={styles.moodBarTrack}>
                      <View 
                        style={[
                          styles.moodBarFill, 
                          { width: `${(count / totalMoods) * 100}%`, backgroundColor: colors.pink }
                        ]} 
                      />
                    </View>
                    <Text style={styles.moodCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
          
          {/* Symptom Tracker */}
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <IconContainer 
                name="warning" 
                size={32} 
                iconSize={18}
                color={colors.blue}
                borderColor={colors.blue}
                shape="circle"
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.sectionTitle}>Symptom Tracker</Text>
            </View>
            <View style={styles.symptomGrid}>
              <View style={[styles.symptomCard, { backgroundColor: colors.pink + '15' }]}>
                <IconContainer
                  name="balloon-outline"
                  size={44}
                  iconSize={28}
                  color={colors.pink}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Text style={styles.symptomValue}>{symptomStats.bloating}</Text>
                <Text style={styles.symptomLabel}>Bloating</Text>
              </View>
              <View style={[styles.symptomCard, { backgroundColor: colors.blue + '15' }]}>
                <IconContainer
                  name="cloud-outline"
                  size={44}
                  iconSize={28}
                  color={colors.blue}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Text style={styles.symptomValue}>{symptomStats.gas}</Text>
                <Text style={styles.symptomLabel}>Gas</Text>
              </View>
              <View style={[styles.symptomCard, { backgroundColor: colors.pink + '15' }]}>
                <IconContainer
                  name="flash-outline"
                  size={44}
                  iconSize={28}
                  color={colors.pink}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Text style={styles.symptomValue}>{symptomStats.cramping}</Text>
                <Text style={styles.symptomLabel}>Cramping</Text>
              </View>
              <View style={[styles.symptomCard, { backgroundColor: colors.yellow + '15' }]}>
                <IconContainer
                  name="medkit-outline"
                  size={44}
                  iconSize={28}
                  color={colors.yellow}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Text style={styles.symptomValue}>{symptomStats.nausea}</Text>
                <Text style={styles.symptomLabel}>Nausea</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Empty State */}
          {stats.totalPoops === 0 && (
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.emptyCard}
            >
              <GutAvatar mood="okay" size={100} />
              <Text style={styles.emptyTitle}>Start Tracking!</Text>
              <Text style={styles.emptyText}>
                Log your first poop to see beautiful insights about your gut health patterns!
              </Text>
            </Animated.View>
          )}
          
          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
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
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.heading,
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
  overviewCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  overviewStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.lg,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.black,
  },
  overviewLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: 2,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.black,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  moodBreakdown: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  moodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodLabel: {
    width: 80,
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    textTransform: 'capitalize',
  },
  moodBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: colors.pink + '20',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  moodCount: {
    width: 30,
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black + '66',
    textAlign: 'right',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomCard: {
    width: '48%',
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  symptomValue: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.black,
    marginTop: spacing.sm,
  },
  symptomLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.black,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black + '99',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 100,
  },
});
