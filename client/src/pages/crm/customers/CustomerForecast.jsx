import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerForecast } from '../../../store/customerSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Alert from '../../../components/ui/Alert';

const CustomerForecast = ({ projectId }) => {
  const dispatch = useDispatch();
  const { forecast, isForecastLoading, error } = useSelector((state) => state.customers);
  const [forecastMonths, setForecastMonths] = useState(6);

  useEffect(() => {
    console.log(projectId);
    if (projectId) {
      dispatch(fetchCustomerForecast({ projectId, months: forecastMonths }));
    }
  }, [dispatch, projectId, forecastMonths]);

  console.log(forecast);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getGrowthColor = (rate) => {
    if (rate > 10) return 'text-green-600';
    if (rate > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

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

  const renderForecast = () => {
    const hasData = forecast?.historical?.length > 0 || forecast?.forecast?.length > 0;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Forecast Period:</label>
            <select
              value={forecastMonths}
              onChange={(e) => setForecastMonths(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
          
          {forecast?.growthRate !== undefined && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className={`text-2xl font-bold ${getGrowthColor(forecast.growthRate)}`}>
                {formatPercentage(forecast.growthRate)}
              </p>
            </div>
          )}
        </div>

        <ChartContainer 
          title="Customer Growth Forecast" 
          isEmpty={!hasData}
          emptyMessage="No forecast data available"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              ...(forecast?.historical || []).map(item => ({ ...item, type: 'Historical' })),
              ...(forecast?.forecast || []).map(item => ({ ...item, type: 'Forecast' }))
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
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name, props) => [
                  formatNumber(value), 
                  props.payload.type === 'Historical' ? 'Historical' : 'Forecast'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {forecast?.forecast?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(forecast.historical?.[forecast.historical.length - 1]?.count || 0)}
                </p>
                <p className="text-xs text-gray-500">customers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Projected in {forecastMonths} months</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(forecast.forecast?.[forecast.forecast.length - 1]?.projected || 0)}
                </p>
                <p className="text-xs text-gray-500">customers</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Expected Growth</p>
                <p className={`text-2xl font-bold ${getGrowthColor(forecast.growthRate || 0)}`}>
                  {formatPercentage(forecast.growthRate || 0)}
                </p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isForecastLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Forecast</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Customer Forecast</h2>
        </div>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Forecast</h2>
      </div>

      {renderForecast()}
    </div>
  );
};

export default CustomerForecast;