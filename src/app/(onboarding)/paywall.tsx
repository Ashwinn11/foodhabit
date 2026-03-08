import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, TrendingDown, Activity, Check } from 'lucide-react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function PaywallScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { updateProfile } = useAuthStore();
    const [finishing, setFinishing] = useState(false);

    const completeOnboarding = async (): Promise<void> => {
        setFinishing(true);
        try {
            await updateProfile({ onboarding_complete: true });
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Onboarding complete error:', error);
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Native RevenueCat Paywall */}
            <RevenueCatUI.Paywall
                options={{
                    displayCloseButton: true,
                }}
                onDismiss={() => {
                    if (navigation.canGoBack()) {
                        router.back();
                    } else {
                        // Fallback to the onboarding bay if no history
                        router.replace('/(onboarding)/conditions');
                    }
                }}
                onPurchaseCompleted={completeOnboarding}
                onRestoreCompleted={completeOnboarding}
            />
            {finishing && (
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                </View>
            )}
        </SafeAreaView>
    );
}
