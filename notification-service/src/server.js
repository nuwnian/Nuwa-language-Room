const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);

// Redis client for pub/sub
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// JWT middleware for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.email = decoded.email;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected to notifications`);
  
  // Join user-specific room
  socket.join(`user:${socket.userId}`);
  
  // Handle manual notification subscription
  socket.on('subscribe:notifications', () => {
    console.log(`User ${socket.userId} subscribed to notifications`);
    socket.emit('notification:subscribed', { status: 'success' });
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected from notifications`);
  });
});

// Redis subscription for real-time notifications
redis.subscribe('notifications');
redis.on('message', (channel, message) => {
  if (channel === 'notifications') {
    try {
      const notification = JSON.parse(message);
      
      // Emit to specific user or broadcast
      if (notification.userId) {
        io.to(`user:${notification.userId}`).emit('notification', notification);
      } else {
        io.emit('notification', notification);
      }
      
      console.log('Notification sent:', notification);
    } catch (err) {
      console.error('Error processing notification:', err);
    }
  }
});

// REST API Endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

// Send notification (internal API)
app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;
    
    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store in Redis
    await redis.hset(`notifications:${userId}`, notification.id, JSON.stringify(notification));
    
    // Publish to subscribers
    await redis.publish('notifications', JSON.stringify(notification));
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get user notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const notifications = await redis.hgetall(`notifications:${userId}`);
    const notificationList = Object.values(notifications)
      .map(n => JSON.parse(n))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + parseInt(limit));
    
    res.json({
      notifications: notificationList,
      total: Object.keys(notifications).length,
      unread: notificationList.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:userId/:notificationId/read', async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    
    const notificationData = await redis.hget(`notifications:${userId}`, notificationId);
    if (!notificationData) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = JSON.parse(notificationData);
    notification.read = true;
    
    await redis.hset(`notifications:${userId}`, notificationId, JSON.stringify(notification));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Broadcast notification to all users
app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { type, title, message, data } = req.body;
    
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      broadcast: true
    };
    
    // Publish to all subscribers
    await redis.publish('notifications', JSON.stringify(notification));
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

// Clear all notifications for a user
app.delete('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await redis.del(`notifications:${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    redis.disconnect();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`🔔 Notification service listening on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time notifications`);
});

module.exports = app;