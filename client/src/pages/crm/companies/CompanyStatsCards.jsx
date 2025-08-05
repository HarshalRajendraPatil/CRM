import React from 'react';

const CompanyStatsCards = ({ stats }) => {
  if (!stats) return null;

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate total companies
  const totalCompanies = stats.total || 0;

  // Calculate status distribution
  const statusCounts = stats.byStatus || {};
  const activeCount = statusCounts.active || 0;
  const leadCount = statusCounts.lead || 0;
  const customerCount = statusCounts.customer || 0;

  // Calculate top industries
  const industries = stats.byIndustry || {};
  const topIndustries = Object.entries(industries)
    .filter(([industry]) => industry !== 'unknown' && industry !== 'undefined')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Companies */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Companies</p>
            <p className="text-2xl font-semibold text-gray-900">{formatNumber(totalCompanies)}</p>
          </div>
        </div>
      </div>

      {/* Active Companies */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Companies</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 mr-2">{formatNumber(activeCount)}</p>
              {totalCompanies > 0 && (
                <p className="text-sm text-gray-500">
                  ({Math.round((activeCount / totalCompanies) * 100)}%)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Leads</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 mr-2">{formatNumber(leadCount)}</p>
              {totalCompanies > 0 && (
                <p className="text-sm text-gray-500">
                  ({Math.round((leadCount / totalCompanies) * 100)}%)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Customers</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 mr-2">{formatNumber(customerCount)}</p>
              {totalCompanies > 0 && (
                <p className="text-sm text-gray-500">
                  ({Math.round((customerCount / totalCompanies) * 100)}%)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Industries (Optional, can be displayed below the main stats) */}
      {topIndustries.length > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Top Industries</h3>
          <div className="flex flex-wrap gap-4">
            {topIndustries.map(([industry, count]) => (
              <div key={industry} className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-700">{industry}</span>
                <span className="ml-1 text-sm text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyStatsCards;