import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

interface AvatarProps {
    name?: string | null;
    url?: string | null;
    size?: number;
}

// Fun pastel gradient pairs keyed by first char code — deterministic
const RING_COLORS = [
    colors.primary.DEFAULT,
    colors.amber.DEFAULT,
    colors.purple.DEFAULT,
    colors.red.DEFAULT,
    '#E05FAA', // extra fun pink
    '#3B82F6', // extra fun blue
];

export function Avatar({ name, url, size = 40 }: AvatarProps): React.JSX.Element {
    const getInitial = () => {
        if (!name) return '?';
        const cleanName = name.replace(/@.*$/, '').trim();
        if (!cleanName) return '?';
        const parts = cleanName.split(/[\s_-]+/);
        let res = '';
        if (parts.length > 1) {
            res = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
        } else {
            res = cleanName[0] || '';
        }
        return res.toUpperCase() || '?';
    };

    const initial = getInitial();

    // Pick a ring color deterministically from the name
    const charCode = name ? name.charCodeAt(0) : 0;
    const ringColor = RING_COLORS[charCode % RING_COLORS.length];

    const ringWidth = Math.max(2, size * 0.065); // scale ring with size
    const innerSize = size - ringWidth * 2 - 2; // gap between ring and avatar

    if (url) {
        return (
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: ringWidth,
                    borderColor: ringColor + '90', // semi-transparent ring
                    padding: 1,
                    backgroundColor: 'transparent',
                }}
            >
                <Image
                    source={{ uri: url }}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: size / 2,
                        backgroundColor: colors.primary.light,
                    }}
                />
            </View>
        );
    }

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: ringWidth,
                borderColor: ringColor + '60',
                padding: 2,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <View
                style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerSize / 2,
                    backgroundColor: ringColor + '25', // very subtle tint
                    borderWidth: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    variant="bodyBold"
                    color={ringColor}
                    style={{ fontSize: size * 0.35 }}
                >
                    {initial}
                </Text>
            </View>
        </View>
    );
}
