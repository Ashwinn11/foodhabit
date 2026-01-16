import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { colors, spacing, bristolColors } from '../../theme/theme';
import { BristolType } from '../../store';
import { Typography } from '../Typography';
import { Card } from '../Card';

interface BristolPickerProps {
  selected: BristolType | undefined;
  onSelect: (type: BristolType) => void;
}

// Mapping Bristol types to custom poop images
const bristolTypes: { type: BristolType; image: any; label: string; color: string }[] = [
  { type: 1, image: require('../../../assets/bristol/bristol_clean_1.png'), label: 'Hard lumps', color: bristolColors.type1 },
  { type: 2, image: require('../../../assets/bristol/bristol_clean_2.png'), label: 'Lumpy', color: bristolColors.type2 },
  { type: 3, image: require('../../../assets/bristol/bristol_clean_3.png'), label: 'Cracked', color: bristolColors.type3 },
  { type: 4, image: require('../../../assets/bristol/bristol_clean_4.png'), label: 'Smooth', color: bristolColors.type4 },
  { type: 5, image: require('../../../assets/bristol/bristol_clean_5.png'), label: 'Soft blobs', color: bristolColors.type5 },
  { type: 6, image: require('../../../assets/bristol/bristol_clean_6.png'), label: 'Fluffy', color: bristolColors.type6 },
  { type: 7, image: require('../../../assets/bristol/bristol_clean_7.png'), label: 'Watery', color: bristolColors.type7 },
];

const BristolOption: React.FC<{
  item: typeof bristolTypes[0];
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
    scale.value = withSpring(1);
    onPress();
  };
  
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={animatedStyle}>
        {isSelected ? (
          <Card 
            variant="colored"
            color={colors.pink}
            style={styles.option}
            padding="md"
          >
            <Image source={item.image} style={styles.bristolImage} resizeMode="contain" />
            <Typography variant="bodyBold" color={colors.black}>Type {item.type}</Typography>
            <Typography variant="bodyXS" color={colors.black + '99'} align="center" style={{ marginTop: 2 }}>
              {item.label}
            </Typography>
          </Card>
        ) : (
          <View style={styles.option}>
            <Image source={item.image} style={styles.bristolImage} resizeMode="contain" />
            <Typography variant="bodyBold" color={item.color}>Type {item.type}</Typography>
            <Typography variant="bodyXS" color={colors.black + '66'} align="center" style={{ marginTop: 2 }}>
              {item.label}
            </Typography>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const BristolPicker: React.FC<BristolPickerProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Typography variant="h4" style={{ marginBottom: spacing.xs }}>What kind of poop did you make? <Typography variant="bodySmall" color={colors.black + '66'}>(Bristol Stool Scale)</Typography></Typography>
      <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginBottom: spacing.md }}>
        Pick the one that looks most like yours!
      </Typography>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bristolTypes.map((item) => (
          <BristolOption
            key={item.type}
            item={item}
            isSelected={selected === item.type}
            onPress={() => onSelect(item.type)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  option: {
    width: 90,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  bristolImage: {
    width: 70,
    height: 70,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
});
