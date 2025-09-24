import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const TaskCompletionChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No task data available</p>
        </div>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    status: item._id || 'Unknown',
    count: item.count || 0
  }));

  const colors = {
    'completed': '#10b981',
    'in_progress': '#3b82f6',
    'pending': '#f59e0b',
    'overdue': '#ef4444',
    'cancelled': '#6b7280'
  };

  const getStatusColor = (status) => {
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'pending': 'Pending',
      'overdue': 'Overdue',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Task Completion</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Tasks by Status</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, count, percent }) => 
                `${getStatusLabel(status)}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, 'Tasks']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => getStatusLabel(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskCompletionChart;
