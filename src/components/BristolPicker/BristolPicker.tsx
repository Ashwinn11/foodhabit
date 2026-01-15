import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts, bristolColors } from '../../theme';
import { BristolType } from '../../store';

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
      <Animated.View
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          isSelected && { borderColor: item.color },
          animatedStyle,
        ]}
      >
        <Image source={item.image} style={styles.bristolImage} resizeMode="contain" />
        <Text style={styles.typeNumber}>Type {item.type}</Text>
        <Text style={styles.typeLabel}>{item.label}</Text>
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: item.color }]}>
            <Ionicons name="checkmark" size={14} color={colors.white} />
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
      <Text style={styles.title}>Bristol Scale</Text>
      <Text style={styles.subtitle}>What did it look like?</Text>
      
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
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '99',
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  option: {
    width: 90,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginRight: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  optionSelected: {
    backgroundColor: colors.blue + '15',
  },
  bristolImage: {
    width: 70,
    height: 70,
  },
  typeNumber: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  typeLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '66',
    textAlign: 'center',
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
