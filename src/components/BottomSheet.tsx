import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_THRESHOLD = 80;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number | string;
  dismissOnBackdrop?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapHeight = '60%',
  dismissOnBackdrop = true,
}) => {
  // isMounted tracks whether the sheet DOM node should exist.
  // It becomes true immediately when visible=true, and becomes false only
  // after the close animation fully completes — never reading .value during render.
  const [isMounted, setIsMounted] = useState(visible);

  const sheetHeight =
    typeof snapHeight === 'string'
      ? (parseFloat(snapHeight) / 100) * SCREEN_HEIGHT
      : snapHeight;

  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const unmount = useCallback(() => {
    setIsMounted(false);
    onClose();
  }, [onClose]);

  const open = useCallback(() => {
    setIsMounted(true);
    translateY.value = sheetHeight;
    backdropOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, { damping: 30, stiffness: 300 });
  }, [sheetHeight]);

  const close = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withSpring(
      sheetHeight,
      { damping: 30, stiffness: 300 },
      (finished) => {
        if (finished) runOnJS(unmount)();
      }
    );
  }, [sheetHeight, unmount]);

  useEffect(() => {
    if (visible) {
      open();
    } else {
      close();
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, context.value.y + e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > SNAP_THRESHOLD || e.velocityY > 500) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 30, stiffness: 300 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isMounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={dismissOnBackdrop ? close : undefined}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle]}>
        <GestureDetector gesture={gesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    ...theme.shadows.medium,
  },
  handleArea: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
});
