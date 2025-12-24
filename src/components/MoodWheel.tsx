import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';
import Card from './Card';

export interface MoodOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'anxious', label: 'Anxious', icon: 'alert-circle-outline', color: theme.colors.brand.tertiary },
  { id: 'calm', label: 'Calm', icon: 'leaf', color: theme.colors.brand.secondary },
  { id: 'stressed', label: 'Stressed', icon: 'alert', color: theme.colors.brand.primary },
  { id: 'energetic', label: 'Energetic', icon: 'flash', color: theme.colors.brand.primary },
  { id: 'tired', label: 'Tired', icon: 'moon', color: theme.colors.brand.tertiary },
  { id: 'happy', label: 'Happy', icon: 'happy-outline', color: theme.colors.brand.secondary },
  { id: 'peaceful', label: 'Peaceful', icon: 'heart-outline', color: theme.colors.brand.secondary },
];

interface MoodWheelProps {
  selectedMood: string | null;
  onMoodSelect: (moodId: string) => void;
}

export default function MoodWheel({ selectedMood, onMoodSelect }: MoodWheelProps) {
  return (
    <View style={styles.gridContainer}>
      {MOOD_OPTIONS.map((mood) => (
        <MoodItem
          key={mood.id}
          mood={mood}
          isSelected={selectedMood === mood.id}
          onPress={() => onMoodSelect(mood.id)}
        />
      ))}
    </View>
  );
}

function MoodItem({ mood, isSelected, onPress }: { mood: MoodOption; isSelected: boolean; onPress: () => void }) {
  const scaleSelectedAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleSelectedAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          ...theme.animations.springConfig.bouncy,
        }),
        Animated.spring(scaleSelectedAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.animations.springConfig.default,
        }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View 
      style={[
        styles.moodCardWrapper, 
        { transform: [{ scale: scaleSelectedAnim }] }
      ]}
    >
      <Card
        pressable
        onPress={onPress}
        selected={isSelected}
        padding="none"
        borderRadius="xl"
        backgroundColor={isSelected ? mood.color + '15' : theme.colors.background.card}
        elevation={isSelected ? (mood.id === 'stressed' || mood.id === 'energetic' ? 'primary' : 'secondary') : 'flat'}
        align="center"
        justify="center"
        style={styles.moodCard}
      >
        <View style={isSelected ? [styles.selectedIndicator, { backgroundColor: mood.color }] : null} />
        <View style={[styles.iconContainer, { backgroundColor: isSelected ? mood.color : theme.colors.background.field }]}>
          <Ionicons
            name={mood.icon as any}
            size={24}
            color={isSelected ? theme.colors.brand.white : theme.colors.text.tertiary}
          />
        </View>
        <Text
          variant="caption2"
          weight={isSelected ? 'bold' : 'semiBold'}
          align="center"
          style={{
            marginTop: 8,
            color: isSelected ? theme.colors.text.primary : theme.colors.text.secondary,
          }}
        >
          {mood.label}
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'flex-start',
  },
  moodCardWrapper: {
    width: '31%',
    aspectRatio: 0.95,
    marginBottom: theme.spacing.md,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
});
