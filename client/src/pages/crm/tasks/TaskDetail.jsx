import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchTask,
  updateTaskAction,
  archiveExistingTask,
  deleteExistingTask,
  addTaskCommentAction,
  updateTaskComment,
  deleteTaskComment,
  addTaskSubtask,
  updateTaskSubtask,
  completeSubtaskAction,
  deleteTaskSubtask,
  addTaskTag,
  removeTaskTag,
  addTaskCustomField,
  updateTaskCustomField,
  deleteTaskCustomField
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
import { formatDate, formatDateTime } from '../../../utils/dealUtils';
import CrmLayout from '../../../layouts/CrmLayout';

const TaskDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  
  const {
    currentTask: task,
    loading,
    error,
  } = useSelector((state) => state.tasks);
  
  const { users } = useSelector((state) => state.users);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newCustomFieldKey, setNewCustomFieldKey] = useState('');
  const [newCustomFieldValue, setNewCustomFieldValue] = useState('');

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTask(taskId));
      dispatch(getUsers());
    }
  }, [dispatch, taskId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateTaskAction({
        id: taskId,
        data: { status: newStatus }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await dispatch(updateTaskAction({
        id: taskId,
        data: { priority: newPriority }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update task priority:', error);
    }
  };

  const handleAssignMember = async (userId) => {
    try {
      await dispatch(updateTaskAction({
        id: taskId,
        data: { assignedTo: userId }
      })).unwrap();
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleUnassignMember = async () => {
    try {
      await dispatch(updateTaskAction({
        id: taskId,
        data: { assignedTo: null }
      })).unwrap();
    } catch (error) {
      console.error('Failed to unassign task:', error);
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(archiveExistingTask(taskId)).unwrap();
      navigate(`/crm/${projectId}/tasks`);
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteExistingTask(taskId)).unwrap();
      navigate(`/crm/${projectId}/tasks`);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await dispatch(addTaskCommentAction({
        taskId,
        content: newComment.trim()
      })).unwrap();
      setNewComment('');
      setShowAddComment(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    
    try {
      await dispatch(addTaskSubtask({
        taskId,
        data: { title: newSubtask.trim() }
      })).unwrap();
      setNewSubtask('');
      setShowAddSubtask(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleCompleteSubtask = async (subtaskId) => {
    try {
      await dispatch(completeSubtaskAction({ taskId, subtaskId })).unwrap();
    } catch (error) {
      console.error('Failed to complete subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await dispatch(deleteTaskSubtask({ taskId, subtaskId })).unwrap();
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      await dispatch(addTaskTag({
        taskId,
        data: { tag: newTag.trim() }
      })).unwrap();
      setNewTag('');
      setShowAddTag(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      await dispatch(removeTaskTag({ taskId, tag })).unwrap();
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleAddCustomField = async () => {
    if (!newCustomFieldKey.trim() || !newCustomFieldValue.trim()) return;
    
    try {
      await dispatch(addTaskCustomField({
        taskId,
        data: { key: newCustomFieldKey.trim(), value: newCustomFieldValue.trim() }
      })).unwrap();
      setNewCustomFieldKey('');
      setNewCustomFieldValue('');
      setShowAddCustomField(false);
    } catch (error) {
      console.error('Failed to add custom field:', error);
    }
  };

  const handleDeleteCustomField = async (key) => {
    try {
      await dispatch(deleteTaskCustomField({ taskId, key })).unwrap();
    } catch (error) {
      console.error('Failed to delete custom field:', error);
    }
  };

  const getResourceLink = (relatedEntity) => {
    if (!relatedEntity || !relatedEntity.type || !relatedEntity.entityId) {
      return null;
    }

    const basePath = `/crm/${projectId}`;
    switch (relatedEntity.type) {
      case 'deal':
        return `${basePath}/deals/${relatedEntity.entityId}`;
      case 'customer':
        return `${basePath}/customers/${relatedEntity.entityId}`;
      case 'company':
        return `${basePath}/companies/${relatedEntity.entityId}`;
      case 'lead':
        return `${basePath}/leads/${relatedEntity.entityId}`;
      default:
        return null;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'status_change':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'assigned':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'comment_added':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'subtask_added':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
      </div>
    );
  }

  const progressPercentage = task.subtasks && task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.status === 'completed').length / task.subtasks.length) * 100)
    : task.status === 'completed' ? 100 : 0;

  const healthScore = getTaskHealthScore(task);
  const healthColor = getTaskHealthColor(healthScore);
  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  const isOverdue = isTaskOverdue(task);

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/crm/${projectId}/tasks`)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                    {formatTaskStatus(task.status)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                    {formatTaskPriority(task.priority)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatTaskType(task.type)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V4" />
                </svg>
                Archive
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={task.assignedTo?._id || ''}
                  onChange={(e) => e.target.value ? handleAssignMember(e.target.value) : handleUnassignMember()}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Progress</div>
                <div className="text-lg font-bold text-indigo-600">{progressPercentage}%</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Health</div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${healthColor}`} />
                  <span className="text-lg font-bold text-gray-900">{healthScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'details', name: 'Details' },
              { id: 'subtasks', name: 'Subtasks' },
              { id: 'comments', name: 'Comments' },
              { id: 'activities', name: 'Activities' },
              { id: 'custom', name: 'Custom Fields' },
              { id: 'recurrence', name: 'Recurrence' },
              { id: 'reminders', name: 'Reminders' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Task Summary</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.description || 'No description provided'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Task Type</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {formatTaskType(task.type)}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Related To</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.relatedEntity ? (
                          <div className="flex items-center space-x-2">
                            <span className="capitalize">{task.relatedEntity.type}:</span>
                            {getResourceLink(task.relatedEntity) ? (
                              <Link
                                to={getResourceLink(task.relatedEntity)}
                                className="text-indigo-600 hover:text-indigo-800 underline"
                              >
                                {task.relatedEntity.entityName || 'View Details'}
                              </Link>
                            ) : (
                              <span>{task.relatedEntity.entityName || 'Unknown'}</span>
                            )}
                          </div>
                        ) : (
                          'No related entity'
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.assignedTo ? (
                          <div className="flex items-center space-x-2">
                            {task.assignedTo.profileImage ? (
                              <img
                                className="h-6 w-6 rounded-full"
                                src={task.assignedTo.profileImage}
                                alt={task.assignedTo.name}
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700">
                                  {task.assignedTo.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          'Unassigned'
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Progress & Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {task.subtasks.filter(s => s.status === 'completed').length}/{task.subtasks.length} subtasks completed
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Health Score</span>
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${healthColor}`} />
                          <span className="text-sm font-medium text-gray-900">{healthScore}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Based on completion rate, due date, and activity
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                        >
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M8 0L4 4L0 0h8z" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.startDate ? formatDate(task.startDate) : 'Not set'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.dueDate ? (
                          <div>
                            <div className={`${isOverdue ? 'text-red-600 font-medium' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-900'}`}>
                              {formatDate(task.dueDate)}
                            </div>
                            {isOverdue && (
                              <div className="text-xs text-red-500">Overdue</div>
                            )}
                            {!isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                              <div className="text-xs text-yellow-500">Due soon</div>
                            )}
                          </div>
                        ) : (
                          'No due date set'
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.completedAt ? formatDateTime(task.completedAt) : 'Not completed'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                      <dd className="text-sm text-gray-900 mt-1 capitalize">
                        {task.visibility || 'Project'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Time Tracking</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estimated Hours</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.estimatedHours ? `${task.estimatedHours} hours` : 'Not estimated'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Actual Hours</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.actualHours || 0} hours
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Progress</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.progress || 0}%
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Completion Notes</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {task.completionNotes || 'No completion notes'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {formatDateTime(task.createdAt)} by {task.createdBy?.name}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {formatDateTime(task.updatedAt)} by {task.updatedBy?.name}
                    </dd>
                  </div>
                  
                  {task.isArchived && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Archived</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {formatDateTime(task.archivedAt)} by {task.archivedBy?.name}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Subtasks</h3>
                <button
                  onClick={() => setShowAddSubtask(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Subtask
                </button>
              </div>
              
              {task.subtasks && task.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {subtask.title}
                        </span>
                        {subtask.status === 'pending' && (
                          <button
                            onClick={() => handleCompleteSubtask(subtask._id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Complete
                          </button>
                        )}
                        {subtask.status === 'completed' && (
                          <span className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600">
                            Completed
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSubtask(subtask._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No subtasks yet
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                <button
                  onClick={() => setShowAddComment(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Comment
                </button>
              </div>
              
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3 p-4 bg-gray-50 rounded-md">
                      <div className="flex-shrink-0">
                        {comment.createdBy?.profileImage ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={comment.createdBy.profileImage}
                            alt={comment.createdBy.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {comment.createdBy?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.createdBy?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(comment.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No comments yet
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
              
              {task.activityLog && task.activityLog.length > 0 ? (
                <div className="space-y-4">
                  {task.activityLog.map((activity, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity?.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity?.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(activity?.timestamp)}
                          </span>
                          {activity?.actor && (
                            <span className="text-xs text-gray-500">
                              by {activity?.actor?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activities yet
                </div>
              )}
            </div>
          )}

          {/* Custom Fields Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
                <button
                  onClick={() => setShowAddCustomField(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Field
                </button>
              </div>
              
              {task.customFields && Object.keys(task.customFields).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(task.customFields).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{key}:</span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomField(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No custom fields yet
                </div>
              )}
            </div>
          )}

          {/* Recurrence Tab */}
          {activeTab === 'recurrence' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recurrence Settings</h3>
              
              {task.recurrence && task.recurrence.enabled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Recurrence is enabled</span>
                    </div>
                  </div>
                  
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pattern</dt>
                      <dd className="text-sm text-gray-900 mt-1 capitalize">
                        {task.recurrence.pattern}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Interval</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        Every {task.recurrence.interval} {task.recurrence.pattern}(s)
                      </dd>
                    </div>
                    
                    {task.recurrence.pattern === 'weekly' && task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Days of Week</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {task.recurrence.daysOfWeek.map(day => {
                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                            return days[day];
                          }).join(', ')}
                        </dd>
                      </div>
                    )}
                    
                    {task.recurrence.endDate && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">End Date</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {formatDate(task.recurrence.endDate)}
                        </dd>
                      </div>
                    )}
                    
                    {task.recurrence.occurrences && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Occurrences</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {task.recurrence.occurrences} times
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">No recurrence set for this task</p>
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Reminders</h3>
              
              {task.reminders && task.reminders.length > 0 ? (
                <div className="space-y-3">
                  {task.reminders.map((reminder, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {reminder.type === 'email' && (
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {reminder.type === 'push' && (
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                            </svg>
                          )}
                          {reminder.type === 'sms' && (
                            <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {reminder.type} reminder
                          </p>
                          <p className="text-sm text-gray-500">
                            {reminder.trigger.replace('_', ' ')} ({reminder.offset} minutes)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {reminder.sent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Sent
                          </span>
                        )}
                        {reminder.sentAt && (
                          <span className="text-xs text-gray-500">
                            {formatDateTime(reminder.sentAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                  </svg>
                  <p className="mt-2">No reminders set for this task</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddComment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddComment(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your comment..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddComment(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddSubtask && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddSubtask(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Subtask</h3>
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter subtask title..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddSubtask(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Subtask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTag && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddTag(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Tag</h3>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter tag name..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddTag(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCustomField && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddCustomField(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Field</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCustomFieldKey}
                  onChange={(e) => setNewCustomFieldKey(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Field name..."
                />
                <input
                  type="text"
                  value={newCustomFieldValue}
                  onChange={(e) => setNewCustomFieldValue(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Field value..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddCustomField(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomField}
                  disabled={!newCustomFieldKey.trim() || !newCustomFieldValue.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Archive Task</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to archive this task? It will be moved to the archived tasks list.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </CrmLayout>
  );
};

export default TaskDetail;
