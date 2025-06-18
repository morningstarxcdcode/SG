import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, spacing, typography, elevation } from '../styles/theme';

export default function ThreatAlertCard({ threat, onPress, style }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return colors.critical;
      case 'MEDIUM':
        return colors.warning;
      case 'LOW':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getThreatIcon = (type) => {
    if (type.includes('WIFI')) return 'wifi-alert';
    if (type.includes('LOCATION')) return 'map-marker-alert';
    if (type.includes('MALICIOUS')) return 'shield-alert';
    if (type.includes('ENCRYPTION')) return 'lock-alert';
    return 'alert-circle';
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Card style={[styles.card, elevation.level1]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon 
                name={getThreatIcon(threat.type)} 
                size={24} 
                color={getSeverityColor(threat.severity)} 
              />
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {threat.type?.replace(/_/g, ' ').toLowerCase()}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {threat.description}
              </Text>
            </View>

            <Chip
              mode="outlined"
              style={[
                styles.severityChip,
                { borderColor: getSeverityColor(threat.severity) }
              ]}
              textStyle={[
                styles.severityText,
                { color: getSeverityColor(threat.severity) }
              ]}
            >
              {threat.severity}
            </Chip>
          </View>

          {threat.recommendation && (
            <View style={styles.recommendation}>
              <Icon name="lightbulb-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.recommendationText} numberOfLines={1}>
                {threat.recommendation}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  content: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  severityChip: {
    height: 28,
    alignSelf: 'flex-start',
  },
  severityText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  recommendationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
    fontStyle: 'italic',
  },
});
