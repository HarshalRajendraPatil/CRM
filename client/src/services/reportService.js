import axios from './../utils/axiosConfig';

// Generate report
export const generateReport = async (projectId, reportData) => {
  const response = await axios.post(`/reports/${projectId}/generate`, reportData, {
    responseType: reportData.format === 'json' ? 'json' : 'blob'
  });
  
  if (reportData.format === 'json') {
    return response.data;
  } else {
    // For binary formats (PDF, Excel, CSV), return the blob data
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

// Generate specific report types
export const generateOverviewReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/overview`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateCompaniesReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/companies`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateCustomersReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/customers`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateDealsReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/deals`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateLeadsReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/leads`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateTasksReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/tasks`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateActivitiesReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/activities`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generatePerformanceReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/performance`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

export const generateFinancialReport = async (projectId, options = {}) => {
  const response = await axios.post(`/reports/${projectId}/financial`, options, {
    responseType: options.format === 'json' ? 'json' : 'blob'
  });
  
  if (options.format === 'json') {
    return response.data;
  } else {
    return {
      data: response.data,
      type: response.headers['content-type'],
      size: response.data.size
    };
  }
};

// Download report file
export const downloadReport = async (url, filename) => {
  try {
    const response = await axios.get(url, {
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
