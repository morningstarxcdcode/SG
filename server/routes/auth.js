const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In a real implementation, this would use a proper database
const users = new Map();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, emergencyContacts } = req.body;
    
    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required'
      });
    }
    
    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = {
      id: `user_${Date.now()}`,
      email: email,
      password: hashedPassword,
      fullName: fullName,
      emergencyContacts: emergencyContacts || [],
      securitySettings: {
        autoScan: true,
        alertThreshold: 'medium',
        locationSharing: false,
        biometricAuth: false
      },
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    users.set(email, user);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'secureguardian_secret_key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          securitySettings: user.securitySettings
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'secureguardian_secret_key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          securitySettings: user.securitySettings,
          lastLogin: user.lastLogin
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'secureguardian_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emergencyContacts: user.emergencyContacts,
        securitySettings: user.securitySettings,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// PUT /api/auth/settings - Update security settings
router.put('/settings', authenticateToken, (req, res) => {
  try {
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const { securitySettings } = req.body;
    
    // Update security settings
    user.securitySettings = {
      ...user.securitySettings,
      ...securitySettings
    };
    
    res.json({
      success: true,
      data: {
        securitySettings: user.securitySettings,
        message: 'Security settings updated successfully'
      }
    });
    
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// POST /api/auth/emergency-contacts - Update emergency contacts
router.post('/emergency-contacts', authenticateToken, (req, res) => {
  try {
    const user = Array.from(users.values()).find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const { emergencyContacts } = req.body;
    
    // Validate emergency contacts
    if (!Array.isArray(emergencyContacts)) {
      return res.status(400).json({
        success: false,
        error: 'Emergency contacts must be an array'
      });
    }
    
    user.emergencyContacts = emergencyContacts;
    
    res.json({
      success: true,
      data: {
        emergencyContacts: user.emergencyContacts,
        message: 'Emergency contacts updated successfully'
      }
    });
    
  } catch (error) {
    console.error('Emergency contacts update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contacts'
    });
  }
});

// POST /api/auth/logout - User logout (token blacklisting would be implemented here)
router.post('/logout', authenticateToken, (req, res) => {
  // In a real implementation, you would blacklist the token
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
