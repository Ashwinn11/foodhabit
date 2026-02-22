import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
// import { authService } from '../services/authService';

export const AuthScreen = () => {
  const handleAppleSignIn = async () => {
    try {
      // Logic for Apple Sign in will go here
      // const credential = await AppleAuthentication.signInAsync(...)
      // await authService.signInWithApple(credential.identityToken!)
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Logic for Google Sign in will go here
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Screen padding={true}>
      <View style={styles.topContainer}>
        <Text variant="caption" style={styles.logo}>GUTBUDDY •</Text>
        <Text variant="hero" style={styles.headline}>
          Know what's safe{`\n`}before you eat it.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <Button 
          label="Continue with Apple" 
          onPress={handleAppleSignIn} 
          variant="primary" 
        />
        <View style={styles.spacer} />
        <Button 
          label="Continue with Google" 
          onPress={handleGoogleSignIn} 
          variant="ghost" 
        />

        <View style={styles.footer}>
          <Text variant="caption" style={styles.footerText}>
            By continuing, you agree to our{' '}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.com/terms')}>
            <Text variant="caption" style={styles.link}>Terms</Text>
          </TouchableOpacity>
          <Text variant="caption" style={styles.footerText}>
            {' '}and{' '}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.com/privacy')}>
            <Text variant="caption" style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.giant,
  },
  logo: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.coral,
  },
  headline: {
    color: theme.colors.textPrimary,
  },
  bottomContainer: {
    paddingBottom: theme.spacing.xl,
  },
  spacer: {
    height: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xxxl,
    flexWrap: 'wrap',
  },
  footerText: {
    color: theme.colors.textSecondary,
    textTransform: 'none',
  },
  link: {
    color: theme.colors.coral,
    textTransform: 'none',
  }
});