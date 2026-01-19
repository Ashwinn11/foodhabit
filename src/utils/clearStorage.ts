import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all AsyncStorage data
 * Run this once to migrate from local-only to database-backed storage
 */
export const clearAllAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage cleared successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear AsyncStorage:', error);
        return false;
    }
};

/**
 * Get all AsyncStorage keys (for debugging)
 */
export const getAllAsyncStorageKeys = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
        return keys;
    } catch (error) {
        console.error('Failed to get AsyncStorage keys:', error);
        return [];
    }
};

/**
 * Remove specific keys from AsyncStorage
 */
export const removeAsyncStorageKeys = async (keys: string[]) => {
    try {
        await AsyncStorage.multiRemove(keys);
        console.log(`✅ Removed ${keys.length} keys from AsyncStorage`);
        return true;
    } catch (error) {
        console.error('Failed to remove AsyncStorage keys:', error);
        return false;
    }
};
