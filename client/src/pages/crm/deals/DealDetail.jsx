import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeal,
  updateExistingDeal,
  deleteExistingDeal,
  archiveExistingDeal,
  restoreExistingDeal,
  addDealNoteAction,
  updateDealNoteAction,
  deleteDealNoteAction,
  addDealActivityAction,
  fetchDealActivities
} from '../../../store/dealSlice';
import { getUsers } from '../../../store/userSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import EditDealSidebar from './EditDealSidebar';
import { getProjectById, getProjectPipelines } from '../../../store/projectSlice';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  getInitials,
  getDealHealthScore,
  getDealHealthColor,
  getDealHealthBgColor
} from '../../../utils/dealUtils';
import CrmLayout from '../../../layouts/CrmLayout';
import ActivityTimeline from '../../../components/activity/ActivityTimeline';
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  PaperClipIcon,
  TrophyIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useProjectAccess } from '../../../hooks/useProjectAccess';

const DealDetail = () => {
  const { projectId, dealId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentDeal, loading, error } = useSelector((state) => state.deals);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { pipelines } = useSelector((state) => state.projects);

  const dealPipelines = pipelines?.filter(p => p.type === 'deal') || [];
  const defaultPipeline = dealPipelines.find(p => p.isDefault) || dealPipelines[0];
  const dealStages = defaultPipeline?.stages || [];

  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { hasSupportExecutiveAccess } = useProjectAccess();

  // Form states
  const [noteForm, setNoteForm] = useState({ content: '' });

  useEffect(() => {
    if (dealId && projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectPipelines(projectId));
      dispatch(fetchDeal({ projectId, dealId }));
      dispatch(fetchDealActivities({ projectId, dealId }));
    }
    if (projectId) {
      dispatch(getUsers({ projectId }));
    }
  }, [dispatch, dealId, projectId]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateExistingDeal({
        projectId,
        dealId: dealId,
        dealData: { status: newStatus }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update deal status:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await dispatch(updateExistingDeal({
        projectId,
        dealId: dealId,
        dealData: { priority: newPriority }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update deal priority:', error);
    }
  };


  const handleDelete = async () => {
    try {
      await dispatch(deleteExistingDeal({ projectId, dealId })).unwrap();
      navigate(`/crm/${projectId}/deals`);
    } catch (error) {
      console.error('Failed to delete deal:', error);
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(archiveExistingDeal({ projectId, dealId })).unwrap();
      setShowArchiveConfirm(false);
      navigate(`/crm/${projectId}/deals`);
    } catch (error) {
      console.error('Failed to archive deal:', error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await dispatch(restoreExistingDeal({ projectId, dealId })).unwrap();
      // Refresh the deal to get updated data
      await dispatch(fetchDeal({ projectId, dealId }));
    } catch (error) {
      console.error('Failed to unarchive deal:', error);
    }
  };

  const handleAssignMember = async (memberId) => {
    try {
      const member = users.find(u => u._id === memberId);
      await dispatch(updateExistingDeal({
        projectId,
        dealId: dealId,
        dealData: { assignedTo: memberId }
      })).unwrap();
      // Refresh the deal to get updated data
      await dispatch(fetchDeal({ projectId, dealId }));
    } catch (error) {
      console.error('Failed to assign member:', error);
    }
  };

  const handleUnassignMember = async () => {
    try {
      await dispatch(updateExistingDeal({
        projectId,
        dealId: dealId,
        dealData: { assignedTo: null }
      })).unwrap();
      // Refresh the deal to get updated data
      await dispatch(fetchDeal({ projectId, dealId }));
    } catch (error) {
      console.error('Failed to unassign member:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteForm.content.trim()) return;

    try {
      await dispatch(addDealNoteAction({
        projectId,
        dealId: dealId,
        noteData: {
          content: noteForm.content,
          author: user._id
        }
      })).unwrap();
      setNoteForm({ content: '' });
      setShowAddNote(false);
      // Refresh the deal to get updated notes
      await dispatch(fetchDeal({ projectId, dealId }));
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({ content: note.content });
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.content.trim()) return;

    try {
      await dispatch(updateDealNoteAction({
        projectId,
        dealId: dealId,
        noteId: editingNote._id,
        noteData: { content: noteForm.content }
      })).unwrap();
      setEditingNote(null);
      setNoteForm({ content: '' });
      // Refresh the deal to get updated notes
      await dispatch(fetchDeal({ projectId, dealId }));
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteDealNoteAction({ projectId, dealId: dealId, noteId })).unwrap();
        // Refresh the deal to get updated notes
        await dispatch(fetchDeal({ projectId, dealId }));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };


  // Calculate deal health score
  const dealHealthScore = currentDeal ? getDealHealthScore(currentDeal) : 0;

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'note':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'email':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'call':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
      case 'meeting':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'status_change':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'value_change':
        return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'attachment':
        return <PaperClipIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <Alert variant="error" title="Error" message={error} />
    );
  }

  if (!currentDeal) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Deal not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The deal you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <CrmLayout>
      {loading ? <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div> : <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/crm/${projectId}/deals`)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentDeal.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {/* Status Select */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Stage:</label>
                    {hasSupportExecutiveAccess ? <select
                      value={currentDeal.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: dealStages.find(s => s._id === currentDeal.status)?.color || '#e5e7eb', color: '#1f2937' }}
                    >
                      <option value="">Select Stage</option>
                      {dealStages.map(stage => (
                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                      ))}
                    </select> : <span
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: dealStages.find(s => s._id === currentDeal.status)?.color || '#e5e7eb', color: '#1f2937' }}
                    >
                      {dealStages.find(s => s._id === currentDeal.status)?.name || currentDeal.status}
                    </span>}
                  </div>

                  {/* Priority Select */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Priority:</label>
                    {hasSupportExecutiveAccess ? <select
                      value={currentDeal.priority || 'medium'}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(currentDeal.priority || 'medium')}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select> : <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(currentDeal.priority || 'medium')}`}>{currentDeal.priority || 'medium'}</span>}
                  </div>

                  <span className="text-sm text-gray-500">
                    {formatCurrency(currentDeal.value, currentDeal.currency)}
                  </span>
                </div>
              </div>
            </div>

            {hasSupportExecutiveAccess && <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {!currentDeal.isArchived ? (
                <Button
                  variant="warning"
                  onClick={() => setShowArchiveConfirm(true)}
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleUnarchive}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Unarchive
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'products', name: 'Products' },
                { id: 'notes', name: 'Notes' },
                { id: 'attachments', name: 'Attachments' },
                { id: 'competitors', name: 'Competitors' },
                { id: 'activities', name: 'Activities' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  {currentDeal.description && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600">{currentDeal.description}</p>
                    </div>
                  )}

                  {/* Deal Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Deal Details</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Deal Number</dt>
                        <dd className="text-sm text-gray-900 font-mono">
                          {currentDeal.dealNumber || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Value</dt>
                        <dd className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(currentDeal.value, currentDeal.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Probability</dt>
                        <dd className="text-sm text-gray-900">
                          {currentDeal.probability}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Expected Close Date</dt>
                        <dd className="text-sm text-gray-900">
                          {currentDeal.expectedCloseDate ? formatDate(currentDeal.expectedCloseDate) : 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Actual Close Date</dt>
                        <dd className="text-sm text-gray-900">
                          {currentDeal.actualCloseDate ? formatDate(currentDeal.actualCloseDate) : 'Not closed'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Source</dt>
                        <dd className="text-sm text-gray-900">
                          {currentDeal.source || 'Not specified'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="text-sm text-gray-900">
                          {formatDateTime(currentDeal.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                        <dd className="text-sm text-gray-900">
                          {formatDateTime(currentDeal.updatedAt)}
                        </dd>
                      </div>
                      {currentDeal.isArchived && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Archived At</dt>
                            <dd className="text-sm text-gray-900">
                              {currentDeal.archivedAt ? formatDateTime(currentDeal.archivedAt) : 'N/A'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Archived By</dt>
                            <dd className="text-sm text-gray-900">
                              {currentDeal.archivedBy?.name || 'Unknown'}
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Relationships */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Relationships</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentDeal.customer && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Customer</dt>
                          <dd className="text-sm text-gray-900">
                            <button
                              onClick={() => navigate(`/crm/${projectId}/customers/${currentDeal.customer._id}`)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {currentDeal.customer.firstName} {currentDeal.customer.lastName}
                            </button>
                          </dd>
                        </div>
                      )}
                      {currentDeal.company && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Company</dt>
                          <dd className="text-sm text-gray-900">
                            <button
                              onClick={() => navigate(`/crm/${projectId}/companies/${currentDeal.company._id}`)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {currentDeal.company.name}
                            </button>
                          </dd>
                        </div>
                      )}
                      {currentDeal.assignedTo && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                          <dd className="text-sm text-gray-900 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              {currentDeal.assignedTo.profileImage ? (
                                <img
                                  src={currentDeal.assignedTo.profileImage}
                                  alt={currentDeal.assignedTo.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {getInitials(currentDeal.assignedTo.name)}
                                </span>
                              )}
                            </div>
                            {currentDeal.assignedTo.name}
                          </dd>
                        </div>
                      )}
                      {currentDeal.contactPerson && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                          {currentDeal.contactPerson?.name ? <dd className="text-sm text-gray-900">
                            <div className="font-medium">{currentDeal.contactPerson.name}</div>
                            {currentDeal.contactPerson.position && (
                              <div className="text-gray-500">{currentDeal.contactPerson.position}</div>
                            )}
                            {currentDeal.contactPerson.email && (
                              <div className="text-gray-500">{currentDeal.contactPerson.email}</div>
                            )}
                            {currentDeal.contactPerson.phone && (
                              <div className="text-gray-500">{currentDeal.contactPerson.phone}</div>
                            )}
                          </dd> : <dd className="text-sm text-gray-900">N/A</dd>}
                        </div>
                      )}
                      {currentDeal.createdBy && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Created By</dt>
                          <dd className="text-sm text-gray-900">
                            {currentDeal.createdBy.name}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Tags */}
                  {currentDeal.tags && currentDeal.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentDeal.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Action */}
                  {(currentDeal.nextAction || currentDeal.nextActionDate) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Next Action</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        {currentDeal.nextAction && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-blue-900">Action:</span>
                            <p className="text-sm text-blue-800">{currentDeal.nextAction}</p>
                          </div>
                        )}
                        {currentDeal.nextActionDate && (
                          <div>
                            <span className="text-sm font-medium text-blue-900">Due Date:</span>
                            <p className="text-sm text-blue-800">{formatDate(currentDeal.nextActionDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Win/Loss Reasons */}
                  {(currentDeal.winReason || currentDeal.lossReason) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Deal Outcome</h3>
                      {currentDeal.winReason && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                          <div className="flex items-center mb-2">
                            <TrophyIcon className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Win Reason</span>
                          </div>
                          <p className="text-sm text-green-800">{currentDeal.winReason}</p>
                        </div>
                      )}
                      {currentDeal.lossReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-900">Loss Reason</span>
                          </div>
                          <p className="text-sm text-red-800">{currentDeal.lossReason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Fields */}
                  {currentDeal.customFields && Object.keys(currentDeal.customFields).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Custom Fields</h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(currentDeal.customFields).map(([key, value], index) => (
                          <div key={index}>
                            <dt className="text-sm font-medium text-gray-500">{key}</dt>
                            <dd className="text-sm text-gray-900">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  {hasSupportExecutiveAccess && <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => setShowAddNote(true)}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>}

                  {/* Deal Health */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Deal Health</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Health Score</span>
                        <span className={`font-medium ${getDealHealthColor(dealHealthScore)}`}>
                          {dealHealthScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getDealHealthBgColor(dealHealthScore)}`}
                          style={{ width: `${dealHealthScore}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Based on timeline, value, and activity
                      </div>
                    </div>
                  </div>

                  {/* Member Assignment */}
                  {hasSupportExecutiveAccess && <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Assigned To</h3>
                    {currentDeal.assignedTo ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            {currentDeal.assignedTo.profileImage ? (
                              <img
                                src={currentDeal.assignedTo.profileImage}
                                alt={currentDeal.assignedTo.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium text-indigo-800">
                                {currentDeal.assignedTo.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{currentDeal.assignedTo.name}</p>
                            <p className="text-xs text-gray-500">{currentDeal.assignedTo.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleUnassignMember}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Unassign member"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">No member assigned</p>
                        <select
                          onChange={(e) => e.target.value && handleAssignMember(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          defaultValue=""
                        >
                          <option value="">Assign to member...</option>
                          {users.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Products</h3>
                  <div className="text-sm text-gray-500">
                    Total Value: {formatCurrency(
                      currentDeal.products?.reduce((total, product) => total + product.totalPrice, 0) || 0,
                      currentDeal.currency
                    )}
                  </div>
                </div>

                {currentDeal.products && currentDeal.products.length > 0 ? (
                  <div className="space-y-4">
                    {currentDeal.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(product.totalPrice, currentDeal.currency)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.quantity} × {formatCurrency(product.unitPrice, currentDeal.currency)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <div className="font-medium">{product.quantity}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Unit Price:</span>
                            <div className="font-medium">{formatCurrency(product.unitPrice, currentDeal.currency)}</div>
                          </div>
                          {product.discount > 0 && (
                            <div>
                              <span className="text-gray-500">Discount:</span>
                              <div className="font-medium">{product.discount}%</div>
                            </div>
                          )}
                          {product.tax > 0 && (
                            <div>
                              <span className="text-gray-500">Tax:</span>
                              <div className="font-medium">{product.tax}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products added</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Products will appear here when added to this deal.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                  {hasSupportExecutiveAccess && <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddNote(true)}
                  >
                    Add Note
                  </Button>}
                </div>

                {console.log(currentDeal.notes)}
                {currentDeal.notes && currentDeal.notes.length > 0 ? (
                  <div className="space-y-4">
                    {currentDeal.notes.map((note) => (
                      <div key={note._id} className="bg-gray-50 rounded-lg p-4">
                        {editingNote && editingNote._id === note._id ? (
                          <form onSubmit={handleUpdateNote} className="space-y-3">
                            <textarea
                              value={noteForm.content}
                              onChange={(e) => setNoteForm({ content: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter note content"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingNote(null);
                                  setNoteForm({ content: '' });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={!noteForm.content.trim() || loading}
                              >
                                Update
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p className="text-gray-900">{note.content}</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center text-sm text-gray-500">
                                <span>By {note.createdBy?.name || 'Unknown'}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDateTime(note.createdAt)}</span>
                              </div>
                              {note.createdBy._id === user._id && <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditNote(note)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note._id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add a note to track important information about this deal.
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <ActivityTimeline
                  entityType="Deal"
                  entityId={dealId}
                  projectId={projectId}
                />
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
                  <div className="text-sm text-gray-500">
                    {currentDeal.attachments?.length || 0} files
                  </div>
                </div>

                {currentDeal.attachments && currentDeal.attachments.length > 0 ? (
                  <div className="space-y-3">
                    {currentDeal.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <PaperClipIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{attachment.name}</h4>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{attachment.type}</span>
                              <span>{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                              <span>Uploaded {formatDateTime(attachment.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {attachment.uploadedBy && (
                            <div className="text-xs text-gray-500">
                              By {attachment.uploadedBy.name}
                            </div>
                          )}
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Files and documents will appear here when uploaded.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Competitors Tab */}
            {activeTab === 'competitors' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Competitors</h3>
                  <div className="text-sm text-gray-500">
                    {currentDeal.competitors?.length || 0} competitors
                  </div>
                </div>

                {currentDeal.competitors && currentDeal.competitors.length > 0 ? (
                  <div className="space-y-4">
                    {currentDeal.competitors.map((competitor, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{competitor.name}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${competitor.status === 'won' ? 'bg-green-100 text-green-800' :
                              competitor.status === 'lost' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {competitor.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {competitor.strengths && (
                            <div>
                              <span className="text-gray-500 font-medium">Strengths:</span>
                              <p className="text-gray-900 mt-1">{competitor.strengths}</p>
                            </div>
                          )}
                          {competitor.weaknesses && (
                            <div>
                              <span className="text-gray-500 font-medium">Weaknesses:</span>
                              <p className="text-gray-900 mt-1">{competitor.weaknesses}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No competitors tracked</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Competitor information will appear here when added.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Note Modal */}
        {showAddNote && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Add Note</h3>
              <form onSubmit={handleAddNote} className="space-y-4">
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter note content"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddNote(false);
                      setNoteForm({ content: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Add Note
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Edit Deal Sidebar */}
        <EditDealSidebar
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          deal={currentDeal}
          projectId={projectId}
        />

        {/* Archive Confirmation Modal */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Archive Deal</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to archive this deal? It will be moved to the archived deals section.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowArchiveConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="warning"
                  onClick={handleArchive}
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Delete Deal</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete this deal? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>}
    </CrmLayout>
  );
};

export default DealDetail;
