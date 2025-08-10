import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateContact, 
  deleteContact, 
  addContactNote, 
  getContactNotes,
  addContactTag,
  removeContactTag,
  updateContactStage,
  updateContactLeadScore
} from '../../../store/contactSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const ContactDetailModal = ({ contact, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message, notes } = useSelector((state) => state.contacts);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load notes when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      dispatch(getContactNotes(contact._id));
    }
  }, [isOpen, contact, dispatch]);

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setIsEditing(false);
      setEditData({});
      setNewNote('');
      setNewTag('');
    }
  }, [isSuccess]);

  const handleEdit = () => {
    setEditData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      jobTitle: contact.jobTitle,
      department: contact.department,
      stage: contact.stage,
      status: contact.status,
      source: contact.source,
      leadScore: contact.leadScore
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    dispatch(updateContact({ contactId: contact._id, contactData: editData }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = () => {
    dispatch(deleteContact(contact._id));
    onClose();
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      dispatch(addContactNote({ 
        contactId: contact._id, 
        noteData: { content: newNote } 
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !contact.tags.includes(newTag.trim())) {
      dispatch(addContactTag({ 
        contactId: contact._id, 
        tagData: { tag: newTag.trim() } 
      }));
    }
  };

  const handleRemoveTag = (tag) => {
    dispatch(removeContactTag({ 
      contactId: contact._id, 
      tag 
    }));
  };

  const handleStageChange = (newStage) => {
    dispatch(updateContactStage({ 
      contactId: contact._id, 
      stageData: { stage: newStage } 
    }));
  };

  const handleLeadScoreChange = (newScore) => {
    dispatch(updateContactLeadScore({ 
      contactId: contact._id, 
      scoreData: { leadScore: newScore } 
    }));
  };

  const getStageColor = (stage) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-green-100 text-green-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      opportunity: 'bg-purple-100 text-purple-800',
      customer: 'bg-indigo-100 text-indigo-800',
      inactive: 'bg-gray-100 text-gray-800',
      lost: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      unsubscribed: 'bg-yellow-100 text-yellow-800',
      bounced: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.other;
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-2xl">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-800">
                        {getInitials(contact.firstName, contact.lastName)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleEdit}
                      disabled={isEditing}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {['overview', 'notes', 'activity', 'settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6">
                  {isError && (
                    <Alert
                      variant="error"
                      title="Error"
                      message={message}
                    />
                  )}

                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.firstName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.lastName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.jobTitle || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.department || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      {/* CRM Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">CRM Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Stage</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(contact.stage)}`}>
                              {contact.stage}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Lead Score</label>
                            <p className={`mt-1 text-sm font-medium ${getLeadScoreColor(contact.leadScore)}`}>
                              {contact.leadScore}/100
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Source</label>
                            <p className="mt-1 text-sm text-gray-900 capitalize">{contact.source}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {contact.tags && contact.tags.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {contact.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Created</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(contact.createdAt)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(contact.updatedAt)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Created By</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.createdBy?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                            <p className="mt-1 text-sm text-gray-900">{contact.assignedTo?.name || 'Unassigned'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                        
                        {/* Add Note */}
                        <div className="mb-4">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Add a note about this contact..."
                          />
                          <div className="mt-2 flex justify-end">
                            <Button
                              type="button"
                              onClick={handleAddNote}
                              disabled={!newNote.trim() || isLoading}
                            >
                              Add Note
                            </Button>
                          </div>
                        </div>

                        {/* Notes List */}
                        <div className="space-y-4">
                          {notes.map(note => (
                            <div key={note._id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{note.content}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatDate(note.createdAt)} by {note.createdBy?.name || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                          {contact.activities && contact.activities.length > 0 ? (
                            contact.activities.map(activity => (
                              <div key={activity._id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{activity.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(activity.createdAt)} by {activity.createdBy?.name || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No recent activity</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        
                        {/* Stage Management */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Change Stage</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['lead', 'prospect', 'qualified', 'opportunity', 'customer'].map(stage => (
                              <button
                                key={stage}
                                onClick={() => handleStageChange(stage)}
                                disabled={contact.stage === stage || isLoading}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  contact.stage === stage
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {stage}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Lead Score Management */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lead Score</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={contact.leadScore}
                              onChange={(e) => handleLeadScoreChange(parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium text-gray-900 w-12">
                              {contact.leadScore}
                            </span>
                          </div>
                        </div>

                        {/* Add Tag */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Add Tag</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter tag name"
                            />
                            <Button
                              type="button"
                              onClick={handleAddTag}
                              disabled={!newTag.trim() || isLoading}
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h4>
                          <Button
                            type="button"
                            variant="error"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            Delete Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isEditing && (
                <div className="flex-shrink-0 px-4 py-4 flex space-x-3 bg-gray-50">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    isLoading={isLoading}
                    disabled={isLoading}
                    fullWidth
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Contact
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this contact? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <Button
                  type="button"
                  variant="error"
                  onClick={handleDelete}
                  isLoading={isLoading}
                  fullWidth
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetailModal;
