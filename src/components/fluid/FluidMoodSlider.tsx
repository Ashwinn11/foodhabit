import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { theme } from '../../theme/theme';
import { Text } from '../Text';
import { Icon3D } from '../Icon3D';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDER_WIDTH = SCREEN_WIDTH - theme.spacing.md * 4;
const KNOB_SIZE = 64;
const MAX_TRANSLATE = SLIDER_WIDTH - KNOB_SIZE;

export type Mood = 'happy' | 'neutral' | 'sad';

interface FluidMoodSliderProps {
  onMoodSelect: (mood: Mood) => void;
}

export const FluidMoodSlider: React.FC<FluidMoodSliderProps> = ({ onMoodSelect }) => {
  const [currentMood, setCurrentMood] = useState<Mood>('neutral');
  const [isDragging, setIsDragging] = useState(false);

  // We start in the middle ('neutral')
  const translateX = useSharedValue(MAX_TRANSLATE / 2);
  const context = useSharedValue({ x: 0 });
  
  // Breathing animation for when the slider is inactive to invite interaction
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Update React state when crossing thresholds, trigger haptics
  useAnimatedReaction(
    () => translateX.value,
    (current, prev) => {
      if (prev === null) return;
      const progress = current / MAX_TRANSLATE;
      
      let newMood: Mood = 'neutral';
      if (progress < 0.25) newMood = 'happy';
      else if (progress > 0.75) newMood = 'sad';
      
      // If mood changed during drag
      if (currentMood !== newMood) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(setCurrentMood)(newMood);
      }
    },
    [currentMood]
  );

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((e) => {
      translateX.value = Math.max(0, Math.min(MAX_TRANSLATE, context.value.x + e.translationX));
    })
    .onEnd(() => {
      runOnJS(setIsDragging)(false);
      // Snap to closest position
      const progress = translateX.value / MAX_TRANSLATE;
      let targetX = MAX_TRANSLATE / 2; // neutral
      let finalMood: Mood = 'neutral';
      
      if (progress < 0.33) {
        targetX = 0; // happy
        finalMood = 'happy';
      } else if (progress > 0.66) {
        targetX = MAX_TRANSLATE; // sad
        finalMood = 'sad';
      }
      
      translateX.value = withSpring(targetX, { damping: 20, stiffness: 200 });
      runOnJS(onMoodSelect)(finalMood);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  // Animated trackbar color mapping
  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgba(109, 190, 140, 0.4)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 77, 77, 0.4)']
      ),
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: isDragging ? withSpring(1.1) : pulse.value }
      ],
      backgroundColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgba(109, 190, 140, 0.2)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 77, 77, 0.2)']
      ),
      borderColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgba(109, 190, 140, 0.8)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 77, 77, 0.8)']
      ),
      shadowColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgb(109, 190, 140)', 'rgb(255, 255, 255)', 'rgb(255, 77, 77)']
      ),
    };
  });

  return (
    <Animated.View style={[styles.container]}>
      <View style={styles.content}>
        <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.title}>
          How's your gut feeling?
        </Text>

        <View style={styles.trackContainer}>
          <Animated.View style={[styles.trackBar, trackStyle]} />
          
          {/* Static underlay icons so user knows where to drag */}
          <View style={styles.underlayIcons}>
            <Icon3D name="face_with_smile" size={42} style={styles.iconOpac} />
            <Icon3D name="neutral_face" size={42} style={styles.iconOpac} />
            <Icon3D name="face_with_sad" size={42} style={styles.iconOpac} />
          </View>

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.knob, knobStyle]}>
               <View style={styles.knobIconWrap}>
                <Icon3D 
                  name={
                    currentMood === 'happy' ? 'face_with_smile' : 
                    currentMood === 'sad' ? 'face_with_sad' : 'neutral_face'
                  } 
                  size={42} 
                />
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        <Text variant="caption" color={theme.colors.textTertiary} align="center" style={styles.hint}>
          {currentMood === 'neutral' ? 'Slide to log' : 'Release to select'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  content: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    width: '100%',
  },
  hint: {
    marginTop: -8,
  },
  iconOpac: {
    opacity: 1,
  },
  knob: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 2,
    height: KNOB_SIZE,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    width: KNOB_SIZE,
    ...theme.shadows.glow,
  },
  knobInner: {
    display: 'none',
  },
  knobIconWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
  },
  trackContainer: {
    height: KNOB_SIZE,
    justifyContent: 'center',
    width: SLIDER_WIDTH,
  },
  trackBar: {
    height: 3,
    width: MAX_TRANSLATE,
    left: KNOB_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    position: 'absolute',
    top: (KNOB_SIZE - 3) / 2,
    zIndex: -1,
  },
  underlayIcons: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  }
});
