import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../theme';
import { 
  GutAvatar, 
  ScreenWrapper, 
  StatCard, 
  IconContainer,
  Typography,
  Card,
  SectionHeader,
  Button
} from '../components';
import { useGutStore } from '../store';

export const InsightsScreen: React.FC = () => {
  const { gutMoments, meals, getPotentialTriggers, getPoopHistoryData, exportData, getTodayWater, getGutHealthScore, getStats } = useGutStore();
  const stats = getStats();
  const todayWater = getTodayWater();
  const triggers = getPotentialTriggers();
  const historyData = getPoopHistoryData();
  
  const getMostCommonBristol = () => {
    if (gutMoments.length === 0) return '-';
    const counts: { [key: number]: number } = {};
    gutMoments.forEach(m => {
      if (m.bristolType) {
        counts[m.bristolType] = (counts[m.bristolType] || 0) + 1;
      }
    });
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxType = sortedEntries[0];
    return maxType ? `Type ${maxType[0]}` : '-';
  };
  
  const getSymptomStats = () => {
    if (gutMoments.length === 0) return { bloating: 0, gas: 0, cramping: 0, nausea: 0 };
    
    return {
      bloating: gutMoments.filter(m => m.symptoms.bloating).length,
      gas: gutMoments.filter(m => m.symptoms.gas).length,
      cramping: gutMoments.filter(m => m.symptoms.cramping).length,
      nausea: gutMoments.filter(m => m.symptoms.nausea).length,
    };
  };
  
  const symptomStats = getSymptomStats();
  const healthScore = getGutHealthScore();

  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Typography variant="h2">Gut Insights</Typography>
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
             <Typography variant="body" color={colors.black + '99'}>
               Your health at a glance
             </Typography>
          </View>
        </Animated.View>
        
        <View style={styles.content}>
          <Card 
            variant="white"
            style={styles.overviewCard}
            padding="xl"
          >
            <GutAvatar score={healthScore.score} size={80} />
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Typography variant="h3">{stats.totalPoops}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Total Logs</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3">{stats.longestStreak}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Day Streak</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3">{meals.length}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Meals</Typography>
              </View>
            </View>
          </Card>
          
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <SectionHeader 
              title="This Week" 
              icon="calendar" 
              iconColor={colors.blue}
            />
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

            {/* Poop Frequency Chart */}
            <Card variant="white" style={{ marginTop: spacing.md }} padding="md">
              <Typography variant="bodyBold" style={{ marginBottom: spacing.sm }}>7-Day Frequency</Typography>
              <View style={styles.chartContainer}>
                {historyData.map((d, i) => {
                   const maxVal = Math.max(...historyData.map(id => id.count), 1);
                   const height = (d.count / maxVal) * 60;
                   return (
                     <View key={i} style={styles.chartColumn}>
                        <View style={[styles.chartBar, { height: Math.max(height, 4), backgroundColor: d.count > 0 ? colors.blue : colors.border + '33' }]} />
                        <Typography variant="bodyXS" color={colors.black + '66'} style={{ fontSize: 8 }}>{d.date}</Typography>
                     </View>
                   );
                })}
              </View>
            </Card>
          </Animated.View>

          {/* Potential Triggers */}
          {triggers.length > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(350).springify()}
              style={styles.section}
            >
              <SectionHeader 
                title="Potential Triggers" 
                icon="alert-circle" 
                iconColor={colors.pink}
              />
              <Card variant="colored" color={colors.pink} padding="md">
                <Typography variant="bodySmall" color={colors.pink} style={{ marginBottom: spacing.sm }}>
                  These foods appear often before you feel symptoms:
                </Typography>
                {triggers.map((t, i) => (
                  <View key={i} style={styles.triggerItem}>
                    <View style={styles.triggerDetails}>
                      <Typography variant="bodyBold" color={colors.black}>{t.food}</Typography>
                      <Typography variant="bodyXS" color={colors.black + '66'}>
                        Linked to: {t.symptoms.join(', ')}
                      </Typography>
                    </View>
                    <View style={styles.triggerBadge}>
                      <Typography variant="bodySmall" color={colors.white}>{t.count}x</Typography>
                    </View>
                  </View>
                ))}
              </Card>
            </Animated.View>
          )}
          
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={styles.section}
          >
            <SectionHeader 
              title="Symptom Tracker" 
              icon="warning" 
              iconColor={colors.blue}
            />
            <View style={styles.symptomGrid}>
              <Card variant="colored" color={colors.pink} style={styles.symptomCard}>
                <IconContainer
                  name="balloon-outline"
                  size={44}
                  iconSize={28}
                  color={colors.pink}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Typography variant="h3" style={{ marginTop: spacing.sm }}>{symptomStats.bloating}</Typography>
                <Typography variant="bodySmall" color={colors.black + '66'}>Bloating</Typography>
              </Card>
              <Card variant="colored" color={colors.blue} style={styles.symptomCard}>
                <IconContainer
                  name="cloud-outline"
                  size={44}
                  iconSize={28}
                  color={colors.blue}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Typography variant="h3" style={{ marginTop: spacing.sm }}>{symptomStats.gas}</Typography>
                <Typography variant="bodySmall" color={colors.black + '66'}>Gas</Typography>
              </Card>
              <Card variant="colored" color={colors.pink} style={styles.symptomCard}>
                <IconContainer
                  name="flash-outline"
                  size={44}
                  iconSize={28}
                  color={colors.pink}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                />
                <Typography variant="h3" style={{ marginTop: spacing.sm }}>{symptomStats.cramping}</Typography>
                <Typography variant="bodySmall" color={colors.black + '66'}>Cramping</Typography>
              </Card>
              <Card variant="colored" color={colors.yellow} style={styles.symptomCard}>
                <IconContainer
                  name="medkit-outline"
                  size={44}
                  iconSize={28}
                  color={colors.black}
                  backgroundColor={colors.yellow}
                  borderWidth={0}
                  shadow={false}
                />
                <Typography variant="h3" style={{ marginTop: spacing.sm }}>{symptomStats.nausea}</Typography>
                <Typography variant="bodySmall" color={colors.black + '66'}>Nausea</Typography>
              </Card>
            </View>
          </Animated.View>
          
          {/* Export section */}
          <Animated.View 
            entering={FadeInDown.delay(550).springify()}
            style={styles.exportSection}
          >
            <Card variant="white" padding="lg" style={styles.exportCard}>
              <IconContainer 
                name="document-text" 
                size={48} 
                iconSize={24} 
                color={colors.blue} 
                backgroundColor={colors.blue + '15'}
                borderWidth={0}
                shadow={false}
              />
              <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                <Typography variant="bodyBold">Doctor's Report</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Export your gut history as a PDF</Typography>
              </View>
              <Button 
                title="Export" 
                variant="outline" 
                size="sm" 
                onPress={exportData}
              />
            </Card>
          </Animated.View>
          
          {stats.totalPoops === 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Card 
                variant="white"
                style={styles.emptyCard}
              >
                <GutAvatar score={50} size={100} />
                <Typography variant="h3" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
                  Start Tracking!
                </Typography>
                <Typography variant="body" align="center" color={colors.black + '99'}>
                  Log your first poop to see beautiful insights about your gut health patterns!
                </Typography>
              </Card>
            </Animated.View>
          )}
          
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  moodBreakdown: {
    // Styling handled by Card component
  },
  moodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodLabel: {
    width: 80,
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
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomCard: {
    width: '48%',
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingTop: spacing.sm,
  },
  chartColumn: {
    alignItems: 'center',
    width: '12%',
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.xs,
  },
  triggerDetails: {
    flex: 1,
  },
  triggerBadge: {
    backgroundColor: colors.pink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  exportSection: {
    marginVertical: spacing.md,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
