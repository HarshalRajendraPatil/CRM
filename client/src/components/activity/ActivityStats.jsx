import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityStats } from '../../store/activitySlice';
import { 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';

const ActivityStats = ({ projectId }) => {
  const dispatch = useDispatch();
  const { 
    activityStats, 
    activityStatsLoading, 
    activityStatsError 
  } = useSelector(state => state.activity);

  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (projectId) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      dispatch(fetchActivityStats({ 
        projectId, 
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }));
    }
  }, [dispatch, projectId, timeRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) {
      return 'text-green-600';
    } else if (current < previous) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  if (activityStatsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading activity stats...</span>
      </div>
    );
  }

  if (activityStatsError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load activity stats</div>
        <div className="text-sm text-gray-500">{activityStatsError}</div>
      </div>
    );
  }

  if (!activityStats) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-2">No activity stats available</div>
      </div>
    );
  }

  const { 
    stats = [], 
    recentActivities = [], 
    activityTrends = [], 
    mostActiveUsers = [], 
    activityByCategory = [], 
    activityByEntityType = [] 
  } = activityStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Statistics</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Activities</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.reduce((sum, stat) => sum + stat.count, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Most Active User */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Most Active User</p>
              <p className="text-lg font-semibold text-gray-900">
                {mostActiveUsers[0]?.user?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {mostActiveUsers[0]?.count || 0} activities
              </p>
            </div>
          </div>
        </div>

        {/* Activities by Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {activityByCategory[0]?._id || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {activityByCategory[0]?.count || 0} activities
              </p>
            </div>
          </div>
        </div>

        {/* Entity Type Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Entity Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {activityByEntityType[0]?._id || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {activityByEntityType[0]?.count || 0} activities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trends Chart */}
      {activityTrends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h4>
          <div className="space-y-4">
            {activityTrends.slice(-7).map((trend, index) => {
              const previousTrend = activityTrends[index - 1];
              const change = previousTrend ? trend.count - previousTrend.count : 0;
              const changePercent = previousTrend ? (change / previousTrend.count) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {new Date(trend._id.year, trend._id.month - 1, trend._id.day).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{trend.count}</span>
                    {previousTrend && (
                      <div className={`flex items-center space-x-1 ${getTrendColor(trend.count, previousTrend.count)}`}>
                        {getTrendIcon(trend.count, previousTrend.count)}
                        <span className="text-xs">
                          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Active Users */}
      {mostActiveUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h4>
          <div className="space-y-3">
            {mostActiveUsers.slice(0, 5).map((user, index) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.user.name}</p>
                    <p className="text-xs text-gray-500">{user.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.count}</p>
                  <p className="text-xs text-gray-500">activities</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h4>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    by {activity.performedBy?.name} • {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityStats;
