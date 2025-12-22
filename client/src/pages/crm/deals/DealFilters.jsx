import React, { useState } from "react";

const DealFilters = ({
  filters,
  onFilterChange,
  customers = [],
  companies = [],
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "",
      priority: "",
      assignedTo: "",
      customer: "",
      company: "",
      valueRange: { min: "", max: "" },
      closeDateRange: { start: "", end: "" },
      createdDateRange: { start: "", end: "" },
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key.includes("Range")) {
        if (value.min || value.max) count++;
      } else if (value && value !== "") {
        count++;
      }
    });
    return count;
  };

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" },
    { value: "on-hold", label: "On Hold" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {getActiveFilterCount()} active
          </span>
          <button
            onClick={handleClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={localFilters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={localFilters.customer || ""}
            onChange={(e) => handleFilterChange("customer", e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Company
          </label>
          <select
            value={localFilters.company || ""}
            onChange={(e) => handleFilterChange("company", e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Value Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Value Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.valueRange?.min || ""}
              onChange={(e) =>
                handleFilterChange("valueRange", {
                  ...localFilters.valueRange,
                  min: e.target.value,
                })
              }
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.valueRange?.max || ""}
              onChange={(e) =>
                handleFilterChange("valueRange", {
                  ...localFilters.valueRange,
                  max: e.target.value,
                })
              }
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Close Date Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Close Date Range
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={localFilters.closeDateRange?.start || ""}
              onChange={(e) =>
                handleFilterChange("closeDateRange", {
                  ...localFilters.closeDateRange,
                  start: e.target.value,
                })
              }
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="date"
              value={localFilters.closeDateRange?.end || ""}
              onChange={(e) =>
                handleFilterChange("closeDateRange", {
                  ...localFilters.closeDateRange,
                  end: e.target.value,
                })
              }
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DealFilters;
