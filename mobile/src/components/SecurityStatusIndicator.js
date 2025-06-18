import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, spacing, typography } from '../styles/theme';

export default function SecurityStatusIndicator({ status, size = 'medium' }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'SECURE':
        return {
          color: colors.secure,
          icon: 'shield-check',
          text: 'Secure',
          backgroundColor: '#e8f5e8',
        };
      case 'MODERATE':
        return {
          color: colors.moderate,
          icon: 'shield',
          text: 'Moderate',
          backgroundColor: '#e3f2fd',
        };
      case 'VULNERABLE':
        return {
          color: colors.warning,
          icon: 'shield-alert',
          text: 'Vulnerable',
          backgroundColor: '#fff3e0',
        };
      case 'CRITICAL':
        return {
          color: colors.critical,
          icon: 'shield-off',
          text: 'Critical',
          backgroundColor: '#ffebee',
        };
      default:
        return {
          color: colors.textSecondary,
          icon: 'shield-outline',
          text: 'Unknown',
          backgroundColor: colors.surface,
        };
    }
  };

  const config = getStatusConfig(status);
  const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const textStyle = size === 'small' ? typography.labelSmall : 
                   size === 'large' ? typography.titleMedium : typography.labelMedium;

  return (
    <View style={styles.container}>
      <Chip
        icon={() => (
          <Icon 
            name={config.icon} 
            size={iconSize} 
            color={config.color} 
          />
        )}
        style={[
          styles.chip,
          { backgroundColor: config.backgroundColor }
        ]}
        textStyle={[textStyle, { color: config.color }]}
      >
        {config.text}
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
