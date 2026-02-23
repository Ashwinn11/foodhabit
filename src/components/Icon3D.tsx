import React, { useEffect } from 'react';
import { Image, StyleProp, ImageStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export type Icon3DName =
  | 'magnifying_glass'
  | 'brain'
  | 'salad'
  | 'warning'
  | 'no_entry'
  | 'check_mark_button'
  | 'spiral_calendar'
  | 'fork_and_knife'
  | 'face_with_smile'
  | 'neutral_face'
  | 'face_with_head_bandage'
  | 'sparkles'
  | 'chart_increasing'
  | 'fire'
  | 'bullseye'
  | 'test_tube'
  | 'thought_balloon';

export type AnimationType = 'float' | 'pulse' | 'spin';

interface Icon3DProps {
  name: Icon3DName;
  size?: number;
  style?: StyleProp<ImageStyle>;
  animated?: boolean;
  animationType?: AnimationType;
}

const iconMap: Record<Icon3DName, ReturnType<typeof require>> = {
  magnifying_glass: require('../../assets/icons/3d/magnifying_glass.png'),
  brain: require('../../assets/icons/3d/brain.png'),
  salad: require('../../assets/icons/3d/salad.png'),
  warning: require('../../assets/icons/3d/warning.png'),
  no_entry: require('../../assets/icons/3d/no_entry.png'),
  check_mark_button: require('../../assets/icons/3d/check_mark_button.png'),
  spiral_calendar: require('../../assets/icons/3d/spiral_calendar.png'),
  fork_and_knife: require('../../assets/icons/3d/fork_and_knife.png'),
  face_with_smile: require('../../assets/icons/3d/face_with_smile.png'),
  neutral_face: require('../../assets/icons/3d/neutral_face.png'),
  face_with_head_bandage: require('../../assets/icons/3d/face_with_head_bandage.png'),
  sparkles: require('../../assets/icons/3d/sparkles.png'),
  chart_increasing: require('../../assets/icons/3d/chart_increasing.png'),
  fire: require('../../assets/icons/3d/fire.png'),
  bullseye: require('../../assets/icons/3d/bullseye.png'),
  test_tube: require('../../assets/icons/3d/test_tube.png'),
  thought_balloon: require('../../assets/icons/3d/thought_balloon.png'),
};

export const Icon3D: React.FC<Icon3DProps> = ({
  name,
  size = 48,
  style,
  animated = false,
  animationType = 'float',
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    if (animationType === 'float') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else if (animationType === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(0.95, { duration: 450, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.05, { duration: 450, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else if (animationType === 'spin') {
      rotate.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated, animationType]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const source = iconMap[name];

  if (!source) {
    return <View style={{ width: size, height: size }} />;
  }

  if (animated) {
    return (
      <Animated.Image
        source={source}
        style={[{ width: size, height: size }, animatedStyle, style as any]}
        resizeMode="contain"
      />
    );
  }

  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style as any]}
      resizeMode="contain"
    />
  );
};
