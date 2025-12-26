import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useAuth } from './src/hooks/useAuth';
import { AuthScreen, ProfileScreen } from './src/screens';
import { theme } from './src/theme';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
        <RNText style={{ marginTop: theme.spacing.md, color: theme.colors.text.white }}>
          Loading...
        </RNText>
      </View>
    );
  }

  return session ? <ProfileScreen /> : <AuthScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
      </View>
    );
  }

  const NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.brand.coral,
      background: theme.colors.brand.black,
      card: theme.colors.brand.cream,
      text: theme.colors.text.white,
      border: theme.colors.brand.cream,
      notification: theme.colors.brand.coral,
    },
    fonts: {
      regular: { fontFamily: theme.fontFamily.regular, fontWeight: '400' as const },
      bold: { fontFamily: theme.fontFamily.bold, fontWeight: '700' as const },
      heavy: { fontFamily: theme.fontFamily.bold, fontWeight: '700' as const },
      medium: { fontFamily: theme.fontFamily.medium, fontWeight: '500' as const },
      thin: { fontFamily: theme.fontFamily.light, fontWeight: '300' as const },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavigationTheme}>
        <AppContent />
        <StatusBar style="light" backgroundColor={theme.colors.brand.black} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.brand.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});