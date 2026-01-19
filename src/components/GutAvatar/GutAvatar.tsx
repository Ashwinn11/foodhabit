
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { 
  HappyCrown, 
  HappyBalloon, 
  HappyCute, 
  HappyClap, 
  ShockAwe, 
  SadFrustrate, 
  SadSick, 
  SadCry 
} from '../mascot';

interface GutAvatarProps {
  score?: number; // 0-100 health score
  size?: number;
  mood?: 'happy' | 'neutral' | 'sad' | 'distressed';
  inflammationLevel?: 'low' | 'medium' | 'high';
  isBloated?: boolean;
  style?: ViewStyle;
  // Legacy props compatibility
  showBadge?: boolean;
  badgeText?: string;
  badgeIcon?: string;
  ringColor?: string;
  onPress?: () => void;
}

export const GutAvatar: React.FC<GutAvatarProps> = ({
  score = 50,
  size = 120,
  mood,
  inflammationLevel,
  isBloated = false,
  style,
  // Badge/Ring props are visual decorations that can be added around the mascot if needed,
  // but for now we focus on the mascot itself.
  ringColor,
}) => {

  const MascotComponent = useMemo(() => {
    // 1. mood override
    if (mood) {
      switch (mood) {
        case 'happy': return HappyCute;
        case 'neutral': return ShockAwe;
        case 'sad': return SadFrustrate;
        case 'distressed': return SadCry;
      }
    }

    // 2. Specific health flags
    if (isBloated) return SadSick;
    if (inflammationLevel === 'high') return SadFrustrate;

    // 3. Score-based fallback
    if (score >= 90) return HappyCrown;
    if (score >= 80) return HappyBalloon; 
    if (score >= 65) return HappyCute;
    if (score >= 50) return HappyClap;
    if (score >= 40) return ShockAwe;
    if (score >= 30) return SadFrustrate; // "The Toll on Your Body" usually around here
    return SadCry; // Very low score
  }, [score, mood, inflammationLevel, isBloated]);

  return (
    <View style={[styles.container, style]}>
       {ringColor && (
        <View 
          style={[
            styles.ring, 
            { 
              width: size + 16, 
              height: size + 16, 
              borderRadius: (size + 16) / 2,
              borderColor: ringColor,
            }
          ]} 
        />
      )}
      <MascotComponent size={size} animated={true} />
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
    opacity: 0.3,
  },
});
