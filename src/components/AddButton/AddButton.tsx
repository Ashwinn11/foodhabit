import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadows } from '../../theme';

interface AddButtonProps {
  size?: number;
  onPress: () => void;
  style?: ViewStyle;
  dotted?: boolean;
  color?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({
  size = 56,
  onPress,
  style,
  dotted = false,
  color = colors.blue,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    rotation.value = withSequence(
      withTiming(90, { duration: 200 }),
    );
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
    onPress();
  };
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderStyle: dotted ? 'dashed' : 'solid',
            borderColor: dotted ? colors.yellow : colors.border,
            borderWidth: dotted ? 2 : 1,
            backgroundColor: dotted ? 'transparent' : colors.white,
          },
          !dotted && shadows.sm,
          style,
          animatedStyle,
        ]}
      >
        <Ionicons name="add" size={size * 0.4} color={color} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontWeight: '300',
    color: colors.black + '99',
    marginTop: -2,
  },
});
