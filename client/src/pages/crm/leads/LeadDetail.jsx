import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchLead, addLeadNote, updateLeadNote, deleteLeadNote, updateLeadStatus, assignLeadToUser, archiveLead, deleteLead, clearLead, unarchiveLead } from '../../../store/leadSlice';
import { getProjectById, getProjectPipelines } from '../../../store/projectSlice';
import { convertLeadToCustomer } from '../../../store/customerSlice';
import { getUserById } from '../../../store/userSlice';
import useProjectAccess from '../../../hooks/useProjectAccess';

import EditLeadSidebar from './EditLeadSidebar';
import CustomerSidebar from '../customers/CustomerSidebar';
import CrmLayout from '../../../layouts/CrmLayout';
import ActivityTimeline from '../../../components/activity/ActivityTimeline';
import LeadScoreCard from './LeadScoreCard';

import {
  Building2, Mail, Phone, Briefcase, MapPin, Tag, CircleDollarSign,
  User, CheckCircle2, MoreHorizontal, ArrowRight, UserPlus,
  Archive, Trash2, PenLine, Pencil, Calendar, MessageSquare, CheckCircle
} from 'lucide-react';

const LeadDetail = () => {
  const { projectId, leadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { lead, isLoading } = useSelector((state) => state.leads);
  const { project, pipelines } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  const { hasSalesExecutiveAccess, hasManagerAccess } = useProjectAccess();

  // Dynamic Pipeline setup
  const leadPipelines = pipelines?.filter(p => p.type === 'lead') || [];
  const defaultPipeline = leadPipelines.find(p => p.isDefault) || leadPipelines[0];
  const leadStages = defaultPipeline?.stages?.slice().sort((a, b) => a.order - b.order) || [];
  const stages = leadStages.map(stage => ({ id: stage._id, name: stage.name, color: stage.color }));

  // UI state
  const [activeTab, setActiveTab] = useState('notes');
  const [note, setNote] = useState('');
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [showConvertSidebar, setShowConvertSidebar] = useState(false);
  // Notes pagination
  const NOTES_PER_PAGE = 5;
  const [notesPage, setNotesPage] = useState(1);

  useEffect(() => {
    dispatch(fetchLead({ projectId, id: leadId }));
    dispatch(getProjectById(projectId));
    dispatch(getProjectPipelines(projectId));
    dispatch(getUserById(user._id));

    return () => {
      dispatch(clearLead());
    };
  }, [dispatch, leadId, projectId]);

  // Note actions
  const onAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await dispatch(addLeadNote({ projectId, id: leadId, content: note })).unwrap();
      setNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const onEditNote = (noteId, currentContent) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(currentContent);
  };

  const onSaveNoteEdit = async () => {
    if (!editingNoteContent.trim()) return;
    try {
      await dispatch(updateLeadNote({ projectId, id: leadId, noteId: editingNoteId, content: editingNoteContent })).unwrap();
      setEditingNoteId(null);
      setEditingNoteContent('');
      dispatch(fetchLead({ projectId, id: leadId }));
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const onCancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const onDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteLeadNote({ projectId, leadId, noteId })).unwrap();
        dispatch(fetchLead({ projectId, id: leadId }));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  // Convert/Archive/Delete
  const onConvert = () => setShowConvertSidebar(true);

  const handleConvertToCustomer = async (customerData) => {
    try {
      await dispatch(convertLeadToCustomer({ projectId, leadId, customerData })).unwrap();
      setShowConvertSidebar(false);
      navigate(`/crm/${projectId}/customers`);
    } catch (error) {
      console.error('Failed to convert lead:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteLead({ projectId, id: leadId })).unwrap();
      navigate(`/crm/${projectId}/leads`);
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const confirmArchive = async () => {
    try {
      await dispatch(archiveLead({ projectId, id: leadId })).unwrap();
      navigate(`/crm/${projectId}/leads`);
    } catch (error) {
      console.error('Failed to archive lead:', error);
    }
  };

  const onUnarchive = async () => {
    try {
      await dispatch(unarchiveLead({ projectId, id: leadId })).unwrap();
      navigate(`/crm/${projectId}/leads`);
    } catch (error) {
      console.error('Failed to unarchive lead:', error);
    }
  };

  const onStatusChange = async (newStatus) => {
    try {
      await dispatch(updateLeadStatus({ projectId, id: leadId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const onAssignUser = async () => {
    try {
      await dispatch(assignLeadToUser({ projectId, id: leadId, userId: selectedUserId })).unwrap();
      setShowAssignModal(false);
      setSelectedUserId('');
    } catch (error) {
      console.error('Failed to assign lead:', error);
    }
  };

  const onUnassignUser = async () => {
    try {
      await dispatch(assignLeadToUser({ projectId, id: leadId, userId: null })).unwrap();
    } catch (error) {
      console.error('Failed to unassign lead:', error);
    }
  };

  const canEditNote = (n) => user && n.createdBy && user._id === n.createdBy._id;

  // Render logic
  if (isLoading) {
    return (
      <CrmLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </CrmLayout>
    );
  }

  if (!lead) {
    return (
      <CrmLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
          <User className="w-12 h-12 text-slate-300" />
          <h2 className="text-xl font-medium text-slate-600">Lead not found</h2>
          <button onClick={() => navigate(`/crm/${projectId}/leads`)} className="text-indigo-600 hover:underline">
            Return to Leads
          </button>
        </div>
      </CrmLayout>
    );
  }

  // Pipeline visualizer math
  const firstStageId = stages.length > 0 ? stages[0].id : null;
  const currentStatus = lead?.stage || lead?.status;
  const isLegacyStatus = currentStatus && !stages.some(s => s.id === currentStatus);
  const displayStatusId = isLegacyStatus ? firstStageId : currentStatus;
  const currentStageIndex = stages.findIndex(s => s.id === displayStatusId);
  const isQualified = stages.find(s => s.id === displayStatusId)?.name?.toLowerCase() === 'qualified' || currentStatus === 'qualified';

  // Initials for Avatar
  const initials = lead.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'L';

  return (
    <CrmLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

              {/* Lead Identity */}
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{lead.name}</h1>
                  <div className="flex items-center text-slate-600 text-sm gap-3">
                    {lead.jobTitle && <span className="flex items-center"><Briefcase size={14} className="mr-1.5" />{lead.jobTitle}</span>}
                    {lead.company && (
                      <span className="flex items-center">
                        <Building2 size={14} className="mr-1.5" />
                        <Link to={`/crm/${projectId}/companies/${lead.company._id}`} className="hover:text-indigo-600 hover:underline">
                          {lead.company.name}
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {lead.convertedAt ? (
                  <button
                    onClick={() => navigate(`/crm/${projectId}/customers/${lead.convertedCustomerId?._id}`)}
                    className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 size={16} className="mr-2" /> Converted
                  </button>
                ) : hasSalesExecutiveAccess ? (
                  <>
                    {isQualified && (
                      <button
                        onClick={onConvert}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <UserPlus size={16} className="mr-2" /> Convert to Customer
                      </button>
                    )}
                    <button
                      onClick={() => setShowEditSidebar(true)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Pencil size={16} className="mr-2" /> Edit
                    </button>
                    {lead.isArchived ? (
                      <button onClick={onUnarchive} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                        Unarchive
                      </button>
                    ) : (
                      <button onClick={confirmArchive} className="inline-flex items-center p-2 bg-white border border-slate-300 text-slate-400 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors" title="Archive">
                        <Archive size={18} />
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Pipeline Visualizer */}
            {!lead.convertedAt && stages.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-slate-700">Pipeline Stage</h3>
                  {hasSalesExecutiveAccess && (
                    <select
                      value={displayStatusId || ''}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className="text-sm border-0 bg-slate-50 rounded-md py-1 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    >
                      {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute top-1/4 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                  <div
                    className="absolute top-1/4 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                  ></div>
                  <div className="relative flex justify-between">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      return (
                        <button
                          key={stage.id}
                          onClick={() => hasSalesExecutiveAccess && onStatusChange(stage.id)}
                          disabled={!hasSalesExecutiveAccess}
                          className="flex flex-col items-center group relative outline-none"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all duration-300
                              ${isCurrent ? 'border-indigo-600 ring-4 ring-indigo-100 scale-110' :
                                isCompleted ? 'border-indigo-600 border-solid' : 'border-slate-300'}
                            `}
                          >
                            {isCompleted && !isCurrent && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                            {isCurrent && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                          </div>
                          <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                            {stage.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Info) */}
          <div className="space-y-6">

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Contact Info</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.email || 'No email provided'}</p>
                    <p className="text-xs text-slate-500">Work</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.phone || 'No phone provided'}</p>
                    <p className="text-xs text-slate-500">Mobile</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">About</h3>
              </div>
              <div className="p-5">
                <dl className="space-y-4">
                  {/* AI Lead Score Card */}
                  <div className="mb-4">
                    <LeadScoreCard lead={lead} hasManagerAccess={hasManagerAccess} projectId={projectId} />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Source</dt>
                    <dd className="text-sm text-slate-900 capitalize px-2.5 py-1 bg-slate-100 rounded-md inline-block">{lead.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Owner</dt>
                    <dd className="text-sm text-slate-900 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-slate-200 mr-2 flex items-center justify-center text-[10px] font-medium">{lead.owner?.name?.[0]}</div>
                      {lead.owner?.name || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Assigned To</dt>
                    <dd className="flex items-center justify-between group">
                      <span className="text-sm text-slate-900">
                        {lead.assignedTo ? lead.assignedTo.name : <span className="text-slate-400 italic">Unassigned</span>}
                      </span>
                      {hasManagerAccess && (
                        <button
                          onClick={() => lead.assignedTo ? onUnassignUser() : setShowAssignModal(true)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {lead.assignedTo ? 'Remove' : 'Assign'}
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Tags & Custom */}
            {(lead.tags?.length > 0 || Object.keys(lead.customFields || {}).length > 0) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 space-y-5">
                  {lead.tags?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(lead.customFields || {}).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Custom Fields</h4>
                      <dl className="space-y-3">
                        {Object.entries(lead.customFields).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-xs text-slate-500">{key}</dt>
                            <dd className="text-sm text-slate-900 mt-0.5">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Tabs) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center justify-center"><MessageSquare size={16} className="mr-2" /> Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'activity' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center justify-center"><Calendar size={16} className="mr-2" /> Activity</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    {hasSalesExecutiveAccess && !lead.convertedAt && (
                      <form onSubmit={onAddNote} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Write a note..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows="3"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={!note.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Post Note
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-4">
                      {(() => {
                        const allNotes = [...(lead.notes || [])].reverse(); // newest first
                        const totalNotes = allNotes.length;
                        const totalNotePages = Math.ceil(totalNotes / NOTES_PER_PAGE);
                        const pagedNotes = allNotes.slice(
                          (notesPage - 1) * NOTES_PER_PAGE,
                          notesPage * NOTES_PER_PAGE
                        );

                        if (totalNotes === 0) {
                          return (
                            <div className="text-center py-12">
                              <MessageSquare className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                              <p className="text-sm text-slate-500">No notes recorded for this lead yet.</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {pagedNotes.map((n) => (
                              <div key={n._id} className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {n.createdBy?.name?.[0] || 'U'}
                                  </div>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-900">{n.createdBy?.name || 'Unknown'}</span>
                                    <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                                  </div>

                                  {editingNoteId === n._id ? (
                                    <div className="space-y-3">
                                      <textarea
                                        value={editingNoteContent}
                                        onChange={(e) => setEditingNoteContent(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        rows="2"
                                      />
                                      <div className="flex gap-2">
                                        <button onClick={onSaveNoteEdit} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700">Save</button>
                                        <button onClick={onCancelNoteEdit} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200">Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.content}</p>
                                  )}

                                  {canEditNote(n) && editingNoteId !== n._id && !lead.convertedAt && (
                                    <div className="mt-3 flex gap-3">
                                      <button onClick={() => onEditNote(n._id, n.content)} className="text-xs font-medium text-slate-400 hover:text-indigo-600">Edit</button>
                                      <button onClick={() => onDeleteNote(n._id)} className="text-xs font-medium text-slate-400 hover:text-red-600">Delete</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Notes pagination */}
                            {totalNotePages > 1 && (
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-500">
                                  {(notesPage - 1) * NOTES_PER_PAGE + 1}–{Math.min(notesPage * NOTES_PER_PAGE, totalNotes)} of {totalNotes} notes
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setNotesPage(p => Math.max(1, p - 1))}
                                    disabled={notesPage === 1}
                                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    ‹ Prev
                                  </button>
                                  {Array.from({ length: totalNotePages }, (_, i) => i + 1).map(pg => (
                                    <button
                                      key={pg}
                                      onClick={() => setNotesPage(pg)}
                                      className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                                        pg === notesPage
                                          ? 'bg-indigo-600 text-white border border-indigo-600'
                                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      {pg}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setNotesPage(p => Math.min(totalNotePages, p + 1))}
                                    disabled={notesPage === totalNotePages}
                                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Next ›
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="relative">
                    <ActivityTimeline entityType="Lead" entityId={leadId} projectId={projectId} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals & Sidebars */}
        {!lead.convertedAt && <EditLeadSidebar isOpen={showEditSidebar} onClose={() => setShowEditSidebar(false)} lead={lead} />}

        <CustomerSidebar
          isOpen={showConvertSidebar}
          onClose={() => setShowConvertSidebar(false)}
          initialData={{
            firstName: lead?.name?.split(' ')[0] || '',
            lastName: lead?.name?.split(' ').slice(1).join(' ') || '',
            email: lead?.email || '',
            phone: lead?.phone || '',
            jobTitle: lead?.jobTitle || '',
            companyName: lead?.companyName || lead?.company?.name || '',
            source: lead?.source || 'lead_conversion',
            tags: lead?.tags || [],
            score: lead?.score || 50,
            priority: 'medium',
            stage: 'lead',
            status: 'active'
          }}
          isFromLead={true}
          onConvert={handleConvertToCustomer}
        />

        {showAssignModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Assign Lead</h3>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              >
                <option value="">Select a user...</option>
                {project?.members?.filter(member => member.role === 'sales_executive' || member.role === 'manager' || member.role === 'admin' || member.user._id === project.owner._id).map(member => (
                  <option key={member.user._id} value={member.user._id}>{member.user.name} ({member.role})</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button onClick={onAssignUser} disabled={!selectedUserId} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">Assign</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Delete Lead</h3>
              <p className="text-sm text-slate-500 text-center mb-6">Are you sure? This action cannot be undone and will permanently remove this lead.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </CrmLayout>
  );
};

export default LeadDetail;


