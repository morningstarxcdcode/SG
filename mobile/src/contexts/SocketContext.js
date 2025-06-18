import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [threatAlerts, setThreatAlerts] = useState([]);

  useEffect(() => {
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    try {
      const newSocket = io('http://localhost:3000', {
        transports: ['websocket'],
        timeout: 5000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to SecureGuardian server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('threat-alert', (alertData) => {
        console.log('Threat alert received:', alertData);
        setThreatAlerts(prev => [alertData, ...prev.slice(0, 9)]); // Keep last 10 alerts
      });

      newSocket.on('security-status-update', (statusData) => {
        console.log('Security status update:', statusData);
      });

      newSocket.on('emergency-alert', (emergencyData) => {
        console.log('Emergency alert:', emergencyData);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
        setIsConnected(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  };

  const joinSecurityMonitoring = (userId) => {
    if (socket && isConnected) {
      socket.emit('join-security-monitoring', userId);
    }
  };

  const startThreatScan = (scanData) => {
    if (socket && isConnected) {
      socket.emit('start-threat-scan', scanData);
    }
  };

  const sendEmergencyAlert = (alertData) => {
    if (socket && isConnected) {
      socket.emit('emergency-alert', alertData);
    }
  };

  const value = {
    socket,
    isConnected,
    threatAlerts,
    joinSecurityMonitoring,
    startThreatScan,
    sendEmergencyAlert,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
