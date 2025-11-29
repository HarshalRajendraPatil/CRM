import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createInvitation, reset } from '../../../store/invitationSlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';

const InviteMemberSidebar = ({ projectId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    projectId,
    email: '',
    role: 'viewer',
    message: '',
    expirationDays: 7
  });
  
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.invitations
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters';
    }
    
    if (formData.expirationDays < 1 || formData.expirationDays > 30) {
      newErrors.expirationDays = 'Expiration days must be between 1 and 30';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(createInvitation({projectId, invitationData: formData}));
  };
  
  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Invite Team Member</h2>
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
            {isSuccess && <Alert variant="success" message="Invitation sent successfully!" className="mb-4" />}
            
            <div className="space-y-4">
              <Input
                label="Email Address*"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                error={errors.email}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="support_executive">Support Executive</option>
                  <option value="viewer">Viewer</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the appropriate role for this team member
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add a personal message to the invitation email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.message.length}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Expires In (Days)
                </label>
                <input
                  type="number"
                  name="expirationDays"
                  value={formData.expirationDays}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.expirationDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expirationDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.expirationDays}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  The invitation will expire after this many days (1-30)
                </p>
              </div>
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
              Send Invitation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberSidebar;