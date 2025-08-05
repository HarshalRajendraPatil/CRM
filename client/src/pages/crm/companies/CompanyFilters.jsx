import React, { useState, useRef, useEffect } from 'react';
import { Popover } from '@headlessui/react';

const CompanyFilters = ({ filters, onFilterChange, industries = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const popoverButtonRef = useRef(null);

  // Sync local filters with props when filters change
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' },
    { value: 'partner', label: 'Partner' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'competitor', label: 'Competitor' }
  ];

  // Industry options
  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    ...industries.filter(industry => industry && industry !== 'unknown').map(industry => ({
      value: industry.toLowerCase(),
      label: industry
    }))
  ];

  // Common tag options (can be expanded)
  const tagOptions = [
    'VIP',
    'Key Account',
    'Enterprise',
    'SMB',
    'Startup',
    'Hot Lead',
    'Cold Lead',
    'Qualified',
    'Negotiation',
    'Churned',
    'Renewal'
  ];

  // Handle status change
  const handleStatusChange = (e) => {
    const newFilters = { ...localFilters, status: e.target.value };
    setLocalFilters(newFilters);
  };

  // Handle industry change
  const handleIndustryChange = (e) => {
    const newFilters = { ...localFilters, industry: e.target.value };
    setLocalFilters(newFilters);
  };

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
      status: 'all',
      industry: 'all',
      tags: []
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.industry !== 'all') count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            ref={popoverButtonRef}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {getActiveFilterCount()}
              </span>
            )}
          </Popover.Button>

          {open && (
            <Popover.Panel
              static
              className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-4 z-10 ring-1 ring-black ring-opacity-5"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={localFilters.status}
                    onChange={handleStatusChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    id="industry-filter"
                    value={localFilters.industry}
                    onChange={handleIndustryChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium ${
                          localFilters.tags.includes(tag)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Reset filters
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  );
};

export default CompanyFilters;