import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import AnimatedMascot from '@/components/AnimatedMascot';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { colors } from '@/theme';



export default function WelcomeScreen(): React.JSX.Element {
    const router = useRouter();


    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 56, justifyContent: 'center', paddingHorizontal: 24 }}>
                    <ProgressDots total={7} current={0} />
                </View>

                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 28,
                        paddingBottom: 32,
                    }}
                >
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <AnimatedMascot expression="happy" size={140} />

                        <Text
                            variant="heading"
                            color={colors.text1}
                            style={{ marginTop: 24, textAlign: 'center', lineHeight: 32 }}
                        >
                            You're in! Welcome to Gut Buddy 👋
                        </Text>

                        <Text
                            variant="bodyBold"
                            color={colors.primary.DEFAULT}
                            style={{ marginTop: 12, textAlign: 'center' }}
                        >
                            Congrats on taking the first step to fix your gut!
                        </Text>

                        <Text
                            variant="body"
                            color={colors.text2}
                            style={{ marginTop: 8, textAlign: 'center', lineHeight: 22 }}
                        >
                            We're going to use advanced AI to find exactly what's causing your discomfort, discover your hidden triggers, and design a gut-safe life for you.
                        </Text>
                    </View>

                    <View style={{ marginTop: 40, gap: 12 }}>
                        <Card style={{
                            padding: 20,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderRadius: 24,
                            borderWidth: 2,
                            borderColor: colors.primary.DEFAULT,
                            shadowColor: colors.primary.DEFAULT,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                        }}>
                            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    backgroundColor: colors.primary.DEFAULT,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={24} color="#FFF" fill="#FFF" fillOpacity={0.2} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="bodyBold" color={colors.text1} style={{ fontSize: 18 }}>Personalized for you</Text>
                                    <Text variant="caption" color={colors.text2} style={{ fontSize: 14, marginTop: 2 }}>Ready for your 2-minute gut analysis?</Text>
                                </View>
                            </View>
                        </Card>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ marginTop: 32 }}>
                        <Button
                            title="Start Analysis"
                            onPress={() => router.push('/(onboarding)/profile')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
