import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Dimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { Text } from './Text';
import { colors, shadows } from '@/theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastConfig: Record<ToastType, { iconBg: string; iconColor: string; icon: typeof CheckCircle2 }> = {
    success: { iconBg: colors.primary.light, iconColor: colors.primary.DEFAULT, icon: CheckCircle2 },
    error: { iconBg: colors.red.light, iconColor: colors.red.DEFAULT, icon: AlertCircle },
    info: { iconBg: colors.amber.light, iconColor: colors.amber.DEFAULT, icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const translateY = useSharedValue(-120);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hideToast = useCallback(() => {
        translateY.value = withTiming(-120, { duration: 220 });
        opacity.value = withTiming(0, { duration: 180 }, () => {
            runOnJS(setToast)(null);
        });
        scale.value = withTiming(0.92, { duration: 200 });
    }, []);

    const showToast = useCallback((options: ToastOptions) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast(options);
        // Springy entrance from above
        translateY.value = withSpring(60, { damping: 16, stiffness: 220, mass: 0.8 });
        opacity.value = withTiming(1, { duration: 200 });
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });

        timerRef.current = setTimeout(() => {
            hideToast();
        }, options.duration || 3000) as unknown as NodeJS.Timeout;
    }, [hideToast]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    const type = toast?.type ?? 'success';
    const config = toastConfig[type];
    const IconComponent = config.icon;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View style={[styles.container, animatedStyle]}>
                    {/* Colored icon circle instead of left-border */}
                    <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
                        <IconComponent size={18} color={config.iconColor} />
                    </View>
                    <View style={styles.content}>
                        <Text variant="bodyBold" color={colors.text1}>{toast.title}</Text>
                        {toast.message && (
                            <Text variant="caption" color={colors.text2}>{toast.message}</Text>
                        )}
                    </View>
                    <Pressable onPress={hideToast} style={styles.closeBtn}>
                        <View style={styles.closeCircle}>
                            <X size={13} color={colors.text3} strokeWidth={2.5} />
                        </View>
                    </Pressable>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        backgroundColor: colors.surface,
        borderRadius: 20, // rounder pill-ish
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...shadows.elevated,
        zIndex: 9999,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    closeBtn: {
        flexShrink: 0,
    },
    closeCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
