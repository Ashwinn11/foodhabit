import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

interface AvatarProps {
    name?: string | null;
    url?: string | null;
    size?: number;
}

export function Avatar({ name, url, size = 40 }: AvatarProps): React.JSX.Element {
    const placeholder = '?';

    if (url) {
        return (
            <Image
                source={{ uri: url }}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.primary.light,
                }}
            />
        );
    }

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.primary.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text
                variant="bodyBold"
                color="#FFFFFF"
                style={{ fontSize: size * 0.4 }}
            >
                {placeholder}
            </Text>
        </View>
    );
}
