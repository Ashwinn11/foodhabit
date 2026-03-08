import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography } from '@/theme';

type FontVariant =
    | 'heading'
    | 'title'
    | 'body'
    | 'bodyBold'
    | 'label'
    | 'labelBold'
    | 'caption'
    | 'badge'
    | 'tabLabel'
    | 'foodName';

interface TextProps extends RNTextProps {
    variant?: FontVariant;
    color?: string;
}

const variantStyles: Record<FontVariant, { fontFamily: string; fontSize: number; letterSpacing?: number }> = {
    heading: { fontFamily: typography.families.figtreeBlack, fontSize: typography.sizes.screenTitle, letterSpacing: -0.5 },
    title: { fontFamily: typography.families.figtreeExtraBold, fontSize: 16 },
    body: { fontFamily: typography.families.figtreeRegular, fontSize: typography.sizes.body },
    bodyBold: { fontFamily: typography.families.figtreeSemiBold, fontSize: typography.sizes.body },
    label: { fontFamily: typography.families.monoRegular, fontSize: typography.sizes.small },
    labelBold: { fontFamily: typography.families.monoBold, fontSize: typography.sizes.small },
    caption: { fontFamily: typography.families.monoRegular, fontSize: typography.sizes.caption },
    badge: { fontFamily: typography.families.monoBold, fontSize: typography.sizes.badge },
    tabLabel: { fontFamily: typography.families.monoBold, fontSize: typography.sizes.tabLabel },
    foodName: { fontFamily: typography.families.figtreeExtraBold, fontSize: typography.sizes.foodName },
};

export function Text({ variant = 'body', color, style, children, ...props }: TextProps): React.JSX.Element {
    const variantStyle = variantStyles[variant];

    return (
        <RNText
            style={[
                {
                    fontFamily: variantStyle.fontFamily,
                    fontSize: variantStyle.fontSize,
                    letterSpacing: variantStyle.letterSpacing,
                    color: color ?? '#1C2B20',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}
