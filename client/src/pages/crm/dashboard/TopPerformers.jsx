import React from 'react';
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline';

const TopPerformers = ({ data, isLoading }) => {
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRankIcon = (index) => {
    if (index === 0) return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <TrophyIcon className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <TrophyIcon className="h-5 w-5 text-orange-500" />;
    return <span className="text-sm font-medium text-gray-500">#{index + 1}</span>;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-50 text-yellow-600';
    if (index === 1) return 'bg-gray-50 text-gray-600';
    if (index === 2) return 'bg-orange-50 text-orange-600';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <div className="flex items-center space-x-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">By Deal Value</span>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((performer, index) => (
          <div key={performer._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-lg ${getRankColor(index)}`}>
              {getRankIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {performer.name}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(performer.totalValue)}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500">
                  {performer.dealCount} deals
                </span>
                <span className="text-xs text-gray-500">
                  {performer?.wonCount/performer?.dealCount * 100}% win rate
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;
