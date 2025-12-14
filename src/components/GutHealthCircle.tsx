import React from 'react';
import { View, StyleSheet } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { theme } from '../theme';
import Text from './Text';

interface GutHealthCircleProps {
  value: number; // 0-100
  label: string;
  goal: string;
  size?: number;
  goalAchieved?: boolean;
}

export default function GutHealthCircle({
  value,
  label,
  goal,
  size = 140,
  goalAchieved = false,
}: GutHealthCircleProps) {
  // Use app colors: secondary (teal) when goal achieved, primary (coral) otherwise
  const progressColor = goalAchieved ? theme.colors.brand.secondary : theme.colors.brand.primary;
  const backgroundColor = goalAchieved
    ? theme.colors.brand.secondary + '15' // Teal with transparency
    : theme.colors.brand.primary + '15'; // Coral with transparency

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circleWrapper,
          {
            width: size,
            height: size,
            backgroundColor,
            borderRadius: size / 2,
          },
        ]}
      >
        <CircularProgress
          value={value}
          radius={size / 2 - 8}
          duration={1500}
          progressValueColor={progressColor}
          progressValueFontSize={28}
          activeStrokeColor={progressColor}
          inActiveStrokeColor={theme.colors.border.light}
          inActiveStrokeOpacity={0.2}
          maxValue={100}
          valueSuffix="%"
          showProgressValue={true}
        />
      </View>

      {/* Label and Goal */}
      <Text
        variant="caption"
        weight="semiBold"
        align="center"
        style={{ marginTop: theme.spacing.md, color: theme.colors.text.primary }}
      >
        {label}
      </Text>
      <Text
        variant="caption"
        color="secondary"
        align="center"
        style={{ marginTop: 4 }}
      >
        {goal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
