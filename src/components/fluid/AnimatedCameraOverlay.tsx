import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export const AnimatedCameraOverlay: React.FC = () => {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(height * 0.7, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Reticle brackets */}
      <View style={styles.reticleContainer}>
        <View style={[styles.bracket, styles.tl]} />
        <View style={[styles.bracket, styles.tr]} />
        <View style={[styles.bracket, styles.bl]} />
        <View style={[styles.bracket, styles.br]} />
        
        {/* Animated Scan Line */}
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reticleContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 40,
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 3,
  },
  tl: { top: 60, left: 40, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
  tr: { top: 60, right: 40, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
  bl: { bottom: 120, left: 40, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
  br: { bottom: 120, right: 40, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00FFCC',
    top: 60,
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
});
