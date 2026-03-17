import React from 'react';
import { ScrollView, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';

export default function TermsScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();

    const openEULA = () => {
        Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.stone }}>
                <Button
                    variant="ghost"
                    title=""
                    icon={<ChevronLeft size={24} color={colors.text1} />}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            router.replace('/(tabs)/profile');
                        }
                    }}
                />
                <Text variant="title" color={colors.text1} style={{ marginLeft: 8 }}>Terms of Service</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text variant="body" color={colors.text1} style={{ marginBottom: 20 }}>
                    By using Gut Buddy, you agree to the following terms and conditions.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>Standard License Agreement</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    Your use of this application is governed by the standard Apple Licensed Application End User License Agreement (EULA).
                </Text>

                <Button
                    title="View Apple Standard EULA"
                    onPress={openEULA}
                    variant="outline"
                    icon={<ExternalLink size={16} color={colors.primary.DEFAULT} />}
                    style={{ marginBottom: 20 }}
                />

                <Text variant="bodyBold" color={colors.text1}>1. Medical Disclaimer</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    Gut Buddy is an educational tool and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>2. Use of AI Insights</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    AI-generated insights are based on patterns and general nutritional data. They may not always be accurate and should be verified with a healthcare professional.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>3. Subscription Terms</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    GutScan Pro subscriptions are processed via Apple In-App Purchases and are subject to Apple's standard subscription terms.
                </Text>

                <Text variant="caption" color={colors.text3} style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                    Last Updated: March 2026
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
