import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getUserNotifications, 
  markAllAsRead, 
  deleteAllNotifications 
} from '../store/notificationSlice';
import DashboardLayout from '../layouts/DashboardLayout';
import NotificationItem from '../components/notifications/NotificationItem';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { notifications, pagination, isLoading: storeLoading, isError, message } = useSelector(
    (state) => state.notifications
  );
  
  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(getUserNotifications({ limit: 20, skip: 0 }));
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch notifications based on tab
    let params = { limit: 20, skip: 0 };
    
    if (tab === 'unread') {
      params.isRead = false;
    }
    
    if (selectedType) {
      params.type = selectedType;
    }
    
    dispatch(getUserNotifications(params));
  };
  
  // Handle type filter change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    
    // Fetch notifications based on type
    let params = { limit: 20, skip: 0 };
    
    if (activeTab === 'unread') {
      params.isRead = false;
    }
    
    if (type) {
      params.type = type;
    }
    
    dispatch(getUserNotifications(params));
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    const filters = {};
    
    if (selectedType) {
      filters.type = selectedType;
    }
    
    dispatch(markAllAsRead(filters));
  };
  
  // Handle delete all
  const handleDeleteAll = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete all notifications?');
    if (confirmDelete) {
      const filters = {};
      
      if (activeTab === 'unread') {
        filters.isRead = false;
      } else if (activeTab === 'read') {
        filters.isRead = true;
      }
      
      if (selectedType) {
        filters.type = selectedType;
      }
      
      dispatch(deleteAllNotifications(filters));
    }
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (isLoading || !pagination.hasMore) return;
    
    setIsLoading(true);
    
    // Prepare params based on active tab and selected type
    let params = {
      limit: 20,
      skip: notifications.length
    };
    
    if (activeTab === 'unread') {
      params.isRead = false;
    } else if (activeTab === 'read') {
      params.isRead = true;
    }
    
    if (selectedType) {
      params.type = selectedType;
    }
    
    dispatch(getUserNotifications(params))
      .finally(() => setIsLoading(false));
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') {
      return !notification.isRead;
    } else if (activeTab === 'read') {
      return notification.isRead;
    }
    return true;
  });
  
  // Get unique notification types for filter
  const notificationTypes = [...new Set(notifications.map(n => n.type))];
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={handleMarkAllAsRead}
              disabled={pagination.unreadCount === 0}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              }
            >
              Mark all as read
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={filteredNotifications.length === 0}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Delete all
            </Button>
          </div>
        </div>
        
        {/* Error message */}
        {isError && (
          <Alert 
            variant="error" 
            message={message} 
            className="mb-4" 
          />
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Status tabs */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'unread'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('unread')}
                >
                  Unread
                  {pagination.unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white text-indigo-800 rounded-full">
                      {pagination.unreadCount}
                    </span>
                  )}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'read'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTabChange('read')}
                >
                  Read
                </button>
              </div>
              
              {/* Type filter */}
              <div className="flex items-center">
                <label htmlFor="type" className="mr-2 text-sm font-medium text-gray-700">
                  Type:
                </label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All types</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {activeTab === 'all' ? 'All notifications' : 
                 activeTab === 'unread' ? 'Unread notifications' : 'Read notifications'}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
              </span>
            </div>
          </div>
          
          {storeLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-lg font-medium">No notifications to display</p>
              <p className="mt-1">
                {selectedType 
                  ? `No ${activeTab !== 'all' ? activeTab + ' ' : ''}notifications of type "${selectedType.replace(/_/g, ' ')}"`
                  : `You don't have any ${activeTab !== 'all' ? activeTab + ' ' : ''}notifications yet`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                />
              ))}
              
              {/* Load more button */}
              {pagination.hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="light"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;