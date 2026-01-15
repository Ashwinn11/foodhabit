import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, spacing, moodIcons } from '../../theme/theme';
import { MoodType } from '../../store';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';
import { Card } from '../Card';

interface MoodPickerProps {
  selected: MoodType | undefined;
  onSelect: (mood: MoodType) => void;
}

const moods: { type: MoodType; icon: any; label: string; color: string }[] = [
  { type: 'amazing', icon: moodIcons.amazing, label: 'Amazing', color: colors.yellow },
  { type: 'happy', icon: moodIcons.happy, label: 'Happy', color: colors.blue },
  { type: 'okay', icon: moodIcons.okay, label: 'Okay', color: colors.blue },
  { type: 'bloated', icon: moodIcons.bloated, label: 'Bloated', color: colors.yellow },
  { type: 'constipated', icon: moodIcons.constipated, label: 'Stuck', color: colors.pink },
  { type: 'urgent', icon: moodIcons.urgent, label: 'Urgent', color: colors.pink },
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
      <Animated.View style={animatedStyle}>
        <Card 
          variant={isSelected ? "colored" : "white"}
          color={item.color}
          style={styles.option}
          padding="md"
        >
          <IconContainer
            name={item.icon}
            size={50}
            iconSize={32}
            color={item.color}
            borderColor={item.color}
            shape="circle"
          />
          <Typography 
            variant="bodyXS" 
            color={isSelected ? colors.black : colors.black + '66'} 
            style={{ marginTop: 8 }}
          >
            {item.label}
          </Typography>
        </Card>
      </Animated.View>
    </Pressable>
  );
};

export const MoodPicker: React.FC<MoodPickerProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Typography variant="h4" style={{ marginBottom: spacing.md }}>
        How are you feeling?
      </Typography>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  option: {
    width: 95,
    alignItems: 'center',
    margin: spacing.xs,
  },
});
