/**
 * WidgetServiceImpl
 * Implementation of IWidgetService for iOS widgets
 */
import { Platform } from 'react-native';
import { IWidgetService, WidgetData } from '../../application/ports/services';

const APP_GROUP_IDENTIFIER = 'group.com.foodhabit.app';

export class WidgetServiceImpl implements IWidgetService {
    private SharedGroupPreferences: any = null;
    private ExtensionStorage: any = null;

    constructor() {
        // Lazy load native modules to avoid crashes on unsupported platforms
        if (Platform.OS === 'ios') {
            try {
                this.SharedGroupPreferences = require('react-native-shared-group-preferences').default;
                this.ExtensionStorage = require('@bacons/apple-targets').ExtensionStorage;
            } catch (e) {
                console.warn('Widget modules not available');
            }
        }
    }

    isSupported(): boolean {
        return Platform.OS === 'ios' && this.SharedGroupPreferences !== null;
    }

    async sync(data: WidgetData): Promise<void> {
        if (!this.isSupported()) return;

        try {
            await this.SharedGroupPreferences.setItem(
                'gut_health_data',
                JSON.stringify(data),
                APP_GROUP_IDENTIFIER
            );

            await this.refresh();
        } catch (error) {
            console.error('Widget Sync Failed:', error);
        }
    }

    async refresh(): Promise<void> {
        if (!this.isSupported() || !this.ExtensionStorage) return;

        try {
            this.ExtensionStorage.reloadWidget('GutHealthWidget');
        } catch (error) {
            console.error('Widget Refresh Failed:', error);
        }
    }
}
