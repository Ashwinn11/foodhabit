import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolateColor,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Icon, LucideIconName } from './Icon';
import { IconContainer } from './IconContainer';
import { Icon3D, Icon3DName } from './Icon3D';

interface SelectionCardProps {
  title: string;
  description?: string;
  icon?: Icon3DName;
  lucideIcon?: LucideIconName;
  lucideColor?: string;
  selected?: boolean;
  onPress: () => void;
  layout?: 'row' | 'grid' | 'pill';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  icon, 
  lucideIcon,
  lucideColor,
  selected, 
  onPress,
  layout = 'row'
}) => {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, { duration: 250 });
  }, [selected, selectedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      borderColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        ['rgba(255,255,255,0.05)', theme.colors.primary]
      ),
      backgroundColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        ['rgba(255,255,255,0.02)', layout === 'pill' ? theme.colors.primary : 'rgba(255,255,255,0.01)']
      ),
    };
  });

  const checkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(selectedProgress.value, [0, 1], [0.8, 1]) }],
      opacity: interpolate(selectedProgress.value, [0, 1], [0.3, 1]),
      backgroundColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        ['transparent', theme.colors.primary]
      ),
      borderColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        ['rgba(255,255,255,0.15)', theme.colors.primary]
      ),
    };
  });

  const gradientOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: layout === 'pill' ? 0 : selectedProgress.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (layout === 'pill') {
    return (
      <AnimatedTouchable
        style={[styles.pillCard, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.pillContent}>
          {lucideIcon && (
            <Icon 
              name={lucideIcon} 
              color={selected ? theme.colors.primaryForeground : (lucideColor ?? theme.colors.primary)} 
              size={18} 
              strokeWidth={2.5}
            />
          )}
          <Text 
            variant="bodySmall" 
            style={[
              { fontFamily: theme.fonts.semibold }, 
              selected ? { color: theme.colors.primaryForeground } : {}
            ]}
          >
            {title}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[
        layout === 'grid' ? styles.gridCard : styles.rowCard, 
        animatedStyle
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[StyleSheet.absoluteFill, gradientOpacityStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255, 77, 77, 0.15)', 'rgba(255, 77, 77, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={layout === 'grid' ? styles.gridContent : styles.rowContent}>
        {layout === 'grid' && (
           <Animated.View style={[styles.gridCheckContainer, checkStyle]}>
            {selected && (
              <Icon 
                name="Check" 
                size={12} 
                color={theme.colors.primaryForeground} 
                strokeWidth={3}
              />
            )}
          </Animated.View>
        )}

        {lucideIcon && (
          <View style={styles.iconWrapper}>
             <IconContainer 
              name={lucideIcon} 
              color={lucideColor ?? theme.colors.primary}
              variant={selected ? 'solid' : 'muted'}
              size={layout === 'grid' ? 48 : 42}
              iconSize={layout === 'grid' ? 24 : 20}
            />
          </View>
        )}
        {icon && !lucideIcon && (
          <View style={styles.iconContainer}>
            <Icon3D name={icon} size={42} animated={selected} animationType="float" />
          </View>
        )}
        <View style={layout === 'grid' ? styles.gridTextContainer : styles.rowTextContainer}>
          <Text variant="h3" style={[styles.title, selected && { color: theme.colors.text }]} numberOfLines={layout === 'grid' ? 2 : undefined}>
            {title}
          </Text>
          {description && (
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.description} numberOfLines={layout === 'grid' ? 3 : undefined}>
              {description}
            </Text>
          )}
        </View>

        {layout === 'row' && (
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            {selected && (
              <Icon 
                name="Check" 
                size={14} 
                color={theme.colors.primaryForeground} 
                strokeWidth={3}
              />
            )}
          </Animated.View>
        )}
      </View>
      
      {/* Glow Effect */}
      {selected && layout !== 'pill' && <View style={styles.glow} pointerEvents="none" />}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  rowCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: theme.spacing.xxs,
  },
  gridCard: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    margin: theme.spacing.xxs,
    minHeight: 160,
  },
  pillCard: {
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    overflow: 'hidden',
    margin: 4,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    zIndex: 2,
  },
  gridContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    zIndex: 2,
    flex: 1,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: theme.spacing.xs,
  },
  iconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextContainer: {
    flex: 1,
    gap: 2,
  },
  gridTextContainer: {
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  description: {
    lineHeight: 18,
    fontSize: 13,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  gridCheckContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    zIndex: 1,
  },
});
