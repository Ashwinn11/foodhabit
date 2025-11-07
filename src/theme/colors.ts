/**
 * Color system for Food Habit app
 * Following iOS design guidelines with semantic color naming
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main brand color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Secondary colors
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Neutral/Gray scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },

  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },

  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },

  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },

  // App-specific colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
  },

  text: {
    primary: '#212121',
    secondary: '#616161',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  border: {
    light: '#EEEEEE',
    main: '#E0E0E0',
    dark: '#BDBDBD',
  },

  // iOS system colors
  ios: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
  },
} as const;

export type ColorScheme = typeof colors;
