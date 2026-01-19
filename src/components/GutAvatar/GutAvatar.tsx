import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadows, radii, spacing } from '../../theme/theme';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';

const MASCOT_HAPPY = require('../../../assets/mascot/mascot_happy.png');
const MASCOT_NEUTRAL = require('../../../assets/mascot/mascot_neutral.png');
const MASCOT_SAD = require('../../../assets/mascot/mascot_sad.png');

interface GutAvatarProps {
  score?: number; // 0-100 health score
  size?: number;
  showBadge?: boolean;
  badgeText?: string;
  badgeIcon?: string;
  ringColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

// Map score to colors and expression
const getAvatarAppearance = (score: number) => {
  if (score >= 70) {
    return {
      source: MASCOT_HAPPY,
      expression: 'happy' as const,
    };
  } else if (score >= 40) {
    return {
      source: MASCOT_NEUTRAL,
      expression: 'neutral' as const,
    };
  } else {
    return {
      source: MASCOT_SAD,
      expression: 'sad' as const,
    };
  }
};

export const GutAvatar: React.FC<GutAvatarProps> = ({
  score = 50,
  size = 80,
  showBadge = false,
  badgeText,
  badgeIcon,
  ringColor,
  style,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const appearance = getAvatarAppearance(score);
  
  // Wiggle animation on mount
  React.useEffect(() => {
    rotation.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, [score, rotation]);
  
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
        <View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            shadows.sm,
          ]}
        >
          <Image 
            source={appearance.source}
            style={{
              width: size,
              height: size,
            }}
            resizeMode="contain"
          />
        </View>
        
        {/* Status badge - Pill shape from reference */}
        {showBadge && (
          <View
            style={[
              styles.badge,
              {
                bottom: -size * 0.1,
                minWidth: size * 0.6,
              },
            ]}
          >
             {/* If we have an icon, use it. Otherwise text */}
            <View style={styles.badgeContent}>
                {badgeIcon ? (
                    <IconContainer
                      name={badgeIcon as any}
                      size={16}
                      iconSize={12}
                      color={colors.white}
                      backgroundColor="transparent"
                      borderWidth={0}
                      shadow={false}
                      style={{ marginRight: 4 }}
                    />
                ) : (
                    <View style={[styles.statusDot, { backgroundColor: colors.white }]} />
                )}
                <Typography variant="bodyBold" color={colors.white} style={{ fontSize: 10 }}>
                  {badgeText || `Score: ${score}`}
                </Typography>
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
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.black,
    borderRadius: radii.full,
    ...shadows.md,
    zIndex: 2,
    borderWidth: 2,
    borderColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
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
    marginRight: 6,
  },
});

