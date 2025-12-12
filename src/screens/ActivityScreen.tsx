import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Container, Text } from '../components';
import { theme } from '../theme';

export default function ActivityScreen() {
  return (
    <Container>
      <View style={styles.container}>
        <Text variant="h3" color="primary">Activity</Text>
        <Text variant="body" color="secondary" style={styles.comingSoon}>
          Coming soon...
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    marginTop: theme.spacing.md,
  },
});
