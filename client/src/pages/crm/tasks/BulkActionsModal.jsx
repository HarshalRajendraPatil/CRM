import React, { useState } from 'react';

const BulkActionsModal = ({ isOpen, onClose, action, selectedCount, onStatusUpdate, onAssign, users }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleSubmit = () => {
    if (action === 'status' && selectedStatus) {
      onStatusUpdate(selectedStatus);
    } else if (action === 'assign' && selectedUser) {
      onAssign(selectedUser);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm bg-opacity-75" onClick={onClose} />
      
      <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {action === 'status' ? 'Update Status' : 'Assign Tasks'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            {action === 'status' 
              ? `Update status for ${selectedCount} selected tasks`
              : `Assign ${selectedCount} selected tasks to a user`
            }
          </p>

          {action === 'status' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'assign' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select user</option>
                <option value="unassigned">Unassigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (action === 'status' && !selectedStatus) ||
                (action === 'assign' && !selectedUser)
              }
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {action === 'status' ? 'Update Status' : 'Assign Tasks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;
