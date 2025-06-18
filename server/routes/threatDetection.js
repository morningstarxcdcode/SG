const express = require('express');
const router = express.Router();
const ThreatDetector = require('../services/ThreatDetector');

const threatDetector = new ThreatDetector();

// GET /api/threat/scan - Perform immediate threat scan
router.get('/scan', async (req, res) => {
  try {
    const locationData = req.query.location ? JSON.parse(req.query.location) : null;
    const scanResults = await threatDetector.scanEnvironment(locationData);
    
    res.json({
      success: true,
      data: scanResults
    });
  } catch (error) {
    console.error('Threat scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threat/analyze - Analyze specific network or location
router.post('/analyze', async (req, res) => {
  try {
    const { networkData, locationData, analysisType } = req.body;
    
    let analysisResults = {};
    
    if (analysisType === 'network' && networkData) {
      analysisResults = threatDetector.analyzeNetwork(networkData);
    } else if (analysisType === 'location' && locationData) {
      analysisResults = threatDetector.analyzeLocationThreats(locationData);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis type or missing data'
      });
    }
    
    res.json({
      success: true,
      data: {
        type: analysisType,
        results: analysisResults,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Threat analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threat/classify - ML-based threat classification
router.post('/classify', async (req, res) => {
  try {
    const { networkData } = req.body;
    
    if (!networkData) {
      return res.status(400).json({
        success: false,
        error: 'Network data is required for classification'
      });
    }
    
    const classification = threatDetector.classifyThreat(networkData);
    
    res.json({
      success: true,
      data: {
        classification: classification,
        networkData: networkData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Threat classification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/threat/status - Get current threat monitoring status
router.get('/status', (req, res) => {
  try {
    const status = {
      monitoringActive: threatDetector.monitoringActive,
      lastScan: threatDetector.lastScanTime || null,
      threatPatternsLoaded: Object.keys(threatDetector.threatPatterns).length,
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threat/report - Report a threat or false positive
router.post('/report', async (req, res) => {
  try {
    const { threatId, reportType, description, userFeedback } = req.body;
    
    // In a real implementation, this would store the report in a database
    // and potentially retrain ML models based on user feedback
    
    const report = {
      id: `REPORT-${Date.now()}`,
      threatId: threatId,
      type: reportType, // 'false_positive', 'confirmed_threat', 'new_threat'
      description: description,
      userFeedback: userFeedback,
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    };
    
    console.log('📝 Threat report received:', report);
    
    res.json({
      success: true,
      data: {
        reportId: report.id,
        message: 'Thank you for your report. It will help improve our threat detection.'
      }
    });
  } catch (error) {
    console.error('Threat report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/threat/patterns - Get current threat patterns (for debugging)
router.get('/patterns', (req, res) => {
  try {
    // Only return this in development mode for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Threat patterns not available in production'
      });
    }
    
    res.json({
      success: true,
      data: threatDetector.threatPatterns
    });
  } catch (error) {
    console.error('Threat patterns error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threat/wifi-scan - Trigger WiFi network scan
router.post('/wifi-scan', async (req, res) => {
  try {
    const wifiThreats = await threatDetector.analyzeWiFiNetworks();
    
    res.json({
      success: true,
      data: {
        threats: wifiThreats,
        scanType: 'wifi_networks',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('WiFi scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
