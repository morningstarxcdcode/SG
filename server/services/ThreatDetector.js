const wifi = require('node-wifi');
const geoip = require('geoip-lite');
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');
const os = require('os');
const { execSync } = require('child_process');

class ThreatDetector {
  constructor() {
    this.initialize();
    this.threatPatterns = this.loadThreatPatterns();
    this.monitoringActive = false;
    this.scanInterval = null;
  }

  initialize() {
    // Initialize wifi scanner
    wifi.init({
      iface: null // network interface, choose a random wifi interface if set to null
    });
  }

  loadThreatPatterns() {
    return {
      maliciousSSIDs: [
        'Free WiFi',
        'Public WiFi',
        'Hotel WiFi',
        'Airport WiFi',
        /^(.+)_nomap$/i,
        /^pineapple/i,
        /^evil.*twin/i
      ],
      suspiciousNetworks: [
        /^android-ap/i,
        /^iphone.*hotspot/i,
        /^samsung.*direct/i
      ],
      vulnerableEncryption: ['WEP', 'None', 'Open'],
      anomalousSignalStrength: -30, // Very strong signal (possible evil twin)
      rateLimit: {
        maxScansPerMinute: 10,
        suspiciousThreshold: 50
      }
    };
  }

  async scanEnvironment(locationData = null) {
    try {
      console.log('🔍 Starting threat environment scan...');
      
      const scanResults = {
        timestamp: new Date().toISOString(),
        location: locationData,
        threats: [],
        riskLevel: 'LOW',
        recommendations: []
      };

      // WiFi Network Analysis
      const wifiThreats = await this.analyzeWiFiNetworks();
      scanResults.threats.push(...wifiThreats);

      // Location-based threat analysis
      if (locationData) {
        const locationThreats = this.analyzeLocationThreats(locationData);
        scanResults.threats.push(...locationThreats);
      }

      // URL and Phishing Analysis (New - Real-time)
      const urlThreats = await this.analyzeUrlsInEnvironment();
      scanResults.threats.push(...urlThreats);

      // Calculate overall risk level
      scanResults.riskLevel = this.calculateRiskLevel(scanResults.threats);
      scanResults.recommendations = this.generateRecommendations(scanResults.threats);

      console.log(`✅ Scan complete. Risk Level: ${scanResults.riskLevel}`);
      return scanResults;

    } catch (error) {
      console.error('❌ Threat scan failed:', error);
      throw new Error(`Threat detection failed: ${error.message}`);
    }
  }

  async analyzeWiFiNetworks() {
    const threats = [];

    // macOS: Only show current SSID, not a full scan
    if (os.platform() === 'darwin') {
      try {
        const ssid = execSync("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}'").toString().trim();
        if (ssid) {
          threats.push({
            type: 'CURRENT_WIFI',
            severity: 'INFO',
            description: `Connected to WiFi: ${ssid}`,
            details: { ssid }
          });
          console.log(`📡 Connected to WiFi: ${ssid}`);
        } else {
          threats.push({
            type: 'NO_WIFI',
            severity: 'LOW',
            description: 'Not connected to any WiFi network',
          });
          console.log('📡 Not connected to any WiFi network');
        }
      } catch (error) {
        threats.push({
          type: 'SCAN_ERROR',
          severity: 'MEDIUM',
          description: 'Unable to get current WiFi SSID',
          details: error.message
        });
        console.warn('⚠️  WiFi SSID fetch failed:', error.message);
      }
      return threats;
    }

    // Windows/Linux: Full scan
    try {
      const networks = await wifi.scan();
      console.log(`📡 Found ${networks.length} WiFi networks`);
      for (const network of networks) {
        const networkThreats = this.analyzeNetwork(network);
        threats.push(...networkThreats);
      }
    } catch (error) {
      threats.push({
        type: 'SCAN_ERROR',
        severity: 'MEDIUM',
        description: 'Unable to scan WiFi networks',
        details: error.message
      });
      console.warn('⚠️  WiFi scan failed:', error.message);
    }
    return threats;
  }

