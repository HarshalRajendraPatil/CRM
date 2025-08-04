import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import projectReducer from './projectSlice';
import invitationReducer from './invitationSlice';
import notificationReducer from './notificationSlice';
import crmReducer from './crmSlice';

// Configure store with reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    projects: projectReducer,
    invitations: invitationReducer,
    notifications: notificationReducer,
    crm: crmReducer,
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools only in development
});

export default store; 