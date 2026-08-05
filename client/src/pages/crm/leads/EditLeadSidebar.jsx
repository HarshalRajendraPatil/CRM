import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLead } from '../../../store/leadSlice';
import Button from '../../../components/ui/Button';
import { getProjectCompanies } from '../../../store/companySlice';
import { useParams } from 'react-router-dom';
import { X, Plus, Trash2, Building, User, Mail, Phone, Briefcase, Tag, Hash } from 'lucide-react';

const EditLeadSidebar = ({ isOpen, onClose, lead }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { isLoading } = useSelector((state) => state.leads);
  const { project, pipelines } = useSelector((state) => state.projects);
  const { companies } = useSelector((state) => state.companies);

  // Get dynamic lead pipeline stages
  const leadPipeline = pipelines?.find(p => p.type === 'lead') || null;
  const leadStages = leadPipeline?.stages?.slice().sort((a, b) => a.order - b.order) || [];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    stage: '',
    assignedTo: '',
    source: 'other',
    jobTitle: '',
    company: '',
    score: 0,
    tags: [],
    customFields: {},
  });

  const [tagInput, setTagInput] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [errors, setErrors] = useState({});

  const sourceOptions = [
    { value: 'web', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'referral', label: 'Referral' },
    { value: 'event', label: 'Event' },
    { value: 'ads', label: 'Advertising' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isOpen) {
      dispatch(getProjectCompanies({
        projectId,
        params: { limit: 20, skip: 0, sort: 'name', order: 'asc' }
      }));
    }
  }, [projectId, dispatch, isOpen]);

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.stage || lead.status || (leadStages.length > 0 ? leadStages[0]._id : ''),
        assignedTo: lead.assignedTo?._id || '',
        source: lead.source || 'other',
        jobTitle: lead.jobTitle || '',
        company: lead.company?._id || '',
        score: lead.score || 0,
        tags: lead.tags || [],
        customFields: lead.customFields || {},
      });
    }
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey.trim()]: customFieldValue.trim()
        }
      }));
      setCustomFieldKey('');
      setCustomFieldValue('');
    }
  };

  const removeCustomField = (key) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[key];
      return { ...prev, customFields: newCustomFields };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.score < 0 || formData.score > 100) {
      newErrors.score = 'Score must be between 0 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const leadData = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        company: formData.company || null,
        score: parseInt(formData.score) || 0,
        status: formData.status
      };

      await dispatch(updateLead({ projectId, id: lead._id, leadData })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Edit Lead</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
          <form id="edit-lead-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Section: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Basic Info</h3>

              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                  <User size={14} className="mr-1.5 text-slate-400" /> Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                    <Mail size={14} className="mr-1.5 text-slate-400" /> Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                    <Phone size={14} className="mr-1.5 text-slate-400" /> Phone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                  />
                  {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Section: Professional Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                    <Briefcase size={14} className="mr-1.5 text-slate-400" /> Job Title
                  </label>
                  <input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. CEO"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                    <Building size={14} className="mr-1.5 text-slate-400" /> Company
                  </label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="">Select Company</option>
                    {companies?.map(company => (
                      <option key={company._id} value={company._id}>{company.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Pipeline Stage <span className="text-red-500 ml-1">*</span></label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 transition-colors"
                  >
                    {leadStages.length === 0 ? (
                      <option value="">No stages found</option>
                    ) : (
                      leadStages.map(stage => (
                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    {sourceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="">Unassigned</option>
                    {project?.members?.filter(member => member.role === 'sales_executive' || member.role === 'manager' || member.role === 'admin' || member.user._id === project.owner._id).map(member => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Score</label>
                  <input
                    name="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border ${errors.score ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                  />
                  {errors.score && <p className="mt-1.5 text-sm text-red-500">{errors.score}</p>}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Section: Extra */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extra Details</h3>

              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                  <Tag size={14} className="mr-1.5 text-slate-400" /> Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type and press enter..."
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-slate-400 hover:text-slate-600">
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                  <Hash size={14} className="mr-1.5 text-slate-400" /> Custom Fields
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customFieldKey}
                    onChange={(e) => setCustomFieldKey(e.target.value)}
                    placeholder="Field name"
                    className="flex-1 min-w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={customFieldValue}
                    onChange={(e) => setCustomFieldValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 min-w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {Object.keys(formData.customFields).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(formData.customFields).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-sm truncate">
                          <span className="font-medium text-slate-700 mr-2">{key}:</span>
                          <span className="text-slate-600">{value}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCustomField(key)}
                          className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex-none p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-lead-form"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeadSidebar;
