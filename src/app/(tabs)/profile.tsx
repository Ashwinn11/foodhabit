import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Switch, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User, Bell, ChevronRight, Shield, Trash2, LogOut,
    Star, Heart, HelpCircle,
} from 'lucide-react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { colors, radii } from '@/theme';
import { haptics } from '@/theme/haptics';

interface ProfileRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
}

function ProfileRow({ icon, label, value, onPress, danger }: ProfileRowProps): React.JSX.Element {
    return (
        <Pressable
            onPress={onPress}
            style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 14, paddingHorizontal: 4,
                borderBottomWidth: 1, borderBottomColor: colors.stone,
            }}
        >
            {icon}
            <Text
                variant="body"
                color={danger ? colors.red.DEFAULT : colors.text1}
                style={{ flex: 1 }}
            >
                {label}
            </Text>
            {value && <Text variant="label" color={colors.text3}>{value}</Text>}
            <ChevronRight size={16} color={colors.text3} />
        </Pressable>
    );
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const { profile, user, signOut, deleteAccount, updateProfile } = useAuthStore();
    const [editingTriggers, setEditingTriggers] = useState(false);
    const [triggerInput, setTriggerInput] = useState(profile?.known_triggers?.join(', ') || '');
    const [saving, setSaving] = useState(false);

    const handleSignOut = (): void => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out', style: 'destructive', onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Sign out error:', error);
                        }
                    }
                },
            ]
        );
    };

    const handleDeleteAccount = (): void => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all your data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you absolutely sure?',
                            'All your meal logs, symptom data, insights, and recipes will be permanently deleted.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Yes, Delete Everything',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await deleteAccount();
                                        } catch (error) {
                                            console.error('Delete account error:', error);
                                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleUpdateTriggers = async (): Promise<void> => {
        setSaving(true);
        try {
            const triggers = triggerInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            await updateProfile({ known_triggers: triggers });
            setEditingTriggers(false);
            haptics.mealLogged();
        } catch (error) {
            console.error('Update triggers error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenPaywall = async (): Promise<void> => {
        try {
            await RevenueCatUI.presentPaywall();
        } catch (error) {
            console.error('Paywall error:', error);
        }
    };

    const handleRestorePurchases = async (): Promise<void> => {
        try {
            await Purchases.restorePurchases();
            Alert.alert('Restored', 'Your purchases have been restored.');
        } catch (error) {
            console.error('Restore error:', error);
        }
    };

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    {/* Profile Header */}
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Avatar name={profile?.full_name} url={profile?.avatar_url} size={80} />
                        <Text variant="heading" color={colors.text1} style={{ marginTop: 12 }}>
                            {profile?.full_name || 'Profile'}
                        </Text>
                        <Text variant="label" color={colors.text2} style={{ marginTop: 4 }}>
                            {profile?.email}
                        </Text>
                    </View>

                    {/* Known Triggers Section */}
                    <Card animated delay={0} style={{ marginTop: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text variant="title" color={colors.text1}>Known Triggers</Text>
                            <Pressable onPress={() => setEditingTriggers(!editingTriggers)}>
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>
                                    {editingTriggers ? 'Cancel' : 'Edit'}
                                </Text>
                            </Pressable>
                        </View>
                        {editingTriggers ? (
                            <View style={{ gap: 10 }}>
                                <Input
                                    placeholder="garlic, dairy, wheat..."
                                    value={triggerInput}
                                    onChangeText={setTriggerInput}
                                    multiline
                                />
                                <Button title="Save" onPress={handleUpdateTriggers} loading={saving} />
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {(profile?.known_triggers || []).length > 0 ? (
                                    (profile?.known_triggers || []).map(trigger => (
                                        <View key={trigger} style={{ backgroundColor: colors.red.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                                            <Text variant="caption" color={colors.red.DEFAULT}>{trigger}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text variant="label" color={colors.text3}>No triggers added yet</Text>
                                )}
                            </View>
                        )}
                    </Card>

                    {/* Conditions */}
                    <Card animated delay={80} style={{ marginTop: 12 }}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 8 }}>Conditions</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {(profile?.diagnosed_conditions || []).length > 0 ? (
                                (profile?.diagnosed_conditions || []).map(condition => (
                                    <View key={condition} style={{ backgroundColor: colors.amber.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                                        <Text variant="caption" color={colors.amber.DEFAULT}>{condition}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text variant="label" color={colors.text3}>None specified</Text>
                            )}
                        </View>
                    </Card>

                    {/* Settings */}
                    <Card animated delay={160} style={{ marginTop: 16 }}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 4 }}>Settings</Text>

                        <ProfileRow
                            icon={<Star size={18} color={colors.amber.DEFAULT} />}
                            label="Subscription"
                            onPress={handleOpenPaywall}
                        />
                        <ProfileRow
                            icon={<Star size={18} color={colors.text2} />}
                            label="Restore Purchases"
                            onPress={handleRestorePurchases}
                        />
                        <ProfileRow
                            icon={<Shield size={18} color={colors.text2} />}
                            label="Privacy Policy"
                            onPress={() => Linking.openURL('https://gutbuddy.app/privacy')}
                        />
                        <ProfileRow
                            icon={<HelpCircle size={18} color={colors.text2} />}
                            label="Terms of Service"
                            onPress={() => Linking.openURL('https://gutbuddy.app/terms')}
                        />
                    </Card>

                    {/* Account Actions */}
                    <Card animated delay={240} style={{ marginTop: 16 }}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 4 }}>Account</Text>

                        <ProfileRow
                            icon={<LogOut size={18} color={colors.text2} />}
                            label="Sign Out"
                            onPress={handleSignOut}
                        />
                        <ProfileRow
                            icon={<Trash2 size={18} color={colors.red.DEFAULT} />}
                            label="Delete Account"
                            onPress={handleDeleteAccount}
                            danger
                        />
                    </Card>

                    {/* App version */}
                    <View style={{ alignItems: 'center', marginTop: 24 }}>
                        <Text variant="caption" color={colors.text3}>Gut Buddy v1.0.0</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
