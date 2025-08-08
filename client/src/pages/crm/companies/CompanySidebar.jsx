import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCompany, updateCompany } from '../../../store/companySlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';
import { getProjectCompanies, getCompanyStats } from '../../../store/companySlice';

const CompanySidebar = ({ isOpen, onClose, projectId, company = null }) => {
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.companies);
  const isEditing = !!company;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    status: 'lead',
    size: '',
    annualRevenue: '',
    description: '',
    tags: [],
    logo: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [showAddressDetails, setShowAddressDetails] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || ''
        },
        status: company.status || 'lead',
        size: company.size || '',
        annualRevenue: company.annualRevenue || '',
        description: company.description || '',
        tags: company.tags || [],
        logo: company.logo || ''
      });

      // Show address details if any address field is filled
      if (
        company.address?.street ||
        company.address?.city ||
        company.address?.state ||
        company.address?.zipCode ||
        company.address?.country
      ) {
        setShowAddressDetails(true);
      }
    }
  }, [company]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle tag input keydown (add on Enter)
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Company name must be less than 100 characters';
    }

    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(\/\S*)?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.logo && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(formData.logo)) {
      newErrors.logo = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    console.log('newErrors', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {

    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare data for API
    const companyData = { ...formData };
    
    // Add project ID for new companies
    if (!isEditing) {
      companyData.projectId = projectId;
    }

    // Remove empty address fields
    if (
      !companyData.address.street &&
      !companyData.address.city &&
      !companyData.address.state &&
      !companyData.address.zipCode &&
      !companyData.address.country
    ) {
      delete companyData.address;
    }

    if (isEditing) {
      await dispatch(updateCompany({ id: company._id, companyData }))
        .unwrap()
        .then(() => {
          onClose();
        });
    } else {
      await dispatch(createCompany(companyData))
        .unwrap()
        .then(() => {
          onClose();
        });
    }

    await dispatch(getProjectCompanies({
      projectId,
      params: {
        limit: 20,
        skip: 0,
        sort: 'name',
        order: 'asc'
      }
    }));
    const stats = await dispatch(getCompanyStats(projectId));
    onClose();
  };

  // Industry options
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Entertainment',
    'Hospitality',
    'Transportation',
    'Construction',
    'Agriculture',
    'Energy',
    'Telecommunications',
    'Other'
  ];

  // Company size options
  const sizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000',
    '10000+'
  ];

  const annualRevenueOptions = [
    '<1M',
    '1M-10M',
    '10M-50M',
    '50M-100M',
    '500M-1B',
    '>1B',
    'Unknown'
  ];

  // Status options
  const statusOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'customer', label: 'Customer' },
    { value: 'partner', label: 'Partner' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'competitor', label: 'Competitor' }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Company' : 'Add Company'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isError && <Alert variant="danger" message={message} className="mb-4" />}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <Input
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="block w-full pl-1 pr-1 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website */}
              <div>
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  error={errors.website}
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  error={errors.email}
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone}
                />
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <button
                    type="button"
                    onClick={() => setShowAddressDetails(!showAddressDetails)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {showAddressDetails ? 'Hide details' : 'Add details'}
                  </button>
                </div>

                {showAddressDetails && (
                  <div className="mt-2 space-y-3">
                    <Input
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        placeholder="City"
                      />
                      <Input
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        placeholder="State/Province"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        placeholder="Zip/Postal Code"
                      />
                      <Input
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full pl-1 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="block w-full pl-1 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Size</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
              </div>

              {/* Annual Revenue */}
              <div>
                <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Revenue
                </label>
                <select
                  id="annualRevenue"
                  name="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={handleChange}
                  className="block w-full pl-1 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Annual Revenue</option>
                  {annualRevenueOptions.map((revenue) => (
                    <option key={revenue} value={revenue}>
                      {revenue}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 p-1 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Add a description about this company..."
                />
              </div>

              {/* Logo URL */}
              <div>
                <Input
                  label="Logo URL"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  error={errors.logo}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    className="shadow-sm focus:ring-indigo-500 p-1 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-l-md"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                {isEditing ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompanySidebar;