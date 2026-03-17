import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, Pressable, Platform, Image, Linking } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import * as Notifications from 'expo-notifications';
import { Sparkles, CheckCircle2, Shield, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { colors, radii } from '@/theme';

const features = [
    'Unlimited AI Meal Checks',
    'Personalized Trigger Detection',
    'Custom Gut-Safe Recipes',
    'Advanced Symptom Trends',
];

export default function PaywallScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { updateProfile } = useAuthStore();
    const { sync: syncSubscription } = useSubscriptionStore();
    
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    // Handle both custom identifiers and default identifiers
                    const targetIds = ['rc_annual', 'rc_monthly', 'rc_weekly', 'annual', 'monthly', 'weekly', '$rc_annual', '$rc_monthly', '$rc_weekly'];
                    const validPackages = offerings.current.availablePackages.filter(pkg => 
                        targetIds.includes(pkg.identifier) || targetIds.includes(pkg.identifier.toLowerCase())
                    );
                    
                    const pkgsToUse = validPackages.length > 0 ? validPackages : offerings.current.availablePackages;
                    
                    if (pkgsToUse.length > 0) {
                        setPackages(pkgsToUse);
                        // Default to annual first
                        const annual = pkgsToUse.find(p => p.identifier.toLowerCase().includes('annual'));
                        setSelectedPackage(annual || pkgsToUse[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching offerings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferings();
    }, []);

    const completeOnboarding = async (): Promise<void> => {
        try {
            await updateProfile({ onboarding_complete: true });
            await syncSubscription();

            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "You're All Set! 🎉",
                        body: "Welcome to Gut Buddy Pro. We're ready to find your triggers.",
                    },
                    trigger: null,
                });
            }

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Onboarding complete error:', error);
            router.replace('/(tabs)');
        }
    };

    const handlePurchase = async () => {
        if (!selectedPackage) return;
        setFinishing(true);
        try {
            const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
            if (typeof customerInfo.entitlements.active['GutScan Pro'] !== 'undefined') {
                await completeOnboarding();
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert('Purchase Failed', error.message);
            }
        } finally {
            setFinishing(false);
        }
    };

    const handleRestore = async () => {
        setFinishing(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (typeof customerInfo.entitlements.active['GutScan Pro'] !== 'undefined') {
                await completeOnboarding();
            } else {
                Alert.alert('No Subscription Found', "We couldn't find an active Pro subscription on this account.");
            }
        } catch (error: any) {
            Alert.alert('Restore Failed', error.message);
        } finally {
            setFinishing(false);
        }
    };

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 16, alignItems: 'flex-start' }}>
                    <Pressable
                        onPress={() => navigation.canGoBack() ? router.back() : router.replace('/(onboarding)/plan')}
                        style={{ padding: 8 }}
                    >
                        <X size={24} color={colors.text2} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <Image 
                            source={require('../../../assets/happy.webp')} 
                            style={{ width: 80, height: 80, marginBottom: 20 }} 
                            resizeMode="contain"
                        />
                        <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', fontSize: 32 }}>
                            Unlock Gut Buddy Pro
                        </Text>
                        <Text variant="body" color={colors.text2} style={{ textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 10 }}>
                            Get the exact roadmap and real-time AI tools to calm your gut and eat with confidence.
                        </Text>
                    </View>

                    <View style={{ marginTop: 32, gap: 16 }}>
                        {features.map((feature, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={16} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} fillOpacity={0.2} />
                                </View>
                                <Text variant="bodyBold" color={colors.text1}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ marginTop: 40, gap: 12 }}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginVertical: 40 }} />
                        ) : (
                            packages.map((pkg) => {
                                const isSelected = selectedPackage?.identifier === pkg.identifier;
                                const idLower = pkg.identifier.toLowerCase();
                                const isAnnual = idLower.includes('annual');
                                const isMonthly = idLower.includes('monthly');
                                const isWeekly = idLower.includes('weekly');
                                
                                let title = 'Premium Access';
                                if (isAnnual) title = 'Annual Plan';
                                if (isMonthly) title = 'Monthly Plan';
                                if (isWeekly) title = 'Weekly Access';
                                
                                let weeklyPriceNum = pkg.product.price;
                                if (isAnnual) weeklyPriceNum = pkg.product.price / 52;
                                if (isMonthly) weeklyPriceNum = (pkg.product.price * 12) / 52;
                                
                                // Safe extraction of currency symbol
                                const symbolMatch = pkg.product.priceString.match(/^[^\d\s]+/);
                                const currencySymbol = symbolMatch ? symbolMatch[0] : '$';
                                const formattedWeekly = `${currencySymbol}${weeklyPriceNum.toFixed(2)} / week`;
                                
                                return (
                                    <Pressable
                                        key={pkg.identifier}
                                        onPress={() => setSelectedPackage(pkg)}
                                    >
                                        <Card
                                            style={{
                                                padding: 20,
                                                borderWidth: 2,
                                                borderColor: isSelected ? colors.primary.DEFAULT : 'transparent',
                                                backgroundColor: isSelected ? colors.primary.light : colors.surface,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <View style={{ flex: 1, paddingRight: 12 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <Text variant="bodyBold" color={colors.text1} style={{ fontSize: 18 }}>
                                                        {title}
                                                    </Text>
                                                    {isAnnual && (
                                                        <View style={{ backgroundColor: colors.primary.DEFAULT, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                                            <Text variant="badge" color="#FFFFFF">BEST VALUE</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>
                                                    Billed as {pkg.product.priceString}{isAnnual ? '/year' : isMonthly ? '/month' : '/week'}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <Text variant="title" color={colors.text1} style={{ fontSize: 20 }}>
                                                    {currencySymbol}{weeklyPriceNum.toFixed(2)}
                                                </Text>
                                                <Text variant="caption" color={colors.text3}>
                                                    / week
                                                </Text>
                                            </View>
                                        </Card>
                                    </Pressable>
                                );
                            })
                        )}
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Button
                            title={(() => {
                                if (!selectedPackage || !selectedPackage.product) return 'Continue';
                                
                                const idLower = selectedPackage.identifier.toLowerCase();
                                const isAnnual = idLower.includes('annual');
                                const isMonthly = idLower.includes('monthly');
                                
                                const intro = selectedPackage.product.introPrice;
                                const suffix = isAnnual ? '/year' : isMonthly ? '/month' : '/week';
                                const priceString = selectedPackage.product.priceString || '';
                                
                                if (intro && intro.periodNumberOfUnits && intro.periodUnit) {
                                    return `Try ${intro.periodNumberOfUnits} ${intro.periodUnit.toLowerCase()}s free, then ${priceString}${suffix}`;
                                }
                                return `Continue with ${priceString}${suffix}`;
                            })()}
                            onPress={handlePurchase}
                            loading={finishing}
                            disabled={!selectedPackage || loading}
                            fullWidth
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 6 }}>
                            <Shield size={14} color={colors.text3} />
                            <Text variant="caption" color={colors.text3}>Cancel anytime. Secure payment.</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 24 }}>
                        <Pressable onPress={handleRestore}>
                            <Text variant="label" color={colors.text2} style={{ textDecorationLine: 'underline' }}>Restore Purchases</Text>
                        </Pressable>
                        <Pressable onPress={() => Linking.openURL('https://briefly.live/gutbuddy/terms-of-service')}>
                            <Text variant="label" color={colors.text2} style={{ textDecorationLine: 'underline' }}>Terms</Text>
                        </Pressable>
                        <Pressable onPress={() => Linking.openURL('https://briefly.live/gutbuddy/privacy-policy')}>
                            <Text variant="label" color={colors.text2} style={{ textDecorationLine: 'underline' }}>Privacy</Text>
                        </Pressable>
                    </View>

                </ScrollView>
                {finishing && (
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

