import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';

const MyCrm = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCrmName, setNewCrmName] = useState('');
  const [newCrmError, setNewCrmError] = useState('');

  // Mock CRM instances - in a real app, this would come from your API
  const [crmInstances, setCrmInstances] = useState([
    {
      id: '1',
      name: 'Marketing Agency',
      description: 'CRM for managing marketing clients and campaigns',
      createdAt: '2023-01-15',
      lastAccessed: '2023-08-22',
      contacts: 156,
      deals: 24,
    },
    {
      id: '2',
      name: 'Sales Team',
      description: 'CRM for our internal sales department',
      createdAt: '2023-03-10',
      lastAccessed: '2023-08-20',
      contacts: 342,
      deals: 47,
    },
    {
      id: '3',
      name: 'Client Project: XYZ Corp',
      description: 'Dedicated CRM for managing the XYZ Corporation project',
      createdAt: '2023-06-05',
      lastAccessed: '2023-08-18',
      contacts: 78,
      deals: 12,
    },
  ]);

  const handleCreateCrm = (e) => {
    e.preventDefault();
    
    if (!newCrmName.trim()) {
      setNewCrmError('CRM name is required');
      return;
    }
    
    // In a real app, you would call your API to create a new CRM instance
    const newCrm = {
      id: Date.now().toString(),
      name: newCrmName,
      description: '',
      createdAt: new Date().toISOString().split('T')[0],
      lastAccessed: new Date().toISOString().split('T')[0],
      contacts: 0,
      deals: 0,
    };
    
    setCrmInstances([...crmInstances, newCrm]);
    setNewCrmName('');
    setShowCreateModal(false);
  };

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My CRM Instances</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create New CRM
            </button>
          </div>

          {crmInstances.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No CRM Instances</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first CRM instance.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create New CRM
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crmInstances.map((crm) => (
                <div key={crm.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{crm.name}</h3>
                    <p className="text-gray-600 mb-4 h-12 overflow-hidden">{crm.description || 'No description provided'}</p>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>Created: {crm.createdAt}</span>
                      <span>Last accessed: {crm.lastAccessed}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium mb-6">
                      <span className="text-indigo-600">{crm.contacts} Contacts</span>
                      <span className="text-green-600">{crm.deals} Deals</span>
                    </div>
                    <Link
                      to={`/dashboard?crm=${crm.id}`}
                      className="block w-full px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Enter CRM
                    </Link>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 flex justify-between">
                    <button className="text-sm text-gray-600 hover:text-gray-900">Settings</button>
                    <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create CRM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateCrm}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New CRM Instance</h3>
                      <div className="mb-4">
                        <label htmlFor="crm-name" className="block text-sm font-medium text-gray-700 mb-1">
                          CRM Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="crm-name"
                          value={newCrmName}
                          onChange={(e) => {
                            setNewCrmName(e.target.value);
                            if (newCrmError) setNewCrmError('');
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                            newCrmError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter CRM name"
                        />
                        {newCrmError && (
                          <p className="mt-1 text-sm text-red-600">{newCrmError}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="crm-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="crm-description"
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Optional description for your CRM"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyCrm; 