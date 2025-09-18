import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealInsights } from '../../../store/dealSlice';
import { formatCurrency } from '../../../utils/dealUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';

const DealInsights = ({ projectId }) => {
  const dispatch = useDispatch();
  const { insights, loading } = useSelector((state) => state.deals);

  const [activeTab, setActiveTab] = useState('performance');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchDealInsights(projectId));
    }
  }, [dispatch, projectId]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend = null, isLoading = false }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? '...' : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-sm ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg className={`w-4 h-4 mr-1 ${trend.direction === 'up' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {trend.percentage}% vs last period
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ title, description, icon }) => (
    <div className="text-center py-12">
      {icon}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  const ChartContainer = ({ title, children, isEmpty = false, emptyMessage = "No data available" }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {isEmpty ? (
        <EmptyState
          title={emptyMessage}
          description="There's no data to display for this chart."
          icon={
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      ) : (
        <div className="h-80">
          {children}
        </div>
      )}
    </div>
  );

  const InsightCard = ({ insight, index }) => (
    <div className={`border-l-4 pl-4 py-4 ${
      insight.priority === 'high' ? 'border-red-500 bg-red-50' : 
      insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{insight.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
          {insight.recommendation && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
              <strong>Recommendation:</strong> {insight.recommendation}
            </div>
          )}
        </div>
        <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {insight.priority}
        </span>
      </div>
    </div>
  );

  const RecommendationCard = ({ recommendation, index }) => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          recommendation.impact === 'high' ? 'bg-red-100 text-red-800' :
          recommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {recommendation.impact} impact
        </span>
      </div>
      <p className="text-sm text-gray-600">{recommendation.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{recommendation.category}</span>
        <span className={`text-xs px-2 py-1 rounded ${
          recommendation.effort === 'high' ? 'bg-red-100 text-red-800' :
          recommendation.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {recommendation.effort} effort
        </span>
      </div>
    </div>
  );

  const renderPerformanceInsights = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={insights?.summary ? formatCurrency(insights.summary.totalRevenue) : '$0'}
          subtitle={`${insights?.summary?.totalDeals || 0} deals`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Win Rate"
          value={insights?.summary ? `${insights.summary.winRate?.toFixed(1)}%` : '0%'}
          subtitle={`${insights?.summary?.wonDeals || 0} won, ${insights?.summary?.lostDeals || 0} lost`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Average Deal Size"
          value={insights?.summary ? formatCurrency(insights.summary.avgDealSize) : '$0'}
          subtitle={`${insights?.summary?.avgSalesCycle?.toFixed(0) || 0} days cycle`}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
        
        <StatCard
          title="Conversion Rate"
          value={insights?.summary ? `${insights.summary.conversionRate.toFixed(1)}%` : '0%'}
          subtitle="Lead to customer"
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="orange"
          isLoading={loading}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source */}
        <ChartContainer 
          title="Revenue by Source"
          isEmpty={!insights?.performance?.revenueBySource || insights.performance.revenueBySource.length === 0}
        >
          {insights?.performance?.revenueBySource && insights.performance.revenueBySource.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.performance.revenueBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="totalRevenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Win Rate by Priority */}
        <ChartContainer 
          title="Win Rate by Priority"
          isEmpty={!insights?.performance?.winRateByPriority || insights.performance.winRateByPriority.length === 0}
        >
          {insights?.performance?.winRateByPriority && insights.performance.winRateByPriority.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.performance.winRateByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Win Rate']} />
                <Bar dataKey="winRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>
    </div>
  );

  const renderTimeInsights = () => (
    <div className="space-y-6">
      {/* Time-based Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Average Sales Cycle"
          value={insights?.timeBased?.avgSalesCycle ? `${insights.timeBased.avgSalesCycle.toFixed(1)} days` : '0 days'}
          subtitle="Time from open to close"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Fastest Close"
          value={insights?.timeBased?.fastestClose ? `${insights.timeBased.fastestClose} days` : '0 days'}
          subtitle="Quickest deal closure"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Longest Cycle"
          value={insights?.timeBased?.longestCycle ? `${insights.timeBased.longestCycle} days` : '0 days'}
          subtitle="Most complex deal"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
          isLoading={loading}
        />
      </div>

      {/* Time-based Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Cycle Distribution */}
        <ChartContainer 
          title="Sales Cycle Distribution"
          isEmpty={!insights?.timeBased?.cycleDistribution || insights.timeBased.cycleDistribution.length === 0}
        >
          {insights?.timeBased?.cycleDistribution && insights.timeBased.cycleDistribution.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.timeBased.cycleDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Deals']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Monthly Trends */}
        <ChartContainer 
          title="Monthly Performance Trends"
          isEmpty={!insights?.timeBased?.monthlyTrends || insights.timeBased.monthlyTrends.length === 0}
        >
          {insights?.timeBased?.monthlyTrends && insights.timeBased.monthlyTrends.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.timeBased.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Deals'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="deals" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Deals"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>
    </div>
  );

  const renderValueInsights = () => (
    <div className="space-y-6">
      {/* Value-based Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Highest Value Deal"
          value={insights?.valueBased?.highestValueDeal ? formatCurrency(insights.valueBased.highestValueDeal) : '$0'}
          subtitle="Single largest deal"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Average Deal Size"
          value={insights?.valueBased?.avgDealSize ? formatCurrency(insights.valueBased.avgDealSize) : '$0'}
          subtitle="Mean deal value"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Total Pipeline Value"
          value={insights?.valueBased?.totalPipelineValue ? formatCurrency(insights.valueBased.totalPipelineValue) : '$0'}
          subtitle="All open deals"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Value-based Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Size Distribution */}
        <ChartContainer 
          title="Deal Size Distribution"
          isEmpty={!insights?.valueBased?.sizeDistribution || insights.valueBased.sizeDistribution.length === 0}
        >
          {insights?.valueBased?.sizeDistribution && insights.valueBased.sizeDistribution.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.valueBased.sizeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Deals']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Revenue by Month */}
        <ChartContainer 
          title="Revenue by Month"
          isEmpty={!insights?.valueBased?.revenueByMonth || insights.valueBased.revenueByMonth.length === 0}
        >
          {insights?.valueBased?.revenueByMonth && insights.valueBased.revenueByMonth.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insights.valueBased.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>
    </div>
  );

  const renderAIInsights = () => (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights & Recommendations</h3>
        {insights && insights.insights && insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No insights available"
            description="AI insights will appear here as you accumulate more deal data."
            icon={
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        )}
      </div>

      {/* Recommendations */}
      {insights && insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Stale Deals Alert */}
      {insights && insights.staleDeals && insights.staleDeals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stale Deals Alert</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {insights.staleDeals.length} deals haven't been updated recently
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>These deals may need attention:</p>
                  <ul className="list-disc list-inside mt-1">
                    {insights.staleDeals.slice(0, 5).map((deal, index) => (
                      <li key={index}>{deal.name} - Last updated {deal.daysSinceUpdate} days ago</li>
                    ))}
                    {insights.staleDeals.length > 5 && (
                      <li>... and {insights.staleDeals.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Insights</h2>
          <p className="text-gray-600">AI-powered insights and recommendations for your sales performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'performance', name: 'Performance' },
            { id: 'time', name: 'Time Analysis' },
            { id: 'value', name: 'Value Analysis' },
            { id: 'ai', name: 'AI Insights' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'performance' && renderPerformanceInsights()}
      {activeTab === 'time' && renderTimeInsights()}
      {activeTab === 'value' && renderValueInsights()}
      {activeTab === 'ai' && renderAIInsights()}
    </div>
  );
};

export default DealInsights;