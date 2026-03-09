import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Dimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { Text } from './Text';
import { colors, shadows, radii } from '@/theme';

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hideToast = useCallback(() => {
        translateY.value = withTiming(-100, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(setToast)(null);
        });
    }, []);

    const showToast = useCallback((options: ToastOptions) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast(options);
        translateY.value = withTiming(60, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });

        timerRef.current = setTimeout(() => {
            hideToast();
        }, options.duration || 3000) as unknown as NodeJS.Timeout;
    }, [hideToast]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const getIcon = () => {
        switch (toast?.type) {
            case 'error': return <AlertCircle size={20} color={colors.red.DEFAULT} />;
            case 'info': return <Info size={20} color={colors.amber.DEFAULT} />;
            default: return <CheckCircle2 size={20} color={colors.primary.DEFAULT} />;
        }
    };

    const getBorderColor = () => {
        switch (toast?.type) {
            case 'error': return colors.red.DEFAULT;
            case 'info': return colors.amber.DEFAULT;
            default: return colors.primary.DEFAULT;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View style={[styles.container, animatedStyle, { borderLeftColor: getBorderColor() }]}>
                    <View style={styles.iconContainer}>
                        {getIcon()}
                    </View>
                    <View style={styles.content}>
                        <Text variant="bodyBold" color={colors.text1}>{toast.title}</Text>
                        {toast.message && (
                            <Text variant="caption" color={colors.text2}>{toast.message}</Text>
                        )}
                    </View>
                    <Pressable onPress={hideToast} style={styles.closeBtn}>
                        <X size={16} color={colors.text3} />
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
        left: 20,
        right: 20,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        ...shadows.elevated,
        zIndex: 9999,
    },
    iconContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    }
});
