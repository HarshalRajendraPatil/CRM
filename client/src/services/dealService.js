import axios from '../utils/axiosConfig';

// ==================== BASIC CRUD OPERATIONS ====================

/**
 * Get all deals for a project with filtering and pagination
 */
export const getProjectDeals = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}`, { params });
};

/**
 * Get all deals for a company with filtering and pagination
 */
export const getCompanyDeals = async (projectId, companyId, params = {}) => {
  return axios.get(`/deals/company/${companyId}?projectId=${projectId}`, { params });
};

/**
 * Get a single deal by ID
 */
export const getDeal = async (projectId, id) => {
  return axios.get(`/deals/${id}?projectId=${projectId}`);
};

/**
 * Create a new deal
 */
export const createDeal = async (projectId, dealData) => {
  return axios.post(`/deals/project/${projectId}`, dealData);
};

/**
 * Update a deal
 */
export const updateDeal = async (projectId, id, dealData) => {
  return axios.put(`/deals/${id}?projectId=${projectId}`, dealData);
};

/**
 * Archive a deal
 */
export const archiveDeal = async (projectId, id) => {
  return axios.patch(`/deals/${id}/archive?projectId=${projectId}`);
};

/**
 * Delete a deal permanently
 */
export const deleteDeal = async (projectId, id) => {
  return axios.delete(`/deals/${id}?projectId=${projectId}`);
};

/**
 * Restore an archived deal
 */
export const restoreDeal = async (projectId, id) => {
  return axios.patch(`/deals/${id}/restore?projectId=${projectId}`);
};

/**
 * Get archived deals for a project
 */
export const getArchivedDeals = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}/archived`, { params });
};

// ==================== DEAL ACTIVITIES ====================

/**
 * Add activity to a deal
 */
export const addDealActivity = async (projectId, id, activityData) => {
  return axios.post(`/deals/${id}/activities?projectId=${projectId}`, activityData);
};

/**
 * Get deal activities
 */
export const getDealActivities = async (projectId, id, params = {}) => {
  return axios.get(`/deals/${id}/activities?projectId=${projectId}`, { params });
};

// ==================== DEAL NOTES ====================

/**
 * Add note to a deal
 */
export const addDealNote = async (projectId, id, noteData) => {
  return axios.post(`/deals/${id}/notes?projectId=${projectId}`, noteData);
};

/**
 * Update a deal note
 */
export const updateDealNote = async (projectId, id, noteId, noteData) => {
  return axios.put(`/deals/${id}/notes/${noteId}?projectId=${projectId}`, noteData);
};

/**
 * Delete a deal note
 */
export const deleteDealNote = async (projectId, id, noteId) => {
  return axios.delete(`/deals/${id}/notes/${noteId}?projectId=${projectId}`);
};


// ==================== BULK OPERATIONS ====================

/**
 * Bulk update multiple deals
 */
export const bulkUpdateDeals = async (projectId, dealIds, updates) => {
  return axios.patch(`/deals/project/${projectId}/bulk-update`, {
    dealIds,
    updates
  });
};

/**
 * Bulk archive multiple deals
 */
export const bulkArchiveDeals = async (projectId, dealIds) => {
  return axios.patch(`/deals/project/${projectId}/bulk-archive`, {
    dealIds
  });
};

/**
 * Bulk delete multiple deals permanently
 */
export const bulkDeleteDeals = async (projectId, dealIds) => {
  return axios.delete(`/deals/project/${projectId}/bulk-delete`, {
    data: { dealIds }
  });
};

/**
 * Bulk assign deals to a user
 */
export const bulkAssignDeals = async (projectId, dealIds, assignedTo) => {
  return axios.patch(`/deals/project/${projectId}/bulk-assign`, {
    dealIds,
    assignedTo
  });
};

// ==================== STAGE AND STATUS MANAGEMENT ====================

/**
 * Move deal to a different stage
 */
export const moveDealToStage = async (projectId, id, stage, reason) => {
  return axios.patch(`/deals/${id}/move-stage?projectId=${projectId}`, { stage, reason });
};

/**
 * Update deal status
 */
