import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fonts, shadows } from '../../theme';

interface PhotoPlaceholderProps {
  size?: number;
  onPress: () => void;
  style?: ViewStyle;
  imageUri?: string;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  size = 140,
  onPress,
  style,
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
          {/* Camera/add icon badge */}
          <View style={styles.iconBadge}>
            <Ionicons name="camera" size={24} color={colors.blue} />
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={14} color={colors.white} />
            </View>
          </View>
          
          <Text style={styles.addText}>ADD PHOTO</Text>
        </View>
      </Animated.View>
      
      <Text style={styles.helpText}>Tap to snap a pic!</Text>
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black + '99',
    letterSpacing: 1,
  },
  helpText: {
    fontSize: fontSizes.sm,
    color: colors.black + '66',
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: fonts.body,
    fontStyle: 'italic',
  },
});
