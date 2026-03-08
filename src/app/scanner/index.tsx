import React, { useState, useRef } from 'react';
import { View, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Star } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSpring } from 'react-native-reanimated';
import Svg, { Rect, Line } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DualBadge } from '@/components/ui/Badge';
import { FoodSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_SIZE = SCREEN_WIDTH * 0.75;

interface MenuDish {
    name: string;
    fodmap_risk: 'low' | 'medium' | 'high';
    personal_verdict: 'avoid' | 'caution' | 'safest';
    why: string[];
    contains_user_triggers: string[];
}

interface MenuResult {
    dishes: MenuDish[];
    best_pick: string;
    best_pick_reason: string;
}

export default function ScannerScreen(): React.JSX.Element {
    const router = useRouter();
    const { user } = useAuthStore();
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<MenuResult | null>(null);

    // Scan line animation
    const scanLineY = useSharedValue(0);
    React.useEffect(() => {
        scanLineY.value = withRepeat(
            withTiming(SCAN_SIZE - 4, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const handleCapture = async (): Promise<void> => {
        if (!cameraRef.current || !user?.id) return;

        setScanning(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
            if (!photo?.base64) throw new Error('Failed to capture photo');

            const { data, error } = await supabase.functions.invoke('analyze-food', {
                body: {
                    mode: 'menu',
                    menu_image_base64: photo.base64,
                    mime_type: 'image/jpeg',
                    user_id: user.id,
                },
            });

            if (error) throw error;
            setResult(data as MenuResult);
        } catch (error) {
            console.error('Menu scan error:', error);
            setResult(null);
        } finally {
            setScanning(false);
        }
    };

    if (!permission?.granted) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                <Text variant="heading" color="#FFFFFF" style={{ textAlign: 'center' }}>Camera Access Required</Text>
                <Text variant="label" color="#FFFFFF80" style={{ textAlign: 'center', marginTop: 8 }}>
                    Gut Buddy needs camera access to scan restaurant menus.
                </Text>
                <View style={{ marginTop: 24, gap: 12 }}>
                    <Button title="Allow Camera" onPress={requestPermission} fullWidth />
                    <Button title="Go Back" variant="ghost" onPress={() => router.back()} fullWidth style={{ opacity: 0.7 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
                ref={cameraRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                facing="back"
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Close button */}
                <Pressable
                    onPress={() => router.back()}
                    style={{ position: 'absolute', top: 60, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={20} color="#FFFFFF" />
                </Pressable>

                {/* Scan Frame */}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative' }}>
                        {/* Corner brackets */}
                        <Svg width={SCAN_SIZE} height={SCAN_SIZE} style={{ position: 'absolute' }}>
                            {/* Top-left */}
                            <Line x1="0" y1="20" x2="0" y2="0" stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            <Line x1="0" y1="0" x2="20" y2="0" stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            {/* Top-right */}
                            <Line x1={SCAN_SIZE - 20} y1="0" x2={SCAN_SIZE} y2="0" stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            <Line x1={SCAN_SIZE} y1="0" x2={SCAN_SIZE} y2="20" stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            {/* Bottom-left */}
                            <Line x1="0" y1={SCAN_SIZE - 20} x2="0" y2={SCAN_SIZE} stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            <Line x1="0" y1={SCAN_SIZE} x2="20" y2={SCAN_SIZE} stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            {/* Bottom-right */}
                            <Line x1={SCAN_SIZE - 20} y1={SCAN_SIZE} x2={SCAN_SIZE} y2={SCAN_SIZE} stroke={colors.primary.DEFAULT} strokeWidth="3" />
                            <Line x1={SCAN_SIZE} y1={SCAN_SIZE - 20} x2={SCAN_SIZE} y2={SCAN_SIZE} stroke={colors.primary.DEFAULT} strokeWidth="3" />
                        </Svg>

                        {/* Scan line */}
                        <Animated.View
                            style={[
                                {
                                    position: 'absolute', left: 4, right: 4,
                                    height: 2, backgroundColor: colors.primary.DEFAULT,
                                    opacity: 0.8,
                                },
                                scanLineStyle,
                            ]}
                        />
                    </View>

                    <Text variant="bodyBold" color="#FFFFFF" style={{ marginTop: 20, textAlign: 'center' }}>
                        {scanning ? 'Analysing menu...' : 'Point at any menu'}
                    </Text>
                    <Text variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 6, textAlign: 'center' }}>
                        Gut Buddy reads every dish and finds what's safe for you
                    </Text>
                </View>

                {/* Capture Button */}
                {!result && (
                    <View style={{ alignItems: 'center', paddingBottom: 40 }}>
                        <Pressable
                            onPress={handleCapture}
                            disabled={scanning}
                            style={{
                                width: 72, height: 72, borderRadius: 36,
                                backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
                                opacity: scanning ? 0.5 : 1,
                            }}
                        >
                            <Camera size={28} color={colors.dark} />
                        </Pressable>
                    </View>
                )}

                {/* Loading */}
                {scanning && (
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, gap: 8 }}>
                        <FoodSkeleton />
                        <FoodSkeleton />
                    </View>
                )}
            </SafeAreaView>

            {/* Results Bottom Sheet */}
            {result && (
                <View style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
                    maxHeight: '65%', paddingBottom: 40,
                }}>
                    <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.stone, alignSelf: 'center', marginTop: 10 }} />
                    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
                        <Text variant="heading" color={colors.text1}>Results for you</Text>
                        <Text variant="label" color={colors.text2}>Based on your personal triggers</Text>

                        {/* Best Pick */}
                        {result.best_pick && (
                            <Card style={{ backgroundColor: colors.primary.light, borderWidth: 1, borderColor: colors.primary.DEFAULT }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Star size={14} color={colors.primary.DEFAULT} />
                                    <Text variant="badge" color={colors.primary.DEFAULT}>BEST PICK</Text>
                                </View>
                                <Text variant="title" color={colors.text1}>{result.best_pick}</Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>{result.best_pick_reason}</Text>
                            </Card>
                        )}

                        {/* All Dishes */}
                        {result.dishes.map((dish, i) => (
                            <Card key={i}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text variant="foodName" color={colors.text1} style={{ flex: 1 }}>{dish.name}</Text>
                                    <DualBadge fodmapRisk={dish.fodmap_risk} personalVerdict={dish.personal_verdict} />
                                </View>
                                {dish.why.map((reason, j) => (
                                    <View key={j} style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: dish.personal_verdict === 'avoid' ? colors.red.DEFAULT : dish.personal_verdict === 'caution' ? colors.amber.DEFAULT : colors.primary.DEFAULT, marginTop: 5 }} />
                                        <Text variant="caption" color={colors.text2} style={{ flex: 1 }}>{reason}</Text>
                                    </View>
                                ))}
                            </Card>
                        ))}

                        <View style={{ gap: 8, marginTop: 8 }}>
                            <Button
                                title={result.best_pick ? `Log ${result.best_pick}` : 'Log a dish'}
                                onPress={() => {
                                    const dish = result.best_pick || result.dishes[0]?.name;
                                    router.replace({ pathname: '/(tabs)/log', params: { prefill: dish } });
                                }}
                                fullWidth
                            />
                            <Button title="Close" variant="outline" onPress={() => router.back()} fullWidth />
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );
}
