import React from 'react';

const ArchiveConfirmModal = ({ isOpen, onClose, task, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
      
      <div className="relative mx-auto mt-20 w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Archive Task</h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to archive the task "{task?.title}"? It will be moved to the archived tasks list.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveConfirmModal;
