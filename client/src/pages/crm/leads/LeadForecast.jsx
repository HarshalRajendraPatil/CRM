import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  SparklesIcon,
  StarIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { getLeadForecast } from '../../../store/leadSlice';

const LeadForecast = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { forecastData, isLoading: loading, isSuccess, isError } = useSelector((state) => state.leads);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [selectedType, setSelectedType] = useState('conversion');

  useEffect(() => {
    dispatch(getLeadForecast({ projectId, params: { period: selectedPeriod, type: selectedType } }));
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
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${gradient ? 'bg-gradient-to-br from-green-50 to-emerald-50' : ''}`}>
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

  const ForecastChart = ({ data, title, subtitle, type = 'leads' }) => {
    if (!data || data.length === 0) return null;

    const getValue = (item) => {
      if (type === 'conversion') return item.projectedConverted || item.converted || 0;
      if (type === 'qualification') return item.projectedQualified || item.qualified || 0;
      return item.projectedTotal || item.total || 0;
    };

    const maxValue = Math.max(...data.map(d => getValue(d)));
    const minValue = Math.min(...data.map(d => getValue(d)));
    const range = maxValue - minValue;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Historical</span>
            <div className="w-3 h-3 bg-green-300 rounded-full ml-4"></div>
            <span className="text-sm text-gray-600">Projected</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.map((item, index) => {
            const value = getValue(item);
            const percentage = range > 0 ? ((value - minValue) / range) * 100 : 50;
            const isProjected = item.projectedTotal !== undefined;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-600">
                  {item.month}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className={`h-6 rounded-full ${isProjected ? 'bg-green-300' : 'bg-green-500'} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-sm font-bold text-gray-900 text-right">
                  {formatNumber(value)}
                </div>
                {isProjected && (
                  <div className="w-24 text-xs text-green-600 font-medium">
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

  const FunnelChart = ({ data }) => {
    if (!data) return null;

    const stages = [
      { key: 'newToContacted', label: 'New → Contacted', value: data.newToContacted, color: 'blue' },
      { key: 'contactedToQualified', label: 'Contacted → Qualified', value: data.contactedToQualified, color: 'yellow' },
      { key: 'qualifiedToConverted', label: 'Qualified → Converted', value: data.qualifiedToConverted, color: 'green' }
    ];

    const maxValue = Math.max(...stages.map(s => s.value));

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FunnelIcon className="h-6 w-6 mr-2" />
              Conversion Funnel
            </h3>
            <p className="text-sm text-gray-500 mt-1">Lead progression through stages</p>
          </div>
        </div>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                <span className="text-sm font-bold text-gray-900">{formatPercentage(stage.value * 100)}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div 
                  className={`h-8 rounded-full bg-${stage.color}-500 flex items-center justify-end pr-3 transition-all duration-1000`}
                  style={{ width: `${(stage.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {formatPercentage(stage.value * 100)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SourceCard = ({ source, total, conversionRate, qualificationRate, avgScore, isTop = false }) => (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${isTop ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 capitalize">{source}</h4>
        {isTop && <StarIcon className="h-5 w-5 text-yellow-500" />}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Leads</span>
          <span className="font-bold">{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Conversion Rate</span>
          <span className="font-bold text-green-600">{conversionRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Qualification Rate</span>
          <span className="font-bold text-blue-600">{qualificationRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg Score</span>
          <span className="font-bold text-purple-600">{avgScore.toFixed(0)}</span>
        </div>
        <div className="mt-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const ScoreBucket = ({ range, count, converted, isHighlight = false }) => (
    <div className={`text-center p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${isHighlight ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'}`}>
      <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
      <div className="text-sm text-gray-600 mb-2">Score {range}</div>
      <div className="text-xs text-gray-500">
        {converted} converted
      </div>
      {isHighlight && <StarIcon className="h-4 w-4 text-yellow-500 mx-auto mt-1" />}
    </div>
  );

  const VelocityCard = ({ velocity }) => (
    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{velocity.month}</span>
        <RocketLaunchIcon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Projected Velocity</span>
          <span className="font-semibold">{formatNumber(velocity.projectedVelocity)} leads</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Expected Conversions</span>
          <span className="font-semibold text-green-600">{formatNumber(velocity.expectedConversions)}</span>
        </div>
      </div>
    </div>
  );

  if (loading && !isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
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
              <p className="text-sm text-red-600 mt-1">Unable to load lead forecast data. Please try again.</p>
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
    funnelTrends,
    sourcePerformance,
    scoreDistribution,
    conversionMetrics,
    velocityForecast,
    riskAssessment, 
    insights 
  } = forecastData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Lead Forecast</h1>
              <p className="text-lg text-gray-600">Conversion predictions and lead quality analysis</p>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="conversion">Conversion Forecast</option>
                <option value="qualification">Qualification Forecast</option>
                <option value="velocity">Velocity Forecast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={formatNumber(insights.totalLeads)}
            icon={UserGroupIcon}
            color="blue"
            gradient={true}
          />
          <StatCard
            title="Conversion Rate"
            value={formatPercentage(conversionMetrics.avgConversionRate)}
            subtitle="Average"
            icon={ArrowTrendingUpIcon}
            color="green"
          />
          <StatCard
            title="Expected Conversions"
            value={formatNumber(insights.expectedConversions)}
            subtitle="Next 6 months"
            icon={SparklesIcon}
            color="purple"
          />
          <StatCard
            title="Avg Conversion Time"
            value={`${Math.round(conversionMetrics.avgConversionTime)} days`}
            subtitle="Time to convert"
            icon={ClockIcon}
            color="indigo"
          />
        </div>

        {/* Risk Assessment */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 border-2 ${getRiskBgColor(riskAssessment.score)}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-gray-700" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Lead Quality Assessment</h3>
                <p className="text-gray-600">Lead portfolio health and quality analysis</p>
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
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Quality Factors
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Low Score Leads</span>
                  <span className="font-bold text-red-600">{riskAssessment.factors.lowScoreLeads}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Stale Leads</span>
                  <span className="font-bold text-yellow-600">{riskAssessment.factors.staleLeads}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">Unassigned Leads</span>
                  <span className="font-bold text-orange-600">{riskAssessment.factors.unassignedLeads}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-gray-700">No Activity</span>
                  <span className="font-bold text-purple-600">{riskAssessment.factors.noActivityLeads}</span>
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
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-bold">{index + 1}</span>
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
            title="Lead Volume Forecast" 
            subtitle="Historical data and future projections"
            type="leads"
          />
          <ForecastChart 
            data={[...historical, ...forecast]} 
            title="Conversion Forecast" 
            subtitle="Expected conversion rates"
            type="conversion"
          />
        </div>

        {/* Funnel Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FunnelChart data={funnelTrends} />
          
          {/* Source Performance */}
          {sourcePerformance && sourcePerformance.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <GlobeAltIcon className="h-6 w-6 mr-2" />
                    Source Performance
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Lead source effectiveness analysis</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <StarIcon className="h-4 w-4" />
                  <span>Top performer</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {sourcePerformance.slice(0, 5).map((source, index) => (
                  <SourceCard
                    key={index}
                    source={source._id}
                    total={source.total}
                    conversionRate={source.conversionRate}
                    qualificationRate={source.qualificationRate}
                    avgScore={source.avgScore}
                    isTop={index === 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score Distribution */}
        {scoreDistribution && scoreDistribution.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrashIcon className="h-6 w-6 mr-2" />
                  Lead Score Distribution
                </h3>
                <p className="text-gray-600 mt-1">Lead quality distribution across score ranges</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <StarIcon className="h-4 w-4" />
                <span>Highest performing</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scoreDistribution.map((bucket, index) => (
                <ScoreBucket
                  key={index}
                  range={bucket._id}
                  count={bucket.count}
                  converted={bucket.converted}
                  isHighlight={index === scoreDistribution.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Velocity Forecast */}
        {velocityForecast && velocityForecast.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <RocketLaunchIcon className="h-6 w-6 mr-2" />
                  Lead Velocity Forecast
                </h3>
                <p className="text-gray-600 mt-1">Expected lead generation and conversion rates</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>Growth projection</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {velocityForecast.map((velocity, index) => (
                <VelocityCard key={index} velocity={velocity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadForecast;