import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchProjectTasks,
  setFilters,
  setViewMode,
  setGroupBy,
  setSortOptions,
  selectTask,
  selectAllTasks,
  clearSelection,
  toggleCreateSidebar,
  toggleEditSidebar,
  toggleBulkActions,
  bulkUpdateTasksAction,
  bulkArchiveTasksAction,
  bulkDeleteTasksAction,
  updateTaskStatusAction,
  assignTaskAction,
  archiveExistingTask,
  deleteExistingTask
} from '../../../store/taskSlice';
import { getUsers } from '../../../store/userSlice';
import {
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
} from '../../../services/taskService';
import TaskListItem from './TaskListItem';
import TaskFilters from './TaskFilters';
import CreateTaskSidebar from './CreateTaskSidebar';
import EditTaskSidebar from './EditTaskSidebar';
import TaskDetail from './TaskDetail';
import TaskStats from './TaskStats';
import TaskKanban from './TaskKanban';
import BulkActionsModal from './BulkActionsModal';
import BulkAssignModal from './BulkAssignModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ArchiveConfirmModal from './ArchiveConfirmModal';
import CrmLayout from '../../../layouts/CrmLayout';

const Tasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const {
    tasks,
    loading,
    error,
    success,
    filters,
    pagination,
    selectedTasks,
    viewMode,
    groupBy,
    sortBy,
    sortOrder,
    showCreateSidebar,
    showEditSidebar,
    showTaskDetail,
    showBulkActions,
    showDeleteConfirm,
    showArchiveConfirm,
    currentTask
  } = useSelector((state) => state.tasks);
  
  const { users } = useSelector((state) => state.users);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [archivingTask, setArchivingTask] = useState(null);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks({ projectId, params: { ...filters } }));
      dispatch(getUsers());
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks({ projectId, params: { ...filters } }));
    }
  }, [dispatch, projectId, filters]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleSortChange = (field) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setSortOptions({ sortBy: field, sortOrder: newSortOrder }));
  };

  const handleLoadMore = () => {
    if (pagination.current < pagination.pages) {
      dispatch(fetchProjectTasks({
        projectId,
        params: {
          ...filters,
          page: pagination.current + 1
        }
      }));
    }
  };

  const handleTaskSelect = (taskId) => {
    dispatch(selectTask(taskId));
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllTasks());
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedTasks.length === 0) return;
    
    try {
      await dispatch(bulkUpdateTasksAction({
        taskIds: selectedTasks,
        updates: { status: newStatus }
      })).unwrap();
      dispatch(clearSelection());
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleBulkAssign = async (assignedTo) => {
    if (selectedTasks.length === 0) return;
    
    try {
      await dispatch(bulkUpdateTasksAction({
        taskIds: selectedTasks,
        updates: { assignedTo }
      })).unwrap();
      dispatch(clearSelection());
    } catch (error) {
      console.error('Failed to assign tasks:', error);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      await dispatch(bulkArchiveTasksAction(selectedTasks)).unwrap();
      dispatch(clearSelection());
    } catch (error) {
      console.error('Failed to archive tasks:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      await dispatch(bulkDeleteTasksAction(selectedTasks)).unwrap();
      dispatch(clearSelection());
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    dispatch(toggleEditSidebar());
  };

  const handleViewTask = (taskId) => {
    navigate(`/crm/${projectId}/tasks/${taskId}`);
  };

  const handleArchiveTask = (task) => {
    setArchivingTask(task);
  };

  const handleDeleteTask = (task) => {
    setDeletingTask(task);
  };

  const confirmArchive = async () => {
    if (archivingTask) {
      try {
        await dispatch(archiveExistingTask(archivingTask._id)).unwrap();
        setArchivingTask(null);
      } catch (error) {
        console.error('Failed to archive task:', error);
      }
    }
  };

  const confirmDelete = async () => {
    if (deletingTask) {
      try {
        await dispatch(deleteExistingTask(deletingTask._id)).unwrap();
        setDeletingTask(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleBulkAction = (action) => {
    setBulkAction(action);
    switch (action) {
      case 'status':
        dispatch(toggleBulkActions());
        break;
      case 'assign':
        dispatch(toggleBulkActions());
        break;
      case 'archive':
        handleBulkArchive();
        break;
      case 'delete':
        handleBulkDelete();
        break;
      default:
        break;
    }
  };

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-10 gap-4 items-center text-sm font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          <div className="col-span-2">Task</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Due Date</div>
          <div className="col-span-1">Progress</div>
          <div className="col-span-1">Health</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <TaskListItem
            key={task._id}
            task={task}
            isSelected={selectedTasks.includes(task._id)}
            onSelect={handleTaskSelect}
            onEdit={handleEditTask}
            onView={handleViewTask}
            onArchive={handleArchiveTask}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.current < pagination.pages && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );

  const renderKanbanView = () => (
    <TaskKanban
      projectId={projectId}
      onEditTask={handleEditTask}
      onViewTask={handleViewTask}
      onArchiveTask={handleArchiveTask}
      onDeleteTask={handleDeleteTask}
    />
  );

  const renderStatsView = () => (
    <TaskStats projectId={projectId} />
  );

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track your project tasks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </button>
          
          <button
            onClick={() => dispatch(toggleCreateSidebar())}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'list', name: 'List View' },
            { id: 'kanban', name: 'Kanban' },
            { id: 'stats', name: 'Statistics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setViewMode(tab.id))}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {selectedTasks.length} selected
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleBulkAction('status')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Update Status
              </button>
              <button
                onClick={() => handleBulkAction('assign')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          users={users}
        />
      )}

      {/* Content */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'stats' && renderStatsView()}

      {/* Sidebars */}
      {showCreateSidebar && (
        <CreateTaskSidebar
          isOpen={showCreateSidebar}
          onClose={() => dispatch(toggleCreateSidebar())}
          projectId={projectId}
        />
      )}

      {showEditSidebar && editingTask && (
        <EditTaskSidebar
          isOpen={showEditSidebar}
          onClose={() => {
            setEditingTask(null);
            dispatch(toggleEditSidebar());
          }}
          task={editingTask}
          projectId={projectId}
        />
      )}

      {/* Modals */}
      {showBulkActions && (
        <BulkActionsModal
          isOpen={showBulkActions}
          onClose={() => dispatch(toggleBulkActions())}
          action={bulkAction}
          selectedCount={selectedTasks.length}
          onStatusUpdate={handleBulkStatusUpdate}
          onAssign={handleBulkAssign}
          users={users}
        />
      )}

      {showDeleteConfirm && deletingTask && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setDeletingTask(null)}
          task={deletingTask}
          onConfirm={confirmDelete}
        />
      )}

      {showArchiveConfirm && archivingTask && (
        <ArchiveConfirmModal
          isOpen={showArchiveConfirm}
          onClose={() => setArchivingTask(null)}
          task={archivingTask}
          onConfirm={confirmArchive}
        />
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </CrmLayout>
  );
};

export default Tasks;
