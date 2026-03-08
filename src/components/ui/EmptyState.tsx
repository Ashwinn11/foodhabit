import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { GutBuddyMascot } from '@/components/mascot/GutBuddy';
import { colors } from '@/theme';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    mascotExpression?: 'happy' | 'neutral' | 'sad';
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, mascotExpression = 'neutral', action }: EmptyStateProps): React.JSX.Element {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
            <GutBuddyMascot expression={mascotExpression} size={80} />
            {icon && (
                <View style={{ marginTop: 8 }}>{icon}</View>
            )}
            <Text variant="title" color={colors.text1} style={{ textAlign: 'center' }}>
                {title}
            </Text>
            <Text variant="label" color={colors.text2} style={{ textAlign: 'center', lineHeight: 18 }}>
                {message}
            </Text>
            {action && (
                <View style={{ marginTop: 8 }}>{action}</View>
            )}
        </View>
    );
}
