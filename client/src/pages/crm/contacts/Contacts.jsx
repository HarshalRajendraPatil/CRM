import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CrmLayout from '../../../layouts/CrmLayout';
import { 
  getProjectContacts, 
  getContactStats, 
  getContactInsights,
  clearContacts,
  clearStats,
  clearInsights,
  reset
} from '../../../store/contactSlice';
import ContactFilters from './ContactFilters';
import ContactList from './ContactList';
import ContactStats from './ContactStats';
import ContactInsights from './ContactInsights';
import CreateContactSidebar from './CreateContactSidebar';
import ContactDetailModal from './ContactDetailModal';
import ContactBulkActions from './ContactBulkActions';

const Contacts = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { contacts, stats, insights, isLoading, pagination } = useSelector((state) => state.contacts);
  // const { user } = useSelector((state) => state.auth);
  
  // State management
  const [filters, setFilters] = useState({
    search: '',
    stage: 'all',
    status: 'all',
    assignedTo: 'all',
    company: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'kanban'
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'stats', 'insights'
  
  // Load initial data
  useEffect(() => {
    if (projectId) { 
      dispatch(getProjectContacts({ projectId, params: { limit: 20, skip: 0, ...filters } }));
      dispatch(getContactStats(projectId));
      dispatch(getContactInsights({ projectId, params: { timeframe: '30d' } }));
    }
    
    return () => {
      dispatch(clearContacts());
      dispatch(clearStats());
      dispatch(clearInsights());
    };
  // only on mount/unmount or project change
  }, [projectId, dispatch]);
  
  // Stable handlers to avoid re-renders
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    dispatch(getProjectContacts({ 
      projectId, 
      params: { limit: 20, skip: 0, ...filters, ...newFilters } 
    }));
  }, [dispatch, projectId, filters]);
  
  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    dispatch(getProjectContacts({ 
      projectId, 
      params: { limit: 20, skip: 0, ...filters, search: searchTerm } 
    }));
  }, [dispatch, projectId, filters]);
  
  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      dispatch(getProjectContacts({ 
        projectId, 
        params: { 
          limit: 20, 
          skip: contacts.length, 
          ...filters 
        } 
      }));
    }
  };
  
  // Handle contact selection
  const handleContactSelect = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact._id));
    }
  };
  
  // Handle contact click
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };
  
  // Handle bulk actions
  const handleBulkAction = (action) => {
    // Implement bulk actions (delete, update stage, assign, etc.)
    console.log('Bulk action:', action, 'on contacts:', selectedContacts);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    dispatch(getProjectContacts({ projectId, params: { limit: 20, skip: 0, ...filters } }));
    dispatch(getContactStats(projectId));
    dispatch(getContactInsights({ projectId, params: { timeframe: '30d' } }));
  };

  // Ensure clean state before opening the create sidebar
  const openCreateSidebar = () => {
    dispatch(reset());
    setShowCreateSidebar(true);
  };
  
  return (
    <CrmLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your contacts and relationships ({pagination.total} total)
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={openCreateSidebar}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Contact
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contacts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Insights
              </button>
            </nav>
          </div>
          
          {/* Content */}
          {activeTab === 'contacts' && (
            <>
              {/* Filters */}
              <ContactFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCount={selectedContacts.length}
                totalCount={contacts.length}
              />
              
              {/* Bulk Actions */}
              {selectedContacts.length > 0 && (
                <ContactBulkActions
                  selectedCount={selectedContacts.length}
                  onBulkAction={handleBulkAction}
                  onClearSelection={() => setSelectedContacts([])}
                />
              )}
              
              {/* Contact List */}
              <ContactList
                contacts={contacts}
                isLoading={isLoading}
                viewMode={viewMode}
                selectedContacts={selectedContacts}
                onContactSelect={handleContactSelect}
                onSelectAll={handleSelectAll}
                onContactClick={handleContactClick}
                onLoadMore={handleLoadMore}
                hasMore={pagination.hasMore}
                pagination={pagination}
              />
            </>
          )}
          
          {activeTab === 'stats' && (
            <ContactStats stats={stats} isLoading={isLoading} />
          )}
          
          {activeTab === 'insights' && (
            <ContactInsights insights={insights} isLoading={isLoading} />
          )}
        </div>
      </div>
      
      {/* Create Contact Sidebar */}
      {showCreateSidebar && (
        <CreateContactSidebar
          projectId={projectId}
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
        />
      )}
      
      {/* Contact Detail Modal */}
      {showContactDetail && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          isOpen={showContactDetail}
          onClose={() => {
            setShowContactDetail(false);
            setSelectedContact(null);
          }}
        />
      )}
    </CrmLayout>
  );
};

export default Contacts;