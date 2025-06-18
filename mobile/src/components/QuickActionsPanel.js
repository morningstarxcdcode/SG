import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, spacing, typography, elevation } from '../styles/theme';

export default function QuickActionsPanel({ 
  onScanPress, 
  onEmergencyPress, 
  onSettingsPress, 
  isScanning 
}) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Quick Actions</Text>
        
        <View style={styles.actionsContainer}>
          <View style={styles.actionItem}>
            <Button
              mode="contained"
              onPress={onScanPress}
              loading={isScanning}
              disabled={isScanning}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon={() => (
                <Icon name="radar" size={20} color={colors.textLight} />
              )}
            >
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          </View>

          <View style={styles.actionItem}>
            <Button
              mode="contained"
              onPress={onEmergencyPress}
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon={() => (
                <Icon name="phone-alert" size={20} color={colors.textLight} />
              )}
            >
              Emergency
            </Button>
          </View>

          <View style={styles.actionItem}>
            <Button
              mode="outlined"
              onPress={onSettingsPress}
              style={[styles.actionButton, styles.outlinedButton]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, { color: colors.primary }]}
              icon={() => (
                <Icon name="cog" size={20} color={colors.primary} />
              )}
            >
              Settings
            </Button>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Icon name="shield-check" size={16} color={colors.secure} />
            <Text style={styles.statText}>Protected</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="wifi" size={16} color={colors.primary} />
            <Text style={styles.statText}>Connected</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="eye" size={16} color={colors.secondary} />
            <Text style={styles.statText}>Monitoring</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    ...elevation.level2,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsContainer: {
    marginBottom: spacing.md,
  },
  actionItem: {
    marginBottom: spacing.sm,
  },
  actionButton: {
    borderRadius: 8,
  },
  outlinedButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  buttonLabel: {
    ...typography.labelLarge,
    color: colors.textLight,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
