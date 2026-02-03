/**
 * Jest Test Setup
 * Global setup for all tests
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
    Platform: {
        OS: 'ios',
        select: jest.fn((obj) => obj.ios),
    },
}));

// Mock shared group preferences
jest.mock('react-native-shared-group-preferences', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
}));

// Mock Extension Storage
jest.mock('@bacons/apple-targets', () => ({
    ExtensionStorage: {
        set: jest.fn(),
        get: jest.fn(),
    },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
    addNotificationReceivedListener: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Mock supabase
jest.mock('./src/config/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                        lte: jest.fn(() => Promise.resolve({ data: [], error: null })),
                    })),
                })),
            })),
            insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
            update: jest.fn(() => Promise.resolve({ data: null, error: null })),
            delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        auth: {
            getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        },
    },
}));

// Global test utilities
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
