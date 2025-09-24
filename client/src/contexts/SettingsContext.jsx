import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCrmSettings, selectSettings, selectSettingsLoading } from '../store/settingsSlice';

const SettingsContext = createContext();

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);

  // Fetch settings when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchCrmSettings(projectId));
    }
  }, [dispatch, projectId]);

  const value = {
    settings,
    loading,
    projectId
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to get settings with automatic loading
export const useSettings = () => {
  const { settings, loading } = useSettingsContext();
  return { settings, loading };
};

// Hook to get specific setting value
export const useSetting = (path, defaultValue = null) => {
  const { settings } = useSettingsContext();
  
  if (!settings) return defaultValue;
  
  const keys = path.split('.');
  let value = settings;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};
