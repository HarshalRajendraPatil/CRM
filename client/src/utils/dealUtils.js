// Deal utility functions

export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    'open': 'bg-blue-100 text-blue-800',
    'qualified': 'bg-green-100 text-green-800',
    'proposal': 'bg-yellow-100 text-yellow-800',
    'negotiation': 'bg-orange-100 text-orange-800',
    'closed-won': 'bg-emerald-100 text-emerald-800',
    'closed-lost': 'bg-red-100 text-red-800',
    'on-hold': 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const getDaysUntilClose = (closeDate) => {
  if (!closeDate) return null;
  const today = new Date();
  const close = new Date(closeDate);
  const diffTime = close - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDealHealthScore = (deal) => {
  let score = 0;
  
  // Stage progress (40% weight)
  if (deal.stage) {
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'];
    const currentStageIndex = stageOrder.indexOf(deal.stage.name?.toLowerCase());
    if (currentStageIndex >= 0) {
      score += (currentStageIndex / (stageOrder.length - 1)) * 40;
    }
  }
  
  // Timeline health (30% weight)
  const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);
  if (daysUntilClose !== null) {
    if (daysUntilClose > 30) score += 30;
    else if (daysUntilClose > 14) score += 20;
    else if (daysUntilClose > 7) score += 10;
    else if (daysUntilClose > 0) score += 5;
  }
  
  // Value health (20% weight)
  if (deal.value) {
    if (deal.value > 100000) score += 20;
    else if (deal.value > 50000) score += 15;
    else if (deal.value > 10000) score += 10;
    else score += 5;
  }
  
  // Activity health (10% weight)
  if (deal.activities && deal.activities.length > 0) {
    const recentActivities = deal.activities.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate > weekAgo;
    });
    if (recentActivities.length > 0) score += 10;
  }
  
  return Math.min(Math.max(score, 0), 100);
};

export const getDealHealthColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getDealHealthBgColor = (score) => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-600';
  if (score >= 40) return 'bg-orange-600';
  return 'bg-red-600';
};

export const calculateDealAge = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = today - created;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDealStageProgress = (deal) => {
  if (!deal.stage || !deal.stage.pipeline) return 0;
  
  const pipeline = deal.stage.pipeline;
  const stages = pipeline.stages || [];
  const currentStageIndex = stages.findIndex(stage => stage._id === deal.stage._id);
  
  if (currentStageIndex === -1) return 0;
  
  return ((currentStageIndex + 1) / stages.length) * 100;
};

export const getDealVelocity = (deal) => {
  if (!deal.createdAt || !deal.expectedCloseDate) return null;
  
  const created = new Date(deal.createdAt);
  const expectedClose = new Date(deal.expectedCloseDate);
  const totalDays = Math.ceil((expectedClose - created) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) return null;
  
  const progress = getDealStageProgress(deal);
  const daysElapsed = calculateDealAge(deal.createdAt);
  
  if (daysElapsed <= 0) return null;
  
  return (progress / daysElapsed) * 100; // Progress per day
};

export const getDealRiskLevel = (deal) => {
  const healthScore = getDealHealthScore(deal);
  const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);
  const dealAge = calculateDealAge(deal.createdAt);
  
  let riskScore = 0;
  
  // Health score risk
  if (healthScore < 40) riskScore += 40;
  else if (healthScore < 60) riskScore += 20;
  
  // Timeline risk
  if (daysUntilClose !== null) {
    if (daysUntilClose < 0) riskScore += 30;
    else if (daysUntilClose <= 7) riskScore += 20;
    else if (daysUntilClose <= 14) riskScore += 10;
  }
  
  // Age risk
  if (dealAge > 90) riskScore += 20;
  else if (dealAge > 60) riskScore += 10;
  
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
};

export const getDealRiskColor = (riskLevel) => {
  const riskColors = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800',
  };
  return riskColors[riskLevel] || 'bg-gray-100 text-gray-800';
};
