/**
 * IStorageService
 * Port for local storage operations
 */

export interface IStorageService {
    /**
     * Get a value from storage
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Set a value in storage
     */
    set<T>(key: string, value: T): Promise<void>;

    /**
     * Remove a value from storage
     */
    remove(key: string): Promise<void>;

    /**
     * Clear all storage
     */
    clear(): Promise<void>;

    /**
     * Get multiple values by keys
     */
    getMultiple<T>(keys: string[]): Promise<Record<string, T | null>>;

    /**
     * Set multiple values
     */
    setMultiple<T>(items: Record<string, T>): Promise<void>;
}
