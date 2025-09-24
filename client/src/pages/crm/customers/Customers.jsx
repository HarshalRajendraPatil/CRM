import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchProjectCustomers, 
  setFilters, 
  clearFilters,
  archiveCustomer,
  bulkUpdateCustomers,
  bulkArchiveCustomers,
  bulkUnarchiveCustomers,
  bulkAssignCustomers,
  bulkUpdateCustomerStages,
  bulkUpdateCustomerPriorities,
  bulkUpdateCustomerStatuses,
  bulkDeleteCustomers,
} from '../../../store/customerSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CustomerFilters from './CustomerFilters';
import CustomerListItem from './CustomerListItem';
import CustomerStats from './CustomerStats';
import CustomerInsights from './CustomerInsights';
import CustomerForecast from './CustomerForecast';
import CustomerKanban from './CustomerKanban';
import CustomerSidebar from './CustomerSidebar';
import CrmLayout from '../../../layouts/CrmLayout';

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const { 
    customers, 
    isLoading, 
    error, 
    filters, 
    pagination,
    isArchiving 
  } = useSelector((state) => state.customers);
  
  const { user } = useSelector((state) => state.auth);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, kanban, stats, insights, forecast
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSidebar, setShowCustomerSidebar] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadCustomers();
    }
  }, [projectId, filters]);

  const loadCustomers = () => {
    const params = {
      ...filters,
      search: searchTerm || filters.search,
      limit: pagination.limit,
      skip: pagination.skip
    };
    dispatch(fetchProjectCustomers({ projectId, params }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedCustomers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to archive ${selectedCustomers.length} customer(s)?`
    );
    
    if (confirmed) {
      await dispatch(bulkArchiveCustomers({ customerIds: selectedCustomers, projectId }));
      setSelectedCustomers([]);
    }
  };

  const handleBulkUnarchive = async () => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUnarchiveCustomers({ customerIds: selectedCustomers, projectId }));
    setSelectedCustomers([]);
  };

  const handleBulkAssign = async (assignedTo) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkAssignCustomers({ customerIds: selectedCustomers, assignedTo, projectId }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdateStage = async (stage) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerStages({ customerIds: selectedCustomers, stage, projectId }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdatePriority = async (priority) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerPriorities({ customerIds: selectedCustomers, priority, projectId }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerStatuses({ customerIds: selectedCustomers, status, projectId }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomers({ customerIds: selectedCustomers, updates }));
    setSelectedCustomers([]);
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`
    );
    
    if (confirmed) {
      await dispatch(bulkDeleteCustomers({ customerIds: selectedCustomers, projectId }));
      setSelectedCustomers([]);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      dispatch(setFilters({ 
        ...filters, 
        skip: pagination.skip + pagination.limit 
      }));
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      prospect: 'bg-blue-100 text-blue-800',
      lead: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      opportunity: 'bg-purple-100 text-purple-800',
      customer: 'bg-emerald-100 text-emerald-800',
      churned: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || colors.prospect;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">
            Manage your customer relationships and track their journey
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCustomerId(null);
              setShowCustomerSidebar(true);
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            }
          >
            Add Customer
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/customers/import`)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
            }
          >
            Import
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'list', name: 'Customers', count: pagination.total },
              { id: 'kanban', name: 'Kanban' },
              { id: 'stats', name: 'Statistics' },
              { id: 'insights', name: 'Analytics' },
              { id: 'forecast', name: 'Forecast' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {viewMode === 'list' && (
            <>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <form onSubmit={handleSearch} className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search customers by name, email, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    Clear
                  </Button>
                </form>

                {showFilters && (
                  <CustomerFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                )}
              </div>

              {/* Bulk Actions */}
              {selectedCustomers.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedCustomers.length} customer(s) selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkUpdateStage(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="">Change Stage</option>
                        <option value="prospect">Prospect</option>
                        <option value="lead">Lead</option>
                        <option value="qualified">Qualified</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="customer">Customer</option>
                        <option value="churned">Churned</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkUpdatePriority(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="">Change Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkUpdateStatus(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="">Change Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkUnarchive}
                      >
                        Unarchive
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={handleBulkArchive}
                        disabled={isArchiving}
                      >
                        Archive
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={handleBulkDelete}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customers Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.length === customers.length && customers.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <CustomerListItem
                          key={customer._id}
                          customer={customer}
                          isSelected={selectedCustomers.includes(customer._id)}
                          onSelect={handleCustomerSelect}
                          onView={() => navigate(`/crm/${projectId}/customers/${customer._id}`)}
                          getStageColor={getStageColor}
                          getPriorityColor={getPriorityColor}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {!isLoading && customers.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first customer.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => {
                          setEditingCustomerId(null);
                          setShowCustomerSidebar(true);
                        }}
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                        }
                      >
                        Add Customer
                      </Button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                  </div>
                )}

                {/* Load More */}
                {pagination.hasMore && !isLoading && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      fullWidth
                    >
                      Load More Customers
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'kanban' && (
            <CustomerKanban />
          )}

          {viewMode === 'stats' && (
            <CustomerStats projectId={projectId} />
          )}

          {viewMode === 'insights' && (
            <CustomerInsights projectId={projectId} />
          )}

          {viewMode === 'forecast' && (
            <CustomerForecast />
          )}
        </div>
              </div>
      </div>

      {/* Customer Sidebar */}
      <CustomerSidebar
        isOpen={showCustomerSidebar}
        onClose={() => {
          setShowCustomerSidebar(false);
          setEditingCustomerId(null);
        }}
      />
    </CrmLayout>
  );
};

export default Customers;
