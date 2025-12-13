import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { streakService } from '../services/gutHarmony/streakService';
import { theme } from '../theme';
import Text from '../components/Text';
import { Ionicons } from '@expo/vector-icons';

const STOOL_TYPES = [
  {
    type: 1,
    label: 'Type 1',
    description: 'Separate hard lumps',
    subtext: 'Constipation',
    icon: '■',
    color: '#8B6F47',
  },
  {
    type: 2,
    label: 'Type 2',
    description: 'Lumpy & sausage-like',
    subtext: 'Constipated',
    icon: '■',
    color: '#A0826D',
  },
  {
    type: 3,
    label: 'Type 3',
    description: 'Sausage-shaped',
    subtext: 'Normal',
    icon: '■',
    color: '#C4B5A0',
  },
  {
    type: 4,
    label: 'Type 4',
    description: 'Smooth & soft',
    subtext: 'Normal',
    icon: '●',
    color: '#78D3BF',
  },
  {
    type: 5,
    label: 'Type 5',
    description: 'Soft blobs',
    subtext: 'Slightly loose',
    icon: '●',
    color: '#FFD700',
  },
  {
    type: 6,
    label: 'Type 6',
    description: 'Mushy paste',
    subtext: 'Loose',
    icon: '◉',
    color: '#FF9500',
  },
  {
    type: 7,
    label: 'Type 7',
    description: 'Liquid only',
    subtext: 'Diarrhea',
    icon: '◆',
    color: '#FF6B6B',
  },
];

const SYMPTOMS = [
  { id: 'bloating', label: 'Bloating', icon: 'balloon-outline' },
  { id: 'gas', label: 'Gas', icon: 'cloud-outline' },
  { id: 'cramping', label: 'Cramping', icon: 'alert-circle-outline' },
  { id: 'urgency', label: 'Urgency', icon: 'flash-outline' },
  { id: 'burning', label: 'Burning', icon: 'flame-outline' },
];

interface QuickLogData {
  stoolType: number | null;
  energyLevel: number;
  selectedSymptoms: string[];
  logTime: Date;
}

