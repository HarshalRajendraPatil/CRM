import axios from './../utils/axiosConfig';

// Get all tasks for a project
export const getProjectTasks = async (projectId, params = {}) => {
  return axios.get(`/tasks/project/${projectId}`, { params });
};

// Get tasks assigned to a specific user
export const getUserTasks = async (userId, params = {}) => {
  return axios.get(`/tasks/user/${userId}`, { params });
};

// Get a single task by ID
export const getTask = async (id) => {
  return axios.get(`/tasks/${id}`);
};

// Create a new task
export const createTask = async (taskData) => {
  return axios.post('/tasks', taskData);
};

// Update a task
export const updateTask = async (id, taskData) => {
  return axios.put(`/tasks/${id}`, taskData);
};

// Delete a task
export const deleteTask = async (id) => {
  return axios.delete(`/tasks/${id}`);
};

// Archive a task
export const archiveTask = async (id) => {
  return axios.patch(`/tasks/${id}/archive`);
};

// Restore an archived task
export const restoreTask = async (id) => {
  return axios.patch(`/tasks/${id}/restore`);
};

// Update task status
export const updateTaskStatus = async (id, status, notes = '') => {
  return axios.patch(`/tasks/${id}/status`, { status, notes });
};

// Assign task to user
export const assignTask = async (id, assignedTo) => {
  return axios.patch(`/tasks/${id}/assign`, { assignedTo });
};

// Add comment to task
export const addTaskComment = async (id, content, mentions = []) => {
  return axios.post(`/tasks/${id}/comments`, { content, mentions });
};

// Add subtask to task
export const addSubtask = async (id, subtaskData) => {
  return axios.post(`/tasks/${id}/subtasks`, subtaskData);
};

// Update subtask
export const updateSubtask = async (id, subtaskId, subtaskData) => {
  return axios.put(`/tasks/${id}/subtasks/${subtaskId}`, subtaskData);
};

// Complete subtask
export const completeSubtask = async (id, subtaskId) => {
  return axios.patch(`/tasks/${id}/subtasks/${subtaskId}/complete`);
};

// Delete subtask
export const deleteSubtask = async (id, subtaskId) => {
  return axios.delete(`/tasks/${id}/subtasks/${subtaskId}`);
};

// Bulk operations
export const bulkUpdateTasks = async (taskIds, updates) => {
  return axios.patch('/tasks/bulk/update', { taskIds, updates });
};

export const bulkDeleteTasks = async (taskIds) => {
  return axios.delete('/tasks/bulk/delete', { data: { taskIds } });
};

export const bulkArchiveTasks = async (taskIds) => {
  return axios.patch('/tasks/bulk/archive', { taskIds });
};

// Get task statistics
export const getTaskStats = async (projectId, params = {}) => {
  return axios.get(`/tasks/project/${projectId}/stats`, { params });
};

// Get task insights
export const getTaskInsights = async (projectId, params = {}) => {
  return axios.get(`/tasks/project/${projectId}/insights`, { params });
};

// Get overdue tasks
export const getOverdueTasks = async (projectId) => {
  return axios.get(`/tasks/project/${projectId}/overdue`);
};

// Get tasks by related entity
export const getTasksByEntity = async (entityType, entityId, params = {}) => {
  return axios.get(`/tasks/entity/${entityType}/${entityId}`, { params });
};

// Export tasks
export const exportTasks = async (projectId, format = 'json', filters = {}) => {
  return axios.get(`/tasks/project/${projectId}/export`, {
    params: { format, ...filters },
    responseType: format === 'csv' ? 'blob' : 'json'
  });
};

// Utility functions
export const formatTaskPriority = (priority) => {
  const priorityMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  return priorityMap[priority] || priority;
};

export const formatTaskStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    on_hold: 'On Hold'
  };
  return statusMap[status] || status;
};

export const formatTaskType = (type) => {
  const typeMap = {
    follow_up: 'Follow Up',
    meeting: 'Meeting',
    call: 'Call',
    email: 'Email',
    document: 'Document',
    research: 'Research',
    review: 'Review',
    other: 'Other'
  };
  console.log(typeMap[type]);
  return typeMap[type] || type;
};

export const getTaskPriorityColor = (priority) => {
  const colorMap = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800';
};

