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
  // Original set
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
  | 'face_with_sad'
  | 'sparkles'
  | 'chart_increasing'
  | 'fire'
  | 'bullseye'
  | 'test_tube'
  | 'thought_balloon'
  // Food
  | 'avocado'
  | 'hamburger'
  | 'broccoli'
  | 'hot_pepper'
  | 'hot_beverage'
  | 'bread'
  | 'glass_of_milk'
  | 'onion'
  | 'leafy_green'
  | 'pizza'
  // Emotions / symptoms
  | 'nauseated_face'
  | 'sleeping_face'
  // Utility / achievement
  | 'trophy'
  | 'star'
  | 'party_popper'
  | 'bell'
  | 'sun'
  | 'crescent_moon'
  | 'seedling'
  | 'heart'
  // Character Icons (Mascot)
  | 'avocado_bloated'
  | 'avocado_caution'
  | 'avocado_detective'
  | 'avocado_growth'
  | 'avocado_knowledge'
  | 'avocado_magic'
  | 'avocado_restaurant'
  | 'avocado_scientist'
  | 'avocado_success'
  | 'avocado_thinking';

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
  face_with_sad: require('../../assets/icons/3d/face_with_sad.png'),
  sparkles: require('../../assets/icons/3d/sparkles.png'),
  chart_increasing: require('../../assets/icons/3d/chart_increasing.png'),
  fire: require('../../assets/icons/3d/fire.png'),
  bullseye: require('../../assets/icons/3d/bullseye.png'),
  test_tube: require('../../assets/icons/3d/test_tube.png'),
  thought_balloon: require('../../assets/icons/3d/thought_balloon.png'),
  // Food
  avocado: require('../../assets/icons/3d/avocado.png'),
  hamburger: require('../../assets/icons/3d/hamburger.png'),
  broccoli: require('../../assets/icons/3d/broccoli.png'),
  hot_pepper: require('../../assets/icons/3d/hot_pepper.png'),
  hot_beverage: require('../../assets/icons/3d/hot_beverage.png'),
  bread: require('../../assets/icons/3d/bread.png'),
  glass_of_milk: require('../../assets/icons/3d/glass_of_milk.png'),
  onion: require('../../assets/icons/3d/onion.png'),
  leafy_green: require('../../assets/icons/3d/leafy_green.png'),
  pizza: require('../../assets/icons/3d/pizza.png'),
  // Emotions / symptoms
  nauseated_face: require('../../assets/icons/3d/nauseated_face.png'),
  sleeping_face: require('../../assets/icons/3d/sleeping_face.png'),
  // Utility / achievement
  trophy: require('../../assets/icons/3d/trophy.png'),
  star: require('../../assets/icons/3d/star.png'),
  party_popper: require('../../assets/icons/3d/party_popper.png'),
  bell: require('../../assets/icons/3d/bell.png'),
  sun: require('../../assets/icons/3d/sun.png'),
  crescent_moon: require('../../assets/icons/3d/crescent_moon.png'),
  seedling: require('../../assets/icons/3d/seedling.png'),
  heart: require('../../assets/icons/3d/heart.png'),
  // Character Icons
  avocado_bloated: require('../../assets/onboarding/avocado_bloated.webp'),
  avocado_caution: require('../../assets/onboarding/avocado_caution.webp'),
  avocado_detective: require('../../assets/onboarding/avocado_detective.webp'),
  avocado_growth: require('../../assets/onboarding/avocado_growth.webp'),
  avocado_knowledge: require('../../assets/onboarding/avocado_knowledge.webp'),
  avocado_magic: require('../../assets/onboarding/avocado_magic.webp'),
  avocado_restaurant: require('../../assets/onboarding/avocado_restaurant.webp'),
  avocado_scientist: require('../../assets/onboarding/avocado_scientist.webp'),
  avocado_success: require('../../assets/onboarding/avocado_success.webp'),
  avocado_thinking: require('../../assets/onboarding/avocado_thinking.webp'),
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
