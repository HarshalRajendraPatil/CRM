import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLeadStats, getLeadInsights } from "../../../store/leadSlice";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LeadForecast from "./LeadForecast";

const LeadStats = ({ projectId }) => {
  const dispatch = useDispatch();
  const { stats, insights, isLoading } = useSelector((state) => state.leads);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(getLeadStats({ projectId }));
    dispatch(getLeadInsights({ projectId }));
  }, [dispatch, projectId]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={insights?.totals?.totalLeads || 0}
          icon={
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Conversion Rate"
          value={`${insights?.totals?.conversionRate || 0}%`}
          subtitle="Qualified leads"
          icon={
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
            </svg>
          }
          color="green"
        />
        <StatCard
          title="This Month"
          value={insights?.totals?.leadsThisMonth || 0}
          subtitle="New leads"
          icon={
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="Active Leads"
          value={
            (insights?.totals?.totalLeads || 0) -
            (insights?.totals?.totalDisqualified || 0)
          }
          subtitle="Excluding disqualified"
          icon={
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          }
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights?.dailyCreationTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Lead Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "New", value: insights?.totals?.totalNew || 0 },
                  {
                    name: "Contacted",
                    value: insights?.totals?.totalContacted || 0,
                  },
                  {
                    name: "Qualified",
                    value: insights?.totals?.totalQualified || 0,
                  },
                  {
                    name: "Disqualified",
                    value: insights?.totals?.totalDisqualified || 0,
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  percent == 0 ? "" : `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderFunnel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Funnel Analysis</h3>
        <div className="space-y-4">
          {insights?.funnel?.map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-600 capitalize">
                {stage.stage}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${
                        (stage.count /
                          Math.max(...insights.funnel.map((s) => s.count))) *
                        100
                      }%`,
                    }}
                  >
                    {stage.count}
                  </div>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-500">
                {stage.conversionFromPrev}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Source Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights?.sourceDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Aging Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(insights?.agingBuckets || {}).map(
                ([key, value]) => ({ age: key, count: value })
              )}
            >
              <CartesianGrid strokeDasharray="3,3" />
              <XAxis dataKey="age" />
              <YAxis dataKey="count" />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Team Member
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Total Leads
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Qualified
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {insights?.ownerPerformance?.map((perf, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{perf.owner?.name || "Unknown"}</td>
                  <td className="py-3 px-4">{perf.total}</td>
                  <td className="py-3 px-4">{perf.qualified}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        perf.conversionRate >= 50
                          ? "bg-green-100 text-green-800"
                          : perf.conversionRate >= 25
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {perf.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Tags</h3>
          <div className="space-y-3">
            {insights?.topTags?.slice(0, 10).map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{tag.tag}</span>
                <span className="text-sm font-medium text-gray-900">
                  {tag.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {insights?.recentActivity?.map((lead, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.name}
                  </p>
                  <p className="text-xs text-gray-500">{lead.owner?.name}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    lead.status === "qualified"
                      ? "bg-green-100 text-green-800"
                      : lead.status === "contacted"
                      ? "bg-blue-100 text-blue-800"
                      : lead.status === "new"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lead Analytics</h2>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", name: "Overview" },
              { id: "funnel", name: "Funnel Analysis" },
              { id: "performance", name: "Performance" },
              { id: "forecast", name: "Forecast" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "funnel" && renderFunnel()}
          {activeTab === "performance" && renderPerformance()}
          {activeTab === "forecast" && <LeadForecast />}
        </div>
      </div>
    </div>
  );
};

export default LeadStats;
