import React from 'react';
import { View, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GutBuddyMascot } from '@/components/mascot/GutBuddy';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import Svg, { Path, Rect } from 'react-native-svg';

// Google logo SVG
function GoogleLogo(): React.JSX.Element {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </Svg>
    );
}

// Apple logo SVG
function AppleLogo(): React.JSX.Element {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
            <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </Svg>
    );
}

export default function AuthScreen(): React.JSX.Element {
    const { signInWithGoogle, signInWithApple, isLoading } = useAuthStore();

    const handleGoogleSignIn = async (): Promise<void> => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Google auth error:', error);
        }
    };

    const handleAppleSignIn = async (): Promise<void> => {
        try {
            await signInWithApple();
        } catch (error: any) {
            if (error?.code !== 'ERR_REQUEST_CANCELED') {
                console.error('Apple auth error:', error);
            }
        }
    };

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 32,
                    }}
                >
                    {/* Mascot */}
                    <GutBuddyMascot expression="happy" size={140} />

                    {/* App icon */}
                    <Image
                        source={require('../../../assets/icon.webp')}
                        style={{ width: 60, height: 60, borderRadius: 14, marginTop: 16 }}
                    />

                    {/* App Name */}
                    <Text
                        variant="heading"
                        color={colors.text1}
                        style={{ fontSize: 32, letterSpacing: -1, marginTop: 16, textAlign: 'center' }}
                    >
                        Gut Buddy
                    </Text>

                    {/* Tagline */}
                    <Text
                        variant="bodyBold"
                        color={colors.text1}
                        style={{ fontSize: 16, marginTop: 12, textAlign: 'center' }}
                    >
                        Stop guessing why your stomach hurts.
                    </Text>

                    {/* Subtext */}
                    <Text
                        variant="label"
                        color={colors.text2}
                        style={{ marginTop: 8, textAlign: 'center', lineHeight: 18 }}
                    >
                        Log your meals. Find your triggers. Eat freely.
                    </Text>

                    {/* Auth Buttons */}
                    <View style={{ width: '100%', gap: 12, marginTop: 40 }}>
                        <Button
                            title="Continue with Google"
                            variant="outline"
                            icon={<GoogleLogo />}
                            onPress={handleGoogleSignIn}
                            loading={isLoading}
                            fullWidth
                            style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            }}
                        />

                        <Button
                            title="Continue with Apple"
                            variant="dark"
                            icon={<AppleLogo />}
                            onPress={handleAppleSignIn}
                            loading={isLoading}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
