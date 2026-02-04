import React, { useState, useEffect, useMemo } from 'react';
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
import { useGutData } from '../presentation/hooks';
import { analyzeFoodWithAI } from '../services/fodmapService';
import { container } from '../infrastructure/di';
import { Meal as DomainMeal, MealType } from '../domain';
import { getTriggerInsightMessage, getTriggerFrequencyMessage, getComboTriggerMessage, getFunGrade } from '../utils/funnyMessages';

export const InsightsScreen: React.FC = () => {
  // Use new architecture for computed values
  const { healthScore, domainMoments } = useGutData();
  
  // Still using store for data and some actions
  const { 
    gutMoments, 
    meals,
    getPoopHistoryData, 
    exportData, 
    getStats, 
    addTriggerFeedback,
    triggerFeedback
  } = useGutStore();
  
  const stats = getStats();
  const historyData = getPoopHistoryData();

  // Get services from DI container
  const triggerService = container.triggerDetectionService;

  // Convert meals to domain entities
  const domainMeals = useMemo(() => {
    return meals.map((m: any) => DomainMeal.reconstitute({
      id: m.id,
      timestamp: new Date(m.timestamp),
      mealType: MealType.create(m.mealType || 'snack'),
      name: m.name || '',
      foods: m.foods || [],
      description: m.description,
      normalizedFoods: m.normalizedFoods,
      foodTags: m.foodTags || [],
    }));
  }, [meals]);

  // Convert trigger feedback to domain format
  const domainFeedback = useMemo(() => {
    return (triggerFeedback || []).map((f: any) => ({
      foodName: f.foodName,
      userConfirmed: f.userConfirmed,
      timestamp: new Date(f.timestamp),
      notes: f.notes,
    }));
  }, [triggerFeedback]);

  // Use new trigger detection service
  const enhancedTriggers = useMemo(() => {
    const triggers = triggerService.detectTriggers({
      moments: domainMoments,
      meals: domainMeals,
      feedback: domainFeedback as any,
    });

    // Convert to the format expected by the UI
    return triggers.map(t => ({
      food: t.food.charAt(0).toUpperCase() + t.food.slice(1),
      occurrences: t.occurrences,
      symptomOccurrences: t.symptomOccurrences,
      confidence: t.confidence,
      frequencyText: `${t.symptomOccurrences} of ${t.occurrences} times`,
      avgLatencyHours: t.avgLatencyHours,
      symptoms: t.symptoms,
      userFeedback: t.userFeedback,
      fodmapIssues: t.fodmapIssues,
      alternatives: t.alternatives,
    }));
  }, [domainMoments, domainMeals, domainFeedback, triggerService]);

  // Get combination triggers
  const combinationTriggers = useMemo(() => {
    const combos = triggerService.detectCombinationTriggers(domainMoments, domainMeals);
    return combos.map(c => ({
      foods: c.foods,
      occurrences: c.occurrences,
      symptomOccurrences: c.symptomOccurrences,
      confidence: c.confidence,
      frequencyText: `${c.symptomOccurrences} of ${c.occurrences} times`,
    }));
  }, [domainMoments, domainMeals, triggerService]);

  // State for AI-enriched insights
  const [aiInsights, setAiInsights] = useState<Record<string, { fodmapIssues?: any; culprits?: string[]; alternatives?: string[] }>>({});
  const [showAllTriggers, setShowAllTriggers] = useState(false);
  
  // Background enrichment for unknown triggers
  useEffect(() => {
    const fetchMissingInsights = async () => {
      for (const trigger of enhancedTriggers) {
        // If trigger has no local FODMAP info and we haven't checked AI yet
        if (!trigger.fodmapIssues && !aiInsights[trigger.food]) {
          const result = await analyzeFoodWithAI(trigger.food);
          if (result) {
            setAiInsights(prev => ({
              ...prev,
              [trigger.food]: {
                fodmapIssues: result.level !== 'low' ? { level: result.level, categories: result.categories } : undefined,
                culprits: result.culprits,
                alternatives: result.alternatives
              }
            }));
          }
        }
      }
    };

    fetchMissingInsights();
  }, [enhancedTriggers]);
  
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

    // Get last poop time formatted
  const getLastPoopTime = () => {
      if (!stats.lastPoopTime) return 'No logs';
      const last = new Date(stats.lastPoopTime);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return 'Now!';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
  };

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
          {/* Overview Card - Using new architecture */}
          <Card 
            variant="white"
            style={styles.overviewCard}
            padding="xl"
          >
            <GutAvatar score={healthScore.score} size={80} />
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Typography variant="h3" color={healthScore.color}>{healthScore.score}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Gut Score</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3">{weeklyLogs}</Typography>
                <Typography variant="bodyXS" color={colors.black + '66'}>Weekly Logs</Typography>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Typography variant="h3" color={healthScore.color}>{getFunGrade(healthScore.score)}</Typography>
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
                style={[styles.statCard, { transform: [{ rotate: '-1.5deg' }] }]}
              />
              <StatCard
                label="MOST COMMON"
                value={getMostCommonBristol()}
                color={colors.pink}
                style={[styles.statCard, { transform: [{ rotate: '1deg' }] }]}
              />

              <StatCard
              label="LAST POOP"
              value={getLastPoopTime()}
              color={colors.yellow}
              icon="time"
              style={[styles.statCard, { transform: [{ rotate: '-1deg' }], marginTop: 2 }]}
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

          {/* Enhanced Triggers - Now using new architecture */}
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
              {enhancedTriggers.slice(0, showAllTriggers ? undefined : 3).map((trigger, i) => {
                // Merge store data with background AI results
                const enriched = {
                  ...trigger,
                  fodmapIssues: trigger.fodmapIssues || aiInsights[trigger.food]?.fodmapIssues,
                  culprits: (trigger as any).culprits || aiInsights[trigger.food]?.culprits,
                  alternatives: trigger.alternatives || aiInsights[trigger.food]?.alternatives
                };

                return (
                <Card key={i} variant="white" padding="md" style={{ marginBottom: spacing.sm }}>
                  <View style={styles.triggerItem}>
                    <View style={styles.triggerDetails}>
                      {/* Food name with confidence badge */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 }}>
                        <Typography variant="bodyBold" color={colors.black}>{enriched.food}</Typography>
                        <View style={[
                          styles.confidenceBadge,
                          { backgroundColor: 
                            enriched.confidence === 'High' ? colors.pink :
                            enriched.confidence === 'Medium' ? '#FFA500' : '#999'
                          }
                        ]}>
                          <Typography variant="bodyXS" color={colors.white}>{enriched.confidence}</Typography>
                        </View>
                      </View>
                      
                      {/* Funny insight based on confidence */}
                      <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginBottom: 2 }}>
                        {getTriggerInsightMessage(enriched.confidence as 'High' | 'Medium' | 'Low')}
                      </Typography>
                      
                      {/* Funny frequency message */}
                      <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginBottom: 4 }}>
                        {enriched.food} {getTriggerFrequencyMessage(enriched.symptomOccurrences, enriched.occurrences)} • {enriched.symptoms.join(', ')}
                      </Typography>

                      {/* Smart Insights: FODMAP & Alternatives */}
                      {(enriched.fodmapIssues || enriched.alternatives) && (
                        <View style={{ marginTop: spacing.xs, padding: spacing.xs, backgroundColor: colors.blue + '10', borderRadius: spacing.sm }}>
                          {enriched.fodmapIssues && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <IconContainer name="flask" size={14} color={colors.blue} variant="transparent" />
                                <Typography variant="bodyXS" color={colors.black} style={{ marginLeft: 4, flex: 1 }}>
                                  Likely Cause: <Typography variant="bodyXS" style={{ fontFamily: 'Fredoka-SemiBold' }}>High {enriched.fodmapIssues.categories.join(', ')}</Typography>
                                  {enriched.culprits && enriched.culprits.length > 0 && (
                                    <Typography variant="bodyXS" color={colors.black + '99'}> ({enriched.culprits.join(', ')})</Typography>
                                  )}
                                </Typography>
                            </View>
                          )}
                          {enriched.alternatives && (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <IconContainer name="leaf" size={14} color={colors.green || colors.blue} variant="transparent" />
                                <Typography variant="bodyXS" color={colors.black} style={{ marginLeft: 4, flex: 1 }}>
                                  Try instead: {enriched.alternatives.slice(0, 3).join(', ')}
                                </Typography>
                            </View>
                          )}
                        </View>
                      )}
                      
                      {/* User Feedback Buttons */}
                      <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
                        <Button
                          title={enriched.userFeedback === true ? "✓ Confirmed" : "Confirm"}
                          variant={enriched.userFeedback === true ? "primary" : "outline"}
                          size="sm"
                          onPress={() => addTriggerFeedback({
                            foodName: enriched.food,
                            userConfirmed: true,
                            timestamp: new Date()
                          })}
                          color={enriched.userFeedback === true ? colors.blue : colors.black}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title={enriched.userFeedback === false ? "✗ Denied" : "Not a trigger"}
                          variant={enriched.userFeedback === false ? "primary" : "outline"}
                          size="sm"
                          onPress={() => addTriggerFeedback({
                            foodName: enriched.food,
                            userConfirmed: false,
                            timestamp: new Date()
                          })}
                          color={enriched.userFeedback === false ? colors.pink : colors.black}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              )})}
              
              {enhancedTriggers.length > 3 && (
                <View style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
                  <Button
                    title={showAllTriggers ? "Show Less" : `See All ${enhancedTriggers.length} Triggers`}
                    variant="outline"
                    onPress={() => setShowAllTriggers(!showAllTriggers)}
                    style={{ backgroundColor: colors.white, borderColor: colors.border }}
                    color={colors.black + '80'}
                  />
                </View>
              )}
            </Animated.View>
          )}
          
          {/* Combination Triggers - Now using new architecture */}
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
                <Typography variant="bodySmall" color={colors.black} style={{ marginBottom: spacing.sm }}>
                  {getComboTriggerMessage()}
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
                variant="solid"
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
                <GutAvatar score={healthScore.score} size={100} />
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
