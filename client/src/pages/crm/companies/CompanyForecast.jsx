import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyForecast } from '../../../store/companySlice';

const CompanyForecast = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { forecastData, isLoading: loading, isError } = useSelector((state) => state.companies);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [selectedType, setSelectedType] = useState('growth');

  useEffect(() => {
    dispatch(getCompanyForecast({ projectId, params: { period: selectedPeriod, type: selectedType } }));
  }, [projectId, selectedPeriod, selectedType, dispatch]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskIcon = (score) => {
    if (score >= 70) return ExclamationTriangleIcon;
    if (score >= 40) return ClockIcon;
    return CheckCircleIcon;
  };

  const getRiskBgColor = (score) => {
    if (score >= 70) return 'bg-red-50 border-red-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, gradient = false }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${gradient ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
      {trend !== null && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(trend)}
          </span>
        </div>
      )}
    </div>
  );

  const ForecastChart = ({ data, title, subtitle, color = 'blue' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.count || d.projectedCount || 0));
    const minValue = Math.min(...data.map(d => d.count || d.projectedCount || 0));
    const range = maxValue - minValue;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Historical</span>
            <div className="w-3 h-3 bg-blue-300 rounded-full ml-4"></div>
            <span className="text-sm text-gray-600">Projected</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.map((item, index) => {
            const value = item.count || item.projectedCount || 0;
            const percentage = range > 0 ? ((value - minValue) / range) * 100 : 50;
            const isProjected = item.projectedCount !== undefined;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-600">
                  {item.month}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className={`h-6 rounded-full ${isProjected ? 'bg-blue-300' : 'bg-blue-500'} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-sm font-bold text-gray-900 text-right">
                  {formatNumber(value)}
                </div>
                {isProjected && (
                  <div className="w-24 text-xs text-blue-600 font-medium">
                    {item.confidence ? `${(item.confidence * 100).toFixed(0)}% confidence` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const IndustryCard = ({ industry, count, avgRevenue, isTop = false }) => (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${isTop ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{industry || 'Unknown'}</h4>
        {isTop && <StarIcon className="h-5 w-5 text-yellow-500" />}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Companies</span>
          <span className="font-medium">{count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg Revenue</span>
          <span className="font-medium">${formatNumber(avgRevenue || 0)}</span>
        </div>
      </div>
    </div>
  );

  const RevenueCard = ({ revenue }) => (
    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          {revenue._id.year}-{revenue._id.month.toString().padStart(2, '0')}
        </span>
        <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Companies</span>
          <span className="font-semibold">{formatNumber(revenue.count)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg Revenue</span>
          <span className="font-semibold text-green-600">${formatNumber(revenue.avgRevenue || 0)}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error loading forecast</h3>
              <p className="text-sm text-red-600 mt-1">Unable to load company forecast data. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">No forecast data</h3>
          <p className="mt-2 text-gray-500">Unable to generate forecast data for this project.</p>
        </div>
      </div>
    );
  }

  const { 
    historical, 
    forecast, 
    growthRate, 
    industryGrowth, 
    revenueData, 
    activityForecast, 
    riskAssessment, 
    insights 
  } = forecastData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Company Forecast</h1>
              <p className="text-lg text-gray-600">Predictive analytics and growth projections for your companies</p>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="growth">Growth Forecast</option>
                <option value="revenue">Revenue Forecast</option>
                <option value="activity">Activity Forecast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Companies"
            value={formatNumber(insights.totalCompanies)}
            icon={BuildingOfficeIcon}
            color="blue"
            gradient={true}
          />
          <StatCard
            title="Growth Rate"
            value={formatPercentage(growthRate)}
            icon={growthRate >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
            color={growthRate >= 0 ? 'green' : 'red'}
            trend={growthRate}
          />
          <StatCard
            title="Projected Growth"
            value={formatNumber(insights.projectedGrowth)}
            subtitle="Next 6 months"
            icon={SparklesIcon}
            color="purple"
          />
          <StatCard
            title="Market Share"
            value={formatNumber(insights.marketShare)}
            subtitle="Top industry"
            icon={GlobeAltIcon}
            color="indigo"
          />
        </div>

        {/* Risk Assessment */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 border-2 ${getRiskBgColor(riskAssessment.score)}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-gray-700" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Risk Assessment</h3>
                <p className="text-gray-600">Company portfolio health analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {React.createElement(getRiskIcon(riskAssessment.score), {
                className: `h-8 w-8 ${getRiskColor(riskAssessment.score)}`
              })}
              <div className="text-right">
                <div className={`text-2xl font-bold ${getRiskColor(riskAssessment.score)}`}>
                  {riskAssessment.score.toFixed(0)}/100
                </div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Risk Factors
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Inactive Companies</span>
                  <span className="font-bold text-red-600">{riskAssessment.factors.inactiveCompanies}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Low Engagement</span>
                  <span className="font-bold text-yellow-600">{riskAssessment.factors.lowEngagement}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Incomplete Profiles</span>
                  <span className="font-bold text-orange-600">{riskAssessment.factors.incompleteProfiles}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskAssessment.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ForecastChart 
            data={[...historical, ...forecast]} 
            title="Company Growth Forecast" 
            subtitle="Historical data and future projections"
          />
          <ForecastChart 
            data={activityForecast} 
            title="Activity Forecast" 
            subtitle="Expected company engagement levels"
          />
        </div>

        {/* Industry Analysis */}
        {industryGrowth && industryGrowth.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <GlobeAltIcon className="h-6 w-6 mr-2" />
                  Industry Growth Analysis
                </h3>
                <p className="text-gray-600 mt-1">Top performing industries by company count</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <StarIcon className="h-4 w-4" />
                <span>Top performer</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industryGrowth.slice(0, 6).map((industry, index) => (
                <IndustryCard
                  key={index}
                  industry={industry._id}
                  count={industry.count}
                  avgRevenue={industry.avgRevenue}
                  isTop={index === 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Revenue Analysis */}
        {revenueData && revenueData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                  Revenue Trends
                </h3>
                <p className="text-gray-600 mt-1">Monthly revenue analysis and trends</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>Revenue growth</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revenueData.slice(-6).map((revenue, index) => (
                <RevenueCard key={index} revenue={revenue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyForecast;