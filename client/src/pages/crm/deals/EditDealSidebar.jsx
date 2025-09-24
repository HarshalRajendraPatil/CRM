import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateExistingDeal, fetchDealActivities, addDealActivityAction } from '../../../store/dealSlice';
import { fetchProjectCustomers } from '../../../store/customerSlice';
import { getProjectCompanies } from '../../../store/companySlice';
import { getUsers } from '../../../store/userSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  getStatusColor, 
  getPriorityColor 
} from '../../../utils/dealUtils';
import { 
  TrashIcon, 
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const EditDealSidebar = ({ isOpen, onClose, deal, projectId }) => {
  const dispatch = useDispatch();
  const { loading, error, activities } = useSelector((state) => state.deals);
  const { customers } = useSelector((state) => state.customers);
  const { companies } = useSelector((state) => state.companies);
  const { users } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    currency: 'USD',
    status: 'open',
    priority: 'medium',
    probability: 50,
    expectedCloseDate: '',
    actualCloseDate: '',
    assignedTo: null,
    customer: null,
    company: null,
    source: '',
    tags: [],
    customFields: {},
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    nextAction: '',
    nextActionDate: '',
    winReason: '',
    lossReason: '',
    products: [],
    competitors: []
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [customFieldInput, setCustomFieldInput] = useState({ key: '', value: '' });
  const [productInput, setProductInput] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    tax: 0,
    totalPrice: 0
  });
  const [competitorInput, setCompetitorInput] = useState({
    name: '',
    strengths: '',
    weaknesses: '',
    status: 'active'
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'custom',
    description: '',
    metadata: {}
  });

  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(fetchProjectCustomers({ projectId }));
      dispatch(getProjectCompanies({ projectId }));
      dispatch(getUsers({ projectId }));
      if (deal?._id) {
        dispatch(fetchDealActivities({ dealId: deal._id }));
      }
    }
  }, [dispatch, isOpen, projectId, deal?._id]);

  useEffect(() => {
    if (deal && isOpen) {
      setFormData({
        name: deal.name || '',
        description: deal.description || '',
        value: deal.value || '',
        currency: deal.currency || 'USD',
        status: deal.status || 'open',
        priority: deal.priority || 'medium',
        probability: deal.probability || 50,
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
        actualCloseDate: deal.actualCloseDate ? new Date(deal.actualCloseDate).toISOString().split('T')[0] : '',
        assignedTo: deal.assignedTo?._id || null,
        customer: deal.customer?._id || null,
        company: deal.company?._id || null,
        source: deal.source || '',
        tags: deal.tags || [],
        customFields: deal.customFields || {},
        contactPerson: deal.contactPerson || {
          name: '',
          email: '',
          phone: '',
          position: ''
        },
        nextAction: deal.nextAction || '',
        nextActionDate: deal.nextActionDate ? new Date(deal.nextActionDate).toISOString().split('T')[0] : '',
        winReason: deal.winReason || '',
        lossReason: deal.lossReason || '',
        products: deal.products || [],
        competitors: deal.competitors || []
      });
    }
  }, [deal, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContactPersonChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [name]: value
      }
    }));
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'quantity' || name === 'unitPrice' || name === 'discount' || name === 'tax' 
      ? parseFloat(value) || 0 
      : value;
    
    setProductInput(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Calculate total price
      if (name === 'quantity' || name === 'unitPrice' || name === 'discount' || name === 'tax') {
        const subtotal = updated.quantity * updated.unitPrice;
        const discountAmount = (subtotal * updated.discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * updated.tax) / 100;
        updated.totalPrice = afterDiscount + taxAmount;
      }
      
      return updated;
    });
  };

  const handleCompetitorInputChange = (e) => {
    const { name, value } = e.target;
    setCompetitorInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addCustomField = () => {
    if (customFieldInput.key.trim() && customFieldInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldInput.key.trim()]: customFieldInput.value.trim()
        }
      }));
      setCustomFieldInput({ key: '', value: '' });
    }
  };

  const removeCustomField = (key) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[key];
      return {
        ...prev,
        customFields: newCustomFields
      };
    });
  };

  const addProduct = () => {
    if (productInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...productInput }]
      }));
      setProductInput({
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        totalPrice: 0
      });
    }
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const addCompetitor = () => {
    if (competitorInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, { ...competitorInput }]
      }));
      setCompetitorInput({
        name: '',
        strengths: '',
        weaknesses: '',
        status: 'active'
      });
    }
  };

  const removeCompetitor = (index) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.description.trim()) return;

    try {
      await dispatch(addDealActivityAction({
        dealId: deal._id,
        activityData: activityForm
      }));
      setActivityForm({ type: 'custom', description: '', metadata: {} });
      setShowAddActivity(false);
      // Refresh activities
      dispatch(fetchDealActivities({ dealId: deal._id }));
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    } else {
      const closeDate = new Date(formData.expectedCloseDate);
      const today = new Date();
      if (closeDate < today) {
        newErrors.expectedCloseDate = 'Close date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value)
      };

      await dispatch(updateExistingDeal({ dealId: deal._id, dealData }));
      onClose();
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-4xl h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Deal</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" title="Error" message={error} className="mb-6" />
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', name: 'Basic Info' },
                { id: 'details', name: 'Details' },
                { id: 'relationships', name: 'Relationships' },
                { id: 'products', name: 'Products' },
                { id: 'competitors', name: 'Competitors' },
                { id: 'activities', name: 'Activities' },
                { id: 'custom', name: 'Custom Fields' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                {/* Deal Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter deal name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter deal description"
                  />
                </div>

                {/* Value, Currency, and Probability */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.value ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="JPY">JPY</option>
                      <option value="CNY">CNY</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability (%)
                    </label>
                    <input
                      type="number"
                      name="probability"
                      value={formData.probability}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.probability ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="50"
                    />
                    {errors.probability && (
                      <p className="mt-1 text-sm text-red-600">{errors.probability}</p>
                    )}
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Website, Referral, Cold Call"
                  />
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Deal Details</h3>
                
                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="open">Open</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed-won">Closed Won</option>
                      <option value="closed-lost">Closed Lost</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date *
                    </label>
                    <input
                      type="date"
                      name="expectedCloseDate"
                      value={formData.expectedCloseDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.expectedCloseDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.expectedCloseDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expectedCloseDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Close Date
                    </label>
                    <input
                      type="date"
                      name="actualCloseDate"
                      value={formData.actualCloseDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.actualCloseDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.actualCloseDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.actualCloseDate}</p>
                    )}
                  </div>
                </div>

                {/* Next Action */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Action
                    </label>
                    <input
                      type="text"
                      name="nextAction"
                      value={formData.nextAction}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Follow up call, Send proposal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Action Date
                    </label>
                    <input
                      type="date"
                      name="nextActionDate"
                      value={formData.nextActionDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Win/Loss Reasons */}
                {(formData.status === 'closed-won' || formData.status === 'closed-lost') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.status === 'closed-won' ? 'Win Reason' : 'Loss Reason'}
                    </label>
                    <textarea
                      name={formData.status === 'closed-won' ? 'winReason' : 'lossReason'}
                      value={formData.status === 'closed-won' ? formData.winReason : formData.lossReason}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Enter ${formData.status === 'closed-won' ? 'win' : 'loss'} reason`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Relationships Tab */}
            {activeTab === 'relationships' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Relationships</h3>
                
                {/* Customer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {customer.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a team member</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Person */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900">Contact Person</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.contactPerson.name}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.contactPerson.position}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., CEO, Manager"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.contactPerson.email}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.contactPerson.phone}
                        onChange={handleContactPersonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                
                {/* Add Product Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Add Product</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productInput.name}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={productInput.description}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Product description"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={productInput.quantity}
                        onChange={handleProductInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={productInput.unitPrice}
                        onChange={handleProductInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={productInput.discount}
                        onChange={handleProductInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax (%)
                      </label>
                      <input
                        type="number"
                        name="tax"
                        value={productInput.tax}
                        onChange={handleProductInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Total: {formatCurrency(productInput.totalPrice, formData.currency)}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addProduct}
                      disabled={!productInput.name.trim()}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>

                {/* Products List */}
                {formData.products.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Added Products</h4>
                    {formData.products.map((product, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{product.name}</h5>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Qty: {product.quantity}</span>
                              <span>Price: {formatCurrency(product.unitPrice, formData.currency)}</span>
                              {product.discount > 0 && <span>Discount: {product.discount}%</span>}
                              {product.tax > 0 && <span>Tax: {product.tax}%</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(product.totalPrice, formData.currency)}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-800 mt-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Competitors Tab */}
            {activeTab === 'competitors' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Competitors</h3>
                
                {/* Add Competitor Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Add Competitor</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Competitor Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={competitorInput.name}
                        onChange={handleCompetitorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Competitor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={competitorInput.status}
                        onChange={handleCompetitorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="active">Active</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Strengths
                      </label>
                      <textarea
                        name="strengths"
                        value={competitorInput.strengths}
                        onChange={handleCompetitorInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Competitor strengths"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weaknesses
                      </label>
                      <textarea
                        name="weaknesses"
                        value={competitorInput.weaknesses}
                        onChange={handleCompetitorInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Competitor weaknesses"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCompetitor}
                    disabled={!competitorInput.name.trim()}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Competitor
                  </Button>
                </div>

                {/* Competitors List */}
                {formData.competitors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Added Competitors</h4>
                    {formData.competitors.map((competitor, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-900">{competitor.name}</h5>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                competitor.status === 'won' ? 'bg-green-100 text-green-800' :
                                competitor.status === 'lost' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {competitor.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              {competitor.strengths && (
                                <div>
                                  <span className="font-medium text-gray-700">Strengths:</span>
                                  <p className="text-gray-600">{competitor.strengths}</p>
                                </div>
                              )}
                              {competitor.weaknesses && (
                                <div>
                                  <span className="font-medium text-gray-700">Weaknesses:</span>
                                  <p className="text-gray-600">{competitor.weaknesses}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCompetitor(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Activities</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddActivity(true)}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </div>

                {/* Activities List */}
                {(activities?.length > 0 || deal?.activities?.length > 0) ? (
                  <div className="space-y-3">
                    {(activities || deal?.activities || []).map((activity, index) => (
                      <div key={activity._id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'note' ? 'bg-blue-100' :
                          activity.type === 'email' ? 'bg-green-100' :
                          activity.type === 'call' ? 'bg-purple-100' :
                          activity.type === 'meeting' ? 'bg-orange-100' :
                          activity.type === 'status_change' ? 'bg-indigo-100' :
                          activity.type === 'value_change' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }`}>
                          <div className={`${
                            activity.type === 'note' ? 'text-blue-600' :
                            activity.type === 'email' ? 'text-green-600' :
                            activity.type === 'call' ? 'text-purple-600' :
                            activity.type === 'meeting' ? 'text-orange-600' :
                            activity.type === 'status_change' ? 'text-indigo-600' :
                            activity.type === 'value_change' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>By {activity.createdBy?.name || activity.user?.name || 'System'}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDateTime(activity.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activities yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Activities will appear here as you work on this deal.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Fields Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Custom Fields & Tags</h3>
                
                {/* Tags Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a tag"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                          >
                            <XMarkIcon className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Fields Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Custom Fields</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={customFieldInput.key}
                      onChange={(e) => setCustomFieldInput(prev => ({ ...prev, key: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Field name"
                    />
                    <input
                      type="text"
                      value={customFieldInput.value}
                      onChange={(e) => setCustomFieldInput(prev => ({ ...prev, value: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Field value"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomField}
                  >
                    Add Field
                  </Button>
                  
                  {Object.keys(formData.customFields).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(formData.customFields).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            <strong>{key}:</strong> {value}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                isLoading={loading}
              >
                Update Deal
              </Button>
            </div>
          </form>

          {/* Add Activity Modal */}
          {showAddActivity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Add Activity</h3>
                <form onSubmit={handleAddActivity} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type
                    </label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="custom">Custom</option>
                      <option value="note">Note</option>
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="status_change">Status Change</option>
                      <option value="value_change">Value Change</option>
                      <option value="attachment">Attachment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter activity description"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAddActivity(false);
                        setActivityForm({ type: 'custom', description: '', metadata: {} });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      Add Activity
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDealSidebar;
