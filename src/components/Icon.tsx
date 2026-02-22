import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { getFluentEmojiUrl } from '../utils/emojiMap';

export interface IconProps {
  name?: string;     // e.g. 'triggers', 'bloating' mapped to Fluent Emoji CDN
  source?: any;      // local image require()
  animation?: any;   // local lottie .json require()
  size?: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ 
  name,
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

  if (name) {
    return (
      <Image
        source={{ uri: getFluentEmojiUrl(name) }}
        style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
      />
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
