import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getProjectCompanies, getCompanyStats, clearCompanies } from '../../../store/companySlice';
import CrmLayout from '../../../layouts/CrmLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CompanyListItem from './CompanyListItem';
import CompanySidebar from './CompanySidebar';
import CompanyFilters from './CompanyFilters';
import CompanyStatsCards from './CompanyStatsCards';

const Companies = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { companies, stats, isLoading, isError, message, pagination } = useSelector((state) => state.companies);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    tags: []
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load companies and stats on component mount
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectCompanies({
        projectId,
        params: {
          limit: 20,
          skip: 0,
          sort: sortBy,
          order: sortOrder
        }
      }));
      dispatch(getCompanyStats(projectId));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCompanies());
    };
  }, [dispatch, projectId]);

  // Handle search and filter changes
  useEffect(() => {
    if (projectId) {
      const params = {
        limit: 20,
        skip: 0,
        sort: sortBy,
        order: sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.industry !== 'all') {
        params.industry = filters.industry;
      }

      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }

      dispatch(getProjectCompanies({ projectId, params }));
    }
  }, [dispatch, projectId, searchTerm, filters, sortBy, sortOrder]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending order for a new field
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasMore) {
      const params = {
        limit: 20,
        skip: companies.length,
        sort: sortBy,
        order: sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.industry !== 'all') {
        params.industry = filters.industry;
      }

      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }

      dispatch(getProjectCompanies({ projectId, params }));
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  return (
    <CrmLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all companies in your CRM
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="primary"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
              onClick={toggleSidebar}
            >
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && <CompanyStatsCards stats={stats} />}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-grow max-w-md">
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
              <CompanyFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                industries={stats?.byIndustry ? Object.keys(stats.byIndustry) : []}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <Alert variant="danger" message={message} className="mb-6" />
        )}

        {/* Companies List */}
        {isLoading && companies.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No companies found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first company</p>
            <Button variant="primary" onClick={toggleSidebar}>Add Company</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      <div className="flex items-center">
                        Company
                        {sortBy === 'name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('industry')}
                    >
                      <div className="flex items-center">
                        Industry
                        {sortBy === 'industry' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <CompanyListItem 
                      key={company._id} 
                      company={company} 
                      projectId={projectId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Load More */}
            {pagination.hasMore && (
              <div className="px-6 py-4 border-t border-gray-200 text-center">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
            
            {/* Load More */}
            {pagination.hasMore && (
              <div className="col-span-full text-center py-6">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
      </div>

      {/* Create/Edit Company Sidebar */}
      <CompanySidebar
        isOpen={showSidebar}
        onClose={toggleSidebar}
        projectId={projectId}
      />
    </CrmLayout>
  );
};

export default Companies;