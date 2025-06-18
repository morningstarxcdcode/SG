import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  Chip,
  FAB,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useSecurity } from '../contexts/SecurityContext';
import { useSocket } from '../contexts/SocketContext';
import { colors, spacing, typography, elevation } from '../styles/theme';
import ThreatAlertCard from '../components/ThreatAlertCard';
import SecurityStatusIndicator from '../components/SecurityStatusIndicator';
import QuickActionsPanel from '../components/QuickActionsPanel';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { securityStatus, threatHistory, performScan, isScanning } = useSecurity();
  const { isConnected, threatAlerts } = useSocket();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);

  useEffect(() => {
    // Perform initial scan when component mounts
    performInitialScan();
  }, []);

  const performInitialScan = async () => {
    try {
      await performScan();
    } catch (error) {
      console.error('Initial scan failed:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await performScan();
    } catch (error) {
      console.error('Refresh scan failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleThreatPress = (threat) => {
    setSelectedThreat(threat);
    setShowThreatModal(true);
  };

  const handleEmergencyPress = () => {
    navigation.navigate('Emergency');
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return colors.secure;
    if (score >= 60) return colors.moderate;
    if (score >= 40) return colors.warning;
    return colors.critical;
  };

  const renderSecurityOverview = () => (
    <Card style={styles.overviewCard}>
      <Card.Content>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Security Overview</Text>
          <SecurityStatusIndicator 
            status={securityStatus?.overallStatus || 'UNKNOWN'}
            size="small"
          />
        </View>
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>
              {securityStatus?.securityScore || 0}
            </Text>
            <Text style={styles.scoreLabel}>Security Score</Text>
          </View>
          
          <View style={styles.scoreDetails}>
            <View style={styles.scoreItem}>
              <Icon name="wifi" size={20} color={colors.primary} />
              <Text style={styles.scoreItemText}>
                WiFi: {securityStatus?.wifiSecurity || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.scoreItem}>
              <Icon name="map-marker" size={20} color={colors.secondary} />
              <Text style={styles.scoreItemText}>
                Location: {securityStatus?.locationPrivacy || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.scoreItem}>
              <Icon name="shield-check" size={20} color={colors.accent} />
              <Text style={styles.scoreItemText}>
                Encryption: {securityStatus?.dataEncryption || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>
        
        <ProgressBar
          progress={(securityStatus?.securityScore || 0) / 100}
          color={getSecurityScoreColor(securityStatus?.securityScore || 0)}
          style={styles.progressBar}
        />
      </Card.Content>
    </Card>
  );

  const renderThreatActivity = () => (
    <Card style={styles.activityCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Recent Threat Activity</Text>
        
        {threatHistory && threatHistory.length > 0 ? (
          <LineChart
            data={{
              labels: threatHistory.slice(-7).map((_, index) => 
                new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
                  .toLocaleDateString().slice(0, 5)
              ),
              datasets: [{
                data: threatHistory.slice(-7).map(h => h.threatCount || 0),
                strokeWidth: 3,
                color: (opacity = 1) => `rgba(249, 93, 106, ${opacity})`,
              }],
            }}
            width={width - 64}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(84, 110, 122, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.accent,
              },
            }}
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="chart-line" size={48} color={colors.textSecondary} />
            <Text style={styles.noDataText}>No threat data available</Text>
            <Text style={styles.noDataSubtext}>
              Perform a security scan to start monitoring
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <QuickActionsPanel
      onScanPress={() => performScan()}
      onEmergencyPress={handleEmergencyPress}
      onSettingsPress={() => navigation.navigate('Settings')}
      isScanning={isScanning}
    />
  );

  const renderRecentAlerts = () => (
    <Card style={styles.alertsCard}>
      <Card.Content>
        <View style={styles.alertsHeader}>
          <Text style={styles.cardTitle}>Recent Alerts</Text>
          <Chip
            mode="outlined"
            onPress={() => navigation.navigate('Threats')}
            style={styles.viewAllChip}
          >
            View All
          </Chip>
        </View>
        
        {threatAlerts && threatAlerts.length > 0 ? (
          threatAlerts.slice(0, 3).map((alert, index) => (
            <ThreatAlertCard
              key={index}
              threat={alert}
              onPress={() => handleThreatPress(alert)}
              style={styles.alertCard}
            />
          ))
        ) : (
          <View style={styles.noAlertsContainer}>
            <Icon name="shield-check" size={48} color={colors.secure} />
            <Text style={styles.noAlertsText}>All Clear</Text>
            <Text style={styles.noAlertsSubtext}>
              No active security threats detected
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <Icon
        name={isConnected ? 'wifi' : 'wifi-off'}
        size={16}
        color={isConnected ? colors.secure : colors.error}
      />
      <Text style={[
        styles.connectionText,
        { color: isConnected ? colors.secure : colors.error }
      ]}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderConnectionStatus()}
        {renderSecurityOverview()}
        {renderThreatActivity()}
        {renderQuickActions()}
        {renderRecentAlerts()}
      </ScrollView>

      <FAB
        icon="shield-search"
        label="Scan"
        onPress={() => performScan()}
        loading={isScanning}
        style={styles.fab}
        color={colors.textLight}
      />

      <Portal>
        <Modal
          visible={showThreatModal}
          onDismiss={() => setShowThreatModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedThreat && (
            <Card>
              <Card.Content>
                <Text style={styles.modalTitle}>
                  {selectedThreat.type?.replace(/_/g, ' ').toLowerCase()}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedThreat.description}
                </Text>
                
                {selectedThreat.recommendation && (
                  <View style={styles.recommendationContainer}>
                    <Text style={styles.recommendationTitle}>
                      Recommendation:
                    </Text>
                    <Text style={styles.recommendationText}>
                      {selectedThreat.recommendation}
                    </Text>
                  </View>
                )}
                
                <Button
                  mode="contained"
                  onPress={() => setShowThreatModal(false)}
                  style={styles.modalButton}
                >
                  Close
                </Button>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  connectionText: {
    ...typography.labelMedium,
    marginLeft: spacing.xs,
  },
  overviewCard: {
    marginBottom: spacing.md,
    ...elevation.level2,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overviewTitle: {
    ...typography.titleLarge,
    color: colors.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  scoreText: {
    ...typography.displaySmall,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scoreItemText: {
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  activityCard: {
    marginBottom: spacing.md,
    ...elevation.level2,
  },
  cardTitle: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noDataText: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  noDataSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  alertsCard: {
    marginBottom: spacing.md,
    ...elevation.level2,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllChip: {
    height: 32,
  },
  alertCard: {
    marginBottom: spacing.sm,
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noAlertsText: {
    ...typography.titleMedium,
    color: colors.secure,
    marginTop: spacing.sm,
  },
  noAlertsSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: 16,
  },
  modalTitle: {
    ...typography.titleLarge,
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  modalDescription: {
    ...typography.bodyLarge,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recommendationContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  recommendationTitle: {
    ...typography.titleSmall,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  modalButton: {
    marginTop: spacing.sm,
  },
});
