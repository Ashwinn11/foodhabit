import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Ellipse } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { theme } from '../theme';

export type GigiEmotion = 'happy' | 'neutral' | 'sad' | 'excited';
export type GigiSize = 'sm' | 'md' | 'lg' | 'xl';

interface GigiProps {
  emotion?: GigiEmotion;
  size?: GigiSize;
  animated?: boolean;
}

const SIZE_MAP = {
  sm: 40,
  md: 80,
  lg: 120,
  xl: 160,
};

const COLOR_MAP = {
  happy: theme.colors.brand.teal, // Greenish teal
  excited: theme.colors.brand.teal, 
  neutral: theme.colors.brand.purple,
  sad: theme.colors.brand.coral,
};



export default function Gigi({ 
  emotion = 'neutral', 
  size = 'md', 
  animated = true 
}: GigiProps) {
  const width = SIZE_MAP[size];
  const height = width;
  const color = COLOR_MAP[emotion];
  
  // Animation values
  const breath = useSharedValue(1);
  const bounce = useSharedValue(0);
  const eyes = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;

    // Breathing animation (scaling slightly)
    breath.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Blinking animation
    const blink = () => {
        eyes.value = withSequence(
            withTiming(0.1, { duration: 100 }), // Close
            withTiming(1, { duration: 100 })    // Open
        );
    };
    
    // Random blink interval
    const interval = setInterval(() => {
        if (Math.random() > 0.7) blink();
    }, 2000);

    // Excited bounce
    if (emotion === 'excited') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 200 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      );
    } else {
      bounce.value = withTiming(0);
    }

    return () => clearInterval(interval);
  }, [emotion, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breath.value },
        { translateY: bounce.value }
      ]
    };
  });

  // Face Elements
  const renderFace = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return (
          <G>
            {/* Eyes (Open) */}
            <Circle cx="35" cy="40" r="5" fill="white" />
            <Circle cx="65" cy="40" r="5" fill="white" />
            {/* Smile */}
            <Path 
              d="M 30 60 Q 50 75 70 60" 
              stroke="white" 
              strokeWidth="5" 
              strokeLinecap="round" 
              fill="none" 
            />
             {/* Cheeks */}
             <Circle cx="25" cy="50" r="4" fill="rgba(255,255,255,0.3)" />
             <Circle cx="75" cy="50" r="4" fill="rgba(255,255,255,0.3)" />
          </G>
        );
      case 'sad':
        return (
          <G>
            {/* Eyes (Sad) */}
            <Path d="M 30 42 Q 35 38 40 42" stroke="white" strokeWidth="3" fill="none" />
            <Path d="M 60 42 Q 65 38 70 42" stroke="white" strokeWidth="3" fill="none" />
            
            {/* Frown */}
            <Path 
              d="M 35 70 Q 50 60 65 70" 
              stroke="white" 
              strokeWidth="5" 
              strokeLinecap="round" 
              fill="none" 
            />
             {/* Tear (optional) */}
            {/* <Path d="M 68 45 Q 65 55 68 60" fill="#add8e6" /> */}
          </G>
        );
      case 'neutral':
      default:
        return (
          <G>
            {/* Eyes (Simple) */}
            <Circle cx="35" cy="40" r="5" fill="white" />
            <Circle cx="65" cy="40" r="5" fill="white" />
            {/* Mouth (Straight) */}
            <Path 
              d="M 35 65 L 65 65" 
              stroke="white" 
              strokeWidth="5" 
              strokeLinecap="round" 
              fill="none" 
            />
          </G>
        );
    }
  };

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={animatedStyle}>
            <Svg width={width} height={height} viewBox="0 0 100 100">
                {/* Body blob */}
                <Path
                    d="M50 5 
                    C20 5 5 25 5 55 
                    C5 85 25 95 50 95 
                    C75 95 95 85 95 55 
                    C95 25 80 5 50 5 Z"
                    fill={color}
                />
                
                {/* Shine/Highlight */}
                <Ellipse cx="30" cy="25" rx="10" ry="5" fill="rgba(255,255,255,0.2)" rotation="-45" />

                {/* Face */}
                {renderFace()}
            </Svg>
        </Animated.View>
    </View>
  );
}
