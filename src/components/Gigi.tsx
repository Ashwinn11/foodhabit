import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat, 
  withSequence,
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { 
  GigiHappy, 
  GigiSad, 
  GigiAngry, 
  GigiConfused, 
  GigiLove, 
  GigiCrown, 
  GigiBalloon, 
  GigiIll 
} from './GigiEmotions';

export type GigiEmotion = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'confused' 
  | 'love' 
  | 'crown' 
  | 'balloon' 
  | 'ill'
  // Legacy mappings
  | 'neutral' 
  | 'excited' 
  | 'worried' 
  | 'sick' 
  | 'thinking';

export type GigiSize = 'sm' | 'md' | 'lg' | 'xl';

interface GigiProps {
  emotion?: GigiEmotion;
  size?: GigiSize;
  animated?: boolean;
}

const SIZE_MAP = {
  sm: 100,
  md: 160,
  lg: 220,
  xl: 300,
};

export default function Gigi({ 
  emotion = 'happy', 
  size = 'md', 
  animated = true 
}: GigiProps) {
  const pixelSize = SIZE_MAP[size];

  // Animation States
  const breath = useSharedValue(1);
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    // Breathing animation
    breath.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    // Bounce animation based on emotion
    if (['happy', 'excited', 'love', 'crown', 'balloon'].includes(emotion)) {
      bounce.value = withRepeat(
        withSequence(withTiming(-10, { duration: 1500 }), withTiming(0, { duration: 1500 })),
        -1, true
      );
    } else if (['angry', 'confused', 'worried'].includes(emotion)) {
       // Rigid / shake?
       bounce.value = withTiming(0);
    } else {
       // Calm
       bounce.value = withTiming(0);
    }

  }, [emotion, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }, { translateY: bounce.value }]
  }));

  const renderMascot = () => {
    switch (emotion) {
      case 'happy':
      case 'neutral': // Map neutral to happy for now
        return <GigiHappy size={pixelSize} />;
      case 'sad':
        return <GigiSad size={pixelSize} />;
      case 'angry':
        return <GigiAngry size={pixelSize} />;
      case 'confused':
      case 'thinking':
      case 'worried':
        return <GigiConfused size={pixelSize} />;
      case 'love':
      case 'excited':
        return <GigiLove size={pixelSize} />;
      case 'crown':
        return <GigiCrown size={pixelSize} />;
      case 'balloon':
        return <GigiBalloon size={pixelSize} />;
      case 'ill':
      case 'sick':
        return <GigiIll size={pixelSize} />;
      default:
        return <GigiHappy size={pixelSize} />;
    }
  };

  return (
    <View style={{ width: pixelSize, height: pixelSize, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animatedStyle}>
        {renderMascot()}
      </Animated.View>
    </View>
  );
}
