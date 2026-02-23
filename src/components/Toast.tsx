import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Icon } from './Icon';
import { Icon3D } from './Icon3D';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ToastItem: React.FC<{ toast: ToastMessage; onDone: () => void }> = ({
  toast,
  onDone,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, (done) => {
      if (done) runOnJS(onDone)();
    });
  }, [onDone]);

  useEffect(() => {
    translateY.value = withSpring(insets.top + 8, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const icon3DName =
    toast.type === 'success' ? 'check_mark_button' : toast.type === 'error' ? 'warning' : null;

  return (
    <Animated.View style={[styles.toast, animStyle]}>
      {icon3DName ? (
        <Icon3D name={icon3DName} size={22} />
      ) : (
        <Icon name="Info" size={18} color={theme.colors.primary} />
      )}
      <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => removeToast(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111624',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    maxWidth: '85%',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  message: {
    flex: 1,
    fontFamily: theme.fonts.medium,
  },
});
