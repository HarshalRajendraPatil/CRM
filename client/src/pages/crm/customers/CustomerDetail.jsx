import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  fetchCustomer, 
  updateCustomer, 
  addCustomerNote, 
  updateCustomerNote,
  deleteCustomerNote,
  addCustomerInteraction,
  updateCustomerInteraction,
  deleteCustomerInteraction,
  archiveCustomer,
  deleteCustomer,
  clearError,
  clearSuccessMessage,
  unarchiveCustomer,
  fetchCustomerDeals,
  fetchCustomerDealStats
} from '../../../store/customerSlice';
import { getProjectById } from '../../../store/projectSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import CrmLayout from '../../../layouts/CrmLayout';
import CustomerSidebar from './CustomerSidebar';
import ActivityTimeline from '../../../components/activity/ActivityTimeline';
import { getProjectCompanies, clearCompanies } from '../../../store/companySlice';
import useProjectAccess from '../../../hooks/useProjectAccess';

const CustomerDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId, customerId } = useParams();
  
  const { 
    currentCustomer, 
    isLoading, 
    error, 
    successMessage,
    customerDeals,
    customerDealStats
  } = useSelector((state) => state.customers);
  const { project } = useSelector((state) => state.projects);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [showCustomerSidebar, setShowCustomerSidebar] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [interactionData, setInteractionData] = useState({
    type: 'call',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 30,
    outcome: 'positive'
  });
  const {hasSupportExecutiveAccess} = useProjectAccess();
  const { user } = useSelector((state) => state.auth);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [editingNoteType, setEditingNoteType] = useState('general');
  const [editingInteractionId, setEditingInteractionId] = useState(null);
  const [editingInteractionData, setEditingInteractionData] = useState(null);

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomer({projectId, id: customerId}));
      if (activeTab === 'deals') {
        dispatch(fetchCustomerDeals({ projectId, customerId }));
        dispatch(fetchCustomerDealStats({ projectId, customerId }));
      }
    }
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectCompanies({ projectId }));
    }

    return () => {
      dispatch(clearCompanies());
    };
  }, [dispatch, customerId, projectId]);

  useEffect(() => {
    if (customerId && activeTab === 'deals') {
      dispatch(fetchCustomerDeals({ projectId, customerId }));
      dispatch(fetchCustomerDealStats({ projectId, customerId }));
    }
  }, [dispatch, customerId, projectId, activeTab]);

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const handleEdit = () => {
    setShowCustomerSidebar(true);
  };

  const handleArchive = async () => {
    const confirmed = window.confirm('Are you sure you want to archive this customer?');
    if (confirmed) {
      try {
        await dispatch(archiveCustomer({projectId, id: customerId})).unwrap();
        navigate(`/crm/${projectId}/customers`);
      } catch (error) {
        console.error('Failed to archive customer:', error);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.');
    if (confirmed) {
      try {
        await dispatch(deleteCustomer(customerId)).unwrap();
        navigate(`/crm/${projectId}/customers`);
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const handleAssign = async (assignedTo) => {
    try {
      await dispatch(updateCustomer({ 
        projectId: projectId,
        id: customerId, 
        customerData: { assignedTo } 
      })).unwrap();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Failed to assign customer:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateCustomer({ 
        projectId: projectId,
        id: customerId, 
        customerData: { status: newStatus }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await dispatch(updateCustomer({ 
        projectId: projectId,
        id: customerId, 
        customerData: { stage: newStage }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update customer stage:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await dispatch(updateCustomer({ 
        projectId: projectId,
        id: customerId, 
        customerData: { priority: newPriority }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update customer priority:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      await dispatch(addCustomerNote({ 
        projectId: projectId,
        id: customerId, 
        noteData: { content: noteContent, type: noteType } 
      })).unwrap();
      setNoteContent('');
      setNoteType('general');
      setShowNoteForm(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!interactionData.title.trim()) return;

    try {
      await dispatch(addCustomerInteraction({ 
        projectId: projectId,
        id: customerId, 
        interactionData 
      })).unwrap();
      setInteractionData({
        type: 'call',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        duration: 30,
        outcome: 'positive'
      });
      setShowInteractionForm(false);
    } catch (error) {
      console.error('Failed to add interaction:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteContent(note.content);
    setEditingNoteType(note.type || 'general');
  };

  const handleSaveNoteEdit = async () => {
    if (!editingNoteContent.trim()) return;
    
    try {
      await dispatch(updateCustomerNote({ 
        projectId: projectId,
        customerId: customerId, 
        noteId: editingNoteId,
        noteData: { content: editingNoteContent, type: editingNoteType }
      })).unwrap();
      setEditingNoteId(null);
      setEditingNoteContent('');
      setEditingNoteType('general');
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleCancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
    setEditingNoteType('general');
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteCustomerNote({ 
          projectId: projectId,
          customerId: customerId, 
          noteId 
        })).unwrap();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleEditInteraction = (interaction) => {
    setEditingInteractionId(interaction._id);
    setEditingInteractionData({
      type: interaction.type,
      title: interaction.title,
      description: interaction.description || '',
      date: interaction.date ? new Date(interaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      duration: interaction.duration || 30,
      outcome: interaction.outcome || 'positive'
    });
  };

  const handleSaveInteractionEdit = async () => {
    if (!editingInteractionData.title.trim()) return;
    
    try {
      await dispatch(updateCustomerInteraction({ 
        projectId: projectId,
        customerId: customerId, 
        interactionId: editingInteractionId,
        interactionData: editingInteractionData
      })).unwrap();
      setEditingInteractionId(null);
      setEditingInteractionData(null);
    } catch (error) {
      console.error('Failed to update interaction:', error);
    }
  };

  const handleCancelInteractionEdit = () => {
    setEditingInteractionId(null);
    setEditingInteractionData(null);
  };



  const handleUnarchive = async (customerId) => {
    console.log(customerId);
    const confirmed = window.confirm('Are you sure you want to unarchive this customer?');
    
    if (confirmed) {
      try {
        await dispatch(unarchiveCustomer({ projectId, id: customerId })).unwrap();
        // Reload customers after unarchiving
        navigate(`/crm/${projectId}/customers`);
      } catch (error) {
        console.error('Failed to unarchive customer:', error);
      }
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await dispatch(deleteCustomerInteraction({ 
          projectId: projectId,
          customerId: customerId, 
          interactionId 
        })).unwrap();
      } catch (error) {
        console.error('Failed to delete interaction:', error);
      }
    }
  };

  const canEditNote = (note) => {
    return user && note.createdBy && (note.createdBy._id === user._id || user.roleGlobal === 'system-admin');
  };

  const canEditInteraction = (interaction) => {
    return user && interaction.createdBy && (interaction.createdBy._id === user._id || user.roleGlobal === 'system-admin');
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
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

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  // if (isLoading) {
  //   return (
  //     <CrmLayout>
  //       <div className="flex items-center justify-center h-64">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //       </div>
  //     </CrmLayout>
  //   );
  // }

  if (!currentCustomer) {
    return (
      <CrmLayout>
        <div className="p-6">
          <Alert type="error" message="Customer not found" />
        </div>
      </CrmLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'company', name: 'Company', icon: '🏢' },
    { id: 'deals', name: 'Deals', icon: '💰' },
    { id: 'communication', name: 'Communication', icon: '📞' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'interactions', name: 'Interactions', icon: '📞' },
    { id: 'activity', name: 'Activity', icon: '📊' }
  ];

  return (
    <CrmLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/crm/${projectId}/customers`)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {getInitials(currentCustomer.firstName, currentCustomer.lastName)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentCustomer.firstName} {currentCustomer.lastName}
                </h1>
                <p className="text-gray-600">{currentCustomer.email}</p>
                {currentCustomer.companyName && (
                  <p className="text-gray-600">{currentCustomer.companyName}</p>
                )}
              </div>
            </div>
          </div>
          {hasSupportExecutiveAccess ? <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(true)}
            >
              {currentCustomer.assignedTo ? 'Re-assign' : 'Assign'}
            </Button>
            {currentCustomer.isArchived ? <Button
              variant="success"
              onClick={() => handleUnarchive(customerId)}
            >
              Unarchive
            </Button> : <Button
              variant="danger"
              onClick={handleArchive}
            >
              Archive
            </Button>}
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div> : null}
        </div>

        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Status Badges with Inline Editing */}
        <div className="flex items-center space-x-4">
          {/* Stage Select */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Stage:</label>
            {hasSupportExecutiveAccess ? <select
              value={currentCustomer.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className={`px-3 py-1 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStageColor(currentCustomer.stage)}`}
            >
              <option value="prospect">Prospect</option>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="opportunity">Opportunity</option>
              <option value="customer">Customer</option>
              <option value="churned">Churned</option>
              <option value="inactive">Inactive</option>
            </select> : <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStageColor(currentCustomer.stage)}`}>
              {currentCustomer.stage}
            </span>}
          </div>

          {/* Status Select */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            {hasSupportExecutiveAccess ? <select
              value={currentCustomer.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-1 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(currentCustomer.status)}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select> : <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(currentCustomer.status)}`}>
              {currentCustomer.status}
            </span>}
          </div>

          {/* Priority Select */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            {hasSupportExecutiveAccess ? <select
              value={currentCustomer.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className={`px-3 py-1 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(currentCustomer.priority)}`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select> : <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getPriorityColor(currentCustomer.priority)}`}>
              {currentCustomer.priority}
            </span>}
          </div>

          {currentCustomer.score && (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              Score: {currentCustomer.score}
            </span>
          )}
          {/* functionality to assign and unassign */}
          {currentCustomer.assignedTo && (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              Assigned to: {currentCustomer.assignedTo.name}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <p className="mt-1 text-sm text-gray-900">{currentCustomer.firstName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <p className="mt-1 text-sm text-gray-900">{currentCustomer.lastName}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{currentCustomer.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{currentCustomer.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <p className="mt-1 text-sm text-gray-900">{currentCustomer.jobTitle || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {currentCustomer.assignedTo ? currentCustomer.assignedTo.name : 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Owner</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {currentCustomer.owner ? currentCustomer.owner.name : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stage</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStageColor(currentCustomer.stage)}`}>
                          {currentCustomer.stage}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(currentCustomer.status)}`}>
                          {currentCustomer.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getPriorityColor(currentCustomer.priority)}`}>
                          {currentCustomer.priority}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Score</label>
                        <p className="mt-1 text-sm text-gray-900">{currentCustomer.score || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Source</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{currentCustomer.source || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lifecycle Stage</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{currentCustomer.lifecycleStage || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address & Social */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    <div className="space-y-2">
                      {currentCustomer.address?.street && (
                        <p className="text-sm text-gray-900">{currentCustomer.address.street}</p>
                      )}
                      <p className="text-sm text-gray-900">
                        {[
                          currentCustomer.address?.city,
                          currentCustomer.address?.state,
                          currentCustomer.address?.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      {currentCustomer.address?.country && (
                        <p className="text-sm text-gray-900">{currentCustomer.address.country}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                    <div className="space-y-3">
                      {currentCustomer.socialLinks?.linkedin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                          <a href={currentCustomer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {currentCustomer.socialLinks.linkedin}
                          </a>
                        </div>
                      )}
                      {currentCustomer.socialLinks?.twitter && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Twitter</label>
                          <a href={currentCustomer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {currentCustomer.socialLinks.twitter}
                          </a>
                        </div>
                      )}
                      {currentCustomer.socialLinks?.facebook && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Facebook</label>
                          <a href={currentCustomer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {currentCustomer.socialLinks.facebook}
                          </a>
                        </div>
                      )}
                      {currentCustomer.socialLinks?.website && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Website</label>
                          <a href={currentCustomer.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {currentCustomer.socialLinks.website}
                          </a>
                        </div>
                      )}
                      {currentCustomer.socialLinks?.other && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Other</label>
                          <a href={currentCustomer.socialLinks.other} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {currentCustomer.socialLinks.other}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags & Custom Fields */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCustomer.tags && currentCustomer.tags.length > 0 ? (
                        currentCustomer.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tags assigned</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h3>
                    <div className="space-y-3">
                      {currentCustomer.customFields && Object.keys(currentCustomer.customFields).length > 0 ? (
                        Object.entries(currentCustomer.customFields).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <p className="mt-1 text-sm text-gray-900">{value}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No custom fields defined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="mt-1 text-sm text-gray-900">{currentCustomer.companyName || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Industry</label>
                      <p className="mt-1 text-sm text-gray-900">{currentCustomer.industry || '-'}</p>
                    </div>
                    {currentCustomer.company && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Linked Company</label>
                        <Link className="mt-1 text-sm text-blue-900 underline" to={`/crm/${projectId}/companies/${currentCustomer.company._id}`}>{currentCustomer.company.name || 'Company record linked'}</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}



            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Contact</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        currentCustomer.communicationPreferences?.email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentCustomer.communicationPreferences?.email ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Contact</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        currentCustomer.communicationPreferences?.phone ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentCustomer.communicationPreferences?.phone ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SMS Contact</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        currentCustomer.communicationPreferences?.sms ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentCustomer.communicationPreferences?.sms ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Method</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {currentCustomer.communicationPreferences?.preferredContactMethod || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <p className="mt-1 text-sm text-gray-900">{currentCustomer.communicationPreferences?.timezone || 'UTC'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <p className="mt-1 text-sm text-gray-900">{currentCustomer.communicationPreferences?.language || 'en'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                        {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                    {hasSupportExecutiveAccess && <Button
                      onClick={() => setShowNoteForm(true)}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      }
                    >
                      Add Note
                    </Button>}
                  </div>

                  {showNoteForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <form onSubmit={handleAddNote} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                          <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="task">Task</option>
            
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
                          <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your note..."
                            required
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button type="submit" disabled={!noteContent.trim()}>
                            Add Note
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowNoteForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4">
                    {currentCustomer.notes && currentCustomer.notes.length > 0 ? (
                      currentCustomer.notes.map((note, index) => (
                        <div key={note._id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                          {editingNoteId === note._id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                                <select
                                  value={editingNoteType}
                                  onChange={(e) => setEditingNoteType(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="general">General</option>
                                  <option value="call">Call</option>
                                  <option value="email">Email</option>
                                  <option value="meeting">Meeting</option>
                                  <option value="task">Task</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  rows={4}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter your note..."
                                  required
                                />
                              </div>
                              <div className="flex space-x-3">
                                <Button type="button" onClick={handleSaveNoteEdit} disabled={!editingNoteContent.trim()}>
                                  Save
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancelNoteEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                    note.type === 'call' ? 'bg-blue-100 text-blue-800' :
                                    note.type === 'email' ? 'bg-green-100 text-green-800' :
                                    note.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                                    note.type === 'task' ? 'bg-yellow-100 text-yellow-800' :
                                    note.type === 'general' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {note.type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatDateTime(note.createdAt)}
                                  </span>
                                </div>
                                {canEditNote(note) && hasSupportExecutiveAccess && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleEditNote(note)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(note._id)}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-900">{note.content}</p>
                              {note.createdBy && (
                                <p className="mt-2 text-xs text-gray-500">
                                  Added by {note.createdBy.name || note.createdBy.email || 'Unknown'}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No notes yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Interactions</h3>
                    {hasSupportExecutiveAccess && <Button
                      onClick={() => setShowInteractionForm(true)}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      }
                    >
                      Add Interaction
                    </Button>}
                  </div>

                  {showInteractionForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <form onSubmit={handleAddInteraction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={interactionData.type}
                              onChange={(e) => setInteractionData({...interactionData, type: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="call">Call</option>
                              <option value="email">Email</option>
                              <option value="meeting">Meeting</option>
                              <option value="task">Task</option>
                              <option value="note">Note</option>
              
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              value={interactionData.date}
                              onChange={(e) => setInteractionData({...interactionData, date: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={interactionData.title}
                            onChange={(e) => setInteractionData({...interactionData, title: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Interaction title"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={interactionData.description}
                            onChange={(e) => setInteractionData({...interactionData, description: e.target.value})}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Interaction description"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                              type="number"
                              value={interactionData.duration}
                              onChange={(e) => setInteractionData({...interactionData, duration: parseInt(e.target.value)})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                            <select
                              value={interactionData.outcome}
                              onChange={(e) => setInteractionData({...interactionData, outcome: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="positive">Positive</option>
                              <option value="neutral">Neutral</option>
                              <option value="negative">Negative</option>
                              <option value="follow_up_required">Follow Up Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button type="submit" disabled={!interactionData.title.trim()}>
                            Add Interaction
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowInteractionForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4">
                    {currentCustomer.interactions && currentCustomer.interactions.length > 0 ? (
                      currentCustomer.interactions.map((interaction, index) => (
                        <div key={interaction._id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                          {editingInteractionId === interaction._id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                  <select
                                    value={editingInteractionData.type}
                                    onChange={(e) => setEditingInteractionData({...editingInteractionData, type: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="call">Call</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="task">Task</option>
                                    <option value="note">Note</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                  <input
                                    type="date"
                                    value={editingInteractionData.date}
                                    onChange={(e) => setEditingInteractionData({...editingInteractionData, date: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={editingInteractionData.title}
                                  onChange={(e) => setEditingInteractionData({...editingInteractionData, title: e.target.value})}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Interaction title"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={editingInteractionData.description}
                                  onChange={(e) => setEditingInteractionData({...editingInteractionData, description: e.target.value})}
                                  rows={3}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Interaction description"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                  <input
                                    type="number"
                                    value={editingInteractionData.duration}
                                    onChange={(e) => setEditingInteractionData({...editingInteractionData, duration: parseInt(e.target.value)})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                                  <select
                                    value={editingInteractionData.outcome}
                                    onChange={(e) => setEditingInteractionData({...editingInteractionData, outcome: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="positive">Positive</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="negative">Negative</option>
                                    <option value="follow_up_required">Follow Up Required</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <Button type="button" onClick={handleSaveInteractionEdit} disabled={!editingInteractionData.title.trim()}>
                                  Save
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancelInteractionEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                    interaction.type === 'call' ? 'bg-blue-100 text-blue-800' :
                                    interaction.type === 'email' ? 'bg-green-100 text-green-800' :
                                    interaction.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                                    interaction.type === 'task' ? 'bg-yellow-100 text-yellow-800' :
                                    interaction.type === 'note' ? 'bg-gray-100 text-gray-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {interaction.type}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                    interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                                    interaction.outcome === 'neutral' ? 'bg-gray-100 text-gray-800' :
                                    interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {interaction.outcome.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">
                                    {formatDate(interaction.date)}
                                  </span>
                                  {canEditInteraction(interaction) && hasSupportExecutiveAccess && (
                                    <>
                                      <button
                                        onClick={() => handleEditInteraction(interaction)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInteraction(interaction._id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <h4 className="mt-2 font-medium text-gray-900">{interaction.title}</h4>
                              {interaction.description && (
                                <p className="mt-1 text-sm text-gray-600">{interaction.description}</p>
                              )}
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                {interaction.duration && (
                                  <span>Duration: {interaction.duration} minutes</span>
                                )}
                                {interaction.createdBy && (
                                  <span>By {interaction.createdBy.name || interaction.createdBy.email || 'Unknown'}</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No interactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Deals</h3>
                    {hasSupportExecutiveAccess && <Button
                      onClick={() => navigate(`/crm/${projectId}/deals?customer=${customerId}`)}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"></path>
                        </svg>
                      }
                    >
                      Create Deal
                    </Button>}
                  </div>

                  {/* Deal Stats */}
                  {console.log("customerDealStats", customerDealStats)}
                  {customerDealStats[customerId] && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {customerDealStats[customerId]?.totalDeals || 0}
                        </div>
                        <div className="text-sm text-blue-800">Total Deals</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(customerDealStats[customerId]?.totalValue || 0)}
                        </div>
                        <div className="text-sm text-green-800">Total Value</div>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {customerDealStats[customerId]?.wonDeals || 0}
                        </div>
                        <div className="text-sm text-emerald-800">Won Deals</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {customerDealStats[customerId]?.activeDeals || 0}
                        </div>
                        <div className="text-sm text-orange-800">Active Deals</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(customerDealStats[customerId]?.wonValue || 0)}
                        </div>
                        <div className="text-sm text-purple-800">Won Value</div>
                      </div>
                      {customerDealStats[customerId]?.conversionRate !== undefined && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">
                            {customerDealStats[customerId]?.conversionRate?.toFixed(1) || 0}%
                          </div>
                          <div className="text-sm text-indigo-800">Conversion Rate</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deals List */}
                  {customerDeals[customerId]?.deals && customerDeals[customerId].deals.length > 0 ? (
                    <div className="space-y-3">
                      {customerDeals[customerId].deals.map((deal) => (
                        <div key={deal._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-medium text-gray-900">
                                  <button
                                    onClick={() => navigate(`/crm/${projectId}/deals/${deal._id}`)}
                                    className="text-indigo-600 hover:text-indigo-800"
                                  >
                                    {deal.name}
                                  </button>
                                </h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  deal.status === 'closed-won' ? 'bg-green-100 text-green-800' :
                                  deal.status === 'closed-lost' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {deal.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {deal.priority && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    deal.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    deal.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {deal.priority}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(deal.value, deal.currency)}
                                </span>
                                {deal.stage && (
                                  <span>Stage: {deal.stage.name}</span>
                                )}
                                {deal.expectedCloseDate && (
                                  <span>Expected Close Date: {formatDate(deal.expectedCloseDate)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/crm/${projectId}/deals/${deal._id}`)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading deals...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No deals yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Create a deal to start tracking sales opportunities for this customer.
                      </p>
                      {hasSupportExecutiveAccess && <div className="mt-6">
                        <Button
                          onClick={() => navigate(`/crm/${projectId}/deals?customer=${customerId}`)}
                        >
                          Create First Deal
                        </Button>
                      </div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <ActivityTimeline 
                  entityType="Customer" 
                  entityId={customerId} 
                  projectId={projectId} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Sidebar for Editing */}
      <CustomerSidebar
        isOpen={showCustomerSidebar}
        onClose={() => setShowCustomerSidebar(false)}
        currentCustomer={currentCustomer}
        customerId={customerId}
      />

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 ">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to:</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'unassign') {
                      handleAssign(null);
                    } else if (value) {
                      handleAssign(value);
                    }
                  }}
                >
                  <option value="">Select a team member</option>
                  <option value="unassign">Unassign</option>
                  {project?.members?.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Customer</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete this customer? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </CrmLayout>
  );
};

export default CustomerDetail;

