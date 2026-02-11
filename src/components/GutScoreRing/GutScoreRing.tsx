import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, spacing } from '../../theme';

interface GutScoreRingProps {
  score: number; // 0-100
  color: string;
  size?: number;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const GutScoreRing: React.FC<GutScoreRingProps> = ({
  score,
  color,
  size = 120,
  strokeWidth = 6,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.black + '10'}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Gradient progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
