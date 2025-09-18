import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewDeal } from '../../../store/dealSlice';
import { fetchProjectCustomers } from '../../../store/customerSlice';
import { getProjectCompanies } from '../../../store/companySlice';
import { getUsers } from '../../../store/userSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const CreateDealSidebar = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.deals);
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
    assignedTo: '',
    customer: '',
    company: '',
    source: '',
    tags: [],
    customFields: [],
    products: [],
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    nextAction: '',
    nextActionDate: '',
    lossReason: '',
    winReason: '',
    competitors: []
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [customFieldInput, setCustomFieldInput] = useState({ key: '', value: '' });
  const [competitorInput, setCompetitorInput] = useState({ name: '', strengths: '', weaknesses: '' });
  const [productInput, setProductInput] = useState({ name: '', description: '', quantity: 1, unitPrice: '', totalPrice: '' });

  useEffect(() => {
    if (isOpen && projectId) {
      dispatch(fetchProjectCustomers({ projectId }));
      dispatch(getProjectCompanies({ projectId }));
      dispatch(getUsers({ projectId }));
    }
  }, [dispatch, isOpen, projectId]);

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
        customFields: [...prev.customFields, {
          key: customFieldInput.key.trim(),
          value: customFieldInput.value.trim()
        }]
      }));
      setCustomFieldInput({ key: '', value: '' });
    }
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const addCompetitor = () => {
    if (competitorInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, {
          name: competitorInput.name.trim(),
          strengths: competitorInput.strengths.trim(),
          weaknesses: competitorInput.weaknesses.trim(),
          status: 'active'
        }]
      }));
      setCompetitorInput({ name: '', strengths: '', weaknesses: '' });
    }
  };

  const removeCompetitor = (index) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const addProduct = () => {
    if (productInput.name.trim() && productInput.unitPrice) {
      const quantity = parseInt(productInput.quantity) || 1;
      const unitPrice = parseFloat(productInput.unitPrice) || 0;
      const totalPrice = quantity * unitPrice;
      
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, {
          name: productInput.name.trim(),
          description: productInput.description.trim(),
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        }]
      }));
      setProductInput({ name: '', description: '', quantity: 1, unitPrice: '', totalPrice: '' });
    }
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleContactPersonChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value
      }
    }));
  };

  const handleCompetitorInputChange = (field, value) => {
    setCompetitorInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
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
        value: parseFloat(formData.value),
        project: projectId
      };

      await dispatch(createNewDeal({ projectId, dealData }));
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        value: '',
        currency: 'USD',
        status: 'open',
        priority: 'medium',
        probability: 50,
        expectedCloseDate: '',
        assignedTo: '',
        customer: '',
        company: '',
        source: '',
        tags: [],
        customFields: [],
        contactPerson: {
          name: '',
          email: '',
          phone: '',
          position: ''
        },
        nextAction: '',
        nextActionDate: '',
        lossReason: '',
        winReason: '',
        competitors: []
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      value: '',
      currency: 'USD',
      status: 'open',
      priority: 'medium',
      probability: 50,
      expectedCloseDate: '',
      assignedTo: null,
      customer: null,
      company: null,
      source: '',
      tags: [],
      customFields: [],
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: ''
      },
      nextAction: '',
      nextActionDate: '',
      lossReason: '',
      winReason: '',
      competitors: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Deal</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" title="Error" message={error} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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

              {/* Value and Currency */}
              <div className="grid grid-cols-2 gap-4">
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
                  </select>
                </div>
              </div>
            </div>

            {/* Deal Details */}
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

              {/* Probability */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Expected Close Date */}
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
            </div>

            {/* Relationships */}
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

              {/* Contact Person */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-800">Contact Person</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleContactPersonChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleContactPersonChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Job title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleContactPersonChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleContactPersonChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              
              <div>
                <div className="flex space-x-2">
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
                  <div className="mt-2 flex flex-wrap gap-2">
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
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                            <path d="m0 0 2 2 2-2 1 1-2 2 2 2-1 1-2-2-2 2-1-1 2-2-2-2z"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productInput.name}
                    onChange={(e) => setProductInput(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={productInput.description}
                    onChange={(e) => setProductInput(prev => ({ ...prev, description: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={productInput.quantity}
                    onChange={(e) => setProductInput(prev => ({ ...prev, quantity: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={productInput.unitPrice}
                    onChange={(e) => setProductInput(prev => ({ ...prev, unitPrice: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    step="0.01"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Total Price"
                    value={productInput.quantity && productInput.unitPrice ? (parseInt(productInput.quantity) || 1) * (parseFloat(productInput.unitPrice) || 0) : ''}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProduct}
                >
                  Add Product
                </Button>
                
                {formData.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {product.quantity} × ${product.unitPrice} = ${product.totalPrice}
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-500">{product.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
              
              <div>
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
                
                {formData.customFields.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.customFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          <strong>{field.key}:</strong> {field.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next Action */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Next Action</h3>
              
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
                    placeholder="e.g., Send proposal, Schedule demo"
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
            </div>

            {/* Competitors */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Competitors</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={competitorInput.name}
                    onChange={(e) => handleCompetitorInputChange('name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Competitor name"
                  />
                  <input
                    type="text"
                    value={competitorInput.strengths}
                    onChange={(e) => handleCompetitorInputChange('strengths', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Strengths"
                  />
                  <input
                    type="text"
                    value={competitorInput.weaknesses}
                    onChange={(e) => handleCompetitorInputChange('weaknesses', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Weaknesses"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
                >
                  Add Competitor
                </Button>
                
                {formData.competitors.length > 0 && (
                  <div className="space-y-2">
                    {formData.competitors.map((competitor, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                            {competitor.strengths && (
                              <p className="text-sm text-gray-600">
                                <strong>Strengths:</strong> {competitor.strengths}
                              </p>
                            )}
                            {competitor.weaknesses && (
                              <p className="text-sm text-gray-600">
                                <strong>Weaknesses:</strong> {competitor.weaknesses}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCompetitor(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
                Create Deal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDealSidebar;
