import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, spacing, typography } from '../styles/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Icon name="shield-check" size={80} color={colors.primary} />
      <Text style={styles.title}>SecureGuardian</Text>
      <Text style={styles.subtitle}>Initializing Security Systems...</Text>
      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.primary,
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.lg,
  },
});
