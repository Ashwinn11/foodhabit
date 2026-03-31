import React from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    ZoomIn,
} from 'react-native-reanimated';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radii, shadows } from '@/theme';

const { width } = Dimensions.get('window');

interface DialogProps {
    visible: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'default' | 'danger';
    loading?: boolean;
}

export function Dialog({
    visible,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    type = 'default',
    loading = false
}: DialogProps): React.JSX.Element {
    if (!visible) return <></>;

    const emoji = type === 'danger' ? '⚠️' : '👋';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={loading ? undefined : onCancel}
        >
            {/* Blurred backdrop */}
            <Pressable
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(28, 43, 32, 0.45)' }]}
                onPress={loading ? undefined : onCancel}
                disabled={loading}
            />

            {/* Centering wrapper */}
            <View style={styles.overlay} pointerEvents="box-none">
                <Animated.View
                    entering={ZoomIn.springify().damping(14).stiffness(200)}
                    style={styles.content}
                >
                    {/* Fun emoji header */}
                    <View style={styles.emojiCircle}>
                        <Text style={{ fontSize: 28 }}>{emoji}</Text>
                    </View>

                    <Text variant="title" color={colors.text1} style={styles.title}>
                        {title}
                    </Text>
                    <Text variant="body" color={colors.text2} style={styles.description}>
                        {description}
                    </Text>

                    <View style={styles.footer}>
                        <Button
                            title={cancelLabel}
                            variant="outline"
                            onPress={onCancel}
                            style={styles.button}
                            disabled={loading}
                        />
                        <Button
                            title={confirmLabel}
                            variant={type === 'danger' ? 'dark' : 'primary'}
                            onPress={onConfirm}
                            style={[
                                styles.button,
                                type === 'danger' && { backgroundColor: colors.red.DEFAULT, shadowColor: colors.red.DEFAULT }
                            ]}
                            loading={loading}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 28, // rounder = friendlier
        padding: 28,
        alignItems: 'center',
        ...shadows.elevated,
    },
    emojiCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        marginBottom: 24,
        lineHeight: 22,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
    }
});
