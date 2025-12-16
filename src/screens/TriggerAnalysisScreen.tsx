import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { getTopTriggers } from '../services/gutHarmony/triggerDetectionService';
import { theme } from '../theme';
import Text from '../components/Text';
import { Ionicons } from '@expo/vector-icons';

interface TriggerInsight {
  food_name: string;
  likely_symptoms: string[];
  confidence: number;
  had_symptoms: number;
}

export default function TriggerAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<TriggerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTriggers();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [user?.id]);

  const loadTriggers = async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);

      // Get recent entries
      const entries = await entryService.getRecentEntries(user.id, 30);
      setEntryCount(entries?.length || 0);

      // Analyze correlations
      if (entries && entries.length >= 3) {
        const triggers = await getTopTriggers(user.id, 5);
        setTriggers(triggers || []);
      }
    } catch (error) {
      console.error('Error loading triggers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.brand.primary;
    if (confidence >= 0.6) return theme.colors.brand.tertiary;
    return theme.colors.text.secondary;
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Strong';
    if (confidence >= 0.6) return 'Moderate';
    return 'Possible';
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.brand.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="largeTitle" weight="bold">
            Your Triggers
          </Text>
          <Text
            variant="body"
            color="secondary"
            style={{ marginTop: 4 }}
          >
            Based on {entryCount} logged entries
          </Text>
        </View>

        {/* Minimum Entries Warning */}
        {entryCount < 3 && (
          <View style={styles.warningCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.brand.primary}
            />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text variant="body" weight="semiBold">
                Need more data
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={{ marginTop: 4 }}
              >
                Log at least 3 entries to discover your triggers
              </Text>
            </View>
          </View>
        )}

        {/* Triggers List */}
        {triggers.length > 0 ? (
          <View style={styles.triggersContainer}>
            <Text
              variant="title2"
              weight="bold"
              style={{
                paddingHorizontal: theme.spacing['2xl'],
                marginBottom: theme.spacing.lg,
              }}
            >
              Correlations Found
            </Text>

            {triggers.map((trigger, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.triggerCard,
                  {
                    opacity: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [
                      {
                        translateY: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + index * 10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.triggerHeader}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semiBold">
                      {trigger.food_name}
                    </Text>
                    <Text
                      variant="caption"
                      color="secondary"
                      style={{ marginTop: 2 }}
                    >
                      {trigger.likely_symptoms && trigger.likely_symptoms.length > 0
                        ? `triggers ${trigger.likely_symptoms.join(', ')}`
                        : 'possible trigger'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.confidenceBadge,
                      {
                        backgroundColor: getConfidenceColor(trigger.confidence) + '20',
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      weight="bold"
                      style={{
                        color: getConfidenceColor(trigger.confidence),
                      }}
                    >
                      {Math.round(trigger.confidence * 100)}%
                    </Text>
                  </View>
                </View>

                {/* Confidence Bar */}
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceBarFill,
                      {
                        width: `${trigger.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(trigger.confidence),
                      },
                    ]}
                  />
                </View>

                {/* Details */}
                <View style={styles.triggerDetails}>
                  <View style={styles.detailItem}>
                    <Text variant="caption" color="secondary">
                      Confidence
                    </Text>
                    <Text
                      variant="body"
                      weight="semiBold"
                      style={{
                        color: getConfidenceColor(trigger.confidence),
                      }}
                    >
                      {getConfidenceLabel(trigger.confidence)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text variant="caption" color="secondary">
                      Times with Symptoms
                    </Text>
                    <Text variant="body" weight="semiBold">
                      {trigger.had_symptoms}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}

            {/* Recommendations */}
            <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.brand.cream }]}>
              <View style={styles.recommendationsHeader}>
                <Ionicons
                  name="bulb-outline"
                  size={24}
                  color={theme.colors.brand.primary}
                />
                <Text
                  variant="title3"
                  weight="bold"
                  style={{ marginLeft: theme.spacing.md, color: theme.colors.brand.black }}
                >
                  Recommendations
                </Text>
              </View>
              <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
                {triggers.slice(0, 2).map((trigger, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationIconBg}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={theme.colors.brand.primary}
                      />
                    </View>
                    <Text
                      variant="body"
                      style={{
                        flex: 1,
                        marginLeft: theme.spacing.md,
                        color: theme.colors.brand.black,
                      }}
                    >
                      Try eliminating{' '}
                      <Text weight="semiBold" style={{ color: theme.colors.brand.black }}>
                        {trigger.food_name}
                      </Text>{' '}
                      for 3 days to see if your symptoms improve
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="pulse-outline"
              size={48}
              color={theme.colors.text.tertiary}
            />
            <Text
              variant="title3"
              weight="semiBold"
              style={{ marginTop: 16 }}
            >
              No patterns yet
            </Text>
            <Text
              variant="body"
              color="secondary"
              align="center"
              style={{ marginTop: 8 }}
            >
              Log more entries to discover correlations between foods and symptoms
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
  },
  warningCard: {
    marginHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
    backgroundColor: theme.colors.brand.primary + '05',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  triggersContainer: {
    paddingHorizontal: theme.spacing['2xl'],
  },
  triggerCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.separator,
  },
  triggerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  confidenceBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: theme.colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  confidenceBarFill: {
    height: '100%',
  },
  triggerDetails: {
    flexDirection: 'row',
    gap: theme.spacing['2xl'],
  },
  detailItem: {
    flex: 1,
  },
  recommendationsCard: {
    backgroundColor: theme.colors.brand.secondary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.brand.secondary + '30',
    marginBottom: theme.spacing['3xl'],
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  recommendationIconBg: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing['3xl'],
  },
});
