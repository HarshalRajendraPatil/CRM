import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CrmLayout from "../../layouts/CrmLayout";
import { generateReport } from "../../services/reportService";

const Reports = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Initialize from location state if available (from Performance page)
  const locationState = location.state || {};
  const [selectedReport, setSelectedReport] = useState(
    locationState.selectedReport || ""
  );
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState(
    locationState.dateRange || {
      startDate: "",
      endDate: "",
    }
  );
  const [filters, setFilters] = useState(
    locationState.userId ? { userId: locationState.userId } : {}
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);

  // Clear location state after using it
  useEffect(() => {
    if (locationState.selectedReport) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  const reportTypes = [
    {
      id: "overview",
      name: "CRM Overview",
      description:
        "Complete overview of your CRM including all entities and statistics",
      icon: "📊",
      category: "General",
    },
    {
      id: "companies",
      name: "Companies Report",
      description: "Detailed report of all companies in your CRM",
      icon: "🏢",
      category: "Entities",
    },
    {
      id: "leads",
      name: "Leads Report",
      description: "Comprehensive leads analysis and conversion metrics",
      icon: "💡",
      category: "Entities",
    },
    {
      id: "customers",
      name: "Customers Report",
      description: "Customer data, lifecycle analysis, and engagement metrics",
      icon: "👥",
      category: "Entities",
    },
    {
      id: "deals",
      name: "Deals Report",
      description: "Sales pipeline, deal analysis, and revenue forecasting",
      icon: "💰",
      category: "Sales",
    },
    {
      id: "tasks",
      name: "Tasks Report",
      description:
        "Task completion, productivity metrics, and team performance",
      icon: "✅",
      category: "Productivity",
    },
    {
      id: "activities",
      name: "Activities Report",
      description: "All activities, interactions, and communication logs",
      icon: "📝",
      category: "Activities",
    },
    {
      id: "performance",
      name: "Performance Report",
      description: "Team performance, productivity metrics, and KPIs",
      icon: "📈",
      category: "Analytics",
    },

  ];

  const formatOptions = [
    { value: "pdf", label: "PDF", icon: "📄" },
    { value: "excel", label: "Excel", icon: "📊" },
    { value: "csv", label: "CSV", icon: "📋" },
    { value: "json", label: "JSON", icon: "🔧" },
  ];

  const handleReportGeneration = async () => {
    if (!selectedReport) {
      alert("Please select a report type");
      return;
    }

    setIsGenerating(true);
    try {
      const reportData = {
        reportType: selectedReport,
        format: reportFormat,
        dateRange,
        filters,
      };

      console.log("Generating report with data:", reportData);

      // Use the report service
      const response = await generateReport(projectId, reportData);

      console.log("Report generation response:", response);

      // Handle the response based on format
      if (reportFormat === "json") {
        // For JSON, show the data in a new window or download as file
        const jsonData = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReport}_report_${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For binary formats (PDF, Excel, CSV), use the blob data from response
        const blob = new Blob([response.data], {
          type:
            response.type ||
            (reportFormat === "pdf"
              ? "application/pdf"
              : reportFormat === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "text/csv"),
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReport}_report_${
          new Date().toISOString().split("T")[0]
        }.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Add to generated reports list
      setGeneratedReports((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: selectedReport,
          format: reportFormat,
          generatedAt: new Date(),
          size:
            response.size ||
            response.data?.size ||
            Math.floor(Math.random() * 5000) + 1000,
        },
      ]);

      alert("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert(
        `Failed to generate report: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getReportIcon = (type) => {
    const report = reportTypes.find((r) => r.id === type);
    return report ? report.icon : "📊";
  };

  const getReportName = (type) => {
    const report = reportTypes.find((r) => r.id === type);
    return report ? report.name : type;
  };

  return (
    <CrmLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate and download comprehensive reports for your CRM data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Generate Report
              </h2>

              {/* Report Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTypes.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedReport === report.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{report.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {report.description}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {report.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="flex space-x-4">
                  {formatOptions.map((format) => (
                    <label
                      key={format.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        reportFormat === format.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={reportFormat === format.value}
                        onChange={(e) => setReportFormat(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-lg">{format.icon}</span>
                      <span className="font-medium">{format.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              {selectedReport && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Filters
                  </label>
                  <div className="space-y-3">
                    {selectedReport === "deals" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Deal Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Minimum Value
                          </label>
                          <input
                            type="number"
                            value={filters.minValue || ""}
                            onChange={(e) =>
                              handleFilterChange("minValue", e.target.value)
                            }
                            placeholder="Enter minimum deal value"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </>
                    )}
                    {selectedReport === "customers" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Customer Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="prospect">Prospect</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Customer Stage
                          </label>
                          <select
                            value={filters.stage || ""}
                            onChange={(e) =>
                              handleFilterChange("stage", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Stages</option>
                            <option value="lead">Lead</option>
                            <option value="prospect">Prospect</option>
                            <option value="customer">Customer</option>
                            <option value="champion">Champion</option>
                          </select>
                        </div>
                      </>
                    )}
                    {selectedReport === "leads" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Lead Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Lead Source
                          </label>
                          <select
                            value={filters.source || ""}
                            onChange={(e) =>
                              handleFilterChange("source", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Sources</option>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="social">Social Media</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                          </select>
                        </div>
                      </>
                    )}
                    {selectedReport === "tasks" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Task Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Priority
                          </label>
                          <select
                            value={filters.priority || ""}
                            onChange={(e) =>
                              handleFilterChange("priority", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </>
                    )}
                    {selectedReport === "companies" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Company Status
                          </label>
                          <select
                            value={filters.status || ""}
                            onChange={(e) =>
                              handleFilterChange("status", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="prospect">Prospect</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Industry
                          </label>
                          <select
                            value={filters.industry || ""}
                            onChange={(e) =>
                              handleFilterChange("industry", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">All Industries</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="finance">Finance</option>
                            <option value="retail">Retail</option>
                            <option value="manufacturing">Manufacturing</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleReportGeneration}
                disabled={!selectedReport || isGenerating}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Report...</span>
                  </div>
                ) : (
                  `Generate ${
                    selectedReport ? getReportName(selectedReport) : "Report"
                  }`
                )}
              </button>
            </div>
          </div>

          {/* Generated Reports History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Reports
              </h3>

              {generatedReports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm">
                    No reports generated yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedReports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg">
                        {getReportIcon(report.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getReportName(report.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.generatedAt.toLocaleDateString()} •{" "}
                          {formatFileSize(report.size)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {report.format}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedReport("overview");
                    setReportFormat("pdf");
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Quick Overview
                      </p>
                      <p className="text-sm text-gray-500">
                        Generate PDF overview
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedReport("deals");
                    setReportFormat("excel");
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="font-medium text-gray-900">Sales Report</p>
                      <p className="text-sm text-gray-500">
                        Excel deals analysis
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedReport("performance");
                    setReportFormat("pdf");
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📈</span>
                    <div>
                      <p className="font-medium text-gray-900">Performance</p>
                      <p className="text-sm text-gray-500">
                        Team performance PDF
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate(`/crm/${projectId}/performance`);
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">👥</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        View Performance
                      </p>
                      <p className="text-sm text-gray-500">
                        Go to Performance page
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrmLayout>
  );
};

export default Reports;
