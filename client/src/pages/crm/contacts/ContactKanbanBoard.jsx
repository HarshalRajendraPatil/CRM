import React from 'react';

const ContactKanbanBoard = ({ contacts, selectedContacts, onContactSelect, onContactClick }) => {
  const stages = [
    { key: 'lead', label: 'Leads', color: 'bg-blue-100 text-blue-800' },
    { key: 'prospect', label: 'Prospects', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { key: 'opportunity', label: 'Opportunities', color: 'bg-purple-100 text-purple-800' },
    { key: 'customer', label: 'Customers', color: 'bg-green-100 text-green-800' },
    { key: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
    { key: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      unsubscribed: 'bg-red-100 text-red-800',
      bounced: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.other;
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getContactsByStage = (stage) => {
    return contacts.filter(contact => contact.stage === stage);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 p-4 min-w-max">
        {stages.map((stage) => {
          const stageContacts = getContactsByStage(stage.key);
          
          return (
            <div key={stage.key} className="flex-shrink-0 w-80">
              {/* Stage Header */}
              <div className="bg-gray-50 rounded-t-lg p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stageContacts.length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stage Content */}
              <div className="bg-gray-50 rounded-b-lg p-2 min-h-96 max-h-96 overflow-y-auto">
                {stageContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No contacts</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stageContacts.map((contact) => (
                      <div
                        key={contact._id}
                        className={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedContacts.includes(contact._id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onContactClick(contact)}
                      >
                        {/* Contact Card */}
                        <div className="p-3">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedContacts.includes(contact._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  onContactSelect(contact._id);
                                }}
                                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <div className="flex-shrink-0 h-6 w-6">
                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-800 font-medium text-xs">
                                    {getInitials(contact.firstName, contact.lastName)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-1 py-0.5 inline-flex text-xs leading-3 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                              {contact.status?.charAt(0).toUpperCase() + contact.status?.slice(1) || 'Unknown'}
                            </span>
                          </div>
                          
                          {/* Name and Company */}
                          <div className="mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            {contact.company?.name && (
                              <p className="text-xs text-gray-500">
                                {contact.company.name}
                              </p>
                            )}
                          </div>

                          {/* Lead Score */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-1 py-0.5 inline-flex text-xs leading-3 font-semibold rounded-full ${getLeadScoreColor(contact.leadScore)}`}>
                              {contact.leadScore || 0}
                            </span>
                            <div className="flex-1 ml-2 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-indigo-600 h-1 rounded-full" 
                                style={{ width: `${contact.leadScore || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Tags */}
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {contact.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {tag}
                                </span>
                              ))}
                              {contact.tags.length > 2 && (
                                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{contact.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Last Activity */}
                          <div className="text-xs text-gray-500">
                            {formatDate(contact.lastActivityDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactKanbanBoard;
