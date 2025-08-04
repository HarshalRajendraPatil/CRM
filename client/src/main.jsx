import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.js';
import './index.css';
import App from './App.jsx';
import { initializeAuth } from './utils/authUtils';

// Initialize authentication and socket connection
initializeAuth();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);