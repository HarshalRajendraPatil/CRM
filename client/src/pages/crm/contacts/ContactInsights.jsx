import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ContactInsights = ({ insights, isLoading }) => {
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('growth');
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No insights yet</h3>
        <p className="mt-1 text-sm text-gray-500">Collect more contact data and activity to see insights here.</p>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num ?? 0).toString();
  };

  const formatPercentage = (num) => {
    const safe = Number.isFinite(num) ? num : 0;
    return `${safe > 0 ? '+' : ''}${safe.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    if ((value ?? 0) > 0) return 'text-green-600';
    if ((value ?? 0) < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMetricIcon = (metric) => {
    const icons = {
      growth: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      conversion: (
        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      engagement: (
        <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
        </svg>
      )
    };
    return icons[metric] || icons.growth;
  };

  const growthTrend = Array.isArray(insights.growthTrend) ? insights.growthTrend : [];
  const stageProgression = Array.isArray(insights.stageProgression) ? insights.stageProgression : [];
  const topSources = Array.isArray(insights.topSources) ? insights.topSources : [];
  const activityTrends = Array.isArray(insights.activityTrends) ? insights.activityTrends : [];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Contact Insights</h2>
          <p className="mt-1 text-sm text-gray-500">Detailed analytics and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeframe === period
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getMetricIcon('growth')}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Growth Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPercentage(insights.growthRate)}
                  </dd>
                  <dd className={`text-sm ${getGrowthColor(insights.growthRate)}`}>
                    vs last {timeframe}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getMetricIcon('conversion')}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPercentage(insights.conversionRate)}
                  </dd>
                  <dd className={`text-sm ${getGrowthColor(insights.conversionRateChange)}`}>
                    {formatPercentage(insights.conversionRateChange)} vs last {timeframe}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="flex items-center p-5">
            <div className="flex-shrink-0">
              {getMetricIcon('engagement')}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Engagement Score</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {(insights.engagementScore ?? 0).toFixed(1)}
                </dd>
                <dd className={`text-sm ${getGrowthColor(insights.engagementChange)}`}>
                  {formatPercentage(insights.engagementChange)} vs last {timeframe}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Growth Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Growth Trend</h3>
          {growthTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">
              No growth data available for the selected timeframe
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="contacts" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stage Progression */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stage Progression</h3>
          {stageProgression.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">
              No stage progression data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Sources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Sources</h3>
          {topSources.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-gray-500">
              No source performance data available
            </div>
          ) : (
            <div className="space-y-4">
              {topSources.map((source, index) => (
                <div key={source.name || index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                    <span className="text-sm text-gray-900 capitalize">{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-900">{source.count}</span>
                    <span className={`text-sm ${getGrowthColor(source.growth)}`}>
                      {formatPercentage(source.growth)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trends</h3>
          {activityTrends.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-gray-500">
              No activity trend data available
            </div>
          ) : (
            <div className="space-y-4">
              {activityTrends.map((activity) => (
                <div key={activity.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 capitalize">{activity.type}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-900">{activity.count}</span>
                    <span className={`text-sm ${getGrowthColor(activity.change)}`}>
                      {formatPercentage(activity.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(insights.avgResponseTime)}
            </div>
            <div className="text-sm text-gray-500">Avg Response Time (hrs)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(insights.contactQualityScore ?? 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(insights.avgDealValue)}
            </div>
            <div className="text-sm text-gray-500">Avg Deal Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(insights.totalRevenue)}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {!insights.recommendations || insights.recommendations.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recommendations</h3>
          <p className="text-sm text-gray-500">No recommendations available yet. As you engage with contacts, we'll surface suggestions here.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-900">{recommendation.message}</p>
                  {recommendation.impact && (
                    <p className="text-xs text-gray-500 mt-1">
                      Potential impact: {recommendation.impact}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInsights;
