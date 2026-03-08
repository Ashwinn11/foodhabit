import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout(): React.JSX.Element {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
    );
}
