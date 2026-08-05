import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectLeads, getArchivedLeads, archiveLead, unarchiveLead, updateLeadStatus } from '../../../store/leadSlice';
import { getProjectPipelines, clearPipelines } from '../../../store/projectSlice';
import CreateLeadSidebar from './CreateLeadSidebar';
import EditLeadSidebar from './EditLeadSidebar';
import LeadKanban from './LeadKanban';
import LeadStats from './LeadStats';
import CrmLayout from '../../../layouts/CrmLayout';
import { getUserById } from '../../../store/userSlice';
import { useProjectAccess } from '../../../hooks/useProjectAccess';
import { getProjectById } from '../../../store/projectSlice';
import {
  Search, Plus, List, LayoutGrid, BarChart3, Archive,
  ArchiveRestore, Trash2, Filter, ChevronDown, Check,
  Eye, Edit, ArrowRight
} from 'lucide-react';

// Helper function to truncate text
const truncateText = (text, maxLength = 20) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const Leads = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { leads, archivedLeads, isLoading } = useSelector((state) => state.leads);
  const { project, pipelines, currentProjectId } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const { hasSalesExecutiveAccess } = useProjectAccess();

  const [view, setView] = useState('list'); // 'list' or 'kanban' or 'stats'
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [selectedLeadToEdit, setSelectedLeadToEdit] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: ''
  });

  const currentLeads = showArchived ? archivedLeads : leads;

  useEffect(() => {
    dispatch(getUserById(user._id));
    dispatch(getProjectById(projectId));
    if (projectId && projectId !== currentProjectId) {
      dispatch(clearPipelines());
      dispatch(getProjectPipelines(projectId));
    }
    if (showArchived) {
      dispatch(getArchivedLeads({ projectId }));
    } else {
      dispatch(getProjectLeads({ projectId }));
    }
  }, [dispatch, projectId, showArchived, currentProjectId]);

  // Extract pipeline stages
  const leadPipeline = pipelines?.filter(p => p.type === 'lead') || [];
  const defaultPipeline = leadPipeline.find(p => p.isDefault) || leadPipeline[0];
  const stages = defaultPipeline?.stages || [];

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setSelectedLeads([]);
  };

  const onSearch = (e) => setSearchTerm(e.target.value);

  const onCreateLead = () => setShowCreateSidebar(true);

  const onEditLead = (lead) => {
    setSelectedLeadToEdit(lead);
    setShowEditSidebar(true);
  };

  const handleLeadSelect = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
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
        await dispatch(updateLeadStatus({ projectId, id: leadId, status: newStatus })).unwrap();
      }
      setSelectedLeads([]);
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
        dispatch(getArchivedLeads({ projectId }));
      } catch (error) {
        console.error('Failed to unarchive leads:', error);
      }
    }
  };

  const filteredLeads = currentLeads.filter(lead => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = lead.name.toLowerCase().includes(searchString) ||
      lead.email?.toLowerCase().includes(searchString) ||
      lead.jobTitle?.toLowerCase().includes(searchString);

    const matchesStatus = !filters.status || (lead.stage || lead.status) === filters.status;
    const matchesSource = !filters.source || lead.source === filters.source;
    const matchesAssigned = !filters.assignedTo || lead.assignedTo?._id === filters.assignedTo;

    return matchesSearch && matchesStatus && matchesSource && matchesAssigned;
  });

  const getStageBadge = (statusId, isConverted) => {
    if (isConverted) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Converted
        </span>
      );
    }
    const stage = stages.find(s => s._id === statusId);
    if (stage) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
        >
          {stage.name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        Unknown
      </span>
    );
  };

  const renderList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === currentLeads.length && currentLeads.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Info</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
              {showArchived && (
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Archived</th>
              )}
              <th scope="col" className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
              <tr
                key={lead._id}
                className={`hover:bg-slate-50 transition-colors ${selectedLeads.includes(lead._id) ? 'bg-indigo-50/30' : ''}`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleLeadSelect(lead._id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-sm text-slate-500">{lead.email || lead.phone || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStageBadge(lead.stage || lead.status, lead.convertedAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{truncateText(lead.company?.name || '-', 15)}</div>
                  <div className="text-xs text-slate-500 capitalize">{truncateText(lead.jobTitle || lead.source || '-', 15)}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                    ${lead.score >= 75 ? 'bg-emerald-100 text-emerald-800' :
                      lead.score >= 50 ? 'bg-amber-100 text-amber-800' :
                        lead.score >= 25 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                    {lead.score || 0}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {lead.assignedTo ? (
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold mr-2">
                        {lead.assignedTo.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-600">{truncateText(lead.assignedTo.name, 12)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                {showArchived && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                    {lead.archivedAt ? new Date(lead.archivedAt).toLocaleDateString() : '-'}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {lead.convertedAt ? (
                      <button
                        onClick={() => navigate(`/crm/${projectId}/customers/${lead.convertedCustomerId._id}`)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors tooltip"
                        title="View Customer"
                      >
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/crm/${projectId}/leads/${lead._id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {hasSalesExecutiveAccess && (
                          <button
                            onClick={() => onEditLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Lead"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={showArchived ? 8 : 7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 text-slate-300 mb-3">
                      <Search size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">No leads found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchTerm || filters.status || filters.source || filters.assignedTo
                        ? "We couldn't find anything matching your search."
                        : "Get started by creating your first lead."}
                    </p>
                    {hasSalesExecutiveAccess && !searchTerm && !Object.values(filters).some(Boolean) && (
                      <button
                        onClick={onCreateLead}
                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        Add New Lead
                      </button>
                    )}
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stage</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage._id} value={stage._id}>{stage.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source</label>
          <div className="relative">
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors"
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
            <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned To</label>
          <div className="relative">
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors"
            >
              <option value="">All Users</option>
              {project?.members?.map(member => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: '', source: '', assignedTo: '' })}
            className="w-full px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  const renderBulkActions = () => {
    if (selectedLeads.length === 0) return null;

    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 flex items-center justify-between shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
            {selectedLeads.length}
          </span>
          <span className="text-sm font-medium text-indigo-900">
            Leads Selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!showArchived ? (
            <>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                      e.target.value = ''; // Reset select
                    }
                  }}
                  className="pl-3 pr-8 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">Move to Stage...</option>
                  {stages.map(stage => (
                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-indigo-400 pointer-events-none" />
              </div>
              <button
                onClick={handleBulkArchive}
                className="flex items-center px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Archive size={14} className="mr-1.5" /> Archive
              </button>
            </>
          ) : (
            <button
              onClick={handleBulkUnarchive}
              className="flex items-center px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors"
            >
              <ArchiveRestore size={14} className="mr-1.5" /> Unarchive
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <CrmLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {showArchived ? <Archive className="text-slate-400" /> : null}
              {showArchived ? 'Archived Leads' : 'Lead Pipeline'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {showArchived ? 'Manage your safely stored archived leads' : 'Track and convert your prospective customers'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {view === 'list' && (
              <button
                onClick={handleToggleArchived}
                className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
              >
                {showArchived ? <List size={16} className="mr-2" /> : <Archive size={16} className="mr-2" />}
                {showArchived ? 'Active Leads' : 'Archived'}
              </button>
            )}
            {!showArchived && hasSalesExecutiveAccess && (
              <button
                onClick={onCreateLead}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Lead
              </button>
            )}
          </div>
        </div>

        {/* View Toggle & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {!showArchived ? (
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <List size={16} className="mr-2" /> List
              </button>
              {hasSalesExecutiveAccess && (
                <button
                  onClick={() => setView('kanban')}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'kanban' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <LayoutGrid size={16} className="mr-2" /> Kanban
                </button>
              )}
              <button
                onClick={() => setView('stats')}
                className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'stats' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <BarChart3 size={16} className="mr-2" /> Analytics
              </button>
            </div>
          ) : (
            <div className="flex-1"></div> // Spacer for archived view
          )}

          {view === 'list' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={onSearch}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              {!showArchived && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${showFilters || Object.values(filters).some(Boolean)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  title="Filter leads"
                >
                  <Filter size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {view === 'list' && !showArchived && showFilters && renderFilters()}

        {/* Bulk Actions */}
        {view === 'list' && renderBulkActions()}

        {/* Main Content Area */}
        {view === 'list' && renderList()}
        {view === 'kanban' && !showArchived && <LeadKanban projectId={projectId} />}
        {view === 'stats' && !showArchived && <LeadStats projectId={projectId} />}

        {/* Sidebars */}
        <CreateLeadSidebar
          isOpen={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          projectId={projectId}
        />

        {selectedLeadToEdit && (
          <EditLeadSidebar
            isOpen={showEditSidebar}
            onClose={() => {
              setShowEditSidebar(false);
              setTimeout(() => setSelectedLeadToEdit(null), 300); // Wait for transition
            }}
            lead={selectedLeadToEdit}
          />
        )}
      </div>
    </CrmLayout>
  );
};

export default Leads;
