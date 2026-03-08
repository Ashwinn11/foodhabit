import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Plus, Activity, UtensilsCrossed, User } from 'lucide-react-native';
import { colors, typography } from '@/theme';

type TabIconProps = {
    focused: boolean;
    color: string;
    size: number;
};

export default function TabLayout(): React.JSX.Element {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingBottom: 24,
                    paddingTop: 8,
                    height: 80,
                },
                tabBarActiveTintColor: colors.primary.DEFAULT,
                tabBarInactiveTintColor: colors.text3,
                tabBarLabelStyle: {
                    fontFamily: typography.families.monoBold,
                    fontSize: typography.sizes.tabLabel,
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: focused ? colors.primary.light : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Home size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: 'Log',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: focused ? colors.primary.light : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Plus size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: focused ? colors.primary.light : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="recipes"
                options={{
                    title: 'Recipes',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: focused ? colors.primary.light : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <UtensilsCrossed size={20} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }: TabIconProps) => (
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: focused ? colors.primary.light : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={20} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
