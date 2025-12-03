import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CrmLayout from '../../layouts/CrmLayout';
import { 
  getUserPerformance, 
  getTeamPerformance, 
  getPerformanceUsers 
} from '../../services/performanceService';

const Performance = () => {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [selectedUserId, setSelectedUserId] = useState(userId || currentUser._id);
  const [performanceUsers, setPerformanceUsers] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(userId ? 'individual' : 'team'); // 'team' or 'individual'
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch performance users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getPerformanceUsers(projectId);
        setPerformanceUsers(response.data.users || []);
      } catch (error) {
        console.error('Error fetching performance users:', error);
      }
    };
    fetchUsers();
  }, [projectId]);

  // Fetch individual performance
  useEffect(() => {
    if (viewMode === 'individual' && selectedUserId) {
      fetchIndividualPerformance();
    }
  }, [selectedUserId, viewMode, dateRange, projectId]);

  // Fetch team performance
  useEffect(() => {
    if (viewMode === 'team') {
      fetchTeamPerformance();
    }
  }, [viewMode, dateRange, projectId]);

  const fetchIndividualPerformance = async () => {
    setLoading(true);
    try {
      const options = {};
      if (dateRange.startDate) options.startDate = dateRange.startDate;
      if (dateRange.endDate) options.endDate = dateRange.endDate;
      
      const response = await getUserPerformance(projectId, selectedUserId, options);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching individual performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPerformance = async () => {
    setLoading(true);
    try {
      const options = {};
      if (dateRange.startDate) options.startDate = dateRange.startDate;
      if (dateRange.endDate) options.endDate = dateRange.endDate;
      
      const response = await getTeamPerformance(projectId, options);
      setTeamPerformance(response.data);
    } catch (error) {
      console.error('Error fetching team performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setViewMode('individual');
    navigate(`/crm/${projectId}/performance/${userId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  if (loading && !performanceData && !teamPerformance) {
    return (
      <CrmLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Tracking</h1>
              <p className="text-gray-600">Monitor individual and team performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Generate Report Button */}
              <button
                onClick={() => {
                  navigate(`/crm/${projectId}/reports`, {
                    state: {
                      selectedReport: 'performance',
                      dateRange: dateRange,
                      userId: viewMode === 'individual' ? selectedUserId : null
                    }
                  });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Generate Report</span>
              </button>
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setViewMode('team');
                    navigate(`/crm/${projectId}/performance`);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'team'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team View
                </button>
                <button
                  onClick={() => {
                    setViewMode('individual');
                    setSelectedUserId(currentUser._id);
                    navigate(`/crm/${projectId}/performance/${currentUser._id}`);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'individual'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Individual View
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-6 flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* User Selector for Individual View */}
        {viewMode === 'individual' && performanceUsers.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => handleUserSelect(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {performanceUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Team Performance View */}
        {viewMode === 'team' && teamPerformance && (
          <div className="space-y-6">
            {/* Team Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <div className="text-sm font-medium text-indigo-600 mb-1">Team Size</div>
                  <div className="text-3xl font-bold text-indigo-900">{teamPerformance.teamSize}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-600 mb-1">Average Performance</div>
                  <div className="text-3xl font-bold text-green-900">{teamPerformance.averagePerformance}%</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-600 mb-1">Date Range</div>
                  <div className="text-xl font-bold text-blue-900">
                    {dateRange.startDate || 'All Time'} - {dateRange.endDate || 'Now'}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamPerformance.members.map((member) => (
                      <tr key={member.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {member.profileImage ? (
                              <img className="h-10 w-10 rounded-full" src={member.profileImage} alt={member.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-800 font-medium text-sm">
                                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(member.performance)}`}>
                              {member.performance}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(member.summary?.totalRevenue || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.summary?.totalDeals || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.summary?.totalTasks || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserSelect(member.userId)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Individual Performance View */}
        {viewMode === 'individual' && performanceData && (
          <div className="space-y-6">
            {/* Performance Score Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {performanceData.user.name}'s Performance
                  </h2>
                  <p className="text-indigo-100">{performanceData.user.email}</p>
                  <p className="text-indigo-100 mt-1">
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm">
                      {performanceData.user.role}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold mb-2">
                    {performanceData.performance.performanceScore}%
                  </div>
                  <div className={`text-lg font-semibold ${getPerformanceColor(performanceData.performance.performanceScore)}`}>
                    {getPerformanceLabel(performanceData.performance.performanceScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(performanceData.performance.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Deals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceData.performance.summary.totalDeals}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Task Completion</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceData.performance.summary.completionRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceData.performance.summary.winRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deals Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deals Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Deals</span>
                    <span className="text-lg font-semibold">{performanceData.performance.deals.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Won Deals</span>
                    <span className="text-lg font-semibold text-green-600">{performanceData.performance.deals.won}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lost Deals</span>
                    <span className="text-lg font-semibold text-red-600">{performanceData.performance.deals.lost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Open Deals</span>
                    <span className="text-lg font-semibold text-blue-600">{performanceData.performance.deals.open}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Value</span>
                    <span className="text-lg font-semibold">{formatCurrency(performanceData.performance.deals.totalValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Won Value</span>
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(performanceData.performance.deals.wonValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Deal Value</span>
                    <span className="text-lg font-semibold">{formatCurrency(performanceData.performance.deals.avgDealValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="text-lg font-semibold">{performanceData.performance.deals.winRate}%</span>
                  </div>
                </div>
              </div>

              {/* Tasks Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="text-lg font-semibold">{performanceData.performance.tasks.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-green-600">{performanceData.performance.tasks.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-semibold text-yellow-600">{performanceData.performance.tasks.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-lg font-semibold text-blue-600">{performanceData.performance.tasks.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overdue</span>
                    <span className="text-lg font-semibold text-red-600">{performanceData.performance.tasks.overdue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-lg font-semibold">{performanceData.performance.tasks.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">On-Time Rate</span>
                    <span className="text-lg font-semibold">{performanceData.performance.tasks.onTimeRate}%</span>
                  </div>
                </div>
              </div>

              {/* Customers Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Customers</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Customers</span>
                    <span className="text-lg font-semibold text-green-600">{performanceData.performance.customers.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Interactions</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.interactions.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Calls</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.interactions.calls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Emails</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.interactions.emails}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Meetings</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.interactions.meetings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Customer Score</span>
                    <span className="text-lg font-semibold">{performanceData.performance.customers.score.average}</span>
                  </div>
                </div>
              </div>

              {/* Leads Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Leads</span>
                    <span className="text-lg font-semibold">{performanceData.performance.leads.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Leads</span>
                    <span className="text-lg font-semibold text-blue-600">{performanceData.performance.leads.new}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Contacted</span>
                    <span className="text-lg font-semibold text-yellow-600">{performanceData.performance.leads.contacted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Qualified</span>
                    <span className="text-lg font-semibold text-green-600">{performanceData.performance.leads.qualified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Converted</span>
                    <span className="text-lg font-semibold text-purple-600">{performanceData.performance.leads.converted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-lg font-semibold">{performanceData.performance.leads.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Lead Score</span>
                    <span className="text-lg font-semibold">{performanceData.performance.leads.score.average}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CrmLayout>
  );
};

export default Performance;

