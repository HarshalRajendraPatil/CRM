import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerInsights } from '../../../store/customerSlice';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Alert from '../../../components/ui/Alert';

const CustomerInsights = ({ projectId }) => {
  const dispatch = useDispatch();
  const { insights, isInsightsLoading, error } = useSelector((state) => state.customers);
  const [activeTab, setActiveTab] = useState('funnel');
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchCustomerInsights({ projectId, params: { period } }));
    }
  }, [dispatch, projectId, period]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const EmptyState = ({ title, description, icon }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <div className="w-8 h-8 text-gray-400">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    </div>
  );

  const ChartContainer = ({ title, children, isEmpty = false, emptyMessage = "No data available" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {isEmpty ? (
        <EmptyState 
          title="No Data Available" 
          description={emptyMessage}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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

  const renderFunnel = () => {
    const hasStageData = insights?.stageConversionRates?.length > 0;
    const maxCount = hasStageData ? Math.max(...insights.stageConversionRates.map(s => s.count)) : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Conversion Funnel</h3>
          {!hasStageData ? (
            <EmptyState 
              title="No Conversion Data" 
              description="Conversion funnel data will appear here once customers are in different stages"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              }
            />
          ) : (
            <div className="space-y-6">
              {insights.stageConversionRates.map((stage, index) => (
                <div key={stage._id} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600 capitalize">
                    {stage._id}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-8 relative">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
                        style={{ 
                          width: `${maxCount > 0 ? (stage.count / maxCount) * 100 : 0}%` 
                        }}
                      >
                        {stage.count}
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-sm font-medium text-gray-900">
                    ${(stage.totalValue || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer 
            title="Stage Conversion Rates" 
            isEmpty={!hasStageData}
            emptyMessage="No stage conversion data available"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights?.stageConversionRates || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>


        </div>
      </div>
    );
  };

  const renderLifecycle = () => {
    const lifecycleStages = [
      { stage: 'awareness', color: 'blue', icon: '👁️', description: 'Customer becomes aware of your product/service' },
      { stage: 'consideration', color: 'yellow', icon: '🤔', description: 'Customer evaluates your offering' },
      { stage: 'decision', color: 'green', icon: '✅', description: 'Customer makes a purchase decision' },
      { stage: 'retention', color: 'purple', icon: '🔄', description: 'Customer continues to use your product' },
      { stage: 'advocacy', color: 'emerald', icon: '⭐', description: 'Customer recommends your product to others' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {lifecycleStages.map((lifecycleStage) => {
            const count = insights?.stageConversionRates?.find(s => s._id === lifecycleStage.stage)?.count || 0;
            return (
              <div key={lifecycleStage.stage} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{lifecycleStage.icon}</div>
                <h4 className="font-semibold text-gray-900 capitalize mb-2">{lifecycleStage.stage}</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">{count}</p>
                <p className="text-sm text-gray-500">customers</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Lifecycle Journey</h3>
          <div className="relative">
            <div className="flex items-center justify-between">
              {lifecycleStages.map((step, index) => (
                <div key={step.stage} className="flex flex-col items-center text-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-yellow-500' :
                    index === 2 ? 'bg-green-500' :
                    index === 3 ? 'bg-purple-500' :
                    'bg-emerald-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < lifecycleStages.length - 1 && (
                    <div className="absolute top-6 left-full w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                  )}
                  <div className="mt-3 text-sm font-medium text-gray-900 capitalize">{step.stage}</div>
                  <div className="mt-1 text-xs text-gray-500 max-w-24 leading-tight">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPredictive = () => {
    const hasChurnData = insights?.churnRate !== undefined;
    const hasLifetimeValue = insights?.customerLifetimeValue;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk Analysis</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {(insights?.churnRate || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mb-4">Current churn rate</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((insights?.churnRate || 0), 100)}%` }}
                ></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Risk</span>
                  <span className="text-green-600 font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medium Risk</span>
                  <span className="text-yellow-600 font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Risk</span>
                  <span className="text-red-600 font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Next 30 days</span>
                <span className="text-lg font-bold text-blue-600">$45,200</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Next 90 days</span>
                <span className="text-lg font-bold text-green-600">$128,500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Next 6 months</span>
                <span className="text-lg font-bold text-purple-600">$312,800</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Health Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">78</div>
              <p className="text-sm text-gray-500 mb-4">Average health score</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full transition-all duration-300" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <ChartContainer 
          title="Customer Lifetime Value Prediction" 
          isEmpty={!hasLifetimeValue}
          emptyMessage="No lifetime value data available for predictions"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { month: 'Jan', predicted: 2500, actual: 2400 },
              { month: 'Feb', predicted: 2800, actual: 2750 },
              { month: 'Mar', predicted: 3200, actual: 3100 },
              { month: 'Apr', predicted: 3600, actual: 3500 },
              { month: 'May', predicted: 4000, actual: 3800 },
              { month: 'Jun', predicted: 4400, actual: 4200 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'LTV']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stackId="1" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3} 
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  };

  const renderBehavioral = () => {
    const hasInteractionData = insights?.interactionAnalysis?.length > 0;
    const hasCreationTrend = insights?.dailyCreationTrend?.length > 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Patterns</h3>
            {!hasInteractionData ? (
              <EmptyState 
                title="No Interaction Data" 
                description="Interaction patterns will appear here once customers have interactions recorded"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                }
              />
            ) : (
              <div className="space-y-3">
                {insights.interactionAnalysis.map((interaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{interaction._id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{interaction.count}</div>
                      {interaction.avgDuration && (
                        <div className="text-xs text-gray-500">{(interaction.avgDuration).toFixed(1)} min avg</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ChartContainer 
            title="Communication Preferences" 
            isEmpty={false}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Email', value: 45 },
                    { name: 'Phone', value: 30 },
                    { name: 'SMS', value: 15 },
                    { name: 'Other', value: 10 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <ChartContainer 
          title="Customer Engagement Timeline" 
          isEmpty={!hasCreationTrend}
          emptyMessage="No customer engagement data available for the selected period"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insights?.dailyCreationTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="New Customers" 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  };

  if (isInsightsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Insights</h2>
          <div className="flex items-center space-x-3">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Insights</h2>
        </div>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Insights</h2>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'funnel', name: 'Conversion Funnel' },
              { id: 'lifecycle', name: 'Lifecycle Analysis' },
              { id: 'predictive', name: 'Predictive Analytics' },
              { id: 'behavioral', name: 'Behavioral Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'funnel' && renderFunnel()}
          {activeTab === 'lifecycle' && renderLifecycle()}
          {activeTab === 'predictive' && renderPredictive()}
          {activeTab === 'behavioral' && renderBehavioral()}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
