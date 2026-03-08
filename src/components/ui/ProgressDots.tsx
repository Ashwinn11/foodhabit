import React from 'react';
import { View } from 'react-native';
import { colors } from '@/theme';

interface ProgressDotsProps {
    total: number;
    current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps): React.JSX.Element {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 }}>
            {Array.from({ length: total }).map((_, i) => {
                const isActive = i === current;
                return (
                    <View
                        key={i}
                        style={{
                            width: isActive ? 10 : 7,
                            height: isActive ? 10 : 7,
                            borderRadius: 999,
                            backgroundColor: isActive ? colors.primary.DEFAULT : colors.primary.mid,
                        }}
                    />
                );
            })}
        </View>
    );
}
