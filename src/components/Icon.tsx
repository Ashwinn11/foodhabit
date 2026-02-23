import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { getLucideIcon } from '../utils/iconMap';
import { theme } from '../theme/theme';

export type IconContainer = 'circle' | 'pill' | 'none' | 'square';

export interface IconProps {
  name?: string;
  source?: any;
  animation?: any;
  size?: number;
  style?: ViewStyle;
  color?: string;
  container?: IconContainer;
  glow?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  animation,
  size = 24,
  style,
  color = theme.colors.text.primary,
  container = 'none',
  glow = false,
}) => {
  if (animation) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <LottieView source={animation} autoPlay loop style={{ width: size, height: size }} />
      </View>
    );
  }

  if (name) {
    const LucideComponent = getLucideIcon(name);
    const boxSize = size * 1.8;
    
    const containerStyle: ViewStyle = {
      width: container !== 'none' ? boxSize : size,
      height: container !== 'none' ? boxSize : size,
      justifyContent: 'center',
      alignItems: 'center',
    };

    if (container === 'circle') {
      containerStyle.borderRadius = boxSize / 2;
      containerStyle.backgroundColor = theme.colors.surface;
      containerStyle.borderWidth = 1;
      containerStyle.borderColor = theme.colors.borderLight;
    } else if (container === 'pill') {
      containerStyle.borderRadius = boxSize / 2.5;
      containerStyle.backgroundColor = theme.colors.surface;
      containerStyle.borderWidth = 1;
      containerStyle.borderColor = theme.colors.borderLight;
    } else if (container === 'square') {
      containerStyle.borderRadius = theme.radii.md;
      containerStyle.backgroundColor = theme.colors.surface;
      containerStyle.borderWidth = 1;
      containerStyle.borderColor = theme.colors.borderLight;
    }

    return (
      <View
        style={[
          containerStyle,
          glow && {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          },
          style,
        ]}
      >
        <LucideComponent color={color} size={size} strokeWidth={2} />
      </View>
    );
  }

  return <View style={[{ width: size, height: size }, style]} />;
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});
