import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectLeads, getArchivedLeads, archiveLead, unarchiveLead, updateLeadStatus } from '../../../store/leadSlice';
import CreateLeadSidebar from './CreateLeadSidebar';
import EditLeadSidebar from './EditLeadSidebar';
import LeadKanban from './LeadKanban';
import LeadStats from './LeadStats';
import Button from '../../../components/ui/Button';
import CrmLayout from '../../../layouts/CrmLayout';

// Helper function to truncate text
const truncateText = (text, maxLength = 15) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const StatusBadge = ({ lead }) => {
  // Check if lead is converted
  if (lead.convertedAt) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-black-800">
      Converted
      </span>
    );
  }
  
  const colors = {
    new: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    qualified: 'bg-green-100 text-green-800',
    disqualified: 'bg-red-100 text-red-800'
  };
  const status = lead.stage || lead.status;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || colors.new}`}>
      {status}
    </span>
  );
};

const Leads = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { leads, archivedLeads, isLoading } = useSelector((state) => state.leads);
  const { project } = useSelector((state) => state.projects);
  
  const [view, setView] = useState('list'); // 'list' or 'kanban' or 'stats'
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: ''
  });

  // Use the appropriate leads array based on showArchived state
  const currentLeads = showArchived ? archivedLeads : leads;

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setSelectedLeads([]); // Clear selected leads when switching views
  };

  useEffect(() => {
    if (showArchived) {
      dispatch(getArchivedLeads({ projectId }));
    } else {
      dispatch(getProjectLeads({ projectId }));
    }
  }, [dispatch, projectId, showArchived]);

  const onSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const onCreateLead = (e) => {
    setShowCreateSidebar(true);
  };

  const onEditLead = (lead) => {
    setSelectedLead(lead);
    setShowEditSidebar(true);
  };

  const onDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to archive this lead?')) {
      try {
        await dispatch(archiveLead(leadId)).unwrap();
        // No need to refetch - the Redux state is already updated
      } catch (error) {
        console.error('Failed to archive lead:', error);
      }
    }
  };

  const onUnarchiveLead = async (leadId) => {
    if (window.confirm('Are you sure you want to unarchive this lead?')) {
      try {
        await dispatch(unarchiveLead(leadId)).unwrap();
        // Refresh the archived leads list
        dispatch(getArchivedLeads({ projectId }));
      } catch (error) {
        console.error('Failed to unarchive lead:', error);
      }
    }
  };

  const handleLeadSelect = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === currentLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentLeads.map(lead => lead._id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      for (const leadId of selectedLeads) {
        await dispatch(updateLeadStatus({ id: leadId, status: newStatus })).unwrap();
      }
      setSelectedLeads([]);
      // No need to refetch - the Redux state is already updated
    } catch (error) {
      console.error('Failed to update leads:', error);
    }
  };

  const handleBulkArchive = async () => {
    if (window.confirm(`Are you sure you want to archive ${selectedLeads.length} leads?`)) {
      try {
        for (const leadId of selectedLeads) {
          await dispatch(archiveLead(leadId)).unwrap();
        }
        setSelectedLeads([]);
        // No need to refetch - the Redux state is already updated
      } catch (error) {
        console.error('Failed to archive leads:', error);
      }
    }
  };

  const handleBulkUnarchive = async () => {
    if (window.confirm(`Are you sure you want to unarchive ${selectedLeads.length} leads?`)) {
      try {
        for (const leadId of selectedLeads) {
          await dispatch(unarchiveLead(leadId)).unwrap();
        }
        setSelectedLeads([]);
        // Refresh the archived leads list
        dispatch(getArchivedLeads({ projectId }));
      } catch (error) {
        console.error('Failed to unarchive leads:', error);
      }
    }
  };

  const filteredLeads = currentLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || (lead.stage || lead.status) === filters.status;
    const matchesSource = !filters.source || lead.source === filters.source;
    const matchesAssigned = !filters.assignedTo || lead.assignedTo?._id === filters.assignedTo;
    
    return matchesSearch && matchesStatus && matchesSource && matchesAssigned;
  });

  const renderList = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === currentLeads.length && currentLeads.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Company</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Job Title</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Source</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Score</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Assigned</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">Status</th>
              {showArchived && (
                <th className="text-left px-4 py-3 text-sm text-gray-500">Archived</th>
              )}
              <th className="text-left px-4 py-3 text-sm text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleLeadSelect(lead._id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900" title={lead.name}>
                      {truncateText(lead.name, 15)}
                    </div>
                    {lead.phone && (
                      <div className="text-sm text-gray-500" title={lead.phone}>
                        {truncateText(lead.phone, 12)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600" title={lead.email || '-'}>
                  {truncateText(lead.email || '-', 20)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600" title={lead.company?.name || '-'}>
                  {truncateText(lead.company?.name || '-', 15)}
                </td>
                <td className="px-4 py-3 text-sm capitalize" title={lead.jobTitle || '-'}>
                  {truncateText(lead.jobTitle || '-', 15)}
                </td>
                <td className="px-4 py-3 text-sm capitalize" title={lead.source || '-'}>
                  {truncateText(lead.source || '-', 10)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.score >= 75 ? 'bg-green-100 text-green-800' :
                    lead.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    lead.score >= 25 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.score || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" title={lead.assignedTo?.name || '-'}>
                  {truncateText(lead.assignedTo?.name || '-', 12)}
                </td>
                <td className="px-4 py-3"><StatusBadge lead={lead} /></td>
                {showArchived && (
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {lead.archivedAt ? new Date(lead.archivedAt).toLocaleDateString() : '-'}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/crm/${projectId}/leads/${lead._id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                    {lead.convertedAt ? (
                      <button
                        onClick={() => navigate(`/crm/${projectId}/customers/${lead.convertedCustomerId._id}`)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        View Customer Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </button>
                        {showArchived ? (
                          <button
                            onClick={() => onUnarchiveLead(lead._id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Unarchive
                          </button>
                        ) : (
                          <button
                            onClick={() => onDeleteLead(lead._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Archive
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10} className="px-4 py-3 text-center">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first lead.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => {
                          setShowCreateSidebar(true);
                        }}
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                        }
                      >
                        Add Lead
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            value={filters.source}
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="web">Website</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="referral">Referral</option>
            <option value="event">Event</option>
            <option value="ads">Advertising</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Users</option>
            {project?.members?.map(member => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => setFilters({ status: '', source: '', assignedTo: '' })}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBulkActions = () => {
    if (selectedLeads.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedLeads.length} lead(s) selected
          </span>
          <div className="flex items-center space-x-2">
            {!showArchived && (
              <>
                <select
                  onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                  className="px-3 py-1 border border-blue-300 rounded text-sm"
                >
                  <option value="">Move to...</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="disqualified">Disqualified</option>
                </select>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkArchive}
                >
                  Archive Selected
                </Button>
              </>
            )}
            {showArchived && (
              <Button
                variant="success"
                size="sm"
                onClick={handleBulkUnarchive}
              >
                Unarchive Selected
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {showArchived ? 'Archived Leads' : 'Leads'}
            </h1>
            <p className="text-gray-600">
              {showArchived ? 'Manage your archived leads' : 'Manage your lead pipeline'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {view === 'list' && <Button
              variant="secondary"
              onClick={handleToggleArchived}
            >
              {showArchived ? 'Show Active Leads' : 'Show Archived Leads'}
            </Button>}
            {!showArchived && (
              <Button onClick={onCreateLead}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Lead
              </Button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          {!showArchived && <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  view === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  view === 'kanban' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                }`}
                disabled={showArchived}
              >
                Kanban View
              </button>
              <button
                onClick={() => setView('stats')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  view === 'stats' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                }`}
                disabled={showArchived}
              >
                Analytics
              </button>
            </div>
          </div>}

          {view === 'list' && (
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={onSearch}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Filters */}
        {view === 'list' && !showArchived && renderFilters()}

        {/* Bulk Actions */}
        {view === 'list' && renderBulkActions()}

        {/* Content */}
        {view === 'list' && renderList()}
        {view === 'kanban' && !showArchived && <LeadKanban projectId={projectId} />}
        {view === 'stats' && !showArchived && <LeadStats projectId={projectId} />}

        {/* Sidebars */}
        <CreateLeadSidebar
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          projectId={projectId}
        />
        
        <EditLeadSidebar
          isOpen={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
        />
      </div>
    </CrmLayout>
  );
};

export default Leads;


