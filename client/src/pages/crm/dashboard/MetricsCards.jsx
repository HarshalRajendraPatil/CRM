import React from 'react';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const MetricsCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: 'Conversion Rate',
      value: `${data.metrics?.conversionRate || 0}%`,
      description: 'Lead to Customer',
      icon: ChartBarIcon,
      color: 'green',
      trend: data.metrics?.conversionRate > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Win Rate',
      value: `${data.metrics?.winRate || 0}%`,
      description: 'Deal Success Rate',
      icon: ChartBarIcon,
      color: 'blue',
      trend: data.metrics?.winRate > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Task Completion',
      value: `${data.metrics?.taskCompletionRate || 0}%`,
      description: 'Completed Tasks',
      icon: ChartBarIcon,
      color: 'purple',
      trend: data.metrics?.taskCompletionRate > 0 ? 'up' : 'neutral'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
