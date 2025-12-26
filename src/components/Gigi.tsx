import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
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
  sm: 60,
  md: 100,
  lg: 150,
  xl: 200,
};

const COLOR_MAP = {
  happy: { main: theme.colors.brand.teal, light: '#6EE7B7', dark: '#047857' },
  excited: { main: theme.colors.brand.teal, light: '#6EE7B7', dark: '#047857' },
  neutral: { main: theme.colors.brand.purple, light: '#A78BFA', dark: '#5B21B6' },
  sad: { main: theme.colors.brand.coral, light: '#FCA5A5', dark: '#B91C1C' },
};


const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Gigi({ 
  emotion = 'neutral', 
  size = 'md', 
  animated = true 
}: GigiProps) {
  const width = SIZE_MAP[size];
  const height = width;
  const colors = COLOR_MAP[emotion];
  
  // Animation values
  const breath = useSharedValue(1);
  const bounce = useSharedValue(0);
  const leftPupilX = useSharedValue(0);
  const leftPupilY = useSharedValue(0);
  const rightPupilX = useSharedValue(0);
  const rightPupilY = useSharedValue(0);
  const blink = useSharedValue(0); // 0 = open, 1 = closed

  useEffect(() => {
    if (!animated) return;

    // Breathing (Scale)
    breath.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Blinking
    const blinkInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            blink.value = withSequence(
                withTiming(1, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
        }
    }, 3000);

    // Eye Movement (Googly effect)
    const moveEyes = () => {
        const range = 8; // Movement range
        const lx = (Math.random() - 0.5) * range;
        const ly = (Math.random() - 0.5) * range;
        const rx = (Math.random() - 0.5) * range; // Slight divergence for googly effect
        const ry = (Math.random() - 0.5) * range;

        leftPupilX.value = withSpring(lx, { damping: 10, stiffness: 50 });
        leftPupilY.value = withSpring(ly, { damping: 10, stiffness: 50 });
        rightPupilX.value = withSpring(rx, { damping: 10, stiffness: 50 });
        rightPupilY.value = withSpring(ry, { damping: 10, stiffness: 50 });
    };

    const eyeInterval = setInterval(moveEyes, 2000);

    // Excited Bounce
    if (emotion === 'excited') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
      // Fast breathing data
      breath.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 400 }),
            withTiming(0.95, { duration: 400 })
          ),
          -1,
          true
      );
    } else {
      bounce.value = withTiming(0);
    }

    return () => {
        clearInterval(blinkInterval);
        clearInterval(eyeInterval);
    };
  }, [emotion, animated]);

  // Derived styles just for the main container transform
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: bounce.value },
        { scale: breath.value }
      ]
    };
  });

  // Animated Props for Pupils
  const leftPupilProps = useAnimatedProps(() => ({
    cx: 35 + leftPupilX.value,
    cy: 40 + leftPupilY.value,
  }));

  const rightPupilProps = useAnimatedProps(() => ({
    cx: 65 + rightPupilX.value,
    cy: 40 + rightPupilY.value,
  }));

  const renderEyes = () => {
      // 3D Eyes: White sclera with slight gradient + moving pupil + highlight
      return (
          <G>
              {/* Left Eye Container */}
              <G>
                <Circle cx="35" cy="40" r="14" fill="white" />
                <Circle cx="35" cy="40" r="14" fill="url(#eyeShadow)" opacity="0.3" />
                
                {/* Left Pupil */}
                <AnimatedCircle r="6" fill="#1f2937" animatedProps={leftPupilProps} />
                <AnimatedCircle r="2" fill="white" opacity="0.8" animatedProps={useAnimatedProps(() => ({
                    cx: 35 + leftPupilX.value + 2,
                    cy: 40 + leftPupilY.value - 2
                }))} />
              </G>

              {/* Right Eye Container */}
              <G>
                <Circle cx="65" cy="40" r="14" fill="white" />
                <Circle cx="65" cy="40" r="14" fill="url(#eyeShadow)" opacity="0.3" />
                
                {/* Right Pupil */}
                <AnimatedCircle r="6" fill="#1f2937" animatedProps={rightPupilProps} />
                <AnimatedCircle r="2" fill="white" opacity="0.8" animatedProps={useAnimatedProps(() => ({
                    cx: 65 + rightPupilX.value + 2,
                    cy: 40 + rightPupilY.value - 2
                }))} />
              </G>

              {/* Eyelids (for blinking/Emotion) */}
               <AnimatedPath
                  fill={colors.main}
                  animatedProps={useAnimatedProps(() => {
                     const blinkY = 25 + (blink.value * 15);
                     return {
                         d: `M 20 ${blinkY} L 50 ${blinkY} L 50 25 L 20 25 Z`
                     };
                  })}
               />
                <AnimatedPath
                  fill={colors.main}
                  animatedProps={useAnimatedProps(() => {
                     const blinkY = 25 + (blink.value * 15);
                     return {
                         d: `M 50 ${blinkY} L 80 ${blinkY} L 80 25 L 50 25 Z`
                     };
                  })}
               />
          </G>
      );
  };

  const renderMouth = () => {
      switch (emotion) {
          case 'happy':
          case 'excited':
              return (
                <Path 
                    d="M 35 65 Q 50 78 65 65" 
                    stroke="#1f2937" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.8"
                />
              );
          case 'sad':
              return (
                <Path 
                    d="M 35 75 Q 50 65 65 75" 
                    stroke="#1f2937" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.8"
                />
              );
          default:
              return (
                <Path 
                    d="M 40 70 Q 50 70 60 70" 
                    stroke="#1f2937" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.8"
                />
              );
      }
  };

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animatedContainerStyle}>
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="bodyGrad" cx="30%" cy="30%" rx="80%" ry="80%">
              <Stop offset="0" stopColor={colors.light} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.main} stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="eyeShadow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0.8" stopColor="white" stopOpacity="0" />
                <Stop offset="1" stopColor="#000" stopOpacity="0.1" />
            </RadialGradient>
          </Defs>

          {/* Body Blob Shadow (Simple) */}
          <Ellipse cx="50" cy="92" rx="30" ry="5" fill="black" opacity="0.1" />

          {/* Main Body */}
          <Path
            d="M50 5 C20 5 5 25 5 55 C5 85 25 95 50 95 C75 95 95 85 95 55 C95 25 80 5 50 5 Z"
            fill="url(#bodyGrad)"
          />
          
          {/* Inner Highlight for more 3D feel */}
          <Path
            d="M50 10 C30 10 15 25 15 50"
            stroke="white"
            strokeWidth="3"
            strokeOpacity="0.3"
            strokeLinecap="round"
            fill="none"
          />

          {renderEyes()}
          {renderMouth()}
          
          {/* Cheeks */}
          <Circle cx="25" cy="55" r="5" fill="#f472b6" opacity="0.4" />
          <Circle cx="75" cy="55" r="5" fill="#f472b6" opacity="0.4" />

        </Svg>
      </Animated.View>
    </View>
  );
}
