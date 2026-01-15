import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radii, fonts, avatarMoodColors } from '../../theme';
import { MoodType } from '../../store';

interface GutAvatarProps {
  mood: MoodType;
  size?: number;
  showBadge?: boolean;
  badgeText?: string;
  badgeIcon?: string;
  ringColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

const moodColors = avatarMoodColors;

export const GutAvatar: React.FC<GutAvatarProps> = ({
  mood,
  size = 80,
  showBadge = false,
  badgeText,
  badgeIcon,
  ringColor,
  style,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const moodColor = moodColors[mood];
  
  // Wiggle animation on mount
  React.useEffect(() => {
    rotation.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, [mood, rotation]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(-4, { duration: 60 }),
      withTiming(4, { duration: 60 }),
      withTiming(0, { duration: 40 })
    );
  };
  
  const blobSize = size;
  const eyeSize = size * 0.12;
  const mouthWidth = size * 0.25;
  const ringSize = size + 8; // Ring is slightly larger
  
  return (
    <View style={[styles.container, style]}>
      {/* Optional colorful ring border from reference */}
      {ringColor && (
        <View 
          style={[
            styles.ring, 
            { 
              width: ringSize, 
              height: ringSize, 
              borderRadius: ringSize / 2,
              borderColor: ringColor,
            }
          ]} 
        />
      )}

      <Animated.View
        style={[animatedStyle]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
      >
        {/* Main blob body */}
        <View
          style={[
            styles.blobBody,
            {
              width: blobSize,
              height: blobSize,
              backgroundColor: moodColor.body,
              borderRadius: blobSize / 2,
            },
            shadows.sm,
          ]}
        >
          {/* Highlight/shine */}
          <View
            style={[
              styles.shine,
              {
                width: blobSize * 0.25,
                height: blobSize * 0.15,
                top: blobSize * 0.15,
                left: blobSize * 0.2,
              },
            ]}
          />
          
          {/* Face container */}
          <View style={styles.faceContainer}>
            {/* Eyes */}
            <View style={[styles.eyesRow, { marginBottom: size * 0.05 }]}>
              <View
                style={[
                  styles.eye,
                  {
                    width: eyeSize,
                    height: eyeSize * 1.2,
                    borderRadius: eyeSize / 2,
                    marginHorizontal: size * 0.06,
                  },
                ]}
              >
                {/* Pupil */}
                <View
                  style={[
                    styles.pupil,
                    {
                      width: eyeSize * 0.5,
                      height: eyeSize * 0.5,
                      borderRadius: eyeSize * 0.25,
                    },
                  ]}
                />
                {/* Eye sparkle */}
                <View
                  style={[
                    styles.eyeSparkle,
                    {
                      width: eyeSize * 0.25,
                      height: eyeSize * 0.25,
                      borderRadius: eyeSize * 0.125,
                      top: eyeSize * 0.2,
                      right: eyeSize * 0.15,
                    },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.eye,
                  {
                    width: eyeSize,
                    height: eyeSize * 1.2,
                    borderRadius: eyeSize / 2,
                    marginHorizontal: size * 0.06,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pupil,
                    {
                      width: eyeSize * 0.5,
                      height: eyeSize * 0.5,
                      borderRadius: eyeSize * 0.25,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.eyeSparkle,
                    {
                      width: eyeSize * 0.25,
                      height: eyeSize * 0.25,
                      borderRadius: eyeSize * 0.125,
                      top: eyeSize * 0.2,
                      right: eyeSize * 0.15,
                    },
                  ]}
                />
              </View>
            </View>
            
            {/* Cheeks */}
            <View style={styles.cheeksRow}>
              <View
                style={[
                  styles.cheek,
                  {
                    width: size * 0.15,
                    height: size * 0.08,
                    borderRadius: size * 0.04,
                    backgroundColor: moodColor.cheeks,
                    marginHorizontal: size * 0.08,
                  },
                ]}
              />
              <View
                style={[
                  styles.cheek,
                  {
                    width: size * 0.15,
                    height: size * 0.08,
                    borderRadius: size * 0.04,
                    backgroundColor: moodColor.cheeks,
                    marginHorizontal: size * 0.08,
                  },
                ]}
              />
            </View>
            
            {/* Mouth */}
            <View
              style={[
                styles.mouth,
                mood === 'happy' || mood === 'amazing'
                  ? {
                      width: mouthWidth,
                      height: mouthWidth * 0.5,
                      borderBottomLeftRadius: mouthWidth,
                      borderBottomRightRadius: mouthWidth,
                      borderTopWidth: 0,
                    }
                  : mood === 'okay'
                  ? {
                      width: mouthWidth * 0.6,
                      height: 3,
                      borderRadius: 2,
                    }
                  : {
                      width: mouthWidth * 0.5,
                      height: mouthWidth * 0.3,
                      borderRadius: mouthWidth * 0.25,
                    },
              ]}
            />
          </View>
          
          {/* Little arms/wiggles for happy moods */}
          {(mood === 'happy' || mood === 'amazing') && (
            <>
              <View
                style={[
                  styles.arm,
                  styles.leftArm,
                  { 
                    width: size * 0.15,
                    height: size * 0.08,
                    left: -size * 0.08,
                    top: size * 0.4,
                  },
                ]}
              />
              <View
                style={[
                  styles.arm,
                  styles.rightArm,
                  {
                    width: size * 0.15,
                    height: size * 0.08,
                    right: -size * 0.08,
                    top: size * 0.4,
                  },
                ]}
              />
            </>
          )}
        </View>
        
        {/* Mood badge - Pill shape from reference */}
        {showBadge && (
          <View
            style={[
              styles.badge,
              {
                paddingHorizontal: 8,
                paddingVertical: 4,
                bottom: -size * 0.1,
                minWidth: size * 0.6,
              },
            ]}
          >
             {/* If we have an icon, use it. Otherwise text */}
            <View style={styles.badgeContent}>
                {badgeIcon ? (
                    <Ionicons name={badgeIcon as any} size={12} color={colors.white} style={{marginRight: 4}} />
                ) : (
                    <View style={[styles.statusDot, { backgroundColor: colors.white }]} />
                )}
                <Animated.Text style={styles.badgeText}>
                {badgeText || mood}
                </Animated.Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  blobBody: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1,
  },
  shine: {
    position: 'absolute',
    backgroundColor: colors.white + '66', // 40% alpha equivalent
    borderRadius: 20,
    transform: [{ rotate: '-20deg' }],
  },
  faceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    backgroundColor: colors.black,
  },
  eyeSparkle: {
    position: 'absolute',
    backgroundColor: colors.white,
  },
  cheeksRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  cheek: {
    opacity: 0.6,
  },
  mouth: {
    backgroundColor: colors.black,
    marginTop: 2,
  },
  arm: {
    position: 'absolute',
    backgroundColor: colors.black + '20',
    borderRadius: 10,
    zIndex: -1,
  },
  leftArm: {
    transform: [{ rotate: '-30deg' }],
  },
  rightArm: {
    transform: [{ rotate: '30deg' }],
  },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.blue, // Simplified to blue
    borderRadius: radii.full,
    ...shadows.sm,
    zIndex: 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
});

