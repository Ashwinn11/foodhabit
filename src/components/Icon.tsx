import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { getLucideIcon } from '../utils/iconMap';
import { theme } from '../theme/theme';

export interface IconProps {
  name?: string;
  source?: any;
  animation?: any;
  size?: number;
  style?: any;
  color?: string;
}

const getTintBg = (color: string) => {
  if (color === theme.colors.coral)  return 'rgba(224,93,76,0.12)';
  if (color === theme.colors.lime)   return 'rgba(212,248,112,0.12)';
  if (color === theme.colors.amber)  return 'rgba(245,201,122,0.12)';
  return theme.colors.surface;
};

export const Icon: React.FC<IconProps> = ({
  name,
  source,
  animation,
  size = 24,
  style,
  color = theme.colors.textPrimary,
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
    const boxSize = size * 1.75;
    const bg = getTintBg(color);
    return (
      <View
        style={[
          styles.pill,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: boxSize / 3,
            backgroundColor: bg,
            borderColor: color === theme.colors.textPrimary
              ? 'rgba(255,255,255,0.06)'
              : `${bg}`,
          },
          style,
        ]}
      >
        <LucideComponent color={color} size={size} strokeWidth={2} />
      </View>
    );
  }

  if (source) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        {/* image fallback intentionally empty — keep app icon via source prop */}
      </View>
    );
  }

  return <View style={[{ width: size, height: size }, style]} />;
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  pill: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
});
