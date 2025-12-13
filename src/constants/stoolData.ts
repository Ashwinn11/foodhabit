import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export const STOOL_TYPES = [
    {
        type: 1,
        label: 'Type 1',
        description: 'Separate hard lumps',
        subtext: 'Constipation',
        iconLib: MaterialCommunityIcons,
        icon: 'dots-grid',
        color: theme.colors.brand.tertiary,
    },
    {
        type: 2,
        label: 'Type 2',
        description: 'Lumpy & sausage-like',
        subtext: 'Constipated',
        iconLib: MaterialCommunityIcons,
        icon: 'weather-hail',
        color: theme.colors.brand.tertiary,
    },
    {
        type: 3,
        label: 'Type 3',
        description: 'Sausage-shaped',
        subtext: 'Normal',
        iconLib: MaterialCommunityIcons,
        icon: 'pill',
        color: theme.colors.brand.primary,
    },
    {
        type: 4,
        label: 'Type 4',
        description: 'Smooth & soft',
        subtext: 'Normal',
        iconLib: MaterialCommunityIcons,
        icon: 'egg',
        color: theme.colors.brand.primary,
    },
    {
        type: 5,
        label: 'Type 5',
        description: 'Soft blobs',
        subtext: 'Slightly loose',
        iconLib: MaterialCommunityIcons,
        icon: 'cloud',
        color: theme.colors.brand.cream,
    },
    {
        type: 6,
        label: 'Type 6',
        description: 'Mushy paste',
        subtext: 'Loose',
        iconLib: MaterialCommunityIcons,
        icon: 'blur',
        color: theme.colors.brand.cream,
    },
    {
        type: 7,
        label: 'Type 7',
        description: 'Liquid only',
        subtext: 'Diarrhea',
        iconLib: Ionicons,
        icon: 'water',
        color: theme.colors.brand.cream,
    },
];

export const SYMPTOMS = [
    { id: 'bloating', label: 'Bloating', icon: 'balloon-outline' },
    { id: 'gas', label: 'Gas', icon: 'cloud-outline' },
    { id: 'cramping', label: 'Cramping', icon: 'alert-circle-outline' },
    { id: 'urgency', label: 'Urgency', icon: 'flash-outline' },
    { id: 'burning', label: 'Burning', icon: 'flame-outline' },
    { id: 'nausea', label: 'Nausea', icon: 'medical-outline' },
];

export const getEnergyIcon = (level: number) => {
    if (level >= 8) return { name: 'flash', color: theme.colors.brand.primary };
    if (level >= 6) return { name: 'happy', color: theme.colors.brand.primary };
    if (level >= 4) return { name: 'remove-circle', color: theme.colors.brand.cream };
    if (level >= 2) return { name: 'alert-circle', color: theme.colors.brand.tertiary };
    return { name: 'battery-dead', color: theme.colors.brand.tertiary };
};
