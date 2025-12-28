import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

// Top Left Blob (Teal-ish)
const Blob1 = () => (
  <View style={styles.blob1}>
    <Svg height={width * 1.2} width={width * 1.2} viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id="grad1" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={theme.colors.brand.teal} stopOpacity="0.15" />
          <Stop offset="100%" stopColor={theme.colors.brand.teal} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path
        d="M45.7,-76.3C58.9,-69.3,69.1,-55.6,76.3,-41.2C83.5,-26.8,87.8,-11.7,85.8,2.4C83.8,16.5,75.5,29.6,65.8,40.7C56.1,51.8,45,60.9,32.7,66.9C20.4,72.9,6.9,75.8,-5.8,73.8C-18.5,71.8,-30.4,64.9,-41.2,56.5C-52,48.1,-61.7,38.2,-68.5,26.4C-75.3,14.6,-79.2,0.9,-77.2,-12.3C-75.2,-25.5,-67.3,-38.2,-56.3,-47.4C-45.3,-56.6,-31.2,-62.3,-17.1,-64.8C-3,-67.3,11.1,-66.6,32.5,-83.3"
        fill="url(#grad1)"
        transform="translate(100 100)"
      />
    </Svg>
  </View>
);

// Bottom Right Blob (Coral-ish)
const Blob2 = () => (
  <View style={styles.blob2}>
    <Svg height={width * 1.5} width={width * 1.5} viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id="grad2" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={theme.colors.brand.coral} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={theme.colors.brand.coral} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path
        d="M38.9,-64.1C51.9,-59.8,64.9,-53.4,73.6,-43.3C82.3,-33.2,86.7,-19.4,85.1,-6.3C83.5,6.8,75.9,19.2,66.7,30.3C57.5,41.4,46.7,51.2,34.9,59.3C23.1,67.4,10.3,73.8,-1.7,76.8C-13.7,79.8,-24.9,79.4,-35.3,73.7C-45.7,68,-55.3,57,-62.8,45.2C-70.3,33.4,-75.7,20.8,-76.3,7.9C-76.9,-5,-72.7,-18.2,-64.7,-29.4C-56.7,-40.6,-44.9,-49.8,-32.8,-54.6C-20.7,-59.4,-8.3,-59.8,2.7,-64.5C13.7,-69.2,25.9,-78.2,38.9,-64.1Z"
        fill="url(#grad2)"
        transform="translate(100 100)"
      />
    </Svg>
  </View>
);

export const BackgroundBlobs: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Blob1 />
      <Blob2 />
    </View>
  );
};

const styles = StyleSheet.create({
  blob1: {
    position: 'absolute',
    top: -width * 0.4,
    left: -width * 0.3,
  },
  blob2: {
    position: 'absolute',
    bottom: -width * 0.5,
    right: -width * 0.4,
  },
});
