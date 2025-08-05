import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCompanyStats } from '../../../store/companySlice';

const CompanyOverviewCard = ({ projectId }) => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.companies);

  useEffect(() => {
    if (projectId) {
      dispatch(getCompanyStats(projectId));
    }
  }, [dispatch, projectId]);

  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const totalCompanies = stats?.total || 0;
  const statusCounts = stats?.byStatus || {};
  const activeCount = statusCounts.active || 0;
  const leadCount = statusCounts.lead || 0;
  const customerCount = statusCounts.customer || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Companies Overview</h3>
          <Link 
            to={`/crm/${projectId}/companies`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-800 mb-1">Total Companies</div>
            <div className="text-2xl font-semibold text-indigo-900">{formatNumber(totalCompanies)}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800 mb-1">Active</div>
            <div className="text-2xl font-semibold text-green-900">{formatNumber(activeCount)}</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-800 mb-1">Leads</div>
            <div className="text-2xl font-semibold text-yellow-900">{formatNumber(leadCount)}</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-1">Customers</div>
            <div className="text-2xl font-semibold text-blue-900">{formatNumber(customerCount)}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-3">
        <Link 
          to={`/crm/${projectId}/companies`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          <span>Manage companies</span>
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CompanyOverviewCard;