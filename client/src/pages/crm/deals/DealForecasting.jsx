import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDealForecast } from '../../../store/dealSlice';
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
  ComposedChart
} from 'recharts';

const DealForecasting = ({ projectId }) => {
  const dispatch = useDispatch();
  const { forecast, loading } = useSelector((state) => state.deals);

  const [activeTab, setActiveTab] = useState('revenue');
  const [timeRange, setTimeRange] = useState('30d');
  const [forecastPeriod, setForecastPeriod] = useState('3m');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchDealForecast({ 
        projectId, 
        params: { 
          period: timeRange,
          forecastPeriod: forecastPeriod 
        } 
      }));
    }
  }, [dispatch, projectId, timeRange, forecastPeriod]);

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

  const renderRevenueForecast = () => (
    <div className="space-y-6">
      {/* Revenue Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Forecasted Revenue"
          value={forecast?.summary ? formatCurrency(forecast.summary.forecastValue) : '$0'}
          subtitle={`${forecast?.summary?.confidence?.toFixed(1) || 0}% confidence`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Best Case Scenario"
          value={forecast?.summary ? formatCurrency(forecast.summary.bestCaseValue) : '$0'}
          subtitle="Optimistic forecast"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Worst Case Scenario"
          value={forecast?.summary ? formatCurrency(forecast.summary.worstCaseValue) : '$0'}
          subtitle="Conservative forecast"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="red"
          isLoading={loading}
        />
        
        <StatCard
          title="Pipeline Value"
          value={forecast?.summary ? formatCurrency(forecast.summary.totalPipelineValue) : '$0'}
          subtitle={`${forecast?.summary?.totalOpenDeals || 0} open deals`}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Revenue Forecast Chart */}
      <ChartContainer 
        title="Revenue Forecast"
        isEmpty={!forecast?.monthlyForecast || forecast.monthlyForecast.length === 0}
      >
        {forecast?.monthlyForecast && forecast.monthlyForecast.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast.monthlyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'forecastValue' ? formatCurrency(value) : 
                  name === 'bestCaseValue' ? formatCurrency(value) :
                  name === 'worstCaseValue' ? formatCurrency(value) : value,
                  name === 'forecastValue' ? 'Forecast' :
                  name === 'bestCaseValue' ? 'Best Case' :
                  name === 'worstCaseValue' ? 'Worst Case' : name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="worstCaseValue" 
                stackId="1" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.3}
                name="Worst Case"
              />
              <Area 
                type="monotone" 
                dataKey="bestCaseValue" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                name="Best Case"
              />
              <Line 
                type="monotone" 
                dataKey="forecastValue" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>

      {/* Revenue by Probability */}
      <ChartContainer 
        title="Revenue by Probability Bracket"
        isEmpty={!forecast?.revenueByProbability || forecast.revenueByProbability.length === 0}
      >
        {forecast?.revenueByProbability && forecast.revenueByProbability.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast.revenueByProbability}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="probabilityRange" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );

  const renderDealForecast = () => (
    <div className="space-y-6">
      {/* Deal Count Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Deals Closing This Period"
          value={forecast?.summary ? forecast.summary.dealsClosingThisPeriod : '0'}
          subtitle={`${forecast?.summary?.totalOpenDeals || 0} total open deals`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Expected Wins"
          value={forecast?.summary ? forecast.summary.expectedWins : '0'}
          subtitle="Based on historical win rate"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Conversion Rate"
          value={forecast?.summary ? `${forecast.summary.conversionRate?.toFixed(1)}%` : '0%'}
          subtitle="Historical average"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Deal Count Forecast Chart */}
      <ChartContainer 
        title="Deal Count Forecast"
        isEmpty={!forecast?.monthlyForecast || forecast.monthlyForecast.length === 0}
      >
        {forecast?.monthlyForecast && forecast.monthlyForecast.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast.monthlyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value,
                  name === 'forecastDeals' ? 'Forecast Deals' :
                  name === 'expectedWins' ? 'Expected Wins' : name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="forecastDeals" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Forecast Deals"
              />
              <Line 
                type="monotone" 
                dataKey="expectedWins" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Expected Wins"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>

      {/* Conversion Rates by Probability */}
      <ChartContainer 
        title="Conversion Rates by Probability"
        isEmpty={!forecast?.conversionRates || forecast.conversionRates.length === 0}
      >
        {forecast?.conversionRates && forecast.conversionRates.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast.conversionRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="probabilityRange" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
              <Bar dataKey="conversionRate" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );

  const renderPipelineAnalysis = () => (
    <div className="space-y-6">
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pipeline Value"
          value={forecast?.summary ? formatCurrency(forecast.summary.totalPipelineValue) : '$0'}
          subtitle={`${forecast?.summary?.totalOpenDeals || 0} open deals`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="High Probability Deals"
          value={forecast?.summary ? formatCurrency(forecast.summary.highProbabilityValue) : '$0'}
          subtitle="80%+ probability"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Medium Probability Deals"
          value={forecast?.summary ? formatCurrency(forecast.summary.mediumProbabilityValue) : '$0'}
          subtitle="50-79% probability"
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color="yellow"
          isLoading={loading}
        />
        
        <StatCard
          title="Low Probability Deals"
          value={forecast?.summary ? formatCurrency(forecast.summary.lowProbabilityValue) : '$0'}
          subtitle="Below 50% probability"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
          isLoading={loading}
        />
      </div>

      {/* Pipeline Distribution */}
      <ChartContainer 
        title="Pipeline Distribution by Probability"
        isEmpty={!forecast?.revenueByProbability || forecast.revenueByProbability.length === 0}
      >
        {forecast?.revenueByProbability && forecast.revenueByProbability.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={forecast.revenueByProbability}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ probabilityRange, percent }) => `${probabilityRange} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {forecast.revenueByProbability.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981', '#3B82F6'][index % 4]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>

      {/* Monthly Pipeline Trends */}
      <ChartContainer 
        title="Monthly Pipeline Trends"
        isEmpty={!forecast?.monthlyForecast || forecast.monthlyForecast.length === 0}
      >
        {forecast?.monthlyForecast && forecast.monthlyForecast.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.monthlyForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Pipeline Value']} />
              <Area 
                type="monotone" 
                dataKey="pipelineValue" 
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

  const renderForecastAccuracy = () => (
    <div className="space-y-6">
      {/* Accuracy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Forecast Accuracy"
          value={forecast?.accuracy ? `${forecast.accuracy.overallAccuracy.toFixed(1)}%` : '0%'}
          subtitle="Historical accuracy"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          isLoading={loading}
        />
        
        <StatCard
          title="Revenue Accuracy"
          value={forecast?.accuracy ? `${forecast.accuracy.revenueAccuracy.toFixed(1)}%` : '0%'}
          subtitle="Revenue forecast accuracy"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          isLoading={loading}
        />
        
        <StatCard
          title="Deal Count Accuracy"
          value={forecast?.accuracy ? `${forecast.accuracy.dealCountAccuracy.toFixed(1)}%` : '0%'}
          subtitle="Deal count forecast accuracy"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* Accuracy Trends */}
      <ChartContainer 
        title="Forecast Accuracy Over Time"
        isEmpty={!forecast?.accuracy?.monthlyAccuracy || forecast.accuracy.monthlyAccuracy.length === 0}
      >
        {forecast?.accuracy?.monthlyAccuracy && forecast.accuracy.monthlyAccuracy.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast.accuracy.monthlyAccuracy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>

      {/* Forecast vs Actual */}
      <ChartContainer 
        title="Forecast vs Actual Performance"
        isEmpty={!forecast?.accuracy?.forecastVsActual || forecast.accuracy.forecastVsActual.length === 0}
      >
        {forecast?.accuracy?.forecastVsActual && forecast.accuracy.forecastVsActual.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast.accuracy.forecastVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === 'forecast' ? 'Forecast' : 'Actual'
                ]}
              />
              <Bar dataKey="forecast" fill="#3B82F6" name="Forecast" />
              <Bar dataKey="actual" fill="#10B981" name="Actual" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Forecasting</h2>
          <p className="text-gray-600">Predictive analytics and revenue forecasting for your sales pipeline</p>
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
          
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1m">1 month</option>
            <option value="3m">3 months</option>
            <option value="6m">6 months</option>
            <option value="1y">1 year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'revenue', name: 'Revenue Forecast' },
            { id: 'deals', name: 'Deal Forecast' },
            { id: 'pipeline', name: 'Pipeline Analysis' },
            { id: 'accuracy', name: 'Forecast Accuracy' }
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
      {activeTab === 'revenue' && renderRevenueForecast()}
      {activeTab === 'deals' && renderDealForecast()}
      {activeTab === 'pipeline' && renderPipelineAnalysis()}
      {activeTab === 'accuracy' && renderForecastAccuracy()}
    </div>
  );
};

export default DealForecasting;