import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchProjectCustomers, 
  fetchArchivedCustomers,
  fetchCustomerInsights,
  setFilters, 
  clearFilters,
  archiveCustomer,
  unarchiveCustomer,
  bulkUpdateCustomers,
  bulkArchiveCustomers,
  bulkUnarchiveCustomers,
  bulkAssignCustomers,
  bulkUpdateCustomerStages,
  bulkUpdateCustomerPriorities,
  bulkUpdateCustomerStatuses,
  bulkDeleteCustomers,
  exportCustomers,
} from '../../../store/customerSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CustomerFilters from './CustomerFilters';
import CustomerListItem from './CustomerListItem';
import CustomerStats from './CustomerStats';
import CustomerForecast from './CustomerForecast';
import CustomerKanban from './CustomerKanban';
import CustomerSidebar from './CustomerSidebar';
import CrmLayout from '../../../layouts/CrmLayout';
import useProjectAccess from '../../../hooks/useProjectAccess';
import { getProjectById } from '../../../store/projectSlice';

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const { 
    customers, 
    archivedCustomers,
    isLoading, 
    error, 
    filters, 
    pagination,
    archivedPagination,
    isArchiving,
    insights,
    isInsightsLoading
  } = useSelector((state) => state.customers);
  
  const { project } = useSelector((state) => state.projects);

  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, kanban, stats, insights, forecast
  const [customerView, setCustomerView] = useState('active'); // active or archived
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSidebar, setShowCustomerSidebar] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const {hasSupportExecutiveAccess} = useProjectAccess();

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      loadCustomers();
      if (viewMode === 'insights') {
        dispatch(fetchCustomerInsights({ projectId }));
      }
    }
  }, [projectId, filters, customerView]);

  useEffect(() => {
    if (projectId && viewMode === 'insights') {
      dispatch(fetchCustomerInsights({ projectId }));
    }
  }, [projectId, viewMode]);

  const loadCustomers = () => {
    const params = {
      ...filters,
      search: searchTerm || filters.search,
      limit: customerView === 'active' ? pagination.limit : archivedPagination.limit,
      skip: customerView === 'active' ? pagination.skip : archivedPagination.skip
    };
    
    if (customerView === 'active') {
      dispatch(fetchProjectCustomers({ projectId, params }));
    } else {
      dispatch(fetchArchivedCustomers({ projectId, params }));
    }
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
    const currentCustomers = customerView === 'active' ? customers : archivedCustomers;
    if (selectedCustomers.length === currentCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(currentCustomers.map(c => c._id));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedCustomers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to archive ${selectedCustomers.length} customer(s)?`
    );
    
    if (confirmed) {
      await dispatch(bulkArchiveCustomers({ projectId, customerIds: selectedCustomers}));
      setSelectedCustomers([]);
    }
  };

  const handleBulkUnarchive = async () => {
    if (selectedCustomers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to unarchive ${selectedCustomers.length} customer(s)?`
    );
    
    if (confirmed) {
      await dispatch(bulkUnarchiveCustomers({ projectId, customerIds: selectedCustomers }));
      setSelectedCustomers([]);
      // Reload customers after unarchiving
      loadCustomers();
    }
  };

  const handleCustomerViewChange = (view) => {
    setCustomerView(view);
    setSelectedCustomers([]);
    setSearchTerm('');
    dispatch(clearFilters());
    // If switching to archived view and currently on kanban, switch to list view
    if (view === 'archived' && viewMode === 'kanban') {
      setViewMode('list');
    }
  };

  const handleBulkAssign = async (assignedTo) => {
    if (selectedCustomers.length === 0 || !assignedTo) return;
    
    try {
      await dispatch(bulkAssignCustomers({ projectId, customerIds: selectedCustomers, assignedTo })).unwrap();
      setSelectedCustomers([]);
      loadCustomers();
    } catch (error) {
      console.error('Failed to assign customers:', error);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const result = await dispatch(exportCustomers({ projectId, format })).unwrap();
      if (format === 'csv' && result.data) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${projectId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'json') {
        // Download JSON
        const dataStr = JSON.stringify(result.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export customers:', error);
    }
  };

  const handleBulkUpdateStage = async (stage) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerStages({ projectId, customerIds: selectedCustomers, stage }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdatePriority = async (priority) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerPriorities({ projectId, customerIds: selectedCustomers, priority }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomerStatuses({ projectId, customerIds: selectedCustomers, status }));
    setSelectedCustomers([]);
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedCustomers.length === 0) return;
    
    await dispatch(bulkUpdateCustomers({ projectId, customerIds: selectedCustomers, updates }));
    setSelectedCustomers([]);
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`
    );
    
    if (confirmed) {
      await dispatch(bulkDeleteCustomers({ projectId, customerIds: selectedCustomers }));
      setSelectedCustomers([]);
    }
  };

  const handleLoadMore = () => {
    const currentPagination = customerView === 'active' ? pagination : archivedPagination;
    if (currentPagination.hasMore) {
      if (customerView === 'active') {
        dispatch(setFilters({ 
          ...filters, 
          skip: pagination.skip + pagination.limit 
        }));
      } else {
        // For archived, we need to update archived pagination
        // Since we don't have a setArchivedFilters action, we'll reload with updated skip
        const params = {
          ...filters,
          search: searchTerm || filters.search,
          limit: archivedPagination.limit,
          skip: archivedPagination.skip + archivedPagination.limit
        };
        dispatch(fetchArchivedCustomers({ projectId, params }));
      }
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
        {hasSupportExecutiveAccess && <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            }
          >
            Export CSV
          </Button>
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
        </div>}
      </div>

      {/* Customer View Tabs (Active/Archived) */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => handleCustomerViewChange('active')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  customerView === 'active'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Active Customers
                {customerView === 'active' && (
                  <span className="ml-2 bg-indigo-200 text-indigo-800 py-0.5 px-2 rounded-full text-xs">
                    {pagination.total}
                  </span>
                )}
              </button>
              {hasSupportExecutiveAccess && <button
                onClick={() => handleCustomerViewChange('archived')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  customerView === 'archived'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Archived Customers
                {customerView === 'archived' && (
                  <span className="ml-2 bg-indigo-200 text-indigo-800 py-0.5 px-2 rounded-full text-xs">
                    {archivedPagination.total}
                  </span>
                )}
              </button>}
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'list', name: customerView === 'active' ? 'Customers' : 'Archived', count: customerView === 'active' ? pagination.total : archivedPagination.total },
              ...(hasSupportExecutiveAccess && customerView === 'active' ? [{ id: 'kanban', name: 'Kanban' }] : []),
              { id: 'stats', name: 'Statistics' },
              { id: 'insights', name: 'Insights' },
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
                      placeholder={`Search ${customerView === 'active' ? 'active' : 'archived'} customers by name, email, company...`}
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
              {hasSupportExecutiveAccess && selectedCustomers.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedCustomers.length} customer(s) selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customerView === 'active' ? (
                        <>
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
                          
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleBulkAssign(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          >
                            <option value="">Assign To</option>
                            {project?.members?.filter(m => m.inviteStatus === 'accepted').map(member => (
                              <option key={member.user._id} value={member.user._id}>
                                {member.user.name}
                              </option>
                            ))}
                          </select>
                          
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={handleBulkArchive}
                            disabled={isArchiving}
                          >
                            Archive
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkUnarchive}
                          >
                            Unarchive
                          </Button>
                        </>
                      )}
                      
                      {hasSupportExecutiveAccess && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={handleBulkDelete}
                        >
                          Delete
                        </Button>
                      )}
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
                            checked={selectedCustomers.length === (customerView === 'active' ? customers.length : archivedCustomers.length) && (customerView === 'active' ? customers.length : archivedCustomers.length) > 0}
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
                          {customerView === 'archived' ? 'Archived At' : 'Last Activity'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(customerView === 'active' ? customers : archivedCustomers).map((customer) => (
                        <CustomerListItem
                          key={customer._id}
                          customer={customer}
                          isSelected={selectedCustomers.includes(customer._id)}
                          onSelect={handleCustomerSelect}
                          onView={() => navigate(`/crm/${projectId}/customers/${customer._id}`)}
                          isArchived={customerView === 'archived'}
                          getStageColor={getStageColor}
                          getPriorityColor={getPriorityColor}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {!isLoading && (customerView === 'active' ? customers : archivedCustomers).length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No {customerView === 'active' ? 'active' : 'archived'} customers found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {customerView === 'active' 
                        ? 'Get started by creating your first customer.'
                        : 'No customers have been archived yet.'}
                    </p>
                    {customerView === 'active' && hasSupportExecutiveAccess && <div className="mt-6">
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
                    </div>}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading {customerView === 'active' ? 'active' : 'archived'} customers...</p>
                  </div>
                )}

                {/* Load More */}
                {(customerView === 'active' ? pagination.hasMore : archivedPagination.hasMore) && !isLoading && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      fullWidth
                    >
                      Load More {customerView === 'active' ? 'Customers' : 'Archived Customers'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'kanban' && customerView === 'active' && hasSupportExecutiveAccess && (
            <CustomerKanban />
          )}

          {viewMode === 'stats' && (
            <CustomerStats projectId={projectId} />
          )}

          {viewMode === 'insights' && (
            <div className="space-y-6">
              {isInsightsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : insights ? (
                <div className="space-y-6">
                  {/* Creation Trend */}
                  {insights.trends?.creationTrend && insights.trends.creationTrend.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Customer Creation Trend</h3>
                      <div className="h-64">
                        <div className="grid grid-cols-7 gap-2">
                          {insights.trends.creationTrend.slice(-7).map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="w-full bg-gray-200 rounded-t" style={{ height: `${(item.count / Math.max(...insights.trends.creationTrend.map(i => i.count))) * 200}px` }}>
                                <div className="bg-indigo-500 h-full rounded-t"></div>
                              </div>
                              <span className="text-xs text-gray-600 mt-1">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Customers */}
                  {insights.topCustomers && insights.topCustomers.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Customers by Score</h3>
                      <div className="space-y-3">
                        {insights.topCustomers.map((customer, index) => (
                          <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold text-indigo-600">#{index + 1}</span>
                              <div>
                                <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">Score: {customer.score || 0}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(customer.stage)}`}>
                                {customer.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Tags */}
                  {insights.topTags && insights.topTags.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {insights.topTags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            {tag.tag} ({tag.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interaction Types */}
                  {insights.interactionTypes && insights.interactionTypes.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Interaction Types Distribution</h3>
                      <div className="space-y-2">
                        {insights.interactionTypes.map((type, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">{type._id || 'Unknown'}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-500 h-2 rounded-full" 
                                  style={{ width: `${(type.count / Math.max(...insights.interactionTypes.map(t => t.count))) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 w-8 text-right">{type.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">No insights available. Insights will appear as you add more customers and interactions.</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'forecast' && (
            <CustomerForecast projectId={projectId} />
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
