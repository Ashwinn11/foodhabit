import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps,
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
  Easing
} from 'react-native-reanimated';

export type GigiEmotion = 'happy' | 'neutral' | 'sad' | 'excited' | 'worried' | 'sick' | 'thinking';
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

const COLORS = {
  teal: { r: 135, g: 221, b: 204 }, // #87DDCC - healthy
  sad: { r: 148, g: 163, b: 184 },   // #94A3B8 - blue-gray
  worried: { r: 251, g: 191, b: 36 }, // #FBBF24 - amber/yellow
  sick: { r: 167, g: 199, b: 163 },   // #A7C7A3 - pale green
  thinking: { r: 147, g: 197, b: 253 }, // #93C5FD - light blue
};

const EMOTION_COLORS: Record<GigiEmotion, { r: number; g: number; b: number }> = {
  happy: COLORS.teal,
  excited: COLORS.teal,
  neutral: COLORS.teal,
  sad: COLORS.sad,
  worried: COLORS.worried,
  sick: COLORS.sick,
  thinking: COLORS.thinking,
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function Gigi({ 
  emotion = 'neutral', 
  size = 'md', 
  animated = true 
}: GigiProps) {
  const width = SIZE_MAP[size];
  const height = width; // 1:1 aspect ratio for 1024x1024

  // Shared Values (Colors)
  const r = useSharedValue(EMOTION_COLORS[emotion].r);
  const g = useSharedValue(EMOTION_COLORS[emotion].g);
  const b = useSharedValue(EMOTION_COLORS[emotion].b);

  // Mouth Morph (Matching gut_say_hi.svg: between eyes, gentle smile)
  const mx1 = useSharedValue(495);
  const my1 = useSharedValue(430); 
  const mcx = useSharedValue(520);
  const mcy = useSharedValue(448); 
  const mx2 = useSharedValue(545);
  const my2 = useSharedValue(430); 

  // Animation States
  const breath = useSharedValue(1);
  const bounce = useSharedValue(0);
  const eyeOffsetX = useSharedValue(0);
  const eyeOffsetY = useSharedValue(0);
  const cheekOpacity = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    // Color
    const targetColor = EMOTION_COLORS[emotion];
    r.value = withTiming(targetColor.r, { duration: 500 });
    g.value = withTiming(targetColor.g, { duration: 500 });
    b.value = withTiming(targetColor.b, { duration: 500 });

    // Mouth Targets - MORE DISTINCT shapes for each emotion
    // Center X is ~520. Eye Y is ~407-415.
    let tm = { x1: 495, y1: 430, cx: 520, cy: 448, x2: 545, y2: 430 }; 
    
    if (emotion === 'happy') {
        // Clear smile
        tm = { x1: 495, y1: 430, cx: 520, cy: 452, x2: 545, y2: 430 }; 
    } else if (emotion === 'sad') {
        // Clear frown (inverted curve)
        tm = { x1: 490, y1: 455, cx: 520, cy: 415, x2: 550, y2: 455 }; 
    } else if (emotion === 'excited') {
        // Cute smile (same width as happy, slightly more curved, not creepy wide)
        tm = { x1: 492, y1: 428, cx: 520, cy: 458, x2: 548, y2: 428 }; 
    } else if (emotion === 'worried') {
        // Wavy/asymmetric concerned mouth
        tm = { x1: 490, y1: 448, cx: 515, cy: 432, x2: 545, y2: 452 }; 
    } else if (emotion === 'sick') {
        // Tight squiggly distressed
        tm = { x1: 500, y1: 450, cx: 520, cy: 435, x2: 540, y2: 455 }; 
    } else if (emotion === 'thinking') {
        // Small 'o' shape
        tm = { x1: 508, y1: 435, cx: 520, cy: 450, x2: 532, y2: 435 }; 
    } else {
        // neutral - gentle slight smile
        tm = { x1: 495, y1: 432, cx: 520, cy: 445, x2: 545, y2: 432 }; 
    }

    mx1.value = withTiming(tm.x1);
    my1.value = withTiming(tm.y1);
    mcx.value = withTiming(tm.cx);
    mcy.value = withTiming(tm.cy);
    mx2.value = withTiming(tm.x2);
    my2.value = withTiming(tm.y2);

    // Loop Animations
    breath.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    const moveEyes = () => {
        const range = 20;
        eyeOffsetX.value = withSpring((Math.random() - 0.5) * range);
        eyeOffsetY.value = withSpring((Math.random() - 0.5) * range);
    };
    const interval = setInterval(moveEyes, 3000);

    // Emotion-specific animations
    if (emotion === 'excited') {
        // Happy bounce
        bounce.value = withRepeat(
            withSequence(withTiming(-80, { duration: 200 }), withTiming(0, { duration: 200 })),
            -1, true
        );
    } else if (emotion === 'happy') {
        // Gentle sway
        bounce.value = withRepeat(
            withSequence(withTiming(-20, { duration: 800 }), withTiming(0, { duration: 800 })),
            -1, true
        );
    } else if (emotion === 'sad') {
        // Slow droop
        bounce.value = withTiming(30, { duration: 1000 });
    } else if (emotion === 'worried') {
        // Nervous shake
        bounce.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 100 }), 
                withTiming(8, { duration: 100 }),
                withTiming(-5, { duration: 100 }),
                withTiming(0, { duration: 100 })
            ),
            -1, false
        );
    } else if (emotion === 'sick') {
        // Wobbly
        bounce.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 300 }), 
                withTiming(15, { duration: 300 })
            ),
            -1, true
        );
    } else if (emotion === 'thinking') {
        // Slight tilt back and forth (simulated with bounce)
        bounce.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1200 }), 
                withTiming(10, { duration: 1200 })
            ),
            -1, true
        );
    } else {
        bounce.value = withTiming(0);
    }

    // Cheek blushing for happy/excited
    if (emotion === 'happy' || emotion === 'excited') {
        cheekOpacity.value = withTiming(0.5, { duration: 400 });
    } else {
        cheekOpacity.value = withTiming(0, { duration: 300 });
    }

    return () => clearInterval(interval);
  }, [emotion, animated]);

  // Animated Props
  const bodyColorProps = useAnimatedProps(() => ({
    fill: `rgb(${Math.round(r.value)},${Math.round(g.value)},${Math.round(b.value)})`
  }));

  const mouthProps = useAnimatedProps(() => ({
    d: `M ${mx1.value} ${my1.value} Q ${mcx.value} ${mcy.value} ${mx2.value} ${my2.value}`
  }));

  const containerTransform = useAnimatedProps(() => ({
      transform: [{ scale: breath.value }, { translateY: bounce.value }]
  }));

  const leftEyeProps = useAnimatedProps(() => ({
      cx: 433 + eyeOffsetX.value,
      cy: 407 + eyeOffsetY.value
  }));
  const rightEyeProps = useAnimatedProps(() => ({
      cx: 605 + eyeOffsetX.value,
      cy: 415 + eyeOffsetY.value
  }));

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ width: '100%', height: '100%' }}>
        <Svg width="100%" height="100%" viewBox="180 200 700 620">
          <Defs>
             <RadialGradient id="highlight" cx="50%" cy="0%" rx="60%" ry="40%">
                <Stop offset="0" stopColor="white" stopOpacity="0.5" />
                <Stop offset="1" stopColor="white" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <AnimatedG animatedProps={containerTransform} origin="512, 512">
            {/* SVG Content from icon.svg - Excluded face paths */}
            
            {/* Outline/Background parts could go here if needed, but icon.svg starts with path4 */}
            
            {/* Path 4: Main Head/Body Top */}
            <AnimatedPath transform="translate(509,219)" d="m0 0h46l25 4 21 6 15 6 21 11 15 10 11 9 13 12 11 13 10 14 10 18 10 22 8 24 6 29 2 17v57l-5 52v9l9 10 13 17 10 15 12 22 7 18 5 20 1 7v15l-2 9-4 6-6 5-3 1h-11l-6-4-5-7v-4h-9l-7-4-4-10-5-14-8-12-1-3h-2l-1 7-10 24-9 16-12 16-9 10-11 11-16 12-8 5-4 36-4 20v4l11 6 8 9 3 7v8l-4 5-11 4-21 3h-30l-21-3-8-4-5-5-1-2v-55l1-9-26 2h-39l-24-2-27-4-21-5-5-1-9 11-9 10-9 11-10 11-8 10-10 6-4 1h-11l-12-4-12-7-13-10-13-13-7-10-6-12-1-4v-11l4-6 6-5 6-2h16l11 2 12-14 1-3-12-17-9-16-8-21-4-15-2-12-1-11v-25l3-26v-7l-19-12-16-13-17-17-12-16-9-15-7-16-4-16v-21l4-12 7-9 6-5 9-4h13l9 4 7 8 3 6v2l6-3 7-1 6 3 4 5 2 5v25l4 12 6 11 3 4 4-43 4-25 7-28 8-22 11-24 12-20 13-17 11-12 13-13 16-12 20-12 19-9 21-7 24-5z" animatedProps={bodyColorProps} />
            
            {/* Path 9: Left Arm/Side */}
            <AnimatedPath transform="translate(242,395)" d="m0 0h8l8 4 6 8 5 12 4-1 4-5 2-1h6l4 5 1 3v25l4 12 6 11 8 10 1 1v21l-8 35-1 3-5-2-16-10-15-13-15-15-12-16-10-18-6-17-2-9v-17l4-12 9-10z" animatedProps={bodyColorProps} />
            
            {/* Path 11: Main Body Lower/Detail */}
            <AnimatedPath transform="translate(339,694)" d="m0 0 9 4 16 9 13 12 9 12 6 9v3l-9 11-9 10-9 11-7 8-10 5h-8l-11-4-11-6-9-7-10-9-8-9-8-13-3-8v-7l5-6 7-3h12l11 3 5-1 13-15 5-6z" fill="#87DDCB" />

            {/* Path 5: Big detail patch (Light Teal) */}
            <Path transform="translate(497,509)" d="m0 0h23l19 3 17 5 16 8 11 7 12 11 8 9 8 14 5 12 4 16 1 7v25l-4 21-6 17-8 16-8 12-8 10-12 13-11 10-17 12-7 2-17 1h-32l-29-2-15-2-3-1-3-13v-8l3-11 6-10 8-8 9-6 14-4 31-5 14-5 9-5 9-7 9-12 5-11 3-14v-12l-3-14-8-16-11-12-14-9-11-4-5-1h-19l-13 4-10 6-9 9-5 10-2 9 1 14 5 12 6 8 7 6 10 5 9 2h9l13-4 8-6 5-8 2-8-1-9-6-9-8-5-3-1h-14l-7 4-3 6v6l3 2h5l5-7 8-1 6 3 3 4v11l-5 6-5 3-4 1h-13l-10-4-8-7-5-8-2-8 1-11 5-10 9-8 8-4 8-2h13l11 3 10 5 12 11 6 10 4 11 1 5v10l-2 10-5 12-8 10-11 8-10 4-18 4-24 4-13 5-11 8-7 7-7 12-4 16 1 15-5-2-13-12-5-5-9-10-10-16-7-15-4-13-2-11v-31l4-19 5-14 8-15 11-14 11-11 12-9 14-8 14-6 21-6z" fill="#B9E6D8"/>
            
            {/* Other Paths (Shadows, Details, Legs) */}
            <Path transform="translate(638,255)" d="m0 0 9 5 13 11 8 7 12 14 10 13 11 19 8 17 11 33 5 25 2 16v56l-3 31-3 24-4 48-5 25-5 19-7 19-8 16-7 12-9 12-11 12-9 9-13 10-17 10-18 8-20 6-19 4-17 2h-6l5-5 14-10 17-16 9-11 10-14 8-16 6-16 4-17 1-7 13-11 8-8 11-14 7-10 10-18 7-15 7-19 6-19 6-31 3-28v-55l-2-21-5-28-6-20-11-24-11-17-10-13-11-12-4-5z" fill="#74CABB"/>
            
            
            <Path transform="translate(627,724)" d="m0 0 2 1-2 23-4 22-3 13 15 8 7 8 2 4v5l-4 3-11 3-18 2h-27l-16-2-10-4-3-5v-47l1-15 26-4 23-6 15-6z" fill="#87DDCB"/>
            
            <Path transform="translate(490,547)" d="m0 0h19l13 4 10 5 9 7 7 7 7 11 5 12 2 11v12l-4 16-6 12-8 10-12 9-13 6-11 3-32 5-11 4-5 3-3-1-12-1 5-6 11-7 11-4 35-6 15-5 11-7 7-8 6-12 2-6 1-7v-10l-3-12-6-11-9-10-11-7-9-3-5-1h-13l-10 3-10 6-6 7-3 7-1 11 3 10 6 8 5 4 10 4h13l7-3 6-6v-11l-5-5-7-1-5 2-3 5-1 1-7-1-2-2 1-9 5-5 5-3h14l8 4 6 5 4 7 1 9-3 10-7 9-8 5-11 3h-9l-11-3-11-6-8-8-7-14-2-10 1-13 4-9 4-6 9-9 14-7z" fill="#87DECC"/>
            
            <Path transform="translate(304,618)" d="m0 0 4 4 7 9 11 11 18 13 16 8 14 6 10 3 10 19 8 11 9 10v2l4 2 11 10 4 2-1-14 4-16 7-12 4-4h13l3 1v2l-8 7-6 9-3 8-1 5v8l2 9v4l-13-2-23-6-4 2-9 11-4 1-10-16-12-13-10-7-12-7-10-4-13-18-12-23-7-21-1-6z" fill="#74CABB"/>
            
            <Path transform="translate(726,540)" d="m0 0 5 5 14 18 13 20 8 15 8 21 4 17 1 6v14l-3 9-7 6h-8l-6-5-2-5v-7l1-6-4-1-3 9h-6l-5-4-6-17-7-13-8-10 4-19 4-25z" fill="#87DDCB"/>
            
             <Path transform="translate(449,269)" d="m0 0h8l6 5 2 9-4 6-7 6-16 11-20 16-2 1h-9l-6-4-3-4v-7l7-11 10-10 13-9 17-8z" fill="#BAE7D9"/>
             
             <Path transform="translate(285,721)" d="m0 0 14 6 13 10 14 14 12 16 9 14 1 7h-8l-11-4-11-6-9-7-10-9-8-9-8-13-3-8v-7l2-3z" fill="#74CABB"/>
             
             <Path transform="translate(627,724)" d="m0 0 2 1-1 15-5 2-10 6-15 6-20 4-21 1-1-16 26-4 23-6 15-6z" fill="#74CABB"/>
             
             <Path transform="translate(726,540)" d="m0 0 5 5 5 6 2 5v12l-4 24-5 21-4 9-3-1-7-9 4-19 4-25z" fill="#75CBBC"/>
             
             <Path transform="translate(497,252)" d="m0 0 6 1 7 6 1 6-4 6-8 5-3 1h-11l-6-3-1-1v-7l4-6 9-6z" fill="#BAE7D9"/>
             
             <Path transform="translate(308,490)" d="m0 0h1v10l-8 35-1 3-5-2-1-5 12-34z" fill="#76CDBD"/>

            {/* Face - Matching gut_say_hi.svg */}
            <G>
                {/* Left Eye (solid black with white highlights) */}
                <AnimatedCircle r="35" fill="#111" animatedProps={leftEyeProps} />
                {/* Big shine (Top Left) */}
                <AnimatedCircle r="12" fill="white" animatedProps={useAnimatedProps(() => ({ cx: 421 + eyeOffsetX.value, cy: 395 + eyeOffsetY.value }))} />
                {/* Small shine (Bottom Right) */}
                <AnimatedCircle r="6" fill="white" animatedProps={useAnimatedProps(() => ({ cx: 445 + eyeOffsetX.value, cy: 420 + eyeOffsetY.value }))} />
                
                {/* Right Eye (solid black with white highlights) */}
                <AnimatedCircle r="35" fill="#111" animatedProps={rightEyeProps} />
                {/* Big shine (Top Left) */}
                <AnimatedCircle r="12" fill="white" animatedProps={useAnimatedProps(() => ({ cx: 593 + eyeOffsetX.value, cy: 403 + eyeOffsetY.value }))} />
                {/* Small shine (Bottom Right) */}
                <AnimatedCircle r="6" fill="white" animatedProps={useAnimatedProps(() => ({ cx: 617 + eyeOffsetX.value, cy: 428 + eyeOffsetY.value }))} />

                {/* Mouth */}
                <AnimatedPath
                    stroke="#111"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    animatedProps={mouthProps}
                />

                {/* Blushing Cheeks */}
                <AnimatedCircle 
                    cx="355" 
                    cy="430" 
                    r="28" 
                    fill="#FDA4AF"
                    animatedProps={useAnimatedProps(() => ({ opacity: cheekOpacity.value }))}
                />
                <AnimatedCircle 
                    cx="665" 
                    cy="430" 
                    r="28" 
                    fill="#FDA4AF"
                    animatedProps={useAnimatedProps(() => ({ opacity: cheekOpacity.value }))}
                />
            </G>

          </AnimatedG>
        </Svg>
      </Animated.View>
    </View>
  );
}
