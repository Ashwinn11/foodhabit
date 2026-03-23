import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Utensils, Target, Sparkles } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { colors } from '@/theme';
import { analytics } from '@/lib/posthog';

const planSteps = [
    { title: 'Weeks 1-2: Detection', desc: 'Identify your 3 primary triggers with smart logging.', icon: Target },
    { title: 'Weeks 3-4: Resets', desc: 'Eliminate high-risk foods and stabilize your gut.', icon: Utensils },
    { title: 'Weeks 5-6: Maintenance', desc: 'Reintroduce foods selectively and build your safe list.', icon: Calendar },
];

export default function PlanScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();

    React.useEffect(() => {
        analytics.planViewed();
    }, []);

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.canGoBack() && router.back()}
                        style={{ padding: 16, position: 'absolute', left: 0, zIndex: 10 }}
                    >
                        <ChevronLeft size={24} color={colors.text1} />
                    </Pressable>
                    <View style={{ flex: 1, paddingHorizontal: 70 }}>
                        <ProgressDots total={7} current={6} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}>
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.purple.light, alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={32} color={colors.purple.DEFAULT} fill={colors.purple.DEFAULT} fillOpacity={0.2} />
                        </View>
                        <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', marginTop: 16 }}>
                            Your plan
                        </Text>
                        <Text variant="body" color={colors.text2} style={{ textAlign: 'center', marginTop: 8 }}>
                            Based on your conditions, here's what the next 6 weeks look like.
                        </Text>
                    </View>

                    <View style={{ marginTop: 32, gap: 12 }}>
                        {planSteps.map((step, i) => (
                            <Card key={i} style={{ padding: 16, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                    <step.icon size={22} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} fillOpacity={0.2} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="labelBold" color={colors.primary.DEFAULT}>{step.title}</Text>
                                    <Text variant="caption" color={colors.text1}>{step.desc}</Text>
                                </View>
                            </Card>
                        ))}
                    </View>

                    <Card style={{ marginTop: 24, backgroundColor: colors.primary.DEFAULT, padding: 20 }}>
                        <Text variant="bodyBold" color="#FFF">Most users see less bloating within 3 weeks.</Text>
                        <Text variant="caption" color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
                            The earlier you start logging, the faster we find your triggers.
                        </Text>
                    </Card>

                    <View style={{ flex: 1 }} />

                    <View style={{ marginTop: 40 }}>
                        <Button
                            title="Start your trial"
                            onPress={() => router.push('/(onboarding)/paywall')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
