import React from 'react';
import { formatTaskPriority, formatTaskStatus, formatTaskType, getTaskPriorityColor, getTaskStatusColor, getTaskTypeIcon, calculateDaysUntilDue, isTaskOverdue, getTaskHealthScore, getTaskHealthColor } from '../../../services/taskService';
import { formatDate, formatDateTime } from '../../../utils/dealUtils';
import { useProjectAccess } from '../../../hooks/useProjectAccess';
import { useDispatch } from 'react-redux';
import { deleteExistingTask, restoreExistingTask, fetchProjectTasks } from '../../../store/taskSlice';

const TaskListItem = ({
  task,
  isSelected,
  onSelect,
  onEdit,
  onView,
  projectId,
  showArchived = false
}) => {
  const dispatch = useDispatch();
  const handleSelect = () => {
    onSelect(task._id);
  };

  const { hasManagerAccess } = useProjectAccess();

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleView = (e) => {
    e.stopPropagation();
    onView(task._id);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteExistingTask({ projectId, taskId: task._id })).unwrap().then(() => {
      dispatch(fetchProjectTasks({ 
        projectId,
        params: { showArchived }
      }));
    });
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    dispatch(restoreExistingTask({ projectId, taskId: task._id })).unwrap().then(() => {
      dispatch(fetchProjectTasks({ 
        projectId,
        params: { showArchived }
      }));
    });
  };

  const getProgressPercentage = () => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === 'completed' ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.status === 'completed').length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  const progressPercentage = getProgressPercentage();
  const healthScore = getTaskHealthScore(task);
  const healthColor = getTaskHealthColor(healthScore);
  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
  const isOverdue = isTaskOverdue(task);

  return (
    <div className="grid grid-cols-10 gap-4 items-center px-6 py-4 hover:bg-gray-50">
      {/* Checkbox */}
      <div className="col-span-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      </div>

      {/* Task Info */}
      <div className="col-span-2">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getTaskTypeIcon(task.relatedTo)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="col-span-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {formatTaskType(task.type)}
        </span>
      </div>

      {/* Priority */}
      <div className="col-span-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
          {formatTaskPriority(task.priority)}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
          {formatTaskStatus(task.status)}
        </span>
      </div>

      {/* Due Date */}
      <div className="col-span-1">
        {task.dueDate ? (
          <div className="text-sm">
            <div className={`${isOverdue ? 'text-red-600 font-medium' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-900'}`}>
              <p>{formatDate(task.dueDate)}</p>
              {task.status !== 'completed' && (
                <span className="text-xs text-gray-500">{Math.abs(daysUntilDue)} days {daysUntilDue > 0 ? 'until due' : 'ago'}</span>
              )}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500">
                Overdue
              </div>
            )}
            {!isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && (
              <div className="text-xs text-yellow-500">
                Due soon
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">No due date</span>
        )}
      </div>

      {/* Progress */}
      <div className="col-span-1">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8">
            {progressPercentage}%
          </span>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {task.subtasks.filter(s => s.status === 'completed').length}/{task.subtasks.length} subtasks
          </div>
        )}
      </div>

      {/* Health Score */}
      <div className="col-span-1">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${healthColor}`} />
          <span className="text-sm font-medium text-gray-900">
            {healthScore}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleView}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="View Task"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          {hasManagerAccess && <>
            {task.isArchived ? (
              <button
                onClick={handleRestore}
                className="text-indigo-600 hover:text-indigo-900 p-1"
                title="Restore Task"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="text-gray-600 hover:text-gray-900 p-1"
                title="Edit Task"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete Task"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>}
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;
