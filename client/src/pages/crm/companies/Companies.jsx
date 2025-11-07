import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProjectCompanies, getCompanyStats, clearCompanies, bulkUpdateCompanies, bulkDeleteCompanies } from '../../../store/companySlice';
import CrmLayout from '../../../layouts/CrmLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CompanyListItem from './CompanyListItem';
import CompanySidebar from './CompanySidebar';
import CompanyFilters from './CompanyFilters';
import CompanyStatsCards from './CompanyStatsCards';
import CompanyStats from './CompanyStats';

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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

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

  // Bulk action functions
  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map(company => company._id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      await dispatch(bulkUpdateCompanies({ 
        companyIds: selectedCompanies, 
        updates: { status: newStatus } 
      }));
      
      // Clear selection after successful update
      setSelectedCompanies([]);
      
      // Refresh companies list
      dispatch(getProjectCompanies({
        projectId,
        params: {
          limit: 20,
          skip: 0,
          sort: sortBy,
          order: sortOrder
        }
      }));
    } catch (error) {
      console.error('Bulk status update failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCompanies.length} companies?`)) {
      try {
        await dispatch(bulkDeleteCompanies(selectedCompanies)).unwrap();
        
        // Clear selection after successful delete
        setSelectedCompanies([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleBulkExport = () => {
    // TODO: Implement bulk export
    console.log('Bulk export:', selectedCompanies);
    // This would export selected companies to CSV/Excel
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
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

        {/* Stats Section */}
        {stats && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Company Statistics</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              >
                {showAdvancedStats ? 'Show Basic Stats' : 'Show Advanced Stats'}
              </Button>
            </div>
            
            {showAdvancedStats ? (
              <CompanyStats stats={stats} projectId={projectId} />
            ) : (
              <CompanyStatsCards stats={stats} />
            )}
          </div>
        )}

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

        {/* Bulk Actions */}
        {selectedCompanies.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : 'y'} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('active')}
                >
                  Mark Active
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('lead')}
                >
                  Mark Lead
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('customer')}
                >
                  Mark Customer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  Export
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setSelectedCompanies([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCompanies.length === companies.length && companies.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
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
                      isSelected={selectedCompanies.includes(company._id)}
                      onSelect={handleSelectCompany}
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