export const getTaskStatusColor = (status) => {
  const colorMap = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    on_hold: 'bg-yellow-100 text-yellow-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getTaskTypeIcon = (type) => {
  const iconMap = {
    follow_up: '📞',
    meeting: '🤝',
    call: '📱',
    email: '📧',
    document: '📄',
    research: '🔍',
    review: '👀',
    other: '📋'
  };
  return iconMap[type] || '📋';
};

export const calculateTaskAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed' || status === 'cancelled') return false;
  return new Date() > new Date(dueDate);
};

export const getTaskHealthScore = (task) => {
  let score = 100;
  
  // Reduce score for overdue tasks
  if (isTaskOverdue(task.dueDate, task.status)) {
    const daysOverdue = Math.abs(calculateDaysUntilDue(task.dueDate));
    score -= Math.min(daysOverdue * 10, 50);
  }
  
  // Reduce score for high priority tasks that are pending
  if (task.priority === 'urgent' && task.status === 'pending') {
    score -= 20;
  } else if (task.priority === 'high' && task.status === 'pending') {
    score -= 10;
  }
  
  // Reduce score for tasks with low progress
  if (task.progress < 25 && task.status === 'in_progress') {
    score -= 15;
  }
  
  return Math.max(score, 0);
};

export const getTaskHealthColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const sortTasks = (tasks, sortBy = 'dueDate', sortOrder = 'asc') => {
  return [...tasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4, on_hold: 5 };
        aValue = statusOrder[a.status] || 0;
        bValue = statusOrder[b.status] || 0;
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'assignedTo':
        aValue = a.assignedTo?.name?.toLowerCase() || '';
        bValue = b.assignedTo?.name?.toLowerCase() || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'dueDate':
      default:
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterTasks = (tasks, filters) => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }
    
    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(task.type)) return false;
    }
    
    // Assigned to filter
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (!filters.assignedTo.includes(task.assignedTo?._id)) return false;
    }
    
    // Overdue filter
    if (filters.overdue) {
      if (!isTaskOverdue(task.dueDate, task.status)) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        task.title,
        task.description,
        task.assignedTo?.name,
        task.createdBy?.name,
        ...task.tags
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const taskDate = new Date(task.dueDate);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (taskDate < startDate || taskDate > endDate) return false;
    }
    
    return true;
  });
};

export const groupTasks = (tasks, groupBy = 'status') => {
  const groups = {};
  
  tasks.forEach(task => {
    let groupKey;
    
    switch (groupBy) {
      case 'priority':
        groupKey = task.priority;
        break;
      case 'type':
        groupKey = task.type;
        break;
      case 'assignedTo':
        groupKey = task.assignedTo?._id || 'unassigned';
        break;
      case 'dueDate':
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          groupKey = 'overdue';
        } else if (diffDays === 0) {
          groupKey = 'today';
        } else if (diffDays <= 7) {
          groupKey = 'this_week';
        } else if (diffDays <= 30) {
          groupKey = 'this_month';
        } else {
          groupKey = 'later';
        }
        break;
      case 'status':
      default:
        groupKey = task.status;
        break;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(task);
  });
  
  return groups;
};

export const calculateTaskMetrics = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const inProgress = tasks.filter(task => task.status === 'in_progress').length;
  const pending = tasks.filter(task => task.status === 'pending').length;
  const overdue = tasks.filter(task => isTaskOverdue(task.dueDate, task.status)).length;
  
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // Calculate average completion time
  const completedTasks = tasks.filter(task => task.status === 'completed' && task.completedAt);
  const avgCompletionTime = completedTasks.length > 0 
    ? completedTasks.reduce((sum, task) => {
        const completionTime = new Date(task.completedAt) - new Date(task.createdAt);
        return sum + completionTime;
      }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
    : 0;
  
  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate: Math.round(completionRate * 100) / 100,
    averageCompletionTime: Math.round(avgCompletionTime * 100) / 100
  };
};

// Utility functions for task formatting and calculations
// export const formatTaskPriority = (priority) => {
//   const priorityMap = {
//     'low': 'Low',
//     'medium': 'Medium',
//     'high': 'High',
//     'urgent': 'Urgent'
//   };
//   return priorityMap[priority] || priority;
// };

