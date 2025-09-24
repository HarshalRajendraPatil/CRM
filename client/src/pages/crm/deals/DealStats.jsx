import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealStats, fetchDealVelocity, fetchDealForecast, fetchDealInsights } from '../../../store/dealSlice';
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

const DealStats = ({ projectId }) => {
  const dispatch = useDispatch();
  const { 
    stats, 
    velocity, 
    forecast, 
    insights,
    loading 
  } = useSelector((state) => state.deals);

  console.log(insights);

  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchDealStats({ projectId, params: { period: timeRange } }));
      dispatch(fetchDealVelocity({ projectId, params: { period: timeRange } }));
      dispatch(fetchDealForecast({ projectId, params: { forecastPeriod: timeRange } }));
      dispatch(fetchDealInsights(projectId));
    }
  }, [dispatch, projectId, timeRange]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const montlyDealTrendData = stats?.trends?.monthly?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    value: item.totalValue,
  }));  

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deal Value"
          value={stats?.overview ? formatCurrency(stats.overview.totalValue) : '$0'}
          subtitle={`${stats?.overview?.totalDeals || 0} active deals`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Won Deals"
          value={stats?.overview ? formatCurrency(stats.overview.wonValue) : '$0'}
          subtitle={`${stats?.overview?.wonDeals || 0} deals closed`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Win Rate"
          value={stats?.overview ? `${stats.overview.conversionRate.toFixed(1)}%` : '0%'}
          subtitle={`${(stats?.overview?.wonDeals || 0) + (stats?.overview?.lostDeals || 0)} total closed`}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
        
        <StatCard
          title="Average Deal Size"
          value={stats?.overview ? formatCurrency(stats.overview.avgDealSize) : '$0'}
          subtitle={`${stats?.overview?.avgSalesCycle?.toFixed(0) || 0} days avg cycle`}
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="orange"
          isLoading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Status Distribution */}
        <ChartContainer 
          title="Deal Status Distribution"
          isEmpty={!stats?.overview || !stats.overview.totalDeals}
        >
          {stats?.overview && stats.overview.totalDeals > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Open', value: stats.overview.openDeals },
                    { name: 'Won', value: stats.overview.wonDeals },
                    { name: 'Lost', value: stats.overview.lostDeals },
                    { name: 'Qualified', value: stats.overview.qualifiedDeals },
                    { name: 'Proposal', value: stats.overview.proposalDeals },
                    { name: 'Negotiation', value: stats.overview.negotiationDeals },
                    { name: 'On Hold', value: stats.overview.onHoldDeals }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${percent == 0 ? '' : `${name} ${(percent * 100).toFixed(0)}%`}`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Open', value: stats.overview.openDeals },
                    { name: 'Won', value: stats.overview.wonDeals },
                    { name: 'Lost', value: stats.overview.lostDeals },
                    { name: 'Qualified', value: stats.overview.qualifiedDeals },
                    { name: 'Proposal', value: stats.overview.proposalDeals },
                    { name: 'Negotiation', value: stats.overview.negotiationDeals },
                    { name: 'On Hold', value: stats.overview.onHoldDeals }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#E48998'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Priority Distribution */}
        <ChartContainer 
          title="Priority Distribution"
          isEmpty={!stats?.distributions?.priorities || stats.distributions.priorities.length === 0}
        >
          {stats?.distributions?.priorities && stats.distributions.priorities.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distributions.priorities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Deals']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Monthly Trends */}
      <ChartContainer 
        title="Monthly Deal Trends"
        isEmpty={!stats?.trends?.monthly || stats.trends.monthly.length === 0}
      >
        {stats?.trends?.monthly && stats.trends.monthly.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" >
            <LineChart data={montlyDealTrendData}>
              <CartesianGrid strokeDasharray="1 1" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, month) => [
                  month === 'totalValue' ? formatCurrency(value) : value,
                  month === 'totalValue' ? 'Deal Count' : 'Deal Value'
                ]}
              />
              <Line 
                type='linear'
                dot={false}
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={5}
                name="Deal Count"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );

  const renderVelocity = () => (
    <div className="space-y-6">
      {/* Velocity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Average Sales Cycle"
          value={velocity?.summary ? `${velocity.summary.avgDealDuration.toFixed(1)} days` : '0 days'}
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
          title="Deals Closed This Period"
          value={velocity?.summary ? velocity.summary.closedDeals : '0'}
          subtitle={`${velocity?.summary ? formatCurrency(velocity.summary.totalPipelineValue) : '$0'} pipeline value`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Average Velocity"
          value={velocity?.summary ? `${velocity.summary.avgVelocity.toFixed(2)}` : '0'}
          subtitle="Value per day"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Velocity Chart */}
      <ChartContainer 
        title="Sales Velocity Over Time"
        isEmpty={!velocity?.deals || velocity.deals.length === 0}
      >
        {velocity?.deals && velocity.deals.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={velocity.deals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="totalDuration" 
                name="Duration (days)"
                type="number"
                scale="linear"
              />
              <YAxis 
                dataKey="velocity" 
                name="Velocity"
                type="number"
                scale="linear"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [
                  name === 'velocity' ? value.toFixed(2) : value,
                  name === 'velocity' ? 'Velocity' : 'Duration (days)'
                ]}
              />
              <Scatter dataKey="velocity" fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );

  const renderForecast = () => (
    <div className="space-y-6">
      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Forecasted Revenue"
          value={forecast?.summary ? formatCurrency(forecast.summary.forecastValue) : '$0'}
          subtitle={`${forecast?.summary?.confidence?.toFixed(1) || 0}% confidence`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Deals Closing This Period"
          value={forecast?.summary ? forecast.summary.dealsClosingThisPeriod : '0'}
          subtitle={`${forecast?.summary?.totalOpenDeals || 0} total open deals`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
      </div>

      {/* Forecast Chart */}
      <ChartContainer 
        title="Monthly Forecast"
        isEmpty={!forecast?.monthlyForecast || forecast.monthlyForecast.length === 0}
      >
        {forecast?.monthlyForecast && forecast.monthlyForecast.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.monthlyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Forecast Value']} />
              <Area 
                type="monotone" 
                dataKey="forecastValue" 
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
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights & Recommendations</h3>
        {insights && insights.insights && insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight, index) => (
              <div key={index} className={`border-l-4 pl-4 py-2 ${
                insight.priority === 'high' ? 'border-red-500' : 
                insight.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
              }`}>
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
              </div>
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
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
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
            ))}
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
          <h2 className="text-2xl font-bold text-gray-900">Deal Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your sales performance</p>
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
            { id: 'overview', name: 'Overview' },
            { id: 'velocity', name: 'Velocity' },
            { id: 'forecast', name: 'Forecast' },
            { id: 'insights', name: 'Insights' }
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'velocity' && renderVelocity()}
      {activeTab === 'forecast' && renderForecast()}
      {activeTab === 'insights' && renderInsights()}
    </div>
  );
};

export default DealStats;