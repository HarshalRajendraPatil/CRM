import { io } from 'socket.io-client';
import store from '../store/index';
import { addNotification } from '../store/notificationSlice';

// Socket.io instance
let socket = null;

// Base URL for socket connection
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Initialize socket connection
 */
export const initializeSocket = () => {
  // Get token from localStorage
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.warn('No token available for socket connection');
    return;
  }
  
  // Create socket connection with auth
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Listen for notifications
  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);
    // Dispatch to Redux store
    store.dispatch(addNotification(notification));
    
    // Show browser notification if supported and user has granted permission
    showBrowserNotification(notification);
  });
  
  return socket;
};

/**
 * Close socket connection
 */
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

/**
 * Join a project room to receive project-specific notifications
 * @param {string} projectId - Project ID to join
 */
export const joinProjectRoom = (projectId) => {
  if (socket && projectId) {
    socket.emit('join-project', projectId);
    console.log(`Joined project room: ${projectId}`);
  }
};

/**
 * Leave a project room
 * @param {string} projectId - Project ID to leave
 */
export const leaveProjectRoom = (projectId) => {
  if (socket && projectId) {
    socket.emit('leave-project', projectId);
    console.log(`Left project room: ${projectId}`);
  }
};

/**
 * Show browser notification if supported and permission granted
 * @param {Object} notification - Notification object
 */
const showBrowserNotification = (notification) => {
  // Check if browser notifications are supported
  if (!('Notification' in window)) {
    return;
  }
  
  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    createBrowserNotification(notification);
  } 
  // Otherwise, request permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createBrowserNotification(notification);
      }
    });
  }
};

/**
 * Create and show a browser notification
 * @param {Object} notification - Notification object
 */
const createBrowserNotification = (notification) => {
  const { title, message, link } = notification;
  
  const browserNotification = new Notification(title, {
    body: message,
    icon: '/logo.png', // Add your app logo path here
  });
  
  // Handle click on notification to navigate to the link
  browserNotification.onclick = () => {
    window.focus();
    if (link) {
      window.location.href = link;
    }
    browserNotification.close();
  };
  
  // Auto close after 5 seconds
  setTimeout(() => {
    browserNotification.close();
  }, 5000);
};

export default {
  initializeSocket,
  closeSocket,
  joinProjectRoom,
  leaveProjectRoom
};