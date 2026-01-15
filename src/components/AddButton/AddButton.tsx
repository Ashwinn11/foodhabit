import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { IconContainer } from '../IconContainer/IconContainer';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/theme';

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
          style,
          animatedStyle,
        ]}
      >
        <IconContainer
          name="add"
          size={size}
          iconSize={size * 0.4}
          color={color}
          backgroundColor={dotted ? "transparent" : colors.white}
          borderColor={dotted ? colors.yellow : colors.border}
          borderWidth={dotted ? 2 : 1}
          shadow={!dotted}
          shape="circle"
          style={dotted ? { borderStyle: 'dashed' } : undefined}
        />
      </Animated.View>
    </Pressable>
  );
};
