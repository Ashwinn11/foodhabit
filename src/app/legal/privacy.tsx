import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';

export default function PrivacyScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();

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
                <Text variant="title" color={colors.text1} style={{ marginLeft: 8 }}>Privacy Policy</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text variant="bodyBold" color={colors.text1}>1. Information We Collect</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    Gut Buddy collects information you provide directly to us, such as when you create an account, log meals, or log symptoms. This includes your email address, dietary restrictions, and health-related logs.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>2. How We Use Your Information</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    We use the information we collect to provide, maintain, and improve our services, including analyzing your gut health patterns and providing personalized insights via AI.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>3. AI Analysis</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    We use Google Gemini AI to analyze your meal logs and symptom logs. Your data is sent to these services for processing but is governed by our privacy standards.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>4. Data Security</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
                </Text>

                <Text variant="bodyBold" color={colors.text1}>5. Contact Us</Text>
                <Text variant="body" color={colors.text2} style={{ marginTop: 8, marginBottom: 16 }}>
                    If you have any questions about this Privacy Policy, please contact us at support@gutbuddy.app.
                </Text>

                <Text variant="caption" color={colors.text3} style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                    Last Updated: March 2026
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
