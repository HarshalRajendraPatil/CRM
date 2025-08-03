import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transferOwnership } from '../../../store/projectSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import Input from '../../../components/ui/Input';

const SettingsTab = ({ projectId, project, isOwnerOrAdmin }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.projects
  );
  
  const toggleTransferModal = () => {
    setShowTransferModal(!showTransferModal);
    setNewOwnerEmail('');
    setError('');
  };
  
  const handleEmailChange = (e) => {
    setNewOwnerEmail(e.target.value);
    setError('');
  };
  
  const handleTransferOwnership = async () => {
    if (!newOwnerEmail.trim()) {
      setError('Email is required');
      return;
    }
    
    // Find member by email
    const member = project.members.find(
      m => m.user.email.toLowerCase() === newOwnerEmail.toLowerCase()
    );
    
    if (!member) {
      setError('User is not a member of this project');
      return;
    }
    
    if (member.user._id === project.owner._id) {
      setError('User is already the owner of this project');
      return;
    }
    
    await dispatch(transferOwnership({
      projectId,
      newOwnerId: member.user._id
    }));
    
    if (!isError) {
      toggleTransferModal();
    }
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Settings</h2>
      
      {isError && <Alert variant="danger" message={message} className="mb-4" />}
      {isSuccess && <Alert variant="success" message="Settings updated successfully" className="mb-4" />}
      
      <div className="space-y-6">
        {/* Danger Zone */}
        {isOwnerOrAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 mb-3">Danger Zone</h3>
            
            {/* Transfer Ownership */}
            <div className="border-t border-red-200 pt-4 mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-800">Transfer Ownership</h4>
                  <p className="mt-1 text-sm text-red-600">
                    Transfer this project to another user. You will remain as an admin.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={toggleTransferModal}
                >
                  Transfer Ownership
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 border border-gray-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Transfer Ownership</h2>
              <button
                onClick={toggleTransferModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
                <p className="mt-2 text-gray-600">
                  You are about to transfer ownership of "{project.name}" to another user.
                  You will remain as an admin, but the new owner will have full control over the project.
                </p>
              </div>
              
              <Input
                label="New Owner's Email"
                name="newOwnerEmail"
                value={newOwnerEmail}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                error={error}
                required
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={toggleTransferModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleTransferOwnership}
                  isLoading={isLoading}
                >
                  Transfer Ownership
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;