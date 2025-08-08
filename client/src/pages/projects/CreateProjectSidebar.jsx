import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, reset } from '../../store/projectSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { getMyProjects } from '../../store/projectSlice';

const CreateProjectSidebar = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    visibility: 'private',
    tags: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.projects
  );
  
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
        dispatch(reset());
      }, 1500);
    }
    
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, onClose, dispatch]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name cannot exceed 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    if (formData.industry && formData.industry.length > 50) {
      newErrors.industry = 'Industry cannot exceed 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Process tags from comma-separated string to array
    const processedData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    await dispatch(createProject(processedData));
    await dispatch(getMyProjects());
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {isError && <Alert variant="danger" message={message} className="mb-4" />}
            {isSuccess && <Alert variant="success" message="Project created successfully!" className="mb-4" />}
            
            <div className="space-y-4">
              <Input
                label="Project Name*"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                error={errors.name}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter project description"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>
              
              <Input
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="E.g., Technology, Healthcare, Finance"
                error={errors.industry}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Private</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public</span>
                  </label>
                </div>
              </div>
              
              <Input
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter comma-separated tags"
              />
              
              <Input
                label="Timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                placeholder="Enter timezone"
              />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t">
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              isLoading={isLoading}
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectSidebar;