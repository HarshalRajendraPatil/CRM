import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEntityActivities, 
  setEntityFilters, 
  setEntityPagination,
  resetEntityPagination,
  clearSelectedActivities,
  setShowFilters,
  setShowBulkActions
} from '../../store/activitySlice';
import { format } from 'date-fns';
import { 
  ClockIcon, 
  UserIcon, 
  TagIcon, 
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

const ActivityTimeline = ({ entityType, entityId, projectId }) => {
  const dispatch = useDispatch();
  const { 
    entityActivities, 
    entityActivitiesLoading, 
    entityActivitiesError,
    entityFilters,
    entityPagination,
    selectedActivities,
    showFilters
  } = useSelector(state => state.activity);

  const [showMore, setShowMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (entityId) {
      dispatch(fetchEntityActivities({ 
        projectId,
        entityType, 
        entityId, 
        params: { ...entityFilters, skip: (currentPage - 1) * entityPagination.limit }
      }));
    }
  }, [dispatch, entityType, entityId, entityFilters, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [entityFilters]);

  const handleFilterChange = (key, value) => {
    dispatch(setEntityFilters({ [key]: value }));
    dispatch(resetEntityPagination());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    const totalPages = Math.ceil(entityPagination.total / entityPagination.limit);
    setCurrentPage(totalPages);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(entityPagination.total / entityPagination.limit);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(entityPagination.total / entityPagination.limit);
  const startItem = (currentPage - 1) * entityPagination.limit + 1;
  const endItem = Math.min(currentPage * entityPagination.limit, entityPagination.total);

  const getActivityIcon = (activityType, category) => {
    const iconClass = "w-5 h-5";
    
    switch (category) {
      case 'creation':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'update':
        return <DocumentTextIcon className={`${iconClass} text-blue-500`} />;
      case 'deletion':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'status_change':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'assignment':
        return <UserGroupIcon className={`${iconClass} text-purple-500`} />;
      case 'interaction':
        return <DocumentTextIcon className={`${iconClass} text-indigo-500`} />;
      case 'conversion':
        return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getActivityColor = (category) => {
    switch (category) {
      case 'creation':
        return 'bg-green-50 border-green-200';
      case 'update':
        return 'bg-blue-50 border-blue-200';
      case 'deletion':
        return 'bg-red-50 border-red-200';
      case 'status_change':
        return 'bg-yellow-50 border-yellow-200';
      case 'assignment':
        return 'bg-purple-50 border-purple-200';
      case 'interaction':
        return 'bg-indigo-50 border-indigo-200';
      case 'conversion':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const renderActivityItem = (activity) => {
    // Defensive programming - ensure activity has required fields
    if (!activity || !activity._id) {
      console.warn('Invalid activity data:', activity);
      return null;
    }

    return (
    <div key={activity._id} className="relative flex items-start space-x-3 pb-6">
      {/* Timeline line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
      
      {/* Activity icon */}
      <div className={`relative flex-shrink-0 w-8 h-8 rounded-full border-2 ${getActivityColor(activity.category)} flex items-center justify-center`}>
        {getActivityIcon(activity.activityType, activity.category)}
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {activity.performedBy?.name || activity.performedBy?.email || 'System'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatActivityTime(activity.createdAt)}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {activity.description || 'No description available'}
              </p>
              
              {activity.changes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium text-gray-600 mb-1">Changes:</div>
                  <div className="text-gray-700">
                    <span className="font-medium">{activity.changes.field}:</span>
                    <span className="text-red-600 line-through ml-1">
                      {typeof activity.changes.oldValue === 'object' 
                        ? JSON.stringify(activity.changes.oldValue) 
                        : activity.changes.oldValue}
                    </span>
                    <span className="text-green-600 ml-1">
                      {typeof activity.changes.newValue === 'object' 
                        ? JSON.stringify(activity.changes.newValue) 
                        : activity.changes.newValue}
                    </span>
                  </div>
                </div>
              )}
              
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(activity.metadata).map(([key, value]) => {
                    // Safely render the value, handling objects and arrays
                    const renderValue = (val) => {
                      if (val === null || val === undefined) return 'N/A';
                      if (typeof val === 'object') {
                        if (Array.isArray(val)) {
                          return val.join(', ');
                        }
                        // For objects, show a summary or stringify
                        if (val._id) return val._id.toString();
                        if (val.name) return val.name;
                        if (val.email) return val.email;
                        return JSON.stringify(val);
                      }
                      return val.toString();
                    };

                    return (
                      <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {key}: {renderValue(value)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activity.priority === 'critical' ? 'bg-red-100 text-red-800' :
                activity.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  if (entityActivitiesLoading && entityActivities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading activities...</span>
      </div>
    );
  }

  if (entityActivitiesError) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-2">Failed to load activities</p>
        <p className="text-sm text-gray-500">{entityActivitiesError}</p>
      </div>
    );
  }

  if (entityActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No activities found</p>
        <p className="text-sm text-gray-500">
          Activities will appear here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {entityPagination.total} activities
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch(setShowFilters(!showFilters))}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={entityFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="creation">Creation</option>
                <option value="update">Update</option>
                <option value="deletion">Deletion</option>
                <option value="status_change">Status Change</option>
                <option value="assignment">Assignment</option>
                <option value="interaction">Interaction</option>
                <option value="conversion">Conversion</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={entityFilters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date</option>
                <option value="activityType">Activity Type</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={entityFilters.order}
                onChange={(e) => handleFilterChange('order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="relative">
        {entityActivities
          .filter(activity => activity && activity._id) // Filter out invalid activities
          .map(renderActivityItem)}
      </div>

      {/* Pagination Controls */}
      {entityPagination.total > entityPagination.limit && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || entityActivitiesLoading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || entityActivitiesLoading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{entityPagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* First page button */}
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1 || entityActivitiesLoading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Previous page button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || entityActivitiesLoading}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        disabled={entityActivitiesLoading}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          i === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                {/* Next page button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || entityActivitiesLoading}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                
                {/* Last page button */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages || entityActivitiesLoading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
