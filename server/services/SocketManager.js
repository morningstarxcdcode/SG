class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.emergencyAlerts = new Set();
  }

  // Broadcast threat alerts to all connected users
  broadcastThreatAlert(threatData) {
    console.log('📢 Broadcasting threat alert to all users');
    
    this.io.emit('threat-alert', {
      type: 'THREAT_DETECTED',
      timestamp: new Date().toISOString(),
      data: threatData,
      priority: this.calculateAlertPriority(threatData)
    });
  }

  // Send personalized threat alert to specific user
  sendUserThreatAlert(userId, threatData) {
    const room = `user-${userId}`;
    
    this.io.to(room).emit('personal-threat-alert', {
      type: 'PERSONAL_THREAT',
      timestamp: new Date().toISOString(),
      data: threatData,
      userId: userId
    });
    
    console.log(`🎯 Sent personal threat alert to user ${userId}`);
  }

  // Handle emergency alerts
  broadcastEmergencyAlert(alertData) {
    const emergencyId = this.generateEmergencyId();
    
    const alert = {
      id: emergencyId,
      type: 'EMERGENCY',
      timestamp: new Date().toISOString(),
      location: alertData.location,
      userId: alertData.userId,
      severity: alertData.severity || 'HIGH',
      message: alertData.message || 'Emergency assistance requested',
      trustedContacts: alertData.trustedContacts || []
    };

    // Store emergency alert
    this.emergencyAlerts.add(alert);

    // Broadcast to emergency responders
    this.io.emit('emergency-alert', alert);

    // Send to trusted contacts if available
    if (alert.trustedContacts.length > 0) {
      alert.trustedContacts.forEach(contactId => {
        this.io.to(`user-${contactId}`).emit('trusted-contact-alert', alert);
      });
    }

    console.log(`🚨 Emergency alert broadcasted: ${emergencyId}`);
    return emergencyId;
  }

  // Send security status updates
  sendSecurityStatusUpdate(userId, status) {
    const room = `user-${userId}`;
    
    this.io.to(room).emit('security-status-update', {
      type: 'STATUS_UPDATE',
      timestamp: new Date().toISOString(),
      userId: userId,
      status: status,
      indicators: this.generateSecurityIndicators(status)
    });
  }

  // Handle real-time location sharing for emergency
  handleLocationShare(userId, locationData) {
    const room = `emergency-${userId}`;
    
    this.io.to(room).emit('emergency-location-update', {
      type: 'LOCATION_UPDATE',
      timestamp: new Date().toISOString(),
      userId: userId,
      location: locationData,
      accuracy: locationData.accuracy || 'unknown'
    });
    
    console.log(`📍 Emergency location updated for user ${userId}`);
  }

  // Calculate alert priority based on threat data
  calculateAlertPriority(threatData) {
    const { riskLevel, threats } = threatData;
    
    const highSeverityCount = threats.filter(t => t.severity === 'HIGH').length;
    const criticalTypes = ['MALICIOUS_SSID', 'HIGH_RISK_LOCATION', 'LOCATION_SPOOFING'];
    const hasCriticalThreats = threats.some(t => criticalTypes.includes(t.type));
    
    if (riskLevel === 'CRITICAL' || hasCriticalThreats) {
      return 'CRITICAL';
    } else if (riskLevel === 'HIGH' || highSeverityCount >= 2) {
      return 'HIGH';
    } else if (riskLevel === 'MEDIUM') {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  // Generate security indicators for UI
  generateSecurityIndicators(status) {
    const indicators = {
      wifiSecurity: status.wifiSecure ? 'SECURE' : 'VULNERABLE',
      locationPrivacy: status.locationPrivate ? 'PROTECTED' : 'EXPOSED',
      dataEncryption: status.dataEncrypted ? 'ENCRYPTED' : 'UNENCRYPTED',
      threatLevel: status.threatLevel || 'UNKNOWN',
      lastScan: status.lastScan || null
    };

    // Add visual indicators
    indicators.overallStatus = this.calculateOverallStatus(indicators);
    indicators.colorCode = this.getStatusColorCode(indicators.overallStatus);
    
    return indicators;
  }

  calculateOverallStatus(indicators) {
    const secureCount = Object.values(indicators).filter(value => 
      ['SECURE', 'PROTECTED', 'ENCRYPTED', 'LOW'].includes(value)
    ).length;
    
    const totalIndicators = 4; // wifi, location, encryption, threat level
    const securityPercentage = (secureCount / totalIndicators) * 100;
    
    if (securityPercentage >= 80) return 'SECURE';
    if (securityPercentage >= 60) return 'MODERATE';
    if (securityPercentage >= 40) return 'VULNERABLE';
    return 'CRITICAL';
  }

  getStatusColorCode(status) {
    const colorMap = {
      'SECURE': '#00c29a',      // Mint green
      'MODERATE': '#1a73e8',    // Deep blue
      'VULNERABLE': '#ff9800',  // Orange
      'CRITICAL': '#f95d6a'     // Coral red
    };
    
    return colorMap[status] || '#546e7a'; // Default slate gray
  }

  // Generate unique emergency ID
  generateEmergencyId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `EMG-${timestamp}-${random}`;
  }

  // Track connected users
  addConnectedUser(socketId, userId) {
    this.connectedUsers.set(socketId, userId);
    console.log(`👤 User ${userId} connected with socket ${socketId}`);
  }

  removeConnectedUser(socketId) {
    const userId = this.connectedUsers.get(socketId);
    this.connectedUsers.delete(socketId);
    
    if (userId) {
      console.log(`👤 User ${userId} disconnected`);
    }
    
    return userId;
  }

  // Get statistics for admin dashboard
  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeEmergencies: this.emergencyAlerts.size,
      timestamp: new Date().toISOString()
    };
  }

  // Clean up old emergency alerts (called periodically)
  cleanupOldAlerts() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const alert of this.emergencyAlerts) {
      const alertTime = new Date(alert.timestamp).getTime();
      if (alertTime < oneDayAgo) {
        this.emergencyAlerts.delete(alert);
      }
    }
    
    console.log(`🧹 Cleaned up old emergency alerts. Active: ${this.emergencyAlerts.size}`);
  }
}

module.exports = SocketManager;
