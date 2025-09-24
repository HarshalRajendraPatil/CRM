import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon,
  FireIcon,
  EyeIcon,
  BoltIcon,
  RocketLaunchIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerForecast } from '../../../store/customerSlice';

const CustomerForecast = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { forecast, isForecastLoading: loading, error } = useSelector((state) => state.customers);
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [selectedType, setSelectedType] = useState('growth');

  useEffect(() => {
    dispatch(fetchCustomerForecast({ projectId, params: { period: selectedPeriod, type: selectedType } }));
  }, [projectId, selectedPeriod, selectedType, dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, isLoading = false }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          )}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== null && (
            <div className={`flex items-center mt-2 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(Math.abs(trend))}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'purple' ? 'from-purple-500 to-purple-600' :
          color === 'orange' ? 'from-orange-500 to-orange-600' :
          color === 'red' ? 'from-red-500 to-red-600' :
          'from-gray-500 to-gray-600'
        }`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading forecast</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast data</h3>
          <p className="mt-1 text-sm text-gray-500">Forecast data will appear here once you have customer data.</p>
        </div>
      </div>
    );
  }

  const { historical, forecast: forecastData, analytics, insights } = forecast;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-8 w-8 mr-3 text-blue-600" />
            Customer Forecast
          </h1>
          <p className="text-gray-600 mt-2">Predictive analytics and growth projections for customer acquisition</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="growth">Growth Forecast</option>
            <option value="revenue">Revenue Forecast</option>
            <option value="acquisition">Acquisition Forecast</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Projected Growth"
          value={formatPercentage(insights?.projectedGrowth || 0)}
          subtitle="Next 6 months"
          icon={ArrowTrendingUpIcon}
          color="blue"
          trend={insights?.projectedGrowth}
        />
        <StatCard
          title="Confidence Level"
          value={formatPercentage(insights?.confidenceLevel || 0)}
          subtitle="Forecast accuracy"
          icon={ShieldCheckIcon}
          color="green"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(historical?.data?.[historical.data.length - 1]?.count || 0)}
          subtitle="Current base"
          icon={UserGroupIcon}
          color="purple"
        />
        <StatCard
          title="Avg Score"
          value={historical?.data?.[historical.data.length - 1]?.avgScore?.toFixed(1) || '0.0'}
          subtitle="Customer quality"
          icon={StarIcon}
          color="orange"
        />
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-orange-500" />
          Risk Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(analytics?.riskFactors?.churnRisk)}`}>
              {analytics?.riskFactors?.churnRisk || 'Low'} Churn Risk
            </div>
            <p className="text-sm text-gray-600 mt-2">Customer retention risk</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(analytics?.riskFactors?.marketSaturation)}`}>
              {analytics?.riskFactors?.marketSaturation || 'Low'} Market Saturation
            </div>
            <p className="text-sm text-gray-600 mt-2">Market penetration level</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(analytics?.riskFactors?.conversionRisk)}`}>
              {analytics?.riskFactors?.conversionRisk || 'Low'} Conversion Risk
            </div>
            <p className="text-sm text-gray-600 mt-2">Lead conversion risk</p>
          </div>
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth Forecast */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <RocketLaunchIcon className="h-6 w-6 mr-2 text-blue-500" />
            Customer Growth Forecast
          </h3>
          <div className="space-y-4">
            {forecastData?.customerGrowth?.slice(0, 6).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-600">Projected: {formatNumber(month.projected)} customers</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(month.projected)}</p>
                  <p className="text-sm text-gray-500">{formatPercentage(month.confidence)} confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BoltIcon className="h-6 w-6 mr-2 text-green-500" />
            Revenue Forecast
          </h3>
          <div className="space-y-4">
            {forecastData?.revenueForecast?.slice(0, 6).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-600">Projected revenue</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(month.projectedRevenue)}</p>
                  <p className="text-sm text-gray-500">{formatNumber(month.projected)} customers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Progression Analysis */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <EyeIcon className="h-6 w-6 mr-2 text-purple-500" />
          Stage Progression Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics?.stageProgression?.map((stage, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 capitalize">{stage._id}</h4>
                <span className="text-2xl font-bold text-purple-600">{stage.count}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Score:</span>
                  <span className="font-medium">{stage.avgScore?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Time:</span>
                  <span className="font-medium">{stage.avgTimeInStage?.toFixed(0) || '0'} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Probabilities */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FireIcon className="h-6 w-6 mr-2 text-red-500" />
          Conversion Probabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics?.conversionProbabilities || {}).map(([stage, data]) => (
            <div key={stage} className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
              <h4 className="font-semibold text-gray-900 capitalize mb-2">{stage}</h4>
              <div className="text-3xl font-bold text-red-600 mb-2">{formatPercentage(data.probability)}</div>
              <p className="text-sm text-gray-600">Conversion rate</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className={`p-4 rounded-xl border-l-4 ${
                recommendation.type === 'critical' ? 'border-red-500 bg-red-50' :
                recommendation.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                recommendation.type === 'info' ? 'border-blue-500 bg-blue-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${getRecommendationColor(recommendation.type)}`}>
                    {recommendation.type === 'critical' ? <ExclamationTriangleIcon className="h-5 w-5" /> :
                     recommendation.type === 'warning' ? <ClockIcon className="h-5 w-5" /> :
                     recommendation.type === 'info' ? <LightBulbIcon className="h-5 w-5" /> :
                     <CheckCircleIcon className="h-5 w-5" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                    <p className="text-gray-700 mt-1">{recommendation.description}</p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">Action: {recommendation.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Data Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-indigo-500" />
          Historical Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {formatPercentage(historical?.avgGrowthRate || 0)}
            </div>
            <p className="text-sm text-gray-600">Average Growth Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {formatNumber(historical?.data?.reduce((sum, item) => sum + item.count, 0) || 0)}
            </div>
            <p className="text-sm text-gray-600">Total Historical Customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {formatCurrency(historical?.data?.reduce((sum, item) => sum + item.totalValue, 0) || 0)}
            </div>
            <p className="text-sm text-gray-600">Total Historical Value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForecast;
