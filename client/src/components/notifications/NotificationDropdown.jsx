import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getUserNotifications, 
  markAllAsRead, 
  deleteAllNotifications,
  getUnreadCount
} from '../../store/notificationSlice';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const { notifications, pagination } = useSelector((state) => state.notifications);
  
  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getUserNotifications({ limit: 10, skip: 0 }));
    }
  }, [isOpen, dispatch]);
  
  // Get unread count periodically
  useEffect(() => {
    // Initial fetch
    dispatch(getUnreadCount());
    
    // Set up interval to fetch unread count every minute
    const intervalId = setInterval(() => {
      dispatch(getUnreadCount());
    }, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch notifications based on tab
    let params = { limit: 10, skip: 0 };
    
    if (tab === 'unread') {
      params.isRead = false;
    }
    
    dispatch(getUserNotifications(params));
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  // Handle delete all
  const handleDeleteAll = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete all notifications?');
    if (confirmDelete) {
      dispatch(deleteAllNotifications());
    }
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (isLoading || !pagination.hasMore) return;
    
    setIsLoading(true);
    
    // Prepare params based on active tab
    let params = {
      limit: 10,
      skip: notifications.length
    };
    
    if (activeTab === 'unread') {
      params.isRead = false;
    }
    
    dispatch(getUserNotifications(params))
      .finally(() => setIsLoading(false));
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(notification => !notification.isRead)
    : notifications;
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-50"
      style={{ maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
              disabled={pagination.unreadCount === 0}
            >
              Mark all as read
            </button>
            <button
              onClick={handleDeleteAll}
              className="text-xs text-red-600 hover:text-red-800"
              disabled={notifications.length === 0}
            >
              Delete all
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => handleTabChange('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => handleTabChange('unread')}
          >
            Unread
            {pagination.unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {pagination.unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Notifications list */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
        {filteredNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications to display</p>
          </div>
        ) : (
          <>
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification._id} 
                notification={notification} 
                onClose={onClose}
              />
            ))}
            
            {/* Load more button */}
            {pagination.hasMore && (
              <div className="p-3 text-center border-t border-gray-200">
                <button
                  onClick={handleLoadMore}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
        <Link
          to="/notifications"
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;