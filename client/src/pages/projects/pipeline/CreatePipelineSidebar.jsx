import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPipeline, reset } from '../../../store/projectSlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const CreatePipelineSidebar = ({ projectId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'deal',
    description: '',
    stages: [
      { name: 'Lead In', color: '#60A5FA', order: 1 },
      { name: 'Qualification', color: '#FCD34D', order: 2 },
      { name: 'Proposal', color: '#A78BFA', order: 3 },
      { name: 'Negotiation', color: '#F87171', order: 4 },
      { name: 'Closed Won', color: '#34D399', order: 5 },
      { name: 'Closed Lost', color: '#9CA3AF', order: 6 }
    ]
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
  
  const handleStageChange = (index, field, value) => {
    const newStages = [...formData.stages];
    newStages[index] = {
      ...newStages[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      stages: newStages
    });
    
    // Clear stage error if exists
    if (errors[`stage_${index}_${field}`]) {
      setErrors({
        ...errors,
        [`stage_${index}_${field}`]: ''
      });
    }
  };
  
  const addStage = () => {
    const newStage = {
      name: '',
      color: '#4A5568',
      order: formData.stages.length + 1
    };
    
    setFormData({
      ...formData,
      stages: [...formData.stages, newStage]
    });
  };
  
  const removeStage = (index) => {
    if (formData.stages.length <= 1) {
      setErrors({
        ...errors,
        stages: 'Pipeline must have at least one stage'
      });
      return;
    }
    
    const newStages = formData.stages.filter((_, i) => i !== index);
    
    // Reorder stages
    const reorderedStages = newStages.map((stage, i) => ({
      ...stage,
      order: i + 1
    }));
    
    setFormData({
      ...formData,
      stages: reorderedStages
    });
    
    // Clear stage errors
    const newErrors = { ...errors };
    delete newErrors[`stage_${index}_name`];
    delete newErrors[`stage_${index}_color`];
    delete newErrors.stages;
    setErrors(newErrors);
  };
  
  const moveStage = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formData.stages.length - 1)
    ) {
      return;
    }
    
    const newStages = [...formData.stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap stages
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    
    // Update order
    newStages.forEach((stage, i) => {
      stage.order = i + 1;
    });
    
    setFormData({
      ...formData,
      stages: newStages
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pipeline name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Pipeline name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Pipeline name cannot exceed 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    if (formData.stages.length === 0) {
      newErrors.stages = 'Pipeline must have at least one stage';
    } else {
      formData.stages.forEach((stage, index) => {
        if (!stage.name.trim()) {
          newErrors[`stage_${index}_name`] = 'Stage name is required';
        } else if (stage.name.length < 2) {
          newErrors[`stage_${index}_name`] = 'Stage name must be at least 2 characters';
        } else if (stage.name.length > 50) {
          newErrors[`stage_${index}_name`] = 'Stage name cannot exceed 50 characters';
        }
        
        if (!stage.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
          newErrors[`stage_${index}_color`] = 'Invalid color format';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(createPipeline({
      projectId,
      pipelineData: formData
    }));
  };
  
  // Prevent body scrolling when sidebar is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-transparent backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>
        
        {/* Sidebar panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Create New Pipeline</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit}>
                  {isError && <Alert variant="danger" message={message} className="mb-4" />}
                  {isSuccess && <Alert variant="success" message="Pipeline created successfully!" className="mb-4" />}
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Pipeline Details</h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="Pipeline Name*"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter pipeline name"
                          error={errors.name}
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pipeline Type*
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="lead">Lead Pipeline</option>
                            <option value="customer">Customer Pipeline</option>
                            <option value="deal">Deal Pipeline</option>
                            <option value="task">Task Pipeline</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter pipeline description"
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
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Pipeline Stages</h3>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addStage}
                          leftIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          }
                        >
                          Add Stage
                        </Button>
                      </div>
                      
                      {errors.stages && (
                        <Alert variant="danger" message={errors.stages} className="mb-4" />
                      )}
                      
                      <div className="space-y-4">
                        {formData.stages.map((stage, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                            <div className="absolute right-2 top-2 flex space-x-1">
                              <button
                                type="button"
                                onClick={() => moveStage(index, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded-full ${
                                  index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStage(index, 'down')}
                                disabled={index === formData.stages.length - 1}
                                className={`p-1 rounded-full ${
                                  index === formData.stages.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeStage(index)}
                                className="p-1 rounded-full text-red-500 hover:bg-red-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-4 mt-2">
                              <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Stage Name*
                                </label>
                                <input
                                  type="text"
                                  value={stage.name}
                                  onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                                  placeholder="Enter stage name"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors[`stage_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`stage_${index}_name`] && (
                                  <p className="mt-1 text-xs text-red-600">{errors[`stage_${index}_name`]}</p>
                                )}
                              </div>
                              
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Color
                                </label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={stage.color}
                                    onChange={(e) => handleStageChange(index, 'color', e.target.value)}
                                    className="h-8 w-8 border-0 p-0 rounded-md"
                                  />
                                  <input
                                    type="text"
                                    value={stage.color}
                                    onChange={(e) => handleStageChange(index, 'color', e.target.value)}
                                    placeholder="#RRGGBB"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                      errors[`stage_${index}_color`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {errors[`stage_${index}_color`] && (
                                  <p className="mt-1 text-xs text-red-600">{errors[`stage_${index}_color`]}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-500">
                              Order: {stage.order}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      disabled={isLoading}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Create Pipeline
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePipelineSidebar;