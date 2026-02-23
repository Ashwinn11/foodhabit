import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
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

  // Animated background color mapping
  // happy (left) = neon cyan
  // neutral (mid) = theme.surface
  // sad (right) = danger/amber
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgba(0, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 77, 77, 0.15)']
      ),
      borderColor: interpolateColor(
        translateX.value,
        [0, MAX_TRANSLATE / 2, MAX_TRANSLATE],
        ['rgba(0, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 77, 77, 0.3)']
      ),
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: withSpring(isDragging ? 1.1 : 1, { damping: 15 }) }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      
      <View style={styles.content}>
        <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.title}>
          How's your gut feeling?
        </Text>

        <View style={styles.trackContainer}>
          {/* Static underlay icons so user knows where to drag */}
          <View style={styles.underlayIcons}>
            <Icon3D name="face_with_smile" size={32} style={styles.iconOpac} />
            <Icon3D name="neutral_face" size={32} style={styles.iconOpac} />
            <Icon3D name="face_with_head_bandage" size={32} style={styles.iconOpac} />
          </View>

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.knob, knobStyle]}>
              <Icon3D 
                name={
                  currentMood === 'happy' ? 'face_with_smile' : 
                  currentMood === 'sad' ? 'face_with_head_bandage' : 'neutral_face'
                } 
                size={48} 
              />
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
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    marginHorizontal: theme.spacing.md,
    overflow: 'hidden',
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  hint: {
    marginTop: -8,
  },
  iconOpac: {
    opacity: 0.3,
  },
  knob: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 1,
    height: KNOB_SIZE,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    width: KNOB_SIZE,
    ...theme.shadows.glow,
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
  underlayIcons: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  }
});
