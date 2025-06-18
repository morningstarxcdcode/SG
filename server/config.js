const express = require('express');
require('dotenv').config();

const app = express();

// Environment configuration
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'secureguardian_secret_key_change_in_production',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secureguardian',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Security Settings
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Threat Detection Settings
  SCAN_INTERVAL: parseInt(process.env.SCAN_INTERVAL) || 30000, // 30 seconds
  MAX_THREAT_HISTORY: parseInt(process.env.MAX_THREAT_HISTORY) || 1000,
  
  // API Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // Emergency Services
  EMERGENCY_CONTACT_POLICE: process.env.EMERGENCY_CONTACT_POLICE || '911',
  EMERGENCY_CONTACT_FIRE: process.env.EMERGENCY_CONTACT_FIRE || '911',
  EMERGENCY_CONTACT_MEDICAL: process.env.EMERGENCY_CONTACT_MEDICAL || '911',
  EMERGENCY_CONTACT_CYBER: process.env.EMERGENCY_CONTACT_CYBER || '1-855-292-3725',
  
  // Feature Flags
  ENABLE_ML_DETECTION: process.env.ENABLE_ML_DETECTION === 'true',
  ENABLE_LOCATION_TRACKING: process.env.ENABLE_LOCATION_TRACKING === 'true',
  ENABLE_BACKGROUND_SCANNING: process.env.ENABLE_BACKGROUND_SCANNING === 'true',
  ENABLE_EMERGENCY_SERVICES: process.env.ENABLE_EMERGENCY_SERVICES === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/secureguardian.log',

  // Threat Intelligence
  GOOGLE_SAFE_BROWSING_API_KEY: process.env.GOOGLE_SAFE_BROWSING_API_KEY || 'YOUR_API_KEY_HERE',
};

module.exports = config;