export const updateDealStatus = async (projectId, id, status, reason) => {
  return axios.patch(`/deals/${id}/status?projectId=${projectId}`, { status, reason });
};

// ==================== STATISTICS AND ANALYTICS ====================

/**
 * Get comprehensive deal statistics
 */
export const getDealStats = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}/stats`, { params });
};

/**
 * Get deal funnel analysis
 */
export const getDealFunnel = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}/funnel`, { params });
};

/**
 * Get deal velocity analysis
 */
export const getDealVelocity = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}/velocity`, { params });
};

/**
 * Get deal forecasting and predictions
 */
export const getDealForecast = async (projectId, params = {}) => {
  return axios.get(`/deals/project/${projectId}/forecast`, { params });
};

/**
 * Get deal insights and recommendations
 */
export const getDealInsights = async (projectId) => {
  return axios.get(`/deals/project/${projectId}/insights`);
};

// ==================== EXPORT ====================

/**
 * Export deals to CSV/JSON
 */
export const exportDeals = async (projectId, format = 'json', filters = {}) => {
  const params = { format, ...filters };
  return axios.get(`/deals/project/${projectId}/export`, { 
    params,
    responseType: format === 'csv' ? 'blob' : 'json'
  });
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format deal value for display
 */
export const formatDealValue = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Calculate deal age in days
 */
export const calculateDealAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days until expected close date
 */
export const calculateDaysUntilClose = (expectedCloseDate) => {
  if (!expectedCloseDate) return null;
  
  const now = new Date();
  const closeDate = new Date(expectedCloseDate);
  const diffTime = closeDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get deal status color
 */
export const getDealStatusColor = (status) => {
  const colors = {
    open: 'blue',
    won: 'green',
    lost: 'red',
    abandoned: 'gray',
    suspended: 'yellow'
  };
  return colors[status] || 'gray';
};

/**
 * Get deal priority color
 */
export const getDealPriorityColor = (priority) => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  };
  return colors[priority] || 'gray';
};

/**
 * Get deal stage color (this would typically come from pipeline configuration)
 */
export const getDealStageColor = (stage) => {
  // This is a default implementation - in a real app, this would come from pipeline configuration
  const colors = {
    'lead': 'gray',
    'qualified': 'blue',
    'proposal': 'yellow',
    'negotiation': 'orange',
    'closed-won': 'green',
    'closed-lost': 'red'
  };
  return colors[stage] || 'gray';
};

/**
 * Calculate weighted pipeline value
 */
export const calculateWeightedPipelineValue = (deals) => {
  return deals.reduce((total, deal) => {
    const probability = deal.probability || 0;
    return total + (deal.value * (probability / 100));
  }, 0);
};

/**
 * Get deal health status
 */
export const getDealHealth = (deal) => {
  const now = new Date();
  const expectedClose = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null;
  const daysUntilClose = expectedClose ? Math.ceil((expectedClose - now) / (1000 * 60 * 60 * 24)) : null;
  
  // Deal is overdue
  if (expectedClose && daysUntilClose < 0) {
    return {
      status: 'overdue',
      color: 'red',
      message: `Overdue by ${Math.abs(daysUntilClose)} days`
    };
  }
  
  // Deal is closing soon (within 7 days)
  if (expectedClose && daysUntilClose <= 7 && daysUntilClose > 0) {
    return {
      status: 'closing-soon',
      color: 'orange',
      message: `Closes in ${daysUntilClose} days`
    };
  }
  
  // Deal has high probability and good value
  if (deal.probability >= 80 && deal.value >= 10000) {
    return {
      status: 'hot',
      color: 'green',
      message: 'Hot opportunity'
    };
  }
  
  // Deal has been in current stage too long (more than 30 days)
  if (deal.daysInCurrentStage && deal.daysInCurrentStage > 30) {
    return {
      status: 'stale',
      color: 'yellow',
      message: `In stage for ${deal.daysInCurrentStage} days`
    };
  }
  
  return {
    status: 'normal',
    color: 'blue',
    message: 'Normal'
  };
};

/**
 * Sort deals by various criteria
 */
export const sortDeals = (deals, sortBy, sortOrder = 'desc') => {
  return [...deals].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'value':
        aValue = a.value;
        bValue = b.value;
        break;
      case 'probability':
        aValue = a.probability || 0;
        bValue = b.probability || 0;
        break;
      case 'expectedCloseDate':
        aValue = a.expectedCloseDate ? new Date(a.expectedCloseDate) : new Date(0);
        bValue = b.expectedCloseDate ? new Date(b.expectedCloseDate) : new Date(0);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'daysInCurrentStage':
        aValue = a.daysInCurrentStage || 0;
        bValue = b.daysInCurrentStage || 0;
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Filter deals by various criteria
 */
export const filterDeals = (deals, filters) => {
  return deals.filter(deal => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(deal.status)) return false;
    }
    
    // Stage filter
    if (filters.stage && filters.stage.length > 0) {
      if (!filters.stage.includes(deal.stage)) return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(deal.priority)) return false;
    }
    
    // Assigned user filter
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (!deal.assignedTo || !filters.assignedTo.includes(deal.assignedTo._id)) return false;
    }
    
    // Value range filter
    if (filters.minValue !== undefined && deal.value < filters.minValue) return false;
    if (filters.maxValue !== undefined && deal.value > filters.maxValue) return false;
    
    // Probability range filter
    if (filters.minProbability !== undefined && (deal.probability || 0) < filters.minProbability) return false;
    if (filters.maxProbability !== undefined && (deal.probability || 0) > filters.maxProbability) return false;
    
    // Date range filters
    if (filters.createdDateFrom) {
      if (new Date(deal.createdAt) < new Date(filters.createdDateFrom)) return false;
    }
    if (filters.createdDateTo) {
      if (new Date(deal.createdAt) > new Date(filters.createdDateTo)) return false;
    }
    if (filters.expectedCloseDateFrom) {
      if (!deal.expectedCloseDate || new Date(deal.expectedCloseDate) < new Date(filters.expectedCloseDateFrom)) return false;
    }
    if (filters.expectedCloseDateTo) {
      if (!deal.expectedCloseDate || new Date(deal.expectedCloseDate) > new Date(filters.expectedCloseDateTo)) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        deal.name,
        deal.description,
        deal.dealNumber,
        deal.assignedTo?.name,
        deal.customer?.name,
        deal.company?.name
      ].filter(Boolean);
      
      if (!searchableFields.some(field => field.toLowerCase().includes(searchTerm))) return false;
    }
    
    return true;
  });
};

/**
 * Group deals by various criteria
 */
export const groupDeals = (deals, groupBy) => {
  const groups = {};
  
  deals.forEach(deal => {
    let groupKey;
    
    switch (groupBy) {
      case 'status':
        groupKey = deal.status;
        break;
      case 'stage':
        groupKey = deal.stage;
        break;
      case 'priority':
        groupKey = deal.priority;
        break;
      case 'assignedTo':
        groupKey = deal.assignedTo ? deal.assignedTo._id : 'unassigned';
        break;
      case 'source':
        groupKey = deal.source || 'unknown';
        break;
      case 'month':
        groupKey = new Date(deal.createdAt).toISOString().substring(0, 7); // YYYY-MM
        break;
      default:
        groupKey = 'all';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(deal);
  });
  
  return groups;
};

/**
 * Calculate deal metrics
 */
export const calculateDealMetrics = (deals) => {
  const totalDeals = deals.length;
  const openDeals = deals.filter(d => d.status === 'open').length;
  const wonDeals = deals.filter(d => d.status === 'won').length;
  const lostDeals = deals.filter(d => d.status === 'lost').length;
  
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.value, 0);
  const lostValue = deals.filter(d => d.status === 'lost').reduce((sum, d) => sum + d.value, 0);
  const openValue = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + d.value, 0);
  
  const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
  const conversionRate = (wonDeals + lostDeals) > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;
  const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
  
  const weightedPipelineValue = deals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + (d.value * ((d.probability || 0) / 100)), 0);
  
  return {
    totalDeals,
    openDeals,
    wonDeals,
    lostDeals,
    totalValue,
    wonValue,
    lostValue,
    openValue,
    avgDealSize,
    conversionRate,
    winRate,
    weightedPipelineValue
  };
};
