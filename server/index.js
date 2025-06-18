const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const threatDetectionRoutes = require('./routes/threatDetection');
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const ThreatDetector = require('./services/ThreatDetector');
const SocketManager = require('./services/SocketManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Initialize services
const threatDetector = new ThreatDetector();
const socketManager = new SocketManager(io);

// Routes
app.use('/api/threat', threatDetectionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('join-security-monitoring', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined security monitoring`);
  });

  socket.on('start-threat-scan', async (data) => {
    try {
      const threatResults = await threatDetector.scanEnvironment(data);
      socket.emit('threat-scan-results', threatResults);
    } catch (error) {
      socket.emit('scan-error', { message: error.message });
    }
  });

  socket.on('emergency-alert', (alertData) => {
    socketManager.broadcastEmergencyAlert(alertData);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start real-time threat monitoring
threatDetector.startContinuousMonitoring((threatData) => {
  socketManager.broadcastThreatAlert(threatData);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🛡️  SecureGuardian Server running on port ${PORT}`);
  console.log(`🔍 Threat Detection: Active`);
  console.log(`📡 Socket.io: Connected`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
