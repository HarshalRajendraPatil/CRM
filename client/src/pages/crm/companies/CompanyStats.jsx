import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCompanyInsights } from '../../../store/companySlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const CompanyStats = ({ stats, projectId }) => {
  const dispatch = useDispatch();
  const { insights, isLoading, isError, message } = useSelector((state) => state.companies);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch insights when component mounts or when projectId changes
  useEffect(() => {
    if (projectId && activeTab === 'insights') {
      dispatch(getCompanyInsights(projectId));
    }
  }, [dispatch, projectId, activeTab]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading statistics: {message}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = Object.entries(stats.byStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    status
  }));

  const industryData = Object.entries(stats.byIndustry || {}).map(([industry, count]) => ({
    name: industry || 'Unknown',
    value: count
  }));

  const sizeData = Object.entries(stats.bySize || {}).map(([size, count]) => ({
    name: size || 'Unknown',
    value: count
  }));

  const revenueData = Object.entries(stats.byRevenue || {}).map(([revenue, count]) => ({
    name: revenue || 'Unknown',
    value: count
  }));

  // Format growth trend data for charts
  const growthData = (stats.growthTrend || []).map(item => ({
    month: `${item._id?.year || ''}-${String(item._id?.month || '').padStart(2, '0')}`,
    count: item.count
  }));

  // Format activity trends data for charts
  const activityData = (stats.activityTrends || []).map(item => ({
    date: `${item._id?.year || ''}-${String(item._id?.month || '').padStart(2, '0')}-${String(item._id?.day || '').padStart(2, '0')}`,
    count: item.count
  }));

  const topTagsData = (stats.topTags || []).map(item => ({
    tag: item.tag || 'Unknown',
    count: item.count
  }));

  const countryData = (stats.companiesByCountry || []).map(item => ({
    country: item.country || 'Unknown',
    count: item.count
  }));

  // Color schemes
  const statusColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4'];

  const StatCard = ({ title, value, subtitle, icon, color = 'indigo' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-100`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'trends'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'details'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'insights'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Companies"
              value={stats.total || 0}
              icon={
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              color="indigo"
            />
            <StatCard
              title="Active Companies"
              value={stats.byStatus?.active || 0}
              subtitle={`${stats.total > 0 ? Math.round((stats.byStatus?.active / stats.total) * 100) : 0}% of total`}
              icon={
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatCard
              title="Lead Companies"
              value={stats.byStatus?.lead || 0}
              subtitle="Potential opportunities"
              icon={
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="yellow"
            />
            <StatCard
              title="Customer Companies"
              value={stats.byStatus?.customer || 0}
              subtitle="Current customers"
              icon={
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              color="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                {statusData.length > 0 ? <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart> : <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">No data available</p>  
                </div>}
              </ResponsiveContainer>
            </div>

            {/* Industry Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Industries</h3>
              <ResponsiveContainer width="100%" height={300}>
                {industryData.length > 0 ? <BarChart data={industryData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart> : <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">No data available</p>  
                </div>}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Growth Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Growth Trend (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {growthData.length > 0 ? <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart> : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </ResponsiveContainer>
          </div>

          {/* Activity Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {activityData.length > 0 ? <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
              </LineChart> : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Company Size Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Size Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              {sizeData.length > 0 ? <BarChart data={sizeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" />
              </BarChart> : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Annual Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              {revenueData.length > 0 ? <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart> : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </ResponsiveContainer>
          </div>

          {/* Top Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Tags</h3>
            <div className="space-y-3">
              {topTagsData.length > 0 ? topTagsData.slice(0, 10).map((tag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{tag.tag}</span>
                  <span className="text-sm font-medium text-gray-900">{tag.count}</span>
                </div>
              )) : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </div>
          </div>

          {/* Companies by Country */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Companies by Country</h3>
            <ResponsiveContainer width="100%" height={300}>
              {countryData.length > 0 ? <BarChart data={countryData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" />
                </BarChart> : <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No data available</p>  
              </div>}
            </ResponsiveContainer>
          </div>

          {/* Companies with Most Notes */}
          {stats.companiesWithMostNotes && stats.companiesWithMostNotes.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Companies with Most Notes</h3>
              <div className="space-y-3">
                {stats.companiesWithMostNotes.map((company, index) => (
                  <div key={`company-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.notesCount} notes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No data available</p>  
          </div>}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insights ? (
            <>
              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Avg Notes per Company"
                  value={insights.avgNotesPerCompany?.toFixed(1) || '0'}
                  subtitle="Average engagement"
                  icon={
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  color="purple"
                />
                <StatCard
                  title="Completion Rate"
                  value={`${insights.completionRate || 0}%`}
                  subtitle="Complete profiles"
                  icon={
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  color="green"
                />
                <StatCard
                  title="Activity Rate"
                  value={`${insights.activityRate || 0}%`}
                  subtitle="Active this week"
                  icon={
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  title="This Month"
                  value={insights.companiesThisMonth || 0}
                  subtitle="New companies"
                  icon={
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  color="indigo"
                />
              </div>

              {/* Detailed Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                {insights.statusDistribution && insights.statusDistribution.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={insights.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {insights.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Industry Distribution */}
                {insights.industryDistribution && insights.industryDistribution.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Industry Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={insights.industryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="industry" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Most Active Companies */}
              {insights.mostActiveCompanies && insights.mostActiveCompanies.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Companies</h3>
                  <div className="space-y-3">
                    {insights.mostActiveCompanies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            Last activity: {company.lastActivityType} - {company.lastActivityDate ? new Date(company.lastActivityDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        {company.lastActivityBy && (
                          <div className="text-xs text-gray-500">
                            by {company.lastActivityBy.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performing Companies */}
              {insights.topPerformingCompanies && insights.topPerformingCompanies.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Companies</h3>
                  <div className="space-y-3">
                    {insights.topPerformingCompanies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.industry} • {company.status}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {company.lastActivityDate && new Date(company.lastActivityDate).toLocaleDateString() || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-gray-600">Loading insights...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyStats;
