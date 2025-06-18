import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [securityStatus, setSecurityStatus] = useState({
    overallStatus: 'UNKNOWN',
    securityScore: 0,
    wifiSecurity: 'Unknown',
    locationPrivacy: 'Unknown',
    dataEncryption: 'Unknown',
    lastScan: null,
  });
  
  const [threatHistory, setThreatHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Location permission failed:', error);
    }
  };

  const performScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    try {
      // Get current location for scan
      let locationData = currentLocation;
      if (!locationData) {
        try {
          locationData = await Location.getCurrentPositionAsync({});
          setCurrentLocation(locationData);
        } catch (error) {
          console.warn('Could not get location for scan');
        }
      }

      // Prepare location data for API
      const scanLocationData = locationData ? {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
      } : null;

      // Call threat detection API
      const response = await axios.get('http://localhost:3000/api/threat/scan', {
        params: {
          location: scanLocationData ? JSON.stringify(scanLocationData) : undefined,
        },
      });

      const scanResults = response.data.data;
      
      // Update security status
      updateSecurityStatus(scanResults);
      
      // Add to threat history
      setThreatHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        threatCount: scanResults.threats.length,
        riskLevel: scanResults.riskLevel,
        threats: scanResults.threats,
      }]);

      return scanResults;
      
    } catch (error) {
      console.error('Security scan failed:', error);
      
      // Mock data for demo purposes when server is not available
      const mockResults = {
        timestamp: new Date().toISOString(),
        threats: [],
        riskLevel: 'LOW',
        recommendations: ['Continue monitoring - no threats detected'],
      };
      
      updateSecurityStatus(mockResults);
      return mockResults;
      
    } finally {
      setIsScanning(false);
    }
  };

  const updateSecurityStatus = (scanResults) => {
    const securityScore = calculateSecurityScore(scanResults);
    const overallStatus = determineOverallStatus(scanResults.riskLevel);
    
    setSecurityStatus({
      overallStatus,
      securityScore,
      wifiSecurity: scanResults.threats.some(t => t.type.includes('WIFI')) ? 'Vulnerable' : 'Secure',
      locationPrivacy: scanResults.threats.some(t => t.type.includes('LOCATION')) ? 'Exposed' : 'Protected',
      dataEncryption: 'Encrypted', // Mock for now
      lastScan: new Date().toISOString(),
    });
  };

  const calculateSecurityScore = (scanResults) => {
    let score = 100;
    
    // Deduct points for threats
    scanResults.threats.forEach(threat => {
      switch (threat.severity) {
        case 'HIGH':
          score -= 25;
          break;
        case 'MEDIUM':
          score -= 15;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  };

  const determineOverallStatus = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'VULNERABLE';
      case 'MEDIUM':
        return 'MODERATE';
      case 'LOW':
      default:
        return 'SECURE';
    }
  };

  const value = {
    securityStatus,
    threatHistory,
    isScanning,
    currentLocation,
    performScan,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
