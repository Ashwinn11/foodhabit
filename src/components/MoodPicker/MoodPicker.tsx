import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing, radii, shadows, fontSizes, fonts, moodIcons } from '../../theme';
import { MoodType } from '../../store';

interface MoodPickerProps {
  selected: MoodType | undefined;
  onSelect: (mood: MoodType) => void;
}

const moods: { type: MoodType; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
  { type: 'amazing', icon: moodIcons.amazing as any, label: 'Amazing', color: colors.yellow },
  { type: 'happy', icon: moodIcons.happy as any, label: 'Happy', color: colors.blue },
  { type: 'okay', icon: moodIcons.okay as any, label: 'Okay', color: colors.blue },
  { type: 'bloated', icon: moodIcons.bloated as any, label: 'Bloated', color: colors.yellow },
  { type: 'constipated', icon: moodIcons.constipated as any, label: 'Stuck', color: colors.pink },
  { type: 'urgent', icon: moodIcons.urgent as any, label: 'Urgent', color: colors.pink },
];

const MoodOption: React.FC<{
  item: typeof moods[0];
  isSelected: boolean;
  onPress: () => void;
}> = ({ item, isSelected, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1.1);
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    onPress();
  };
  
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.option,
          isSelected && { backgroundColor: item.color + '40', borderColor: item.color },
          animatedStyle,
        ]}
      >
        <IconContainer
          name={item.icon}
          size={50}
          iconSize={32}
          color={item.color}
          borderColor={item.color}
          shape="circle"
        />
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const MoodPicker: React.FC<MoodPickerProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.grid}>
        {moods.map((item) => (
          <MoodOption
            key={item.type}
            item={item}
            isSelected={selected === item.type}
            onPress={() => onSelect(item.type)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  option: {
    width: 95,
    alignItems: 'center',
    padding: spacing.md,
    margin: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  label: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black + '66',
    marginTop: 8,
  },
  labelSelected: {
    color: colors.black,
  },
});
