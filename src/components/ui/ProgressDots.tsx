import React from 'react';
import { View } from 'react-native';
import { colors } from '@/theme';

interface ProgressDotsProps {
    total: number;
    current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps): React.JSX.Element {
    const progress = (current + 1) / total;

    return (
        <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
            <View style={{ height: 6, backgroundColor: colors.primary.light, borderRadius: 3, overflow: 'hidden' }}>
                <View
                    style={{
                        height: '100%',
                        width: `${progress * 100}%`,
                        backgroundColor: colors.primary.DEFAULT,
                        borderRadius: 3
                    }}
                />
            </View>
        </View>
    );
}
