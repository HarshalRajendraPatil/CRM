import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const CustomerFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      stage: '',
      status: '',
      source: '',
      priority: '',
      owner: null,
      assignedTo: null,
      tags: []
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const stages = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'customer', label: 'Customer' },
    { value: 'churned', label: 'Churned' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const sources = [
    { value: 'web', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'referral', label: 'Referral' },
    { value: 'event', label: 'Event' },
    { value: 'ads', label: 'Advertising' },
    { value: 'social', label: 'Social Media' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage
          </label>
          <select
            value={localFilters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <select
            value={localFilters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Sources</option>
            {sources.map(source => (
              <option key={source.value} value={source.value}>
                {source.label}
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
            value={localFilters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>



      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created From
          </label>
          <input
            type="date"
            value={localFilters.createdFrom || ''}
            onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created To
          </label>
          <input
            type="date"
            value={localFilters.createdTo || ''}
            onChange={(e) => handleFilterChange('createdTo', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Last Activity Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Activity From
          </label>
          <input
            type="date"
            value={localFilters.lastActivityFrom || ''}
            onChange={(e) => handleFilterChange('lastActivityFrom', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Activity To
          </label>
          <input
            type="date"
            value={localFilters.lastActivityTo || ''}
            onChange={(e) => handleFilterChange('lastActivityTo', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          placeholder="enterprise, vip, hot-lead"
          value={localFilters.tagsInput || ''}
          onChange={(e) => handleFilterChange('tagsInput', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Company Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          type="text"
          placeholder="Search by company name"
          value={localFilters.companyName || ''}
          onChange={(e) => handleFilterChange('companyName', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Job Title Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Title
        </label>
        <input
          type="text"
          placeholder="CEO, Manager, Director"
          value={localFilters.jobTitle || ''}
          onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Industry Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <input
          type="text"
          placeholder="Technology, Healthcare, Finance"
          value={localFilters.industry || ''}
          onChange={(e) => handleFilterChange('industry', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Score Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={localFilters.minScore || ''}
            onChange={(e) => handleFilterChange('minScore', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="100"
            value={localFilters.maxScore || ''}
            onChange={(e) => handleFilterChange('maxScore', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>



      {/* Communication Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Contact Method
        </label>
        <select
          value={localFilters.preferredContactMethod || ''}
          onChange={(e) => handleFilterChange('preferredContactMethod', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Methods</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {/* Lifecycle Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lifecycle Stage
        </label>
        <select
          value={localFilters.lifecycleStage || ''}
          onChange={(e) => handleFilterChange('lifecycleStage', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Lifecycle Stages</option>
          <option value="awareness">Awareness</option>
          <option value="consideration">Consideration</option>
          <option value="decision">Decision</option>
          <option value="retention">Retention</option>
          <option value="advocacy">Advocacy</option>
        </select>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          size="sm"
        >
          Clear All
        </Button>
        <Button
          variant="primary"
          onClick={handleApplyFilters}
          size="sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default CustomerFilters;
