import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors, radii, typography } from '@/theme';

interface InputProps extends TextInputProps {
    icon?: React.ReactNode;
    label?: string;
}

export function Input({ icon, label, style, ...props }: InputProps): React.JSX.Element {
    return (
        <View style={{ gap: 6 }}>
            {label && (
                <Text variant="label" color={colors.text2} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Text>
            )}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.stone,
                    borderRadius: radii.input,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    gap: 10,
                }}
            >
                {icon}
                <TextInput
                    style={[
                        {
                            flex: 1,
                            fontFamily: typography.families.figtreeRegular,
                            fontSize: 14,
                            color: colors.text1,
                        },
                        style,
                    ]}
                    placeholderTextColor={colors.text3}
                    {...props}
                />
            </View>
        </View>
    );
}