  async analyzeUrlsInEnvironment() {
    // In a real application, you would get URLs from various sources.
    // For this advanced demonstration, we'll check a known malicious test URL.
    const sampleUrl = 'http://malware.testing.google.test/testing/malware/';
    return this.checkUrlWithSafeBrowsing(sampleUrl);
  }

  async checkUrlWithSafeBrowsing(url) {
    const threats = [];
    const apiKey = config.GOOGLE_SAFE_BROWSING_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('⚠️ Google Safe Browsing API key is not configured. Skipping URL analysis.');
      threats.push({
        type: 'CONFIGURATION_ERROR',
        severity: 'MEDIUM',
        description: 'Google Safe Browsing API key is missing. URL analysis is disabled.',
        recommendation: 'Add GOOGLE_SAFE_BROWSING_API_KEY to your .env file.'
      });
      return threats;
    }

    try {
      const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
      const requestBody = {
        client: {
          clientId: 'secureguardian',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [
            { url: url }
          ]
        }
      };

      const response = await axios.post(apiUrl, requestBody);

      if (response.data && response.data.matches) {
        for (const match of response.data.matches) {
          threats.push({
            type: 'MALICIOUS_URL',
            severity: 'HIGH',
            description: `Malicious URL detected by Google Safe Browsing: ${match.threatType}`,
            details: {
              url: match.threat.url,
              threatType: match.threatType,
              platform: match.platformType
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Google Safe Browsing API error:', error.response ? error.response.data : error.message);
      threats.push({
        type: 'API_ERROR',
        severity: 'MEDIUM',
        description: 'Failed to check URL with Google Safe Browsing.',
        details: error.message
      });
    }

    return threats;
  }

  analyzeNetwork(network) {
    const threats = [];
    const { ssid, security, signal_level, mac } = network;

    // Check for malicious SSID patterns
    for (const pattern of this.threatPatterns.maliciousSSIDs) {
      if (typeof pattern === 'string' && ssid === pattern) {
        threats.push({
          type: 'MALICIOUS_SSID',
          severity: 'HIGH',
          description: `Potentially malicious network detected: ${ssid}`,
          network: { ssid, mac, signal_level },
          recommendation: 'Avoid connecting to this network'
        });
      } else if (pattern instanceof RegExp && pattern.test(ssid)) {
        threats.push({
          type: 'SUSPICIOUS_SSID',
          severity: 'MEDIUM',
          description: `Suspicious network pattern: ${ssid}`,
          network: { ssid, mac, signal_level },
          recommendation: 'Exercise caution when connecting'
        });
      }
    }

    // Check for vulnerable encryption
    if (this.threatPatterns.vulnerableEncryption.includes(security)) {
      threats.push({
        type: 'WEAK_ENCRYPTION',
        severity: security === 'None' ? 'HIGH' : 'MEDIUM',
        description: `Weak or no encryption: ${security}`,
        network: { ssid, mac, security },
        recommendation: 'Use VPN if you must connect'
      });
    }

    // Check for anomalous signal strength (possible evil twin)
    if (signal_level > this.threatPatterns.anomalousSignalStrength) {
      threats.push({
        type: 'ANOMALOUS_SIGNAL',
        severity: 'MEDIUM',
        description: `Unusually strong signal detected: ${signal_level}dBm`,
        network: { ssid, mac, signal_level },
        recommendation: 'Verify network authenticity before connecting'
      });
    }

    return threats;
  }

  analyzeLocationThreats(locationData) {
    const threats = [];
    const { latitude, longitude, accuracy } = locationData;

    // Get location info from IP geolocation
    const geo = geoip.lookup(locationData.ip || '8.8.8.8');
    
    if (geo) {
      // Check for high-risk locations
      const riskAreas = this.checkHighRiskAreas(geo);
      threats.push(...riskAreas);
    }

    // Check location accuracy for spoofing
    if (accuracy && accuracy > 1000) {
      threats.push({
        type: 'LOCATION_SPOOFING',
        severity: 'MEDIUM',
        description: 'Low location accuracy detected - possible spoofing',
        details: `Accuracy: ${accuracy}m`,
        recommendation: 'Verify your actual location'
      });
    }

    return threats;
  }

  checkHighRiskAreas(geo) {
    const threats = [];
    
    // Example high-risk area detection
    const { country, region, city } = geo;
    
    // This would be populated with actual threat intelligence data
    const highRiskRegions = ['Unknown', 'Anonymous Proxy'];
    
    if (highRiskRegions.includes(region)) {
      threats.push({
        type: 'HIGH_RISK_LOCATION',
        severity: 'HIGH',
        description: `Detected connection from high-risk region: ${region}`,
        location: { country, region, city },
        recommendation: 'Use VPN for additional protection'
      });
    }

    return threats;
  }

  calculateRiskLevel(threats) {
    if (threats.length === 0) return 'LOW';
    
    const highSeverityCount = threats.filter(t => t.severity === 'HIGH').length;
    const mediumSeverityCount = threats.filter(t => t.severity === 'MEDIUM').length;
    
    if (highSeverityCount >= 2) return 'CRITICAL';
    if (highSeverityCount >= 1) return 'HIGH';
    if (mediumSeverityCount >= 3) return 'HIGH';
    if (mediumSeverityCount >= 1) return 'MEDIUM';
    
    return 'LOW';
  }

  generateRecommendations(threats) {
    const recommendations = [];
    const threatTypes = [...new Set(threats.map(t => t.type))];

    if (threatTypes.includes('MALICIOUS_SSID') || threatTypes.includes('WEAK_ENCRYPTION')) {
      recommendations.push('Enable VPN protection before connecting to any network');
    }

    if (threatTypes.includes('ANOMALOUS_SIGNAL')) {
      recommendations.push('Verify network authenticity with venue staff');
    }

    if (threatTypes.includes('HIGH_RISK_LOCATION')) {
      recommendations.push('Consider using additional security measures');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring - no immediate threats detected');
    }

    return recommendations;
  }

  startContinuousMonitoring(callback) {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    console.log('🔄 Starting continuous threat monitoring...');
    
    this.scanInterval = setInterval(async () => {
      try {
        const threatData = await this.scanEnvironment();
        if (threatData.threats.length > 0) {
          callback(threatData);
        }
      } catch (error) {
        console.error('Monitoring scan failed:', error);
      }
    }, 30000); // Scan every 30 seconds
  }

  stopContinuousMonitoring() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.monitoringActive = false;
    console.log('⏹️  Threat monitoring stopped');
  }

  // Machine Learning threat classification (simplified implementation)
  classifyThreat(networkData) {
    // This would integrate with TensorFlow.js or similar ML framework
    const features = this.extractFeatures(networkData);
    const threatProbability = this.simpleMLClassifier(features);
    
    return {
      probability: threatProbability,
      classification: threatProbability > 0.7 ? 'THREAT' : 'SAFE',
      confidence: Math.abs(threatProbability - 0.5) * 2
    };
  }

  extractFeatures(networkData) {
    // Extract features for ML classification
    return {
      ssidLength: networkData.ssid ? networkData.ssid.length : 0,
      hasCommonWords: /free|wifi|public|hotel/i.test(networkData.ssid || ''),
      signalStrength: networkData.signal_level || -100,
      encryptionType: networkData.security || 'unknown',
      macVendor: this.getMacVendor(networkData.mac)
    };
  }

  simpleMLClassifier(features) {
    // Simplified rule-based classifier (would be replaced with actual ML model)
    let score = 0.5;
    
    if (features.hasCommonWords) score += 0.3;
    if (features.signalStrength > -30) score += 0.2;
    if (features.encryptionType === 'None') score += 0.4;
    if (features.ssidLength > 20) score += 0.1;
    
    return Math.min(1.0, score);
  }

  getMacVendor(mac) {
    // Simplified MAC vendor lookup
    if (!mac) return 'unknown';
    
    const vendorMap = {
      '00:1B:63': 'Apple',
      '08:00:27': 'VirtualBox',
      '00:0C:29': 'VMware',
      '00:50:56': 'VMware'
    };
    
    const macPrefix = mac.substring(0, 8).toUpperCase();
    return vendorMap[macPrefix] || 'unknown';
  }
}

module.exports = ThreatDetector;
