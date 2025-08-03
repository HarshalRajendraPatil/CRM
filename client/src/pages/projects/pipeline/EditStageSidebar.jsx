import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStage, reset } from '../../../store/projectSlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const EditStageSidebar = ({ projectId, pipelineId, stage, onClose }) => {
  const [formData, setFormData] = useState({
    name: stage.name || '',
    color: stage.color || '#4A5568'
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
      newErrors.name = 'Stage name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Stage name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Stage name cannot exceed 50 characters';
    }
    
    if (!formData.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      newErrors.color = 'Invalid color format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(updateStage({
      projectId,
      pipelineId,
      stageId: stage._id,
      stageData: formData
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
                <h2 className="text-xl font-semibold text-gray-800">Edit Stage</h2>
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
                  {isSuccess && <Alert variant="success" message="Stage updated successfully!" className="mb-4" />}
                  
                  <div className="space-y-4">
                    <Input
                      label="Stage Name*"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter stage name"
                      error={errors.name}
                      required
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          className="h-10 w-10 border-0 p-0 rounded-md"
                        />
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="#RRGGBB"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.color ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.color && (
                        <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                      )}
                    </div>
                    
                    {stage.isDefault && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              This is a default stage and cannot be removed. At least one default stage must exist in a pipeline.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                      Update Stage
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

export default EditStageSidebar;