// export const formatTaskStatus = (status) => {
//   const statusMap = {
//     'todo': 'To Do',
//     'in-progress': 'In Progress',
//     'completed': 'Completed',
//     'on-hold': 'On Hold',
//     'cancelled': 'Cancelled'
//   };
//   return statusMap[status] || status;
// };

// export const formatTaskType = (type) => {
//   const typeMap = {
//     'deal': 'Deal',
//     'customer': 'Customer',
//     'company': 'Company',
//     'lead': 'Lead',
//     'project': 'Project'
//   };
//   return typeMap[type] || 'General';
// };

// export const getTaskPriorityColor = (priority) => {
//   const colorMap = {
//     'low': 'bg-green-100 text-green-800',
//     'medium': 'bg-yellow-100 text-yellow-800',
//     'high': 'bg-orange-100 text-orange-800',
//     'urgent': 'bg-red-100 text-red-800'
//   };
//   return colorMap[priority] || 'bg-gray-100 text-gray-800';
// };

// export const getTaskStatusColor = (status) => {
//   const colorMap = {
//     'todo': 'bg-gray-100 text-gray-800',
//     'in-progress': 'bg-blue-100 text-blue-800',
//     'completed': 'bg-green-100 text-green-800',
//     'on-hold': 'bg-yellow-100 text-yellow-800',
//     'cancelled': 'bg-red-100 text-red-800'
//   };
//   return colorMap[status] || 'bg-gray-100 text-gray-800';
// };

// export const getTaskTypeIcon = (type) => {
//   const iconMap = {
//     'deal': (
//       <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//       </svg>
//     ),
//     'customer': (
//       <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//       </svg>
//     ),
//     'company': (
//       <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//       </svg>
//     ),
//     'lead': (
//       <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     'project': (
//       <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//       </svg>
//     )
//   };
//   return iconMap[type] || (
//     <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//     </svg>
//   );
// };

// export const calculateDaysUntilDue = (dueDate) => {
//   if (!dueDate) return null;
//   const today = new Date();
//   const due = new Date(dueDate);
//   const diffTime = due - today;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// };

// export const isTaskOverdue = (task) => {
//   if (!task.dueDate || task.status === 'completed') return false;
//   const today = new Date();
//   const due = new Date(task.dueDate);
//   return due < today;
// };

// export const getTaskHealthScore = (task) => {
//   let score = 50; // Base score
  
//   // Status impact
//   if (task.status === 'completed') score += 30;
//   else if (task.status === 'in-progress') score += 10;
//   else if (task.status === 'on-hold') score -= 10;
//   else if (task.status === 'cancelled') score -= 20;
  
//   // Due date impact
//   if (task.dueDate) {
//     const daysUntilDue = calculateDaysUntilDue(task.dueDate);
//     if (daysUntilDue < 0) score -= 20; // Overdue
//     else if (daysUntilDue <= 3) score -= 10; // Due soon
//     else if (daysUntilDue > 7) score += 10; // Plenty of time
//   }
  
//   // Progress impact
//   if (task.subtasks && task.subtasks.length > 0) {
//     const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
//     const progressPercentage = (completedSubtasks / task.subtasks.length) * 100;
//     score += (progressPercentage - 50) * 0.2; // Scale progress impact
//   }
  
//   // Activity impact
//   if (task.comments && task.comments.length > 0) score += 5;
//   if (task.attachments && task.attachments.length > 0) score += 5;
  
//   return Math.max(0, Math.min(100, Math.round(score)));
// };

// export const getTaskHealthColor = (score) => {
//   if (score >= 80) return 'bg-green-500';
//   if (score >= 60) return 'bg-yellow-500';
//   if (score >= 40) return 'bg-orange-500';
//   return 'bg-red-500';
// };

export default {
  getProjectTasks,
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  restoreTask,
  updateTaskStatus,
  assignTask,
  addTaskComment,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  bulkUpdateTasks,
  bulkDeleteTasks,
  bulkArchiveTasks,
  getTaskStats,
  getTaskInsights,
  getOverdueTasks,
  getTasksByEntity,
  exportTasks,
  // Utility functions
  formatTaskPriority,
  formatTaskStatus,
  formatTaskType,
  getTaskPriorityColor,
  getTaskStatusColor,
  getTaskTypeIcon,
  calculateDaysUntilDue,
  isTaskOverdue,
  getTaskHealthScore,
  getTaskHealthColor
};
