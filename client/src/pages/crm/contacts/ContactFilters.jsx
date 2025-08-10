import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ContactFilters = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  viewMode, 
  onViewModeChange,
  selectedCount,
  totalCount 
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { companies } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      search: '',
      stage: 'all',
      status: 'all',
      assignedTo: 'all',
      company: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.stage !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.assignedTo !== 'all') count++;
    if (filters.company !== 'all') count++;
    return count;
  };
  
  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'customer', label: 'Customer' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'lost', label: 'Lost' },
    { value: 'other', label: 'Other' }
  ];
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
    { value: 'bounced', label: 'Bounced' },
    { value: 'other', label: 'Other' }
  ];
  
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'company', label: 'Company' },
    { value: 'leadScore', label: 'Lead Score' },
    { value: 'lastActivityDate', label: 'Last Activity' }
  ];
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      {/* Search and View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <label htmlFor="search" className="sr-only">Search contacts</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search contacts by name, email, company..."
            />
          </div>
        </div>
        
        {/* View Mode and Results */}
        <div className="flex items-center space-x-4">
          {/* Results Count */}
          <div className="text-sm text-gray-500">
            {selectedCount > 0 ? (
              <span>{selectedCount} of {totalCount} selected</span>
            ) : (
              <span>{totalCount} contacts</span>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
        
        {/* Stage Filter */}
        <select
          value={filters.stage}
          onChange={(e) => handleFilterChange('stage', e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {stageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Assigned To Filter */}
        <select
          value={filters.assignedTo}
          onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Users</option>
          <option value="me">Assigned to Me</option>
          <option value="unassigned">Unassigned</option>
          {/* Add more user options here */}
        </select>
        
        {/* Company Filter */}
        <select
          value={filters.company}
          onChange={(e) => handleFilterChange('company', e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Companies</option>
          {companies.map(company => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        
        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Sort Order */}
        <button
          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className={`h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
      
      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Advanced Filters
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all filters
          </button>
        )}
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Lead Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Score Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Date Created Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Created
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Last Activity Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Activity
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="event">Event</option>
                <option value="social_media">Social Media</option>
                <option value="advertising">Advertising</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g., Sales, Marketing"
                className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags separated by commas"
                className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFilters;
