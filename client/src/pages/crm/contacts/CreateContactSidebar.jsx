import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createContact } from '../../../store/contactSlice';
import { getMyProjects } from '../../../store/projectSlice';
import { getProjectCompanies } from '../../../store/companySlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const CreateContactSidebar = ({ projectId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.contacts);
  const { projects } = useSelector((state) => state.projects);
  const { companies } = useSelector((state) => state.companies);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    companyId: '',
    stage: 'lead',
    status: 'active',
    source: 'other',
    leadScore: 0,
    assignedTo: '',
    tags: [],
    notes: '',
    addresses: [],
    socialLinks: [],
    customFields: {},
    communicationPreferences: {
      email: true,
      phone: true,
      sms: false,
      marketing: false
    }
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newAddress, setNewAddress] = useState({
    type: 'primary',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [newSocialLink, setNewSocialLink] = useState({
    platform: 'linkedin',
    url: '',
    isPrimary: false
  });

  // Load projects and companies on mount
  useEffect(() => {
    dispatch(getMyProjects());
    if (projectId) {
      dispatch(getProjectCompanies({ projectId, params: { limit: 100 } }));
    }
  }, [dispatch, projectId]);

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        department: '',
        companyId: '',
        stage: 'lead',
        status: 'active',
        source: 'other',
        leadScore: 0,
        assignedTo: '',
        tags: [],
        notes: '',
        addresses: [],
        socialLinks: [],
        customFields: {},
        communicationPreferences: {
          email: true,
          phone: true,
          sms: false,
          marketing: false
        }
      });
      setErrors({});
      onClose();
    }
  }, [isSuccess, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.leadScore < 0 || formData.leadScore > 100) {
      newErrors.leadScore = 'Lead score must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const contactData = {
      ...formData,
      projectId,
      companyId: formData.companyId || undefined,
      assignedTo: formData.assignedTo || undefined
    };
    
    dispatch(createContact(contactData));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAddress = () => {
    if (newAddress.street && newAddress.city) {
      setFormData(prev => ({
        ...prev,
        addresses: [...prev.addresses, { ...newAddress }]
      }));
      setNewAddress({
        type: 'primary',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
    }
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const addSocialLink = () => {
    if (newSocialLink.url) {
      setFormData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, { ...newSocialLink }]
      }));
      setNewSocialLink({
        platform: 'linkedin',
        url: '',
        isPrimary: false
      });
    }
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.name === 'newTag') {
        addTag();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-transparent backdrop-blur-sm bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Create New Contact</h2>
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

              {/* Form */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
                  {isError && (
                    <Alert
                      variant="error"
                      title="Error"
                      message={message}
                    />
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        required
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Job Title"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                      />
                      <Input
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Company & Assignment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Company & Assignment</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <select
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select a company</option>
                        {companies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To
                      </label>
                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Unassigned</option>
                        {/* Add project members here */}
                      </select>
                    </div>
                  </div>

                  {/* CRM Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">CRM Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stage
                        </label>
                        <select
                          name="stage"
                          value={formData.stage}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="lead">Lead</option>
                          <option value="prospect">Prospect</option>
                          <option value="qualified">Qualified</option>
                          <option value="opportunity">Opportunity</option>
                          <option value="customer">Customer</option>
                          <option value="inactive">Inactive</option>
                          <option value="lost">Lost</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="unsubscribed">Unsubscribed</option>
                          <option value="bounced">Bounced</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Source
                        </label>
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="website">Website</option>
                          <option value="referral">Referral</option>
                          <option value="cold_outreach">Cold Outreach</option>
                          <option value="event">Event</option>
                          <option value="social_media">Social Media</option>
                          <option value="advertising">Advertising</option>
                          <option value="partner">Partner</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <Input
                        label="Lead Score"
                        type="number"
                        name="leadScore"
                        value={formData.leadScore}
                        onChange={handleChange}
                        error={errors.leadScore}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                    
                    <div className="flex space-x-2">
                      <Input
                        label=""
                        name="newTag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add any notes about this contact..."
                    />
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
                    
                    <div className="space-y-2">
                      {Object.entries(formData.communicationPreferences).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`communicationPreferences.${key}`}
                            checked={value}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 flex space-x-3 bg-gray-50">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                  fullWidth
                >
                  Create Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContactSidebar;
