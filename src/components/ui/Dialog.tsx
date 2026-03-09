import React from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeIn,
    FadeOut,
    ZoomIn,
} from 'react-native-reanimated';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radii, shadows } from '@/theme';

const { width, height } = Dimensions.get('window');

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

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}
        >
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.overlay}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

                <Animated.View
                    entering={ZoomIn.duration(250)}
                    style={styles.content}
                >
                    <Text variant="title" color={colors.text1} style={styles.title}>
                        {title}
                    </Text>
                    <Text variant="body" color={colors.text2} style={styles.description}>
                        {description}
                    </Text>

                    <View style={styles.footer}>
                        <Button
                            title={cancelLabel}
                            variant="ghost"
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
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 43, 32, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        ...shadows.elevated,
    },
    title: {
        marginBottom: 8,
        fontSize: 20,
    },
    description: {
        marginBottom: 24,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    button: {
        flex: 1,
    }
});
