import React from 'react';
import Button from '../../../components/ui/Button';

const CustomerListItem = ({ 
  customer, 
  isSelected, 
  onSelect, 
  onView, 
  getStageColor,
  getPriorityColor,
  getStatusColor 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: customer.deal?.currency || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      {/* Checkbox */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(customer._id)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </td>

      {/* Customer Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {getInitials(customer.firstName, customer.lastName)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.fullName}
            </div>
            <div className="text-sm text-gray-500">
              {customer.email}
            </div>
            {customer.phone && (
              <div className="text-sm text-gray-500">
                {customer.phone}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Company */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {customer.companyName || customer.company?.name || '-'}
        </div>
        {customer.jobTitle && (
          <div className="text-sm text-gray-500">
            {customer.jobTitle}
          </div>
        )}
        {customer.industry && (
          <div className="text-sm text-gray-500">
            {customer.industry}
          </div>
        )}
      </td>

      {/* Stage */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStageColor(customer.stage)}`}>
          {customer.stage}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </td>

      {/* Priority */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(customer.priority)}`}>
          {customer.priority}
        </span>
      </td>

      {/* Score */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {customer.score || 0}
        </div>
      </td>

      {/* Assigned To */}
      <td className="px-6 py-4 whitespace-nowrap">
        {customer.assignedTo ? (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                {customer.assignedTo.profileImage ? (
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src={customer.assignedTo.profileImage} 
                    alt={customer.assignedTo.name}
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {getInitials(customer.assignedTo.name?.split(' ')[0], customer.assignedTo.name?.split(' ')[1])}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {customer.assignedTo.name}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        )}
      </td>

      {/* Last Activity */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {customer.lastActivityDate ? formatDateTime(customer.lastActivityDate) : 'No activity'}
        </div>
        {customer.lastActivityType && (
          <div className="text-sm text-gray-500 capitalize">
            {customer.lastActivityType.replace('_', ' ')}
          </div>
        )}
        {customer.lastActivityBy && (
          <div className="text-sm text-gray-500">
            by {customer.updatedBy.name}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="link"
            size="sm"
            onClick={onView}
          >
              View
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerListItem;
