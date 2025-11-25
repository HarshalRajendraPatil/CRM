import React from 'react';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getDealHealthScore, getDealHealthColor } from '../../../utils/dealUtils';
import { PencilIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useProjectAccess } from '../../../hooks/useProjectAccess';

const DealListItem = ({ 
  deal, 
  isSelected, 
  onSelect, 
  onEdit, 
  onView,
  onDelete,
  onDuplicate
}) => {
  const {hasSupportExecutiveAccess} = useProjectAccess();
  const {
    _id,
    name,
    value,
    currency,
    status,
    priority,
    probability,
    expectedCloseDate,
    assignedUser,
    customerInfo,
    companyInfo,
  } = deal;

  const handleSelect = () => {
    onSelect(_id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(deal);
  };

  const handleView = () => {
    onView(_id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
      onDelete(_id);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicate(deal);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDaysUntilClose = (closeDate) => {
    if (!closeDate) return null;
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilClose = getDaysUntilClose(expectedCloseDate);
  const dealHealthScore = getDealHealthScore(deal);
  const dealHealthColor = getDealHealthColor(dealHealthScore);

  return (
    <div 
      className={`group grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
        isSelected ? 'bg-indigo-50' : ''
      }`}
      onClick={handleView}
    >
      {/* Selection Checkbox */}
      <div className="col-span-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
        />
      </div>

      {/* Deal Name & Customer */}
      <div className="col-span-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            {name}
          </h3>
          <div className="text-xs text-gray-500">
            {customerInfo && `${customerInfo.firstName}`}
            {companyInfo && customerInfo && ' • '}
            {companyInfo && companyInfo.name}
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="col-span-2">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(value, currency)}
        </div>
        <div className="text-xs text-gray-500">
          {probability}% probability
        </div>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {/* Priority */}
      <div className="col-span-1">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </div>

      {/* Close Date */}
      <div className="col-span-2">
        <div className="text-sm text-gray-900">
          {expectedCloseDate ? formatDate(expectedCloseDate) : '-'}
        </div>
        <div className="text-xs text-gray-500">
        {expectedCloseDate && getDaysUntilClose(expectedCloseDate) > 0 ? `${getDaysUntilClose(expectedCloseDate)} days until close` : 'Overdue by ' + Math.abs(getDaysUntilClose(expectedCloseDate)) + ' days'}
        </div>
      </div>

      {/* Assigned To */}
      <div className="col-span-2">
        {assignedUser ? (
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              {assignedUser.profileImage ? (
                <img src={assignedUser.profileImage} alt="Profile" className="h-6 w-6 rounded-full" />
              ) : (
                <span className="text-indigo-800 font-medium text-xs">
                  {getInitials(assignedUser.name)}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-900 truncate">{assignedUser.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        )}
      </div>

      {/* Actions */}
      {hasSupportExecutiveAccess && <div className="col-span-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title="Edit deal"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
{/*           
          <button
            onClick={handleArchive}
            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
            title="Archive deal"
          >
            <ArchiveBoxIcon className="h-4 w-4" />
          </button> */}
          
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete deal"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>}
    </div>
  );
};

export default DealListItem;