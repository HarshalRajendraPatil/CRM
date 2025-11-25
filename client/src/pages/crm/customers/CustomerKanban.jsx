import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  fetchProjectCustomers, 
  bulkUpdateCustomers,
  updateCustomer
} from '../../../store/customerSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import CustomerSidebar from './CustomerSidebar';

const CustomerKanban = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  
  const { customers, currentCustomer, loading, error } = useSelector((state) => state.customers);
  
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCustomerSidebar, setShowCustomerSidebar] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // Customer stages for kanban columns
  const stages = [
    { id: 'prospect', name: 'Prospect', color: 'bg-gray-100', textColor: 'text-gray-700' },
    { id: 'lead', name: 'Lead', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { id: 'qualified', name: 'Qualified', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { id: 'opportunity', name: 'Opportunity', color: 'bg-orange-100', textColor: 'text-orange-700' },
    { id: 'customer', name: 'Customer', color: 'bg-green-100', textColor: 'text-green-700' },
    { id: 'churned', name: 'Churned', color: 'bg-red-100', textColor: 'text-red-700' },
    { id: 'inactive', name: 'Inactive', color: 'bg-gray-100', textColor: 'text-gray-500' }
  ];

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectCustomers({ projectId }));
    }
  }, [dispatch, projectId]);

  // Group customers by stage
  const customersByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = customers.filter(customer => customer.stage === stage.id);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const customerId = draggableId;
    const newStage = destination.droppableId;

    try {
      dispatch(updateCustomer({ projectId, id: customerId, customerData: { stage: newStage } }));
    } catch (error) {
      console.error('Failed to update customer stage:', error);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (stageId) => {
    const stageCustomers = customersByStage[stageId] || [];
    const stageCustomerIds = stageCustomers.map(c => c._id);
    
    const allSelected = stageCustomerIds.every(id => selectedCustomers.includes(id));
    
    if (allSelected) {
      setSelectedCustomers(prev => prev.filter(id => !stageCustomerIds.includes(id)));
    } else {
      setSelectedCustomers(prev => [...new Set([...prev, ...stageCustomerIds])]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCustomers.length === 0) return;

    try {
      let updateData = {};
      
      switch (bulkAction) {
        case 'archive':
          updateData = { isArchived: true };
          break;
        case 'unarchive':
          updateData = { isArchived: false };
          break;
        case 'high_priority':
          updateData = { priority: 'high' };
          break;
        case 'medium_priority':
          updateData = { priority: 'medium' };
          break;
        case 'low_priority':
          updateData = { priority: 'low' };
          break;
        case 'active_status':
          updateData = { status: 'active' };
          break;
        case 'inactive_status':
          updateData = { status: 'inactive' };
          break;
        default:
          return;
      }

      await dispatch(bulkUpdateCustomers({ 
        projectId,
        customerIds: selectedCustomers, 
        updates: updateData, 
      })).unwrap();

      setSelectedCustomers([]);
      setBulkAction('');
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Kanban</h1>
          <p className="text-gray-600">Manage customers with drag-and-drop workflow</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedCustomers.length} customer(s) selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="">Select Action</option>
                <option value="archive">Archive Selected</option>
                <option value="unarchive">Unarchive Selected</option>
                <option value="high_priority">Mark High Priority</option>
                <option value="medium_priority">Mark Medium Priority</option>
                <option value="low_priority">Mark Low Priority</option>
                <option value="active_status">Mark Active</option>
                <option value="inactive_status">Mark Inactive</option>
              </select>
              <Button
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomers([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              {/* Stage Header */}
              <div className={`${stage.color} ${stage.textColor} p-3 rounded-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{stage.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {customersByStage[stage.id]?.length || 0}
                    </span>
                    <input
                      type="checkbox"
                      checked={customersByStage[stage.id]?.every(c => selectedCustomers.includes(c._id))}
                      onChange={() => handleSelectAll(stage.id)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Stage Column */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] p-2 rounded-lg border-2 border-dashed ${
                      snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {customersByStage[stage.id]?.map((customer, index) => (
                      <Draggable
                        key={customer._id}
                        draggableId={customer._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg border border-gray-200 mb-3 cursor-move hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${selectedCustomers.includes(customer._id) ? 'ring-2 ring-blue-500' : ''}`}
                                                         onClick={() => {
                               setEditingCustomerId(customer._id);
                               setShowCustomerSidebar(true);
                             }}
                          >
                            {/* Customer Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedCustomers.includes(customer._id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleCustomerSelect(customer._id);
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {customer.firstName} {customer.lastName}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {customer.email}
                              </p>
                              <p className={`text-sm text-gray-600 truncate w-fit p-1 rounded-md text-white ${getPriorityColor(customer.priority)}`}>
                                {customer.priority}
                              </p>
                              <p className={`text-sm text-gray-600 truncate w-fit p-1 rounded-md text-white ${getStatusColor(customer.status)}`}>
                                {customer.status}
                              </p>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Customer Sidebar */}
      <CustomerSidebar
        isOpen={showCustomerSidebar}
        onClose={() => {
          setShowCustomerSidebar(false);
          setEditingCustomerId(null);
        }}
        currentCustomer={currentCustomer}
        customerId={editingCustomerId}
      />
    </div>
  );
};

export default CustomerKanban;
