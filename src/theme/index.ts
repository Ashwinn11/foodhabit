// Design System Tokens
// Single source of truth — used by Tailwind config and programmatic code (SVG, charts)

export const colors = {
    bg: '#F0F7F2',
    surface: '#FFFFFF',
    border: '#D4EAD9',
    primary: {
        DEFAULT: '#2D7A52',
        light: '#E6F5EC',
        mid: '#B8DFC8',
    },
    amber: {
        DEFAULT: '#C8821A',
        light: '#FEF3DC',
    },
    red: {
        DEFAULT: '#C0392B',
        light: '#FDE8E6',
    },
    text1: '#1C2B20',
    text2: '#6B8C72',
    text3: '#A8BFAC',
    cream: '#FDFAF4',
    stone: '#E8E2D6',
    dark: '#1C2B20',
    gradient: {
        start: '#EDFAF2',
        mid: '#FDFAF4',
        end: '#F5F0FF',
    },
    purple: '#7C3AED',
} as const;

export const typography = {
    families: {
        figtreeBlack: 'Figtree_900Black',
        figtreeExtraBold: 'Figtree_800ExtraBold',
        figtreeBold: 'Figtree_700Bold',
        figtreeSemiBold: 'Figtree_600SemiBold',
        figtreeMedium: 'Figtree_500Medium',
        figtreeRegular: 'Figtree_400Regular',
        monoBold: 'DMMono_500Medium',
        monoMedium: 'DMMono_500Medium',
        monoRegular: 'DMMono_400Regular',
    },
    sizes: {
        screenTitle: 20,
        foodName: 12,
        tabLabel: 8.5,
        badge: 8.5,
        body: 14,
        small: 11,
        caption: 9,
        captionSm: 9.5,
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
} as const;

export const radii = {
    card: 20,
    btn: 14,
    btnSm: 10,
    chip: 999,
    tab: 10,
    input: 12,
} as const;

export const shadows = {
    card: {
        shadowColor: 'rgba(44,120,70,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    button: {
        shadowColor: 'rgba(45,122,82,0.30)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 6,
    },
    elevated: {
        shadowColor: 'rgba(44,120,70,0.12)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 8,
    },
} as const;

export type ColorName = keyof typeof colors;
