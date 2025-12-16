import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { theme } from '../theme';
import Text from '../components/Text';
import { EmptyState, IconButton } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { STOOL_TYPES, getEnergyIcon } from '../constants/stoolData';

interface HistoryEntry {
  id: string;
  stool_type: number;
  energy_level: number | undefined;
  symptoms: Record<string, boolean>;
  created_at: string;
}

type MarkedDates = Record<string, any>;

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  // Track current month for future filtering/analytics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [user?.id]);

  const loadHistory = async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);

      const allEntries = await entryService.getRecentEntries(user.id, 90);
      const validEntries = (allEntries || []).filter(e => e.energy_level !== undefined) as HistoryEntry[];
      setEntries(validEntries);

      // Build marked dates for calendar
      const marked: MarkedDates = {};
      validEntries.forEach((entry) => {
        const date = new Date(entry.created_at).toISOString().split('T')[0];
        marked[date] = {
          marked: true,
          dotColor: theme.colors.brand.primary,
          selected: false,
        };
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayPress = (day: any) => {
    const entry = entries.find(
      (e) => new Date(e.created_at).toISOString().split('T')[0] === day.dateString
    );
    if (entry) {
      setSelectedEntry(entry);
    } else {
      // Show empty state for dates with no data
      setSelectedEntry({
        id: 'empty',
        stool_type: 0,
        energy_level: undefined,
        symptoms: {},
        created_at: day.dateString,
      } as HistoryEntry);
    }
  };

  const handleMonthChange = (date: any) => {
    // Update the current month when user navigates
    setCurrentMonth(date.dateString.substring(0, 7));
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
            Your History
          </Text>
          <Text
            variant="body"
            color="secondary"
            style={{ marginTop: 4 }}
          >
            {entries.length} entries logged
          </Text>
        </View>

        {/* Calendar */}
        <Animated.View
          style={[
            styles.calendarContainer,
            {
              opacity: scaleAnim,
              transform: [
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Calendar
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            hideExtraDays={false}
            theme={{
              backgroundColor: theme.colors.background.primary,
              calendarBackground: theme.colors.background.primary,
              textSectionTitleColor: theme.colors.text.secondary,
              textSectionTitleDisabledColor: theme.colors.text.tertiary,
              selectedDayBackgroundColor: theme.colors.brand.primary,
              selectedDayTextColor: theme.colors.brand.white,
              todayTextColor: theme.colors.brand.primary,
              todayBackgroundColor: theme.colors.background.card,
              dayTextColor: theme.colors.text.primary,
              textDisabledColor: theme.colors.text.tertiary,
              dotColor: theme.colors.brand.primary,
              selectedDotColor: theme.colors.brand.white,
              monthTextColor: theme.colors.text.primary,
              arrowColor: theme.colors.brand.primary,
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
        </Animated.View>

        {/* Recent Entries List */}
        {entries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text
              variant="title2"
              weight="bold"
              style={{ marginBottom: theme.spacing.lg }}
            >
              Recent Entries
            </Text>
            {entries.slice(0, 5).map((entry, index) => {
              const stoolType = STOOL_TYPES.find(t => t.type === entry.stool_type);
              const energyIcon = entry.energy_level !== undefined ? getEnergyIcon(entry.energy_level) : null;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedEntry(entry);
                  }}
                  style={styles.entryRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semiBold">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text
                      variant="caption"
                      color="secondary"
                      style={{ marginTop: 2 }}
                    >
                      {stoolType?.label || `Type ${entry.stool_type}`}
                    </Text>
                  </View>
                  <View style={styles.entryMeta}>
                    {energyIcon && (
                      <Ionicons
                        name={energyIcon.name as any}
                        size={18}
                        color={energyIcon.color}
                      />
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {entries.length === 0 && (
          <EmptyState
            icon="calendar-outline"
            title="No entries yet"
            description="Your logged entries will appear here"
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Entry Detail Modal */}
      <Modal
        visible={selectedEntry !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSelectedEntry(null);
        }}
      >
        <View
          style={[
            styles.modalContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                onPress={() => setSelectedEntry(null)}
                color={theme.colors.text.primary}
              />
              <Text variant="title2" weight="bold">
                Entry Details
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedEntry && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Date */}
                <View style={styles.detailSection}>
                  <Text variant="caption" color="secondary">
                    Date
                  </Text>
                  <Text
                    variant="body"
                    weight="semiBold"
                    style={{ marginTop: 4 }}
                  >
                    {new Date(selectedEntry.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Empty State - No Data for this date */}
                {selectedEntry.id === 'empty' && (
                  <EmptyState
                    icon="calendar-outline"
                    title="No entry for this date"
                    description="Start logging to track your health patterns"
                  />
                )}

                {/* Stool Type */}
                {selectedEntry.id !== 'empty' && (
                  <>
                    <View style={styles.detailSection}>
                      <Text variant="caption" color="secondary">
                        Stool Type
                      </Text>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          {STOOL_TYPES.find(t => t.type === selectedEntry.stool_type)?.iconLib && (
                            <Ionicons
                              name={STOOL_TYPES.find(t => t.type === selectedEntry.stool_type)?.icon as any}
                              size={24}
                              color={STOOL_TYPES.find(t => t.type === selectedEntry.stool_type)?.color}
                            />
                          )}
                        </View>
                        <Text variant="body" weight="semiBold">
                          {STOOL_TYPES.find(t => t.type === selectedEntry.stool_type)?.label}
                        </Text>
                      </View>
                    </View>

                    {/* Energy Level */}
                    {selectedEntry.energy_level !== undefined && (
                      <View style={styles.detailSection}>
                        <Text variant="caption" color="secondary">
                          Energy Level
                        </Text>
                        <View style={styles.detailRow}>
                          <Ionicons
                            name={getEnergyIcon(selectedEntry.energy_level).name as any}
                            size={24}
                            color={getEnergyIcon(selectedEntry.energy_level).color}
                          />
                          <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.md }}>
                            {selectedEntry.energy_level}/10
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Symptoms */}
                    {Object.values(selectedEntry.symptoms || {}).some(Boolean) && (
                      <View style={styles.detailSection}>
                        <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.md }}>
                          Symptoms
                        </Text>
                        <View style={styles.symptomsList}>
                          {Object.entries(selectedEntry.symptoms || {}).map(([key, value]) =>
                            value ? (
                              <View key={key} style={styles.symptomTag}>
                                <Text
                                  variant="caption"
                                  weight="semiBold"
                                  style={{
                                    color: theme.colors.brand.white,
                                  }}
                                >
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Text>
                              </View>
                            ) : null
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  calendarContainer: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
  },
  entriesSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.separator,
  },
  entryMeta: {
    marginRight: theme.spacing.lg,
  },
  emptyState: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing['3xl'],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    paddingHorizontal: theme.spacing['2xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.separator,
  },
  modalBody: {
    paddingVertical: theme.spacing.lg,
  },
  emptyDetailState: {
    paddingVertical: theme.spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailSection: {
    marginBottom: theme.spacing['2xl'],
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.separator,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  symptomTag: {
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
