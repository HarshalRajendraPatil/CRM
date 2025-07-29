import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';

// Configure store with reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    // Add other reducers here as needed
  },
  devTools: import.meta.env.DEV, // Enable Redux DevTools only in development
});

export default store; 