import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectDeals, 
  fetchArchivedDeals,
  setFilters, 
  setSorting,
  toggleArchivedView,
  bulkUpdateDealsAction,
  bulkArchiveDealsAction,
  bulkDeleteDealsAction,
  bulkAssignDealsAction,
  archiveExistingDeal,
  deleteExistingDeal,
  createNewDeal,
  selectDeal,
  selectAllDeals,
  clearSelection
} from '../../../store/dealSlice';
import { fetchProjectCustomers } from '../../../store/customerSlice';
import { getProjectById } from '../../../store/projectSlice';
import { getProjectCompanies } from '../../../store/companySlice';
import { getUsers } from '../../../store/userSlice';
import CreateDealSidebar from './CreateDealSidebar';
import EditDealSidebar from './EditDealSidebar';
import DealFilters from './DealFilters';
import DealListItem from './DealListItem';
import DealStats from './DealStats';
import DealInsights from './DealInsights';
import DealForecasting from './DealForecasting';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import CrmLayout from '../../../layouts/CrmLayout';
import { useProjectAccess } from '../../../hooks/useProjectAccess';

const Deals = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    deals,
    archivedDeals,
    showArchived,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    selectedDeals,
    pagination
  } = useSelector((state) => state.deals);
  
  const { users } = useSelector((state) => state.users);
  
  const { customers } = useSelector((state) => state.customers);
  const { companies } = useSelector((state) => state.companies);
  
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // list, stats, insights, forecasting
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const {hasSupportExecutiveAccess} = useProjectAccess();

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      if (showArchived) {
        dispatch(fetchArchivedDeals({ projectId }));
      } else {
        dispatch(fetchProjectDeals({ projectId }));
      }
      dispatch(fetchProjectCustomers({ projectId }));
      dispatch(getProjectCompanies({ projectId }));
      dispatch(getUsers({ projectId }));
    }
  }, [dispatch, projectId, showArchived]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      dispatch(setSorting({ sortBy: field, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      dispatch(setSorting({ sortBy: field, sortOrder: 'desc' }));
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      if (showArchived) {
        dispatch(fetchArchivedDeals({ 
          projectId, 
          params: { skip: archivedDeals.length }
        }));
      } else {
        dispatch(fetchProjectDeals({ 
          projectId, 
          params: { skip: deals.length }
        }));
      }
    }
  };

  const handleDealSelect = (dealId) => {
    dispatch(selectDeal(dealId));
  };

  const handleSelectAll = () => {
    dispatch(selectAllDeals());
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedDeals.length === 0) return;
    
    try {
      await dispatch(bulkUpdateDealsAction({
        projectId,
        dealIds: selectedDeals,
        updates: { status: newStatus }
      }));
      dispatch(clearSelection());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update deal statuses:', error);
    }
  };


  const handleBulkAssign = async (assignedTo) => {
    if (selectedDeals.length === 0) return;
    
    try {
      await dispatch(bulkAssignDealsAction({
        projectId,
        dealIds: selectedDeals,
        assignedTo
      }));
      dispatch(clearSelection());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to assign deals:', error);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedDeals.length === 0) return;
    
    const confirmArchive = window.confirm(
      `Are you sure you want to archive ${selectedDeals.length} deal(s)?`
    );
    
    if (confirmArchive) {
      try {
        await dispatch(bulkArchiveDealsAction({
          projectId,
          dealIds: selectedDeals
        }));
        dispatch(clearSelection());
        setShowBulkActions(false);
      } catch (error) {
        console.error('Failed to archive deals:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeals.length === 0) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${selectedDeals.length} deal(s)? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        await dispatch(bulkDeleteDealsAction({
          projectId,
          dealIds: selectedDeals
        }));
        dispatch(clearSelection());
        setShowBulkActions(false);
      } catch (error) {
        console.error('Failed to delete deals:', error);
      }
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowEditSidebar(true);
  };

  const handleViewDeal = (dealId) => {
    navigate(`/crm/${projectId}/deals/${dealId}`);
  };

  const handleToggleArchived = () => {
    dispatch(toggleArchivedView());
  };

  const handleArchiveDeal = (dealId) => {
    if (window.confirm('Are you sure you want to archive this deal?')) {
      dispatch(archiveExistingDeal({ projectId, dealId }));
    }
  };

  const handleDeleteDeal = (dealId) => {
    if (window.confirm('Are you sure you want to permanently delete this deal? This action cannot be undone.')) {
      dispatch(deleteExistingDeal({ projectId, dealId }));
    }
  };

  const handleDuplicateDeal = (deal) => {
    const duplicatedDeal = {
      ...deal,
      name: `${deal.name} (Copy)`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete duplicatedDeal._id;
    dispatch(createNewDeal({ projectId, dealData: duplicatedDeal }));
  };


  const renderListView = () => (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Deals</h2>
            <span className="text-sm text-gray-500">
              {pagination.total} total
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </Button>
            
            {hasSupportExecutiveAccess && <Button
              variant={showArchived ? "primary" : "outline"}
              size="sm"
              onClick={handleToggleArchived}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
              </svg>
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>}
            
            {hasSupportExecutiveAccess && <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateSidebar(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deal
            </Button>}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <DealFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            customers={customers}
            companies={companies}
          />
        </div>
      )}

      {/* Bulk Actions */}
      {selectedDeals.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedDeals.length} deal(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value);
                  if (e.target.value === 'status') {
                    setShowBulkActions(true);
                  }
                }}
                className="text-sm border border-blue-300 rounded px-2 py-1"
              >
                <option value="">Bulk Actions</option>
                <option value="status">Update Status</option>
                <option value="assign">Assign To</option>
                <option value="archive">Archive</option>
                <option value="delete">Delete</option>
              </select>
              
              {bulkAction && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (bulkAction === 'archive') {
                      handleBulkArchive();
                    } else if (bulkAction === 'delete') {
                      handleBulkDelete();
                    } else {
                      setShowBulkActions(true);
                    }
                  }}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modals */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Bulk Action</h3>
            
            {bulkAction === 'status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                  onChange={(e) => {
                    handleBulkStatusUpdate(e.target.value);
                    setShowBulkActions(false);
                    setBulkAction('');
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="open">Open</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            )}
            
            
            {bulkAction === 'assign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                  onChange={(e) => {
                    handleBulkAssign(e.target.value);
                    setShowBulkActions(false);
                    setBulkAction('');
                  }}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBulkActions(false);
                  setBulkAction('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedDeals.length === (showArchived ? archivedDeals : deals).length && (showArchived ? archivedDeals : deals).length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSortChange('name')}
              className="flex items-center hover:text-gray-900"
            >
              Deal Name
              {sortBy === 'name' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSortChange('value')}
              className="flex items-center hover:text-gray-900"
            >
              Value
              {sortBy === 'value' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => handleSortChange('status')}
              className="flex items-center hover:text-gray-900"
            >
              Status
              {sortBy === 'status' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => handleSortChange('priority')}
              className="flex items-center hover:text-gray-900"
            >
              Priority
              {sortBy === 'priority' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSortChange('expectedCloseDate')}
              className="flex items-center hover:text-gray-900"
            >
              Close Date
              {sortBy === 'expectedCloseDate' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleSortChange('assignedTo')}
              className="flex items-center hover:text-gray-900"
            >
              Assigned To
              {sortBy === 'assignedTo' && (
                <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
          {hasSupportExecutiveAccess && <div className="col-span-1">
              Actions 
          </div>}
        </div>
      </div>

      {/* Deal List */}
      <div className="space-y-4">
        {(showArchived ? archivedDeals : deals).map((deal) => (
          <DealListItem
            key={deal._id}
            deal={deal}
            isSelected={selectedDeals.includes(deal._id)}
            onSelect={handleDealSelect}
            onEdit={handleEditDeal}
            onView={handleViewDeal}
            onArchive={handleArchiveDeal}
            onDelete={handleDeleteDeal}
            onDuplicate={handleDuplicateDeal}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="px-6 py-4 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Empty State */}
      {deals.length === 0 && !loading && (
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new deal.
          </p>
          {hasSupportExecutiveAccess && <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => setShowCreateSidebar(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deal
            </Button>
          </div>}
        </div>
      )}
    </div>
  );

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Management</h1>
          <p className="text-gray-600">Manage and track your sales deals</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* View Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                currentView === 'list'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-3 py-2 text-sm font-medium border-t border-b ${
                currentView === 'stats'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView('insights')}
              className={`px-3 py-2 text-sm font-medium border-t border-b ${
                currentView === 'insights'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView('forecasting')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border ${
                currentView === 'forecasting'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      {/* Content */}
      {currentView === 'list' && renderListView()}
      {currentView === 'stats' && (
        <DealStats projectId={projectId} />
      )}
      {currentView === 'insights' && (
        <DealInsights projectId={projectId} />
      )}
      {currentView === 'forecasting' && (
        <DealForecasting projectId={projectId} />
      )}

      {/* Sidebars */}
      {showCreateSidebar && (
        <CreateDealSidebar
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          projectId={projectId}
        />
      )}

      {showEditSidebar && editingDeal && (
        <EditDealSidebar
          isOpen={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false);
            setEditingDeal(null);
          }}
          deal={editingDeal}
          projectId={projectId}
        />
      )}
    </div>
    </CrmLayout>
  );
};

export default Deals;
