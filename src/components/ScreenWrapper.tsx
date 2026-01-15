import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  useGradient?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  useGradient = true,
  ...safeAreaProps
}) => {

  if (useGradient) {
    return (
      <LinearGradient
        colors={[...colors.gradientBackground]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, style]}
      >
        <SafeAreaView style={[styles.safeArea, contentContainerStyle]} {...safeAreaProps}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }, style]} 
      {...safeAreaProps}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
