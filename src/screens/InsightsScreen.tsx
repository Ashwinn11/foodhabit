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
  const { gutMoments, getEnhancedTriggers, getCombinationTriggers, getPoopHistoryData, exportData, getTodayWater, getGutHealthScore, getStats, addTriggerFeedback } = useGutStore();
  const stats = getStats();
  const todayWater = getTodayWater();
  const enhancedTriggers = getEnhancedTriggers();
  const combinationTriggers = getCombinationTriggers();
  const historyData = getPoopHistoryData();
  
  // Calculate weekly logs for Insights focus
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyLogs = gutMoments.filter(m => new Date(m.timestamp) >= weekAgo).length;
  
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
                <Typography variant="h3" color={colors.pink}>{healthScore.score}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Gut Score</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3">{weeklyLogs}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Weekly Logs</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3" color={colors.blue}>{healthScore.grade}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Gut Status</Typography>
              </View>
            </View>
          </Card>
          
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <SectionHeader 
              title="This Week's Stats" 
              icon="calendar" 
              iconColor={colors.blue}
            />
            <View style={styles.statsRow}>
              <StatCard
                label="DAILY AVG"
                value={stats.avgFrequency}
                unit="x"
                color={colors.yellow}
                style={styles.statCard}
              />
              <StatCard
                label="MOST COMMON"
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

          {/* Enhanced Triggers */}
          {enhancedTriggers.length > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(350).springify()}
              style={styles.section}
            >
              <SectionHeader 
                title="Food Triggers" 
                icon="alert-circle" 
                iconColor={colors.pink}
              />
              {enhancedTriggers.map((trigger, i) => (
                <Card key={i} variant="white" padding="md" style={{ marginBottom: spacing.sm }}>
                  <View style={styles.triggerItem}>
                    <View style={styles.triggerDetails}>
                      {/* Food name with confidence badge */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 }}>
                        <Typography variant="bodyBold" color={colors.black}>{trigger.food}</Typography>
                        <View style={[
                          styles.confidenceBadge,
                          { backgroundColor: 
                            trigger.confidence === 'High' ? colors.pink :
                            trigger.confidence === 'Medium' ? '#FFA500' : '#999'
                          }
                        ]}>
                          <Typography variant="bodyXS" color={colors.white}>{trigger.confidence}</Typography>
                        </View>
                      </View>
                      
                      {/* Frequency */}
                      <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginBottom: 2 }}>
                        Triggers {trigger.frequencyText}
                      </Typography>
                      
                      {/* Latency */}
                      <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginBottom: 4 }}>
                        Typically in {trigger.avgLatencyHours}h • {trigger.symptoms.join(', ')}
                      </Typography>
                      
                      {/* User Feedback Buttons */}
                      <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
                        <Button
                          title={trigger.userFeedback === true ? "✓ Confirmed" : "Confirm"}
                          variant={trigger.userFeedback === true ? "primary" : "outline"}
                          size="sm"
                          onPress={() => addTriggerFeedback({
                            foodName: trigger.food,
                            userConfirmed: true,
                            timestamp: new Date()
                          })}
                          color={trigger.userFeedback === true ? colors.blue : colors.black}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title={trigger.userFeedback === false ? "✗ Denied" : "Not a trigger"}
                          variant={trigger.userFeedback === false ? "primary" : "outline"}
                          size="sm"
                          onPress={() => addTriggerFeedback({
                            foodName: trigger.food,
                            userConfirmed: false,
                            timestamp: new Date()
                          })}
                          color={trigger.userFeedback === false ? colors.pink : colors.black}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </Animated.View>
          )}
          
          {/* Combination Triggers */}
          {combinationTriggers.length > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.section}
            >
              <SectionHeader 
                title="Food Combinations" 
                icon="link" 
                iconColor={colors.blue}
              />
              <Card variant="colored" color={colors.blue} padding="md">
                <Typography variant="bodySmall" color={colors.blue} style={{ marginBottom: spacing.sm }}>
                  These food combos trigger more than individually:
                </Typography>
                {combinationTriggers.map((combo, i) => (
                  <View key={i} style={styles.triggerItem}>
                    <View style={styles.triggerDetails}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Typography variant="bodyBold" color={colors.black}>
                          {combo.foods.join(' + ')}
                        </Typography>
                        <View style={[styles.confidenceBadge, { backgroundColor: colors.blue }]}>
                          <Typography variant="bodyXS" color={colors.white}>{combo.confidence}</Typography>
                        </View>
                      </View>
                      <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: 2 }}>
                        {combo.frequencyText}
                      </Typography>
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
  fodmapBadge: {
    backgroundColor: colors.blue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fodmapInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white + 'CC',
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  confidenceBadge: {
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
