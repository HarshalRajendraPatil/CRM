import React from 'react';

const ContactListItem = ({ contact, isSelected, onSelect, onClick }) => {
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
    <tr 
      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-indigo-50' : ''}`}
      onClick={onClick}
    >
      {/* Contact Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
          />
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-800 font-medium text-sm">
                {getInitials(contact.firstName, contact.lastName)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {contact.email}
            </div>
            {contact.phone && (
              <div className="text-sm text-gray-500">
                {contact.phone}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Company */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {contact.company?.name || 'No Company'}
        </div>
        {contact.jobTitle && (
          <div className="text-sm text-gray-500">
            {contact.jobTitle}
          </div>
        )}
      </td>

      {/* Stage */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(contact.stage)}`}>
          {contact.stage?.charAt(0).toUpperCase() + contact.stage?.slice(1) || 'Unknown'}
        </span>
      </td>

      {/* Lead Score */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeadScoreColor(contact.leadScore)}`}>
            {contact.leadScore || 0}
          </span>
          <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${contact.leadScore || 0}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* Assigned To */}
      <td className="px-6 py-4 whitespace-nowrap">
        {contact.assignedTo ? (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
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
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        )}
      </td>

      {/* Last Activity */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div>{formatDate(contact.lastActivityDate)}</div>
          {contact.lastActivityType && (
            <div className="text-xs text-gray-400">
              {contact.lastActivityType}
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {/* Status Badge */}
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
            {contact.status?.charAt(0).toUpperCase() + contact.status?.slice(1) || 'Unknown'}
          </span>
          
          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex space-x-1">
              {contact.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
              {contact.tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{contact.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Show action menu
              }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ContactListItem;
