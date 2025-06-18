const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// In a real implementation, this would integrate with actual emergency services APIs
const emergencyContacts = {
  police: '911',
  fire: '911',
  medical: '911',
  cybersecurity: '1-855-292-3725' // CISA
};

// Active emergency alerts storage (would be in database in production)
const activeEmergencies = new Map();

// POST /api/emergency/alert - Trigger emergency alert
router.post('/alert', authenticateToken, async (req, res) => {
  try {
    const { 
      alertType, 
      location, 
      description, 
      severity, 
      evidence,
      autoContactAuthorities 
    } = req.body;
    
    if (!alertType || !location) {
      return res.status(400).json({
        success: false,
        error: 'Alert type and location are required'
      });
    }
    
    // Create emergency alert
    const emergencyId = `EMG-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const emergency = {
      id: emergencyId,
      userId: req.user.userId,
      alertType: alertType,
      location: location,
      description: description || '',
      severity: severity || 'HIGH',
      evidence: evidence || [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoContactAuthorities: autoContactAuthorities || false,
      responders: []
    };
    
    // Store emergency
    activeEmergencies.set(emergencyId, emergency);
    
    // Log emergency for monitoring
    console.log(`🚨 EMERGENCY ALERT: ${emergencyId} - ${alertType} at ${location.latitude}, ${location.longitude}`);
    
    // Simulate emergency response dispatch
    const responseActions = await handleEmergencyResponse(emergency);
    
    res.status(201).json({
      success: true,
      data: {
        emergencyId: emergencyId,
        status: 'ALERT_CREATED',
        responseActions: responseActions,
        emergencyContacts: emergencyContacts,
        estimatedResponseTime: '5-15 minutes'
      }
    });
    
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create emergency alert'
    });
  }
});

// GET /api/emergency/status/:emergencyId - Get emergency status
router.get('/status/:emergencyId', authenticateToken, (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = activeEmergencies.get(emergencyId);
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    // Check if user owns this emergency
    if (emergency.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: emergency
    });
    
  } catch (error) {
    console.error('Emergency status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency status'
    });
  }
});

// PUT /api/emergency/update/:emergencyId - Update emergency status
router.put('/update/:emergencyId', authenticateToken, (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { status, description, evidence } = req.body;
    
    const emergency = activeEmergencies.get(emergencyId);
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    // Check if user owns this emergency
    if (emergency.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Update emergency
    if (status) emergency.status = status;
    if (description) emergency.description = description;
    if (evidence) emergency.evidence = [...emergency.evidence, ...evidence];
    emergency.updatedAt = new Date().toISOString();
    
    console.log(`📝 Emergency ${emergencyId} updated: ${status}`);
    
    res.json({
      success: true,
      data: emergency
    });
    
  } catch (error) {
    console.error('Emergency update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency'
    });
  }
});

// POST /api/emergency/evidence/:emergencyId - Add evidence to emergency
router.post('/evidence/:emergencyId', authenticateToken, (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { evidenceType, data, description, timestamp } = req.body;
    
    const emergency = activeEmergencies.get(emergencyId);
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }
    
    // Check if user owns this emergency
    if (emergency.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Add evidence
    const evidence = {
      id: `EV-${Date.now()}`,
      type: evidenceType, // 'photo', 'audio', 'location', 'network_data', 'text'
      data: data,
      description: description || '',
      timestamp: timestamp || new Date().toISOString(),
      verified: false
    };
    
    emergency.evidence.push(evidence);
    emergency.updatedAt = new Date().toISOString();
    
    console.log(`📷 Evidence added to emergency ${emergencyId}: ${evidenceType}`);
    
    res.json({
      success: true,
      data: {
        evidenceId: evidence.id,
        evidenceCount: emergency.evidence.length,
        message: 'Evidence added successfully'
      }
    });
    
  } catch (error) {
    console.error('Evidence addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add evidence'
    });
  }
});

// GET /api/emergency/contacts - Get emergency contact information
router.get('/contacts', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        emergencyContacts: emergencyContacts,
        localAuthorities: {
          police: emergencyContacts.police,
          fire: emergencyContacts.fire,
          medical: emergencyContacts.medical
        },
        cybersecurityHotline: emergencyContacts.cybersecurity,
        instructions: {
          physical: 'For immediate physical danger, call 911',
          cyber: 'For cyber threats, contact CISA or local cybersecurity authorities',
          app: 'Use SecureGuardian emergency button for integrated response'
        }
      }
    });
  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency contacts'
    });
  }
});

// POST /api/emergency/panic - Silent panic button
router.post('/panic', authenticateToken, async (req, res) => {
  try {
    const { location, silentMode } = req.body;
    
    // Create silent emergency alert
    const emergencyId = `PANIC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const emergency = {
      id: emergencyId,
      userId: req.user.userId,
      alertType: 'PANIC',
      location: location,
      description: 'Silent panic alert activated',
      severity: 'CRITICAL',
      evidence: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      silentMode: silentMode || true,
      autoContactAuthorities: true,
      responders: []
    };
    
    activeEmergencies.set(emergencyId, emergency);
    
    console.log(`🔕 SILENT PANIC ALERT: ${emergencyId}`);
    
    // Handle panic response
    const responseActions = await handlePanicResponse(emergency);
    
    res.json({
      success: true,
      data: {
        emergencyId: emergencyId,
        status: 'PANIC_ALERT_ACTIVE',
        silentMode: true,
        responseActions: responseActions
      }
    });
    
  } catch (error) {
    console.error('Panic alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate panic alert'
    });
  }
});

// Helper function to handle emergency response
async function handleEmergencyResponse(emergency) {
  const actions = [];
  
  try {
    // Determine response based on alert type
    switch (emergency.alertType) {
      case 'PHYSICAL_THREAT':
        actions.push('Police dispatch requested');
        actions.push('Emergency contacts notified');
        break;
        
      case 'CYBER_ATTACK':
        actions.push('Cybersecurity team alerted');
        actions.push('Network isolation protocols activated');
        break;
        
      case 'LOCATION_THREAT':
        actions.push('Location monitoring increased');
        actions.push('Safe zone recommendations sent');
        break;
        
      case 'PANIC':
        actions.push('Silent alert sent to authorities');
        actions.push('Location tracking activated');
        break;
        
      default:
        actions.push('General emergency response initiated');
    }
    
    // Add location-based services
    if (emergency.location) {
      actions.push(`GPS coordinates shared: ${emergency.location.latitude}, ${emergency.location.longitude}`);
    }
    
    // Add evidence collection
    actions.push('Automatic evidence collection started');
    
    return actions;
    
  } catch (error) {
    console.error('Emergency response error:', error);
    return ['Emergency response initiated with limited features'];
  }
}

// Helper function to handle panic response
async function handlePanicResponse(emergency) {
  const actions = [];
  
  try {
    actions.push('Silent alert sent to emergency services');
    actions.push('Trusted contacts notified discretely');
    actions.push('Location tracking activated');
    actions.push('Audio recording started');
    actions.push('Photo evidence collection enabled');
    
    return actions;
    
  } catch (error) {
    console.error('Panic response error:', error);
    return ['Panic response initiated'];
  }
}

module.exports = router;
