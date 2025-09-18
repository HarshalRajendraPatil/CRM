import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTasks, updateTaskAction } from '../../../store/taskSlice';
import { formatTaskPriority, formatTaskStatus, getTaskPriorityColor, getTaskStatusColor, calculateDaysUntilDue, isTaskOverdue } from '../../../services/taskService';
import { formatDate } from '../../../utils/dealUtils';

const TaskKanban = ({ projectId, onEditTask, onViewTask, onArchiveTask, onDeleteTask }) => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks({ projectId, params: { isArchived: false } }));
    }
  }, [dispatch, projectId]);

  const statusColumns = [
    { id: 'pending', name: 'Pending', color: 'bg-gray-100' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-100' },
    { id: 'completed', name: 'Completed', color: 'bg-green-100' },
    { id: 'on_hold', name: 'On Hold', color: 'bg-yellow-100' },
    { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(status);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        await dispatch(updateTaskAction({
          id: draggedTask._id,
          data: { status: targetStatus }
        })).unwrap();
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
    
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDragOver = draggedOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${isDragOver ? 'bg-indigo-50' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`rounded-lg ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{column.name}</h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const daysUntilDue = calculateDaysUntilDue(task.dueDate);
                  const isOverdue = isTaskOverdue(task);
                  
                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => onEditTask(task)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Edit Task"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onViewTask(task._id)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="View Task"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Priority */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                          {formatTaskPriority(task.priority)}
                        </span>
                        
                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="text-xs">
                            <span className={`${isOverdue ? 'text-red-600 font-medium' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {formatDate(task.dueDate)}
                            </span>
                            {isOverdue && (
                              <div className="text-red-500">Overdue</div>
                            )}
                            {!isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                              <div className="text-yellow-500">Due soon</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Assigned User */}
                      {task.assignedTo && (
                        <div className="flex items-center space-x-2 mb-3">
                          {task.assignedTo.profileImage ? (
                            <img
                              className="h-5 w-5 rounded-full"
                              src={task.assignedTo.profileImage}
                              alt={task.assignedTo.name}
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {task.assignedTo.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-600 truncate">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}

                      {/* Progress */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.round((task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onArchiveTask(task)}
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="Archive Task"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteTask(task)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Task"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Comments Count */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No tasks in {column.name.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanban;
