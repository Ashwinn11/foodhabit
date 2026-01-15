import React from 'react';
import { View, StyleSheet, Pressable, Image, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { colors, spacing, shadows } from '../../theme/theme';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';

interface PhotoPlaceholderProps {
  size?: number;
  onPress: () => void;
  style?: ViewStyle;
  photoUri?: string;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  size = 140,
  onPress,
  style,
  photoUri,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    // Subtle pulsing animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    onPress();
  };
  
  // If we have a photo, show it
  if (photoUri) {
    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.container, { width: size, height: size }, style, animatedStyle]}>
          <Image 
            source={{ uri: photoUri }} 
            style={[styles.capturedImage, { width: size, height: size, borderRadius: size / 2 }]} 
          />
          <View style={styles.retakeOverlay}>
            <IconContainer
              name="camera"
              size={40}
              iconSize={20}
              color={colors.white}
              backgroundColor="rgba(0,0,0,0.5)"
              borderWidth={0}
              shadow={false}
              style={{ marginBottom: spacing.xs }}
            />
            <Typography variant="bodyXS" color={colors.white} style={styles.retakeText}>
              Tap to retake
            </Typography>
          </View>
        </Animated.View>
      </Pressable>
    );
  }
  
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.container, { width: size, height: size }, style, animatedStyle]}>
        {/* Dotted circle border */}
        <Animated.View style={[styles.dottedCircle, { width: size, height: size, borderRadius: size / 2 }, dotStyle]}>
          {/* Create dotted effect with many small dots */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * ((size - 8) / 2);
            const y = Math.sin(radian) * ((size - 8) / 2);
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    left: size / 2 + x - 3,
                    top: size / 2 + y - 3,
                  },
                ]}
              />
            );
          })}
        </Animated.View>
        
        {/* Inner content */}
        <View style={styles.innerContent}>
          {/* Camera/add icon using IconContainer */}
          <View>
            <IconContainer
              name="camera"
              size={50}
              iconSize={24}
              color={colors.blue}
              borderColor={colors.blue}
              shape="circle"
              style={{ marginBottom: spacing.sm }}
            />
            <IconContainer
              name="add"
              size={20}
              iconSize={14}
              color={colors.white}
              backgroundColor={colors.blue}
              borderWidth={0}
              shadow={false}
              style={styles.plusBadge}
            />
          </View>
          
          <Typography variant="bodyXS" color={colors.black + '99'} style={{ letterSpacing: 1 }}>
            ADD PHOTO
          </Typography>
        </View>
      </Animated.View>
      
      <Typography variant="bodySmall" color={colors.black + '66'} align="center" style={{ marginTop: spacing.md, fontStyle: 'italic' }}>
        Tap to snap a pic!
      </Typography>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  dottedCircle: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.yellow,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.blue,
    ...shadows.sm,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  capturedImage: {
    resizeMode: 'cover',
  },
  retakeOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  retakeText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
