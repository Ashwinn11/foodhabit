/**
 * AsyncStorageServiceImpl
 * Implementation of IStorageService using AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from '../../application/ports/services';

export class AsyncStorageServiceImpl implements IStorageService {
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Failed to get ${key} from storage:`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to set ${key} in storage:`, error);
            throw error;
        }
    }

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove ${key} from storage:`, error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw error;
        }
    }

    async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
        try {
            const pairs = await AsyncStorage.multiGet(keys);
            const result: Record<string, T | null> = {};

            pairs.forEach(([key, value]) => {
                result[key] = value ? JSON.parse(value) : null;
            });

            return result;
        } catch (error) {
            console.error('Failed to get multiple keys from storage:', error);
            return {};
        }
    }

    async setMultiple<T>(items: Record<string, T>): Promise<void> {
        try {
            const pairs: [string, string][] = Object.entries(items).map(([key, value]) => [
                key,
                JSON.stringify(value),
            ]);
            await AsyncStorage.multiSet(pairs);
        } catch (error) {
            console.error('Failed to set multiple keys in storage:', error);
            throw error;
        }
    }
}
