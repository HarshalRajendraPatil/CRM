import React from 'react';

const ContactGridItem = ({ contact, isSelected, onSelect, onClick }) => {
  const getStageColor = (stage) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      opportunity: 'bg-purple-100 text-purple-800',
      customer: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      lost: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || colors.other;
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

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  return (
    <div 
      className={`bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium text-lg">
                  {getInitials(contact.firstName, contact.lastName)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
            {contact.status?.charAt(0).toUpperCase() + contact.status?.slice(1) || 'Unknown'}
          </span>
        </div>
        
        {/* Name and Title */}
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.jobTitle && (
            <p className="text-sm text-gray-500 mt-1">
              {contact.jobTitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {contact.email && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {contact.email}
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {contact.phone}
            </div>
          )}
          {contact.company?.name && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {contact.company.name}
            </div>
          )}
        </div>

        {/* Stage and Lead Score */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStageColor(contact.stage)}`}>
            {contact.stage?.charAt(0).toUpperCase() + contact.stage?.slice(1) || 'Unknown'}
          </span>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getLeadScoreColor(contact.leadScore)}`}>
              {contact.leadScore || 0}
            </span>
            <div className="w-12 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${contact.leadScore || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Assigned To */}
        {contact.assignedTo && (
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-6 w-6">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-800 font-medium text-xs">
                  {getInitials(contact.assignedTo.firstName, contact.assignedTo.lastName)}
                </span>
              </div>
            </div>
            <div className="ml-2">
              <div className="text-sm text-gray-900">
                {contact.assignedTo.firstName} {contact.assignedTo.lastName}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {tag}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{contact.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Last Activity */}
        <div className="text-xs text-gray-500">
          <div className="flex items-center">
            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last activity: {formatDate(contact.lastActivityDate)}
          </div>
          {contact.lastActivityType && (
            <div className="text-xs text-gray-400 mt-1">
              {contact.lastActivityType}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created {new Date(contact.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Show action menu
            }}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactGridItem;
