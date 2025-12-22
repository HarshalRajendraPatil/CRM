import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CrmLayout from "../../layouts/CrmLayout";
import {
  fetchDashboardData,
  fetchRevenueTrend,
  fetchDealFunnel,
  fetchTaskCompletion,
  fetchLeadConversion,
  fetchUserPerformance,
} from "../../store/dashboardSlice";
import OverviewCards from "./dashboard/OverviewCards";
import MetricsCards from "./dashboard/MetricsCards";
import RevenueChart from "./dashboard/RevenueChart";
import DealFunnelChart from "./dashboard/DealFunnelChart";
import TaskCompletionChart from "./dashboard/TaskCompletionChart";
import RecentActivity from "./dashboard/RecentActivity";
import TopPerformers from "./dashboard/TopPerformers";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import LeadStatusChart from "./dashboard/LeadStatusChart";

const CrmDashboard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { dashboardData, charts, isLoading, error } = useSelector(
    (state) => state.dashboard
  );

  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    if (projectId) {
      dispatch(fetchDashboardData({ projectId, period: selectedPeriod }));
      dispatch(fetchRevenueTrend({ projectId, period: selectedPeriod }));
      dispatch(fetchDealFunnel(projectId));
      dispatch(fetchTaskCompletion(projectId));
      dispatch(fetchLeadConversion(projectId));
      dispatch(fetchUserPerformance(projectId));
    }
  }, [dispatch, projectId, selectedPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchDashboardData({ projectId, period: selectedPeriod }));
      await dispatch(fetchRevenueTrend({ projectId, period: selectedPeriod }));
      await dispatch(fetchDealFunnel(projectId));
      await dispatch(fetchTaskCompletion(projectId));
      await dispatch(fetchLeadConversion(projectId));
      await dispatch(fetchUserPerformance(projectId));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (isLoading && !dashboardData) {
    return (
      <CrmLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CRM Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Complete overview of your CRM performance and analytics
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Period Selector */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="period"
                  className="text-sm font-medium text-gray-700"
                >
                  Period:
                </label>
                <select
                  id="period"
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="block w-full px-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`-ml-1 mr-2 h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading dashboard
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="mb-8">
            <OverviewCards data={dashboardData} isLoading={isLoading} />
          </div>

          {/* Metrics Cards */}
          <div className="mb-8">
            <MetricsCards data={dashboardData} isLoading={isLoading} />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend Chart */}
            <div>
              <RevenueChart data={charts.revenueTrend} isLoading={isLoading} />
            </div>

            {/* Deal Funnel Chart */}
            <div>
              <DealFunnelChart data={charts.dealFunnel} isLoading={isLoading} />
            </div>
          </div>

          {/* Task Completion and Lead Conversion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <TaskCompletionChart
                data={charts.taskCompletion}
                isLoading={isLoading}
              />
            </div>
            <div>
              <LeadStatusChart
                data={charts.leadConversion}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <RecentActivity
                data={dashboardData?.recentActivities}
                isLoading={isLoading}
              />
            </div>

            {/* Top Performers */}
            <div>
              <TopPerformers
                data={charts.userPerformance}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Analytics Summary */}
          {dashboardData?.analytics && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Analytics Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Deal Analytics */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Deal Analytics
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      Total Value: $
                      {dashboardData.analytics.deals.totalValue?.toLocaleString() ||
                        0}
                    </p>
                    <p>
                      Won Value: $
                      {dashboardData.analytics.deals.wonValue?.toLocaleString() ||
                        0}
                    </p>
                    <p>
                      Open Value: $
                      {dashboardData.analytics.deals.openValue?.toLocaleString() ||
                        0}
                    </p>
                    <p>
                      Win Rate:{" "}
                      {dashboardData.analytics.deals.wonCount &&
                      dashboardData.analytics.deals.totalCount
                        ? Math.round(
                            (dashboardData.analytics.deals.wonCount /
                              dashboardData.analytics.deals.totalCount) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                {/* Task Analytics */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    Task Analytics
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>
                      Total Tasks: {dashboardData.analytics.tasks.total || 0}
                    </p>
                    <p>
                      Completed: {dashboardData.analytics.tasks.completed || 0}
                    </p>
                    <p>
                      In Progress:{" "}
                      {dashboardData.analytics.tasks.inProgress || 0}
                    </p>
                    <p>Overdue: {dashboardData.analytics.tasks.overdue || 0}</p>
                  </div>
                </div>

                {/* Lead Analytics */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-900 mb-2">
                    Lead Analytics
                  </h4>
                  <div className="space-y-1 text-sm text-orange-700">
                    <p>
                      Total Leads: {dashboardData.analytics.leads.total || 0}
                    </p>
                    <p>New: {dashboardData.analytics.leads.new || 0}</p>
                    <p>
                      Qualified: {dashboardData.analytics.leads.qualified || 0}
                    </p>
                    <p>
                      Disqualified:{" "}
                      {dashboardData.analytics.leads.disqualified || 0}
                    </p>
                  </div>
                </div>

                {/* Customer Analytics */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">
                    Customer Analytics
                  </h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <p>
                      Total Customers:{" "}
                      {dashboardData.analytics.customers.total || 0}
                    </p>
                    <p>
                      Active: {dashboardData.analytics.customers.active || 0}
                    </p>
                    <p>
                      Inactive:{" "}
                      {dashboardData.analytics.customers.inactive || 0}
                    </p>
                    <p>
                      Archived:{" "}
                      {dashboardData.analytics.customers.archived || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CrmLayout>
  );
};

export default CrmDashboard;
