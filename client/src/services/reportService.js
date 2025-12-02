import axios from './../utils/axiosConfig';

// Generate report
export const generateReport = async (projectId, reportData) => {
  const response = await axios.post(`/reports/${projectId}/generate?projectId=${projectId}`, reportData, {
    responseType: reportData.format === 'json' ? 'json' : 'blob'
  });
  
  if (reportData.format === 'json') {
    return response.data;
  } else {
    // For binary formats (PDF, Excel, CSV), return the blob data
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

// Generate specific report types
export const generateOverviewReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/overview?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateCompaniesReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/companies?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateCustomersReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/customers?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateDealsReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/deals?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateLeadsReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/leads?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateTasksReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/tasks?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateActivitiesReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/activities?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generatePerformanceReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/performance?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

export const generateFinancialReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/financial?projectId=${projectId}`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    return {
      data: blob,
      type: response.headers['content-type'],
      size: blob.size || response.data.length || 0
    };
  }
};

// Download report file
export const downloadReport = async (projectId, url, filename) => {
  try {
    const response = await axios.get(`${url}?projectId=${projectId}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
