import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
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
  completeSubtask,
} from '../services/taskService';

// Async thunks
export const fetchProjectTasks = createAsyncThunk(
  'tasks/fetchProjectTasks',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getProjectTasks(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchUserTasks = createAsyncThunk(
  'tasks/fetchUserTasks',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getUserTasks(userId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await getTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createNewTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateExistingTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTask(taskId, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteExistingTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const archiveExistingTask = createAsyncThunk(
  'tasks/archiveTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await archiveTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive task');
    }
  }
);

export const restoreExistingTask = createAsyncThunk(
  'tasks/restoreTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await restoreTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restore task');
    }
  }
);

export const updateTaskStatusAction = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status, notes = '' }, { rejectWithValue }) => {
    try {
      const response = await updateTaskStatus(taskId, status, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
    }
  }
);

export const assignTaskAction = createAsyncThunk(
  'tasks/assignTask',
  async ({ taskId, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await assignTask(taskId, assignedTo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign task');
    }
  }
);

export const addTaskCommentAction = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ taskId, content, mentions = [] }, { rejectWithValue }) => {
    try {
      const response = await addTaskComment(taskId, content, mentions);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const addSubtaskAction = createAsyncThunk(
  'tasks/addSubtask',
  async ({ taskId, subtaskData }, { rejectWithValue }) => {
    try {
      const response = await addSubtask(taskId, subtaskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subtask');
    }
  }
);

export const updateSubtaskAction = createAsyncThunk(
  'tasks/updateSubtask',
  async ({ taskId, subtaskId, subtaskData }, { rejectWithValue }) => {
    try {
      const response = await updateSubtask(taskId, subtaskId, subtaskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subtask');
    }
  }
);

export const completeSubtaskAction = createAsyncThunk(
  'tasks/completeSubtask',
  async ({ taskId, subtaskId }, { rejectWithValue }) => {
    try {
      const response = await completeSubtask(taskId, subtaskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete subtask');
    }
  }
);

export const deleteSubtaskAction = createAsyncThunk(
  'tasks/deleteSubtask',
  async ({ taskId, subtaskId }, { rejectWithValue }) => {
    try {
      const response = await deleteSubtask(taskId, subtaskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
    }
  }
);

export const bulkUpdateTasksAction = createAsyncThunk(
  'tasks/bulkUpdateTasks',
  async ({ taskIds, updates }, { rejectWithValue }) => {
    try {
      const response = await bulkUpdateTasks(taskIds, updates);
      return { taskIds, updates, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update tasks');
    }
  }
);

export const bulkDeleteTasksAction = createAsyncThunk(
  'tasks/bulkDeleteTasks',
  async (taskIds, { rejectWithValue }) => {
    try {
      const response = await bulkDeleteTasks(taskIds);
      return { taskIds, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete tasks');
    }
  }
);

export const bulkArchiveTasksAction = createAsyncThunk(
  'tasks/bulkArchiveTasks',
  async (taskIds, { rejectWithValue }) => {
    try {
      const response = await bulkArchiveTasks(taskIds);
      return { taskIds, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk archive tasks');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getTaskStats(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task stats');
    }
  }
);

export const fetchOverdueTasks = createAsyncThunk(
  'tasks/fetchOverdueTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getOverdueTasks(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue tasks');
    }
  }
);

export const fetchTasksByEntity = createAsyncThunk(
  'tasks/fetchTasksByEntity',
  async ({ entityType, entityId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getTasksByEntity(entityType, entityId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch entity tasks');
    }
  }
);

export const exportTasksAction = createAsyncThunk(
  'tasks/exportTasks',
  async ({ projectId, format = 'json', filters = {} }, { rejectWithValue }) => {
    try {
      const response = await exportTasks(projectId, format, filters);
      return { data: response.data, format };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export tasks');
    }
  }
);

// Additional async thunks for task management
export const createTaskAction = createAsyncThunk(
  'tasks/createTaskAction',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTaskAction = createAsyncThunk(
  'tasks/updateTaskAction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateTask(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const fetchTaskActivities = createAsyncThunk(
  'tasks/fetchTaskActivities',
  async (taskId, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await getTask(taskId);
      return response.data.activities || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task activities');
    }
  }
);

// export const addTaskComment = createAsyncThunk(
//   'tasks/addTaskComment',
//   async ({ taskId, data }, { rejectWithValue }) => {
//     try {
//       const response = await addTaskComment(taskId, data.content, data.mentionedUsers || []);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
//     }
//   }
// );

export const updateTaskComment = createAsyncThunk(
  'tasks/updateTaskComment',
  async ({ taskId, commentId, data }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        'comments.$[elem].content': data.content 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteTaskComment = createAsyncThunk(
  'tasks/deleteTaskComment',
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        $pull: { comments: { _id: commentId } }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const addTaskSubtask = createAsyncThunk(
  'tasks/addTaskSubtask',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await addSubtask(taskId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subtask');
    }
  }
);

export const updateTaskSubtask = createAsyncThunk(
  'tasks/updateTaskSubtask',
  async ({ taskId, subtaskId, data }, { rejectWithValue }) => {
    try {
      const response = await updateSubtask(taskId, subtaskId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subtask');
    }
  }
);

export const deleteTaskSubtask = createAsyncThunk(
  'tasks/deleteTaskSubtask',
  async ({ taskId, subtaskId }, { rejectWithValue }) => {
    try {
      const response = await deleteSubtask(taskId, subtaskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
    }
  }
);

export const addTaskTag = createAsyncThunk(
  'tasks/addTaskTag',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        $addToSet: { tags: data.tag }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add tag');
    }
  }
);

export const removeTaskTag = createAsyncThunk(
  'tasks/removeTaskTag',
  async ({ taskId, tag }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        $pull: { tags: tag }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove tag');
    }
  }
);

export const addTaskCustomField = createAsyncThunk(
  'tasks/addTaskCustomField',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        [`customFields.${data.key}`]: data.value
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add custom field');
    }
  }
);

export const updateTaskCustomField = createAsyncThunk(
  'tasks/updateTaskCustomField',
  async ({ taskId, key, data }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        [`customFields.${key}`]: data.value
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update custom field');
    }
  }
);

export const deleteTaskCustomField = createAsyncThunk(
  'tasks/deleteTaskCustomField',
  async ({ taskId, key }, { rejectWithValue }) => {
    try {
      // This would need to be implemented in the service
      const response = await updateTask(taskId, { 
        $unset: { [`customFields.${key}`]: 1 }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete custom field');
    }
  }
);

export const fetchTaskInsights = createAsyncThunk(
  'tasks/fetchTaskInsights',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getTaskInsights(projectId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task insights');
    }
  }
);

// Initial state
const initialState = {
  // Task lists
  tasks: [],
  userTasks: [],
  currentTask: null,
  overdueTasks: [],
  entityTasks: [],
  archivedTasks: [],
  
  // Task statistics
  stats: null,
  insights: null,
  activities: [],
  comments: [],
  
  // UI state
  loading: false,
  error: null,
  success: null,
  
  // Filters and pagination
  filters: {
    status: [],
    priority: [],
    type: [],
    assignedTo: [],
    overdue: false,
    search: '',
    dateRange: null
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  },
  
  // Selection state
  selectedTasks: [],
  
  // View state
  viewMode: 'list', // 'list', 'kanban', 'calendar'
  groupBy: 'status',
  sortBy: 'dueDate',
  sortOrder: 'asc',
  
  // Sidebar state
  showCreateSidebar: false,
  showEditSidebar: false,
  showTaskDetail: false,
  
  // Modal state
  showDeleteConfirm: false,
  showArchiveConfirm: false,
  showBulkActions: false,
  
  // Current project context
  currentProjectId: null
};

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Set group by
    setGroupBy: (state, action) => {
      state.groupBy = action.payload;
    },
    
    // Set sort options
    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    // Task selection
    selectTask: (state, action) => {
      const taskId = action.payload;
      if (!state.selectedTasks.includes(taskId)) {
        state.selectedTasks.push(taskId);
      }
    },
    
    deselectTask: (state, action) => {
      const taskId = action.payload;
      state.selectedTasks = state.selectedTasks.filter(id => id !== taskId);
    },
    
    selectAllTasks: (state) => {
      state.selectedTasks = state.tasks.map(task => task._id);
    },
    
    clearSelection: (state) => {
      state.selectedTasks = [];
    },
    
    // Sidebar controls
    toggleCreateSidebar: (state) => {
      state.showCreateSidebar = !state.showCreateSidebar;
    },
    
    toggleEditSidebar: (state) => {
      state.showEditSidebar = !state.showEditSidebar;
    },
    
    toggleTaskDetail: (state) => {
      state.showTaskDetail = !state.showTaskDetail;
    },
    
    // Modal controls
    toggleDeleteConfirm: (state) => {
      state.showDeleteConfirm = !state.showDeleteConfirm;
    },
    
    toggleArchiveConfirm: (state) => {
      state.showArchiveConfirm = !state.showArchiveConfirm;
    },
    
    toggleBulkActions: (state) => {
      state.showBulkActions = !state.showBulkActions;
    },
    
    // Set current project
    setCurrentProject: (state, action) => {
      state.currentProjectId = action.payload;
    },
    
    // Set current task
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    
    // Clear current task
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    
    // Update task in list (optimistic updates)
    updateTaskInList: (state, action) => {
      const updatedTask = action.payload;
      const index = state.tasks.findIndex(task => task._id === updatedTask._id);
      if (index !== -1) {
        state.tasks[index] = updatedTask;
      }
    },
    
    // Remove task from list
    removeTaskFromList: (state, action) => {
      const taskId = action.payload;
      state.tasks = state.tasks.filter(task => task._id !== taskId);
      state.selectedTasks = state.selectedTasks.filter(id => id !== taskId);
    },
    
    // Add task to list
    addTaskToList: (state, action) => {
      const newTask = action.payload;
      state.tasks.unshift(newTask);
    },
    
    // Reset state
    resetTaskState: (state) => {
      return { ...initialState, currentProjectId: state.currentProjectId };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project tasks
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.userTasks = action.payload.data;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single task
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.data;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update task
      .addCase(updateTaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(updateTaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create task
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload.data);
        state.success = action.payload.message;
        state.showCreateSidebar = false;
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update task
      .addCase(updateExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
        state.showEditSidebar = false;
      })
      .addCase(updateExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete task
      .addCase(deleteExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        state.tasks = state.tasks.filter(task => task._id !== taskId);
        state.selectedTasks = state.selectedTasks.filter(id => id !== taskId);
        if (state.currentTask && state.currentTask._id === taskId) {
          state.currentTask = null;
        }
        state.success = 'Task deleted successfully';
        state.showDeleteConfirm = false;
      })
      .addCase(deleteExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Archive task
      .addCase(archiveExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const archivedTask = action.payload.data;
        state.tasks = state.tasks.filter(task => task._id !== archivedTask._id);
        state.selectedTasks = state.selectedTasks.filter(id => id !== archivedTask._id);
        state.success = action.payload.message;
        state.showArchiveConfirm = false;
      })
      .addCase(archiveExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Restore task
      .addCase(restoreExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const restoredTask = action.payload.data;
        state.tasks.unshift(restoredTask);
        state.success = action.payload.message;
      })
      .addCase(restoreExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update task status
      .addCase(updateTaskStatusAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatusAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(updateTaskStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Assign task
      .addCase(assignTaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(assignTaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add task comment
      .addCase(addTaskCommentAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskCommentAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(addTaskCommentAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add subtask
      .addCase(addSubtaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubtaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(addSubtaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add task subtask
      .addCase(addTaskSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskSubtask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(addTaskSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update task subtask
      .addCase(updateTaskSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskSubtask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(updateTaskSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete task subtask
      .addCase(deleteTaskSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaskSubtask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(deleteTaskSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update subtask
      .addCase(updateSubtaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubtaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(updateSubtaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Complete subtask
      .addCase(completeSubtaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSubtaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(completeSubtaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete subtask
      .addCase(deleteSubtaskAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubtaskAction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        const index = state.tasks.findIndex(task => task._id === updatedTask._id);
        if (index !== -1) {
          state.tasks[index] = updatedTask;
        }
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.success = action.payload.message;
      })
      .addCase(deleteSubtaskAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk update tasks
      .addCase(bulkUpdateTasksAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateTasksAction.fulfilled, (state, action) => {
        state.loading = false;
        const { taskIds, updates } = action.payload;
        state.tasks = state.tasks.map(task => 
          taskIds.includes(task._id) ? { ...task, ...updates } : task
        );
        state.selectedTasks = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkUpdateTasksAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk delete tasks
      .addCase(bulkDeleteTasksAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteTasksAction.fulfilled, (state, action) => {
        state.loading = false;
        const { taskIds } = action.payload;
        state.tasks = state.tasks.filter(task => !taskIds.includes(task._id));
        state.selectedTasks = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkDeleteTasksAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk archive tasks
      .addCase(bulkArchiveTasksAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkArchiveTasksAction.fulfilled, (state, action) => {
        state.loading = false;
        const { taskIds } = action.payload;
        state.tasks = state.tasks.filter(task => !taskIds.includes(task._id));
        state.selectedTasks = [];
        state.success = action.payload.message;
        state.showBulkActions = false;
      })
      .addCase(bulkArchiveTasksAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch task stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch overdue tasks
      .addCase(fetchOverdueTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueTasks = action.payload.data;
      })
      .addCase(fetchOverdueTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch tasks by entity
      .addCase(fetchTasksByEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entityTasks = action.payload.data;
      })
      .addCase(fetchTasksByEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Export tasks
      .addCase(exportTasksAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportTasksAction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Tasks exported successfully';
      })
      .addCase(exportTasksAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch task insights
      .addCase(fetchTaskInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(fetchTaskInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch task activities
      .addCase(fetchTaskActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchTaskActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearMessages,
  setFilters,
  clearFilters,
  setPagination,
  setViewMode,
  setGroupBy,
  setSortOptions,
  selectTask,
  deselectTask,
  selectAllTasks,
  clearSelection,
  toggleCreateSidebar,
  toggleEditSidebar,
  toggleTaskDetail,
  toggleDeleteConfirm,
  toggleArchiveConfirm,
  toggleBulkActions,
  setCurrentProject,
  setCurrentTask,
  clearCurrentTask,
  updateTaskInList,
  removeTaskFromList,
  addTaskToList,
  resetTaskState
} = taskSlice.actions;

export default taskSlice.reducer;
