import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';

export interface MoodOption {
  id: string;
  label: string;
  icon: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'anxious', label: 'Anxious', icon: 'alert-circle-outline' },
  { id: 'calm', label: 'Calm', icon: 'leaf' },
  { id: 'stressed', label: 'Stressed', icon: 'alert' },
  { id: 'energetic', label: 'Energetic', icon: 'flash' },
  { id: 'tired', label: 'Tired', icon: 'moon' },
  { id: 'happy', label: 'Happy', icon: 'happy-outline' },
  { id: 'peaceful', label: 'Peaceful', icon: 'heart-outline' },
];

interface MoodWheelProps {
  selectedMood: string | null;
  onMoodSelect: (moodId: string) => void;
}

export default function MoodWheel({ selectedMood, onMoodSelect }: MoodWheelProps) {
  return (
    <View>
      <View style={styles.gridContainer}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodCard,
                isSelected && styles.moodCardSelected,
              ]}
              onPress={() => onMoodSelect(mood.id)}
            >
              <View
                style={[
                  styles.moodIconContainer,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.brand.primary + '20'
                      : theme.colors.border.light,
                  },
                ]}
              >
                <Ionicons
                  name={mood.icon as any}
                  size={28}
                  color={
                    isSelected
                      ? theme.colors.brand.primary
                      : theme.colors.text.secondary
                  }
                />
              </View>
              <Text
                variant="caption"
                weight="semiBold"
                align="center"
                style={{
                  marginTop: theme.spacing.sm,
                  color: isSelected
                    ? theme.colors.brand.primary
                    : theme.colors.text.secondary,
                }}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '31%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    aspectRatio: 1,
  },
  moodCardSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primary + '10',
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
