import axios from '../utils/axiosConfig';

// Get CRM settings
export const getCrmSettings = async (projectId) => {
  return axios.get(`/settings/project/${projectId}`);
};

// Update CRM settings
export const updateCrmSettings = async (projectId, settingsData) => {
  return axios.put(`/settings/project/${projectId}`, settingsData);
};

// Update specific setting section
export const updateSettingSection = async (projectId, section, sectionData) => {
  return axios.put(`/settings/project/${projectId}/${section}`, sectionData);
};

// Reset settings to default
export const resetSettings = async (projectId) => {
  return axios.post(`/settings/project/${projectId}/reset`);
};

// Get available timezones
export const getTimezones = async () => {
  return axios.get('/settings/timezones');
};

// Get available currencies
export const getCurrencies = async () => {
  return axios.get('/settings/currencies');
};