export default function QuickLogScreen({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuickLogData>({
    stoolType: null,
    energyLevel: 5,
    selectedSymptoms: [],
    logTime: new Date(),
  });

  const isComplete = data.stoolType !== null;

  const toggleSymptom = (symptomId: string) => {
    setData((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter((s) => s !== symptomId)
        : [...prev.selectedSymptoms, symptomId],
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id || !isComplete) return;

    setLoading(true);
    try {
      // Create symptoms object
      const symptomsObj = SYMPTOMS.reduce(
        (acc, symptom) => ({
          ...acc,
          [symptom.id]: data.selectedSymptoms.includes(symptom.id),
        }),
        {}
      );

      // Log entry with selected time
      await entryService.logStoolEntry(user.id, {
        entry_time: data.logTime.toISOString(),
        stool_type: data.stoolType!,
        energy_level: data.energyLevel,
        symptoms: symptomsObj,
      });

      // Update streak
      await streakService.updateStreak(user.id);

      Alert.alert('Success', 'Entry logged! Keep tracking for accurate insights.');
      onComplete();
    } catch (error) {
      console.error('Error logging entry:', error);
      Alert.alert('Error', 'Failed to log entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTime = (hours: number, minutes: number) => {
    const newTime = new Date(data.logTime);
    newTime.setHours(hours, minutes, 0, 0);
    setData((prev) => ({ ...prev, logTime: newTime }));
  };

  const selectedStoolType = STOOL_TYPES.find((t) => t.type === data.stoolType);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="title2" weight="bold">
          Quick Log
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Time Picker */}
        <View style={styles.section}>
          <Text variant="caption" color="secondary" style={styles.sectionTitle}>
            When did this happen?
          </Text>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text
              variant="title2"
              weight="bold"
              style={{ color: theme.colors.brand.black }}
            >
              {data.logTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
            <Text
              variant="caption"
              style={{ marginTop: 4, color: theme.colors.brand.black }}
            >
              {data.logTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Time Presets */}
          <View style={styles.timePresetsGrid}>
            {[
              { label: 'Morning', hours: 8, minutes: 0 },
              { label: 'Afternoon', hours: 14, minutes: 0 },
              { label: 'Evening', hours: 19, minutes: 0 },
              { label: 'Now', hours: new Date().getHours(), minutes: new Date().getMinutes() },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.timePreset,
                  data.logTime.getHours() === preset.hours &&
                    data.logTime.getMinutes() === preset.minutes &&
                    styles.timePresetSelected,
                ]}
                onPress={() => updateTime(preset.hours, preset.minutes)}
              >
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{
                    color:
                      data.logTime.getHours() === preset.hours &&
                      data.logTime.getMinutes() === preset.minutes
                        ? theme.colors.brand.primary
                        : theme.colors.text.secondary,
                  }}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stool Type - Bristol Scale with proper descriptions */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            Bristol Stool Scale
          </Text>

          {/* Selected Type Display */}
          {selectedStoolType && (
            <View
              style={[
                styles.selectedTypeDisplay,
                { borderLeftColor: selectedStoolType.color },
              ]}
            >
              <Text variant="title1" style={{ fontSize: 32 }}>
                {selectedStoolType.icon}
              </Text>
              <View style={{ flex: 1, marginLeft: theme.spacing.lg }}>
                <Text
                  variant="body"
                  weight="semiBold"
                  style={{ color: theme.colors.brand.black }}
                >
                  {selectedStoolType.label}
                </Text>
                <Text
                  variant="caption"
                  style={{ marginTop: 4, color: theme.colors.brand.black }}
                >
                  {selectedStoolType.description}
                </Text>
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{ marginTop: 2, color: selectedStoolType.color }}
                >
                  {selectedStoolType.subtext}
                </Text>
              </View>
            </View>
          )}

          {/* Type Selection Grid */}
          <View style={styles.typeGrid}>
            {STOOL_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeCard,
                  data.stoolType === item.type && styles.typeCardSelected,
                ]}
                onPress={() => setData((prev) => ({ ...prev, stoolType: item.type }))}
              >
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text variant="title1" style={{ color: theme.colors.brand.white }}>
                    {item.icon}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  weight="semiBold"
                  align="center"
                  style={{ marginTop: 8 }}
                >
                  {item.label}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  align="center"
                  style={{ marginTop: 2, fontSize: 10 }}
                >
                  {item.subtext}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Energy Level - Slider */}
        <View style={styles.section}>
          <View style={styles.energyHeader}>
            <Text variant="title3" weight="bold">
              Energy Level
            </Text>
            <View
              style={[
                styles.energyBadge,
                {
                  backgroundColor:
                    data.energyLevel >= 7
                      ? 'rgba(120, 211, 191, 0.2)'
                      : data.energyLevel >= 4
                        ? 'rgba(255, 215, 0, 0.2)'
                        : 'rgba(255, 107, 107, 0.2)',
                },
              ]}
            >
              <Text
                variant="title3"
                weight="bold"
                style={{
                  color:
                    data.energyLevel >= 7
                      ? theme.colors.feedback.success
                      : data.energyLevel >= 4
                        ? '#FFD700'
                        : theme.colors.feedback.error,
                }}
              >
                {data.energyLevel}/10
              </Text>
            </View>
          </View>

          {/* Slider with cream background like onboarding */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={data.energyLevel}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, energyLevel: value }))
              }
              minimumTrackTintColor={theme.colors.brand.primary}
              maximumTrackTintColor={theme.colors.border.light}
              thumbTintColor={theme.colors.brand.primary}
            />
            <View style={styles.sliderLabels}>
              <Text variant="caption" style={{ color: theme.colors.brand.black }}>
                Low
              </Text>
              <Text variant="caption" style={{ color: theme.colors.brand.black }}>
                High
              </Text>
            </View>
          </View>

          {/* Energy Description */}
          <Text
            variant="caption"
            color="secondary"
            align="center"
            style={{ marginTop: theme.spacing.lg }}
          >
            {data.energyLevel >= 8
              ? '🔥 Energized'
              : data.energyLevel >= 6
                ? '✓ Good'
                : data.energyLevel >= 4
                  ? '〰 Neutral'
                  : data.energyLevel >= 2
                    ? '⚠ Low'
                    : '😴 Exhausted'}
          </Text>
        </View>

        {/* Symptoms - Optional */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            Symptoms
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: theme.spacing.lg }}
          >
            Select any that apply (optional)
          </Text>

          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomCard,
                  data.selectedSymptoms.includes(symptom.id) &&
                    styles.symptomCardSelected,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Ionicons
                  name={
                    data.selectedSymptoms.includes(symptom.id)
                      ? symptom.icon.replace('-outline', '')
                      : symptom.icon
                  }
                  size={24}
                  color={
                    data.selectedSymptoms.includes(symptom.id)
                      ? theme.colors.brand.primary
                      : theme.colors.text.secondary
                  }
                />
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{
                    marginTop: theme.spacing.sm,
                    color: data.selectedSymptoms.includes(symptom.id)
                      ? theme.colors.brand.primary
                      : theme.colors.text.secondary,
                  }}
                >
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer - Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isComplete || loading}
          style={[
            styles.submitButton,
            {
              opacity: isComplete ? 1 : 0.5,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.brand.white} size="small" />
          ) : (
            <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.white }}>
              Save Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing['3xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },

  /* Time Picker */
  timeDisplay: {
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timePresetsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  timePreset: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePresetSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
  },

  /* Stool Type */
  selectedTypeDisplay: {
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '31%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeCardSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Energy Level */
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  energyBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  sliderContainer: {
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },

  /* Symptoms */
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  symptomCardSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
  },

  /* Footer */
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
