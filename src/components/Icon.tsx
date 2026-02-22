import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
// Note: We will need a vector icons fallback, like Ionicons if needed.
// Example: import { Ionicons } from '@expo/vector-icons';
// For now, focusing on 3D pngs and Lottie animations based on the plan.

export interface IconProps {
  name?: string; // e.g. 'garlic', 'dairy'
  source?: any; // require('../assets/icons/garlic.png')
  animation?: any; // require('../assets/animations/sad.json')
  size?: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ 
  source, 
  animation,
  size = 24,
  style
}) => {
  if (animation) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <LottieView
          source={animation}
          autoPlay
          loop
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

  if (source) {
    return (
      <Image
        source={source}
        style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
      />
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]} />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
