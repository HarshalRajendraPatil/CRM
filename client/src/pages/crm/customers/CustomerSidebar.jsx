import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer, updateCustomer } from '../../../store/customerSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import { useParams } from 'react-router-dom';

const CustomerSidebar = ({ isOpen, onClose, customerId = null, currentCustomer = null, initialData = null, isFromLead = false, onConvert = null }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { isLoading, error, successMessage } = useSelector((state) => state.customers);
  const { user } = useSelector((state) => state.auth);
  
  const isEditing = !!currentCustomer && !!customerId;
  const isConverting = isFromLead;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyName: '',
    industry: '',
    source: '',
    stage: 'prospect',
    status: 'active',
    priority: 'medium',
    score: 50,
    assignedTo: null,
    tags: [],
    notes: [],
    interactions: [],

    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      website: '',
      other: ''
    },
    communicationPreferences: {
      email: true,
      phone: true,
      sms: false,
      preferredContactMethod: 'email',
      timezone: 'UTC',
      language: 'en'
    },
    lifecycleStage: 'awareness',
    convertedFromLead: null,
    convertedAt: null,
    convertedBy: null,
    customFields: {},
    isArchived: false,
    archivedAt: null,
    archivedBy: null
  });

  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [customFields, setCustomFields] = useState([]);
  const [newCustomFieldKey, setNewCustomFieldKey] = useState('');
  const [newCustomFieldValue, setNewCustomFieldValue] = useState('');

  useEffect(() => {
    if (isEditing && currentCustomer) {
      // Convert customFields object to array for easier management
      const customFieldsArray = currentCustomer.customFields ? 
        Object.entries(currentCustomer.customFields).map(([key, value]) => ({ key, value })) : [];
      setCustomFields(customFieldsArray);
      
      setFormData({
        firstName: currentCustomer.firstName || '',
        lastName: currentCustomer.lastName || '',
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || '',
        jobTitle: currentCustomer.jobTitle || '',
        companyName: currentCustomer.companyName || '',
        industry: currentCustomer.industry || '',
        source: currentCustomer.source || '',
        stage: currentCustomer.stage || 'prospect',
        status: currentCustomer.status || 'active',
        priority: currentCustomer.priority || 'medium',
        score: currentCustomer.score || 50,
        assignedTo: currentCustomer.assignedTo || null,
        tags: currentCustomer.tags || [],
        notes: currentCustomer.notes || [],
        interactions: currentCustomer.interactions || [],

        address: {
          street: currentCustomer.address?.street || '',
          city: currentCustomer.address?.city || '',
          state: currentCustomer.address?.state || '',
          zipCode: currentCustomer.address?.zipCode || '',
          country: currentCustomer.address?.country || 'United States'
        },
        socialLinks: {
          linkedin: currentCustomer.socialLinks?.linkedin || '',
          twitter: currentCustomer.socialLinks?.twitter || '',
          facebook: currentCustomer.socialLinks?.facebook || '',
          website: currentCustomer.socialLinks?.website || '',
          other: currentCustomer.socialLinks?.other || ''
        },
        communicationPreferences: {
          email: currentCustomer.communicationPreferences?.email ?? true,
          phone: currentCustomer.communicationPreferences?.phone ?? true,
          sms: currentCustomer.communicationPreferences?.sms ?? false,
          preferredContactMethod: currentCustomer.communicationPreferences?.preferredContactMethod || 'email',
          timezone: currentCustomer.communicationPreferences?.timezone || 'UTC',
          language: currentCustomer.communicationPreferences?.language || 'en'
        },
        lifecycleStage: currentCustomer.lifecycleStage || 'awareness',
        convertedFromLead: currentCustomer.convertedFromLead || null,
        convertedAt: currentCustomer.convertedAt || null,
        convertedBy: currentCustomer.convertedBy || null,
        customFields: currentCustomer.customFields || {},
        isArchived: currentCustomer.isArchived || false,
        archivedAt: currentCustomer.archivedAt || null,
        archivedBy: currentCustomer.archivedBy || null
      });
    }
  }, [currentCustomer, isEditing]);

  useEffect(() => {
    if (initialData && !isEditing) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [grandchild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCustomField = () => {
    if (newCustomFieldKey.trim() && newCustomFieldValue.trim()) {
      setCustomFields(prev => [...prev, { key: newCustomFieldKey.trim(), value: newCustomFieldValue.trim() }]);
      setNewCustomFieldKey('');
      setNewCustomFieldValue('');
    }
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCustomField = (index, field, value) => {
    setCustomFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Remove fields that shouldn't be sent to the backend
    const { 
      notes, 
      interactions, 
      convertedFromLead, 
      convertedAt, 
      convertedBy, 
      isArchived, 
      archivedAt, 
      archivedBy,
      ...customerDataWithoutSystemFields 
    } = formData;
    
    // Convert customFields array back to object
    const customFieldsObject = customFields.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {});

    const customerData = {
      ...customerDataWithoutSystemFields,
      customFields: customFieldsObject,
      project: projectId,
      owner: user._id
    };

    try {
      if (isConverting && onConvert) {
        await onConvert(customerData);
      } else if (isEditing) {
        await dispatch(updateCustomer({ id: customerId, customerData })).unwrap();
        onClose();
      } else {
        await dispatch(createCustomer(customerData)).unwrap();
        onClose();
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: '👤' },
    { id: 'status', name: 'Status', icon: '📊' },

    { id: 'address', name: 'Address', icon: '📍' },
    { id: 'social', name: 'Social', icon: '🌐' },
    { id: 'communication', name: 'Communication', icon: '📞' },
    { id: 'tags', name: 'Tags', icon: '🏷️' },
    { id: 'custom', name: 'Custom Fields', icon: '⚙️' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isConverting ? 'Convert Lead to Customer' : 
                 isEditing ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <p className="text-sm text-gray-600">
                {isConverting ? 'Review and modify lead information before converting' :
                 isEditing ? 'Update customer information' : 'Create a new customer record'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <Input
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
              <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
              />
              <Input
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Source</option>
                  <option value="web">Website</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="referral">Referral</option>
                  <option value="event">Event</option>
                  <option value="ads">Ads</option>
                  <option value="social">Social</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="lead_conversion">Lead Conversion</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                    <option value="churned">Churned</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-100)</label>
                  <input
                    type="number"
                    name="score"
                    min="1"
                    max="100"
                    value={formData.score}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
                <select
                  name="lifecycleStage"
                  value={formData.lifecycleStage}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="awareness">Awareness</option>
                  <option value="consideration">Consideration</option>
                  <option value="decision">Decision</option>
                  <option value="retention">Retention</option>
                  <option value="advocacy">Advocacy</option>
                </select>
              </div>
            </div>
          )}



          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <Input
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
                <Input
                  label="State/Province"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP/Postal Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
                <Input
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <Input
                label="LinkedIn"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleInputChange}
              />
              <Input
                label="Twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleInputChange}
              />
              <Input
                label="Facebook"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook}
                onChange={handleInputChange}
              />
              <Input
                label="Website"
                name="socialLinks.website"
                value={formData.socialLinks.website}
                onChange={handleInputChange}
              />
              <Input
                label="Other"
                name="socialLinks.other"
                value={formData.socialLinks.other}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                <select
                  name="communicationPreferences.preferredContactMethod"
                  value={formData.communicationPreferences.preferredContactMethod}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="communicationPreferences.email"
                    checked={formData.communicationPreferences.email}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow Email Contact
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="communicationPreferences.phone"
                    checked={formData.communicationPreferences.phone}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow Phone Contact
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="communicationPreferences.sms"
                    checked={formData.communicationPreferences.sms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow SMS Contact
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    name="communicationPreferences.timezone"
                    value={formData.communicationPreferences.timezone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="communicationPreferences.language"
                    value={formData.communicationPreferences.language}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Fields Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Fields</h3>
                <p className="text-sm text-gray-600">
                  Add custom key-value fields to store additional information specific to your business needs.
                </p>
              </div>
              
              {/* Add New Custom Field */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Custom Field</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <input
                      type="text"
                      value={newCustomFieldKey}
                      onChange={(e) => setNewCustomFieldKey(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Budget Range, Decision Maker"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Value</label>
                    <input
                      type="text"
                      value={newCustomFieldValue}
                      onChange={(e) => setNewCustomFieldValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., $50K - $100K, John Smith"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddCustomField}
                    disabled={!newCustomFieldKey.trim() || !newCustomFieldValue.trim()}
                    className="w-full"
                  >
                    Add Field
                  </Button>
                </div>
              </div>

              {/* Existing Custom Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Existing Custom Fields</h3>
                {customFields.length > 0 ? (
                  customFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => handleUpdateCustomField(index, 'key', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Field name"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Field value"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No custom fields added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : 
                 isConverting ? 'Convert to Customer' :
                 isEditing ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSidebar;
