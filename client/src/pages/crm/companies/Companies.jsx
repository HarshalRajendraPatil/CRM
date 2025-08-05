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
  const { project } = useSelector((state) => state.projects);

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
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleViewMode}
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                  title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
                >
                  {viewMode === 'list' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span className="text-gray-300">|</span>
                <CompanyFilters 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  industries={stats?.byIndustry ? Object.keys(stats.byIndustry) : []}
                />
              </div>
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
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companies.map((company) => (
              <div key={company._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <Link to={`/crm/${projectId}/companies/${company._id}`} className="block p-4">
                  <div className="flex items-center mb-3">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-10 w-10 rounded-md object-cover mr-3" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-indigo-700 font-medium text-lg">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{company.name}</h3>
                      <p className="text-xs text-gray-500">{company.industry || 'No industry'}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {company.email && (
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{company.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status === 'active' ? 'bg-green-100 text-green-800' :
                        company.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        company.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                        company.status === 'customer' ? 'bg-blue-100 text-blue-800' :
                        company.status === 'partner' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex -space-x-1 overflow-hidden">
                      {company.tags && company.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block h-6 w-6 rounded-full bg-indigo-100 text-xs text-indigo-800 flex items-center justify-center border border-white"
                          title={tag}
                        >
                          {tag.charAt(0).toUpperCase()}
                        </span>
                      ))}
                      {company.tags && company.tags.length > 3 && (
                        <span className="inline-block h-6 w-6 rounded-full bg-gray-100 text-xs text-gray-800 flex items-center justify-center border border-white">
                          +{company.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            
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