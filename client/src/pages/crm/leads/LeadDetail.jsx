import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchLead, addLeadNote, updateLeadNote, deleteLeadNote, updateLeadStatus, assignLeadToUser, archiveLead, clearLead } from '../../../store/leadSlice';
import { getProjectById } from '../../../store/projectSlice';
import { convertLeadToCustomer } from '../../../store/customerSlice';
import EditLeadSidebar from './EditLeadSidebar';
import CustomerSidebar from '../customers/CustomerSidebar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CrmLayout from '../../../layouts/CrmLayout';
import ActivityTimeline from '../../../components/activity/ActivityTimeline';

const LeadDetail = () => {
  const { projectId, leadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lead, isLoading } = useSelector((state) => state.leads);
  const { project } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const [note, setNote] = useState('');
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [showConvertSidebar, setShowConvertSidebar] = useState(false);

  useEffect(() => {
    dispatch(fetchLead(leadId));
    dispatch(getProjectById(projectId));

    return () => {
      dispatch(clearLead());
    };
  }, [dispatch, leadId]);

  const onAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    try {
      await dispatch(addLeadNote({ id: leadId, content: note })).unwrap();
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
      await dispatch(updateLeadNote({ leadId, noteId: editingNoteId, content: editingNoteContent })).unwrap();
      setEditingNoteId(null);
      setEditingNoteContent('');
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
        await dispatch(deleteLeadNote({ leadId, noteId })).unwrap();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const onConvert = () => {
    setShowConvertSidebar(true);
  };

  const handleConvertToCustomer = async (customerData) => {
    try {
      await dispatch(convertLeadToCustomer({ leadId, customerData })).unwrap();
      setShowConvertSidebar(false);
      navigate(`/crm/${projectId}/customers`);
    } catch (error) {
      console.error('Failed to convert lead:', error);
    }
  };

  const onArchive = () => {
    setShowDeleteConfirm(true);
  };

  const confirmArchive = async () => {
    try {
      await dispatch(archiveLead(leadId)).unwrap();
      navigate(`/crm/${projectId}/leads`);
    } catch (error) {
      console.error('Failed to archive lead:', error);
    }
  };

  const onStatusChange = async (newStatus) => {
    try {
      await dispatch(updateLeadStatus({ id: leadId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const onAssignUser = async () => {
    try {
      await dispatch(assignLeadToUser({ id: leadId, userId: selectedUserId })).unwrap();
      setShowAssignModal(false);
      setSelectedUserId('');
    } catch (error) {
      console.error('Failed to assign lead:', error);
    }
  };

  const onUnassignUser = async () => {
    try {
      await dispatch(assignLeadToUser({ id: leadId, userId: null })).unwrap();
    } catch (error) {
      console.error('Failed to unassign lead:', error);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      new: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      disqualified: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || colors.new}`}>
        {status}
      </span>
    );
  };

  const canEditNote = (note) => {
    return user && note.createdBy && user._id === note.createdBy._id;
  };

  return (
    <CrmLayout>
      {isLoading ? <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div> : !lead ? <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lead not found</div>
      </div> : <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-600">Lead Details</p>
        </div>
        <div className="flex items-center space-x-3">
          {lead.convertedAt ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Converted to Customer
              </span>
              <Button
                variant="secondary"
                onClick={() => navigate(`/crm/${projectId}/customers/${lead.convertedCustomerId._id}`)}
              >
                View Customer
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowEditSidebar(true)}
              >
                Edit Lead
              </Button>
              <Button
                variant="danger"
                onClick={onArchive}
              >
                Archive Lead
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{lead.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{lead.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{lead.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <p className="text-gray-900">{lead.jobTitle || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Reference</label>
                <Link className="text-blue-900 underline" to={`/crm/${projectId}/companies/${lead.company._id}`}>{lead.company?.name || '-'}</Link>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <p className="text-gray-900 capitalize">{lead.source}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <p className="text-gray-900">{lead.score || 0}</p>
              </div>
            </div>
          </div>

          {/* Status and Assignment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status & Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={lead.stage || lead.status} />
                  {!lead.convertedAt && <select
                    value={lead.stage || lead.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="disqualified">Disqualified</option>
                  </select>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-900">{lead.assignedTo?.name || 'Unassigned'}</p>
                  {!lead.convertedAt && (lead.assignedTo ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onUnassignUser}
                    >
                      Unassign
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAssignModal(true)}
                    >
                      Assign
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <p className="text-gray-900">{lead.owner?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-gray-900">{lead.createdBy?.name}</p>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {lead.customFields && Object.keys(lead.customFields).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(lead.customFields).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                    <p className="text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion Information */}
          {(lead.convertedAt || lead.convertedContactId || lead.convertedCustomerId) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.convertedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Converted At</label>
                    <p className="text-gray-900">{new Date(lead.convertedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {lead.convertedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Converted By</label>
                    <p className="text-gray-900">{lead.convertedBy?.name}</p>
                  </div>
                )}
                {lead.convertedContactId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact ID</label>
                    <p className="text-gray-900">{lead.convertedContactId}</p>
                  </div>
                )}
                {lead.convertedCustomerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <button
                      onClick={() => navigate(`/crm/${projectId}/customers/${lead.convertedCustomerId._id}`)}
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      View Customer Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            
            {/* Add Note Form */}
            <form onSubmit={onAddNote} className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1"
                  disabled={lead.convertedAt}
                />
                <Button type="submit" disabled={!note.trim() || lead.convertedAt}>
                  Add Note
                </Button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes.map((note, index) => (
                  <div key={note._id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                    {editingNoteId === note._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={onSaveNoteEdit}
                            disabled={!editingNoteContent.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={onCancelNoteEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900">{note.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>{note.createdBy?.name || 'Unknown'}</span>
                      <div className="flex items-center space-x-2">
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        {canEditNote(note) && editingNoteId !== note._id && (
                          <>
                            <button
                              onClick={() => onEditNote(note._id, note.content)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteNote(note._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notes yet</p>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <ActivityTimeline 
              entityType="Lead" 
              entityId={leadId} 
              projectId={projectId} 
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {(lead.stage || lead.status) === 'qualified' && (
                <Button
                  onClick={onConvert}
                  className="w-full"
                  variant="success"
                  disabled={lead.convertedAt}
                >
                  Convert to Customer
                </Button>
              )}
              <Button
                onClick={() => setShowEditSidebar(true)}
                variant="secondary"
                className="w-full"
                disabled={lead.convertedAt}
              >
                Edit Lead
              </Button>
              {!lead.convertedAt && <Button
                onClick={onArchive}
                variant="danger"
                className="w-full"
              >
                Archive Lead
              </Button>}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Source</dt>
                <dd className="capitalize">{lead.source}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Score</dt>
                <dd>{lead.score || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Owner</dt>
                <dd>{lead.owner?.name || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Assigned To</dt>
                <dd>{lead.assignedTo?.name || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Job Title</dt>
                <dd>{lead.jobTitle || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd>{new Date(lead.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Updated</dt>
                <dd>{new Date(lead.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Edit Sidebar */}
      {!lead.convertedAt && (
        <EditLeadSidebar
          isOpen={showEditSidebar}
          onClose={() => setShowEditSidebar(false)}
          lead={lead}
        />
      )}


      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Assign Lead</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {project?.members?.map(member => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUserId('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={onAssignUser}
                disabled={!selectedUserId}
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Archive Lead</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to archive this lead? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmArchive}
              >
                Archive Lead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Sidebar */}
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
          status: 'active',
          address: {
            street: lead?.company?.address?.street || '',
            city: lead?.company?.address?.city || '3qe',
            state: lead?.company?.address?.state || '',
            zipCode: lead?.company?.address?.zipCode || '',
            country: lead?.company?.address?.country || 'United States'
          },
          socialLinks: {
            linkedin: lead?.socialLinks?.linkedin || '',
            twitter: lead?.socialLinks?.twitter || '',
            facebook: lead?.socialLinks?.facebook || '',
            website: lead?.socialLinks?.website || '',
            other: lead?.socialLinks?.other || ''
          },
          industry: lead?.company?.industry || '',
          deal: {
            value: 0,
            currency: 'USD',
            probability: 0,
            dealStage: 'discovery'
          },
          communicationPreferences: {
            email: true,
            phone: true,
            sms: false,
            preferredContactMethod: 'email',
            timezone: 'UTC',
            language: 'en'
          },
          lifecycleStage: 'awareness'
        }}
        isFromLead={true}
        onConvert={handleConvertToCustomer}
      />
    </div>}
    </CrmLayout>
  );
};

export default LeadDetail;



