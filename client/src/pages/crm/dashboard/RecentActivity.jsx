import React from 'react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  UserPlusIcon, 
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getEntityIcon = (type) => {
    const icons = {
      companies: BuildingOfficeIcon,
      customers: UserGroupIcon,
      deals: CurrencyDollarIcon,
      leads: UserPlusIcon,
      tasks: ClipboardDocumentListIcon
    };
    return icons[type] || ClipboardDocumentListIcon;
  };

  const getEntityColor = (type) => {
    const colors = {
      companies: 'bg-blue-50 text-blue-600',
      customers: 'bg-green-50 text-green-600',
      deals: 'bg-purple-50 text-purple-600',
      leads: 'bg-orange-50 text-orange-600',
      tasks: 'bg-indigo-50 text-indigo-600'
    };
    return colors[type] || 'bg-gray-50 text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600',
      inactive: 'text-gray-600',
      archived: 'text-red-600',
      won: 'text-green-600',
      lost: 'text-red-600',
      open: 'text-blue-600',
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      in_progress: 'text-blue-600',
      overdue: 'text-red-600',
      qualified: 'text-green-600',
      unqualified: 'text-red-600',
      converted: 'text-green-600'
    };
    return colors[status] || 'text-gray-600';
  };

  // Combine all recent activities
  const allActivities = [
    ...(data.companies || []).map(item => ({ ...item, type: 'companies' })),
    ...(data.customers || []).map(item => ({ ...item, type: 'customers' })),
    ...(data.deals || []).map(item => ({ ...item, type: 'deals' })),
    ...(data.leads || []).map(item => ({ ...item, type: 'leads' })),
    ...(data.tasks || []).map(item => ({ ...item, type: 'tasks' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {allActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        ) : (
          allActivities.map((activity, index) => {
            const Icon = getEntityIcon(activity.type);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getEntityColor(activity.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.name || activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    {activity.value && (
                      <span className="text-xs text-gray-500">
                        ${activity.value.toLocaleString()}
                      </span>
                    )}
                    {activity.stage && (
                      <span className="text-xs text-gray-500">
                        {activity.stage}
                      </span>
                    )}
                    {activity.priority && (
                      <span className="text-xs text-gray-500">
                        {activity.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
