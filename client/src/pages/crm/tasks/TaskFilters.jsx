import React, { useState } from 'react';

const TaskFilters = ({ filters, onFilterChange, users }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: '',
      priority: '',
      assignedTo: '',
      relatedTo: '',
      dueDateFrom: '',
      dueDateTo: '',
      tags: '',
      isOverdue: false,
      hasSubtasks: false,
      hasComments: false,
      hasAttachments: false
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const relatedToOptions = [
    { value: '', label: 'All Types' },
    { value: 'deal', label: 'Deal' },
    { value: 'customer', label: 'Customer' },
    { value: 'company', label: 'Company' },
    { value: 'lead', label: 'Lead' },
    { value: 'project', label: 'Project' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Clear all filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            value={localFilters.assignedTo || ''}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Users</option>
            <option value="unassigned">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Related To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={localFilters.relatedTo || ''}
            onChange={(e) => handleFilterChange('relatedTo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {relatedToOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date From
          </label>
          <input
            type="date"
            value={localFilters.dueDateFrom || ''}
            onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Due Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date To
          </label>
          <input
            type="date"
            value={localFilters.dueDateTo || ''}
            onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={localFilters.tags || ''}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            placeholder="Enter tags (comma-separated)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Boolean Filters */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Additional Filters
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOverdue"
              checked={localFilters.isOverdue || false}
              onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isOverdue" className="ml-2 text-sm text-gray-700">
              Overdue only
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasSubtasks"
              checked={localFilters.hasSubtasks || false}
              onChange={(e) => handleFilterChange('hasSubtasks', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="hasSubtasks" className="ml-2 text-sm text-gray-700">
              Has subtasks
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasComments"
              checked={localFilters.hasComments || false}
              onChange={(e) => handleFilterChange('hasComments', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="hasComments" className="ml-2 text-sm text-gray-700">
              Has comments
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasAttachments"
              checked={localFilters.hasAttachments || false}
              onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="hasAttachments" className="ml-2 text-sm text-gray-700">
              Has attachments
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value || (typeof value === 'boolean' && !value)) return null;
            
            let displayValue = value;
            if (key === 'assignedTo' && value !== 'unassigned') {
              const user = users.find(u => u._id === value);
              displayValue = user ? user.name : value;
            } else if (key === 'status') {
              const status = statusOptions.find(s => s.value === value);
              displayValue = status ? status.label : value;
            } else if (key === 'priority') {
              const priority = priorityOptions.find(p => p.value === value);
              displayValue = priority ? priority.label : value;
            } else if (key === 'relatedTo') {
              const relatedTo = relatedToOptions.find(r => r.value === value);
              displayValue = relatedTo ? relatedTo.label : value;
            } else if (typeof value === 'boolean') {
              displayValue = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            }

            return (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {displayValue}
                <button
                  onClick={() => handleFilterChange(key, key === 'isOverdue' || key === 'hasSubtasks' || key === 'hasComments' || key === 'hasAttachments' ? false : '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M8 0L4 4L0 0h8z" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
