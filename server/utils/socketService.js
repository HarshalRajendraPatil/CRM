import { Server } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';

let io;
const connectedUsers = new Map(); // Maps userId to socketId

// Initialize Socket.IO server
export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = verifyAccessToken(token);
      
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Attach user ID to socket
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const userId = socket.userId;
    
    // Store user connection
    connectedUsers.set(userId, socket.id);
    
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
    
    // Join user to their personal room for targeted notifications
    socket.join(`user:${userId}`);
    
    // Join project rooms if needed
    socket.on('join-project', (projectId) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log(`User ${userId} joined project room: ${projectId}`);
      }
    });
    
    // Leave project room
    socket.on('leave-project', (projectId) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`User ${userId} left project room: ${projectId}`);
      }
    });
  });

  return io;
};

// Send notification to specific user
export const emitNotification = (userId, notification) => {
  if (!io) {
    console.warn('Socket.IO not initialized when trying to emit notification');
    return;
  }
  
  // Emit to user's personal room
  io.to(`user:${userId}`).emit('notification', notification);
};

// Send notification to all users in a project
export const emitProjectNotification = (projectId, notification, excludeUserId = null) => {
  if (!io) {
    console.warn('Socket.IO not initialized when trying to emit project notification');
    return;
  }
  
  // If excludeUserId is provided, we need to emit to each user in the room except the excluded one
  if (excludeUserId) {
    // Get all sockets in the room
    const room = io.sockets.adapter.rooms.get(`project:${projectId}`);
    
    if (room) {
      // Iterate through all sockets in the room
      for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        
        // Skip the excluded user
        if (socket && socket.userId !== excludeUserId) {
          socket.emit('notification', notification);
        }
      }
    }
  } else {
    // Emit to all users in the project room
    io.to(`project:${projectId}`).emit('notification', notification);
  }
};

// Check if a user is online
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Get socket ID for a user
export const getUserSocketId = (userId) => {
  return connectedUsers.get(userId);
};

// Get all connected users
export const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

export default {
  initSocketServer,
  emitNotification,
  emitProjectNotification,
  isUserOnline,
  getUserSocketId,
  getConnectedUsers
};