import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateLeadStatus, getProjectLeads } from '../../../store/leadSlice';
import Button from '../../../components/ui/Button';

const LeadKanban = ({ projectId }) => {
  const dispatch = useDispatch();
  const { leads, isLoading } = useSelector((state) => state.leads);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [optimisticLeads, setOptimisticLeads] = useState([]);

  const stages = [
    { id: 'new', name: 'New', color: 'bg-gray-100' },
    { id: 'contacted', name: 'Contacted', color: 'bg-blue-100' },
    { id: 'qualified', name: 'Qualified', color: 'bg-green-100' },
    { id: 'disqualified', name: 'Disqualified', color: 'bg-red-100' }
  ];

  useEffect(() => {
    dispatch(getProjectLeads({ projectId }));
  }, [dispatch, projectId]);

  // Update optimistic leads when actual leads change
  useEffect(() => {
    setOptimisticLeads(leads);
  }, [leads]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    const leadId = draggableId;
    
    // Find the lead being moved
    const leadToUpdate = optimisticLeads.find(lead => lead._id === leadId);
    if (!leadToUpdate) return;

    // Optimistic update - immediately update the local state
    const updatedLead = { ...leadToUpdate, status: newStatus, stage: newStatus };
    const newOptimisticLeads = optimisticLeads.map(lead => 
      lead._id === leadId ? updatedLead : lead
    );
    setOptimisticLeads(newOptimisticLeads);
    
    try {
      await dispatch(updateLeadStatus({ id: leadId, status: newStatus })).unwrap();
      // No need to refresh - the Redux state is already updated
    } catch (error) {
      console.error('Failed to update lead status:', error);
      // Revert optimistic update on error
      setOptimisticLeads(leads);
    }
  };

  const getLeadsByStage = (stageId) => {
    return optimisticLeads.filter(lead => (lead.stage || lead.status) === stageId);
  };

  const handleLeadSelect = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === optimisticLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(optimisticLeads.map(lead => lead._id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      for (const leadId of selectedLeads) {
        await dispatch(updateLeadStatus({ id: leadId, status: newStatus })).unwrap();
      }
      setSelectedLeads([]);
      setShowBulkActions(false);
      // No need to refresh - the Redux state is already updated
    } catch (error) {
      console.error('Failed to update leads:', error);
    }
  };

  const LeadCard = ({ lead, index }) => (
    <Draggable draggableId={lead._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg' : ''
          } ${selectedLeads.includes(lead._id) ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleLeadSelect(lead._id)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
            <input
              type="checkbox"
              checked={selectedLeads.includes(lead._id)}
              onChange={() => handleLeadSelect(lead._id)}
              className="ml-2"
            />
          </div>
          
          {lead.email && (
            <p className="text-sm text-gray-600 mb-1">{lead.email}</p>
          )}
          
          {lead.jobTitle && (
            <p className="text-sm text-gray-500 mb-2">{lead.jobTitle}</p>
          )}
          
          {lead.assignedTo && (
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                {lead.assignedTo.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 ml-2">{lead.assignedTo.name}</span>
            </div>
          )}
          
          {lead.score !== undefined && lead.score !== null && (
            <div className="flex items-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                lead.score >= 75 ? 'bg-green-100 text-green-800' :
                lead.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                lead.score >= 25 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                Score: {lead.score}
              </span>
            </div>
          )}
          
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {lead.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {lead.tags.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{lead.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{lead.source}</span>
            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </Draggable>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading kanban board...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header with bulk actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Lead Pipeline</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedLeads.length === optimisticLeads.length && optimisticLeads.length > 0}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-600">
              {selectedLeads.length} of {optimisticLeads.length} selected
            </span>
          </div>
        </div>
        
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Bulk Actions
            </Button>
            {showBulkActions && (
              <div className="flex gap-2">
                {stages.map(stage => (
                  <Button
                    key={stage.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(stage.id)}
                  >
                    Move to {stage.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {stages.map(stage => (
            <div key={stage.id} className="flex flex-col">
              <div className={`${stage.color} rounded-lg p-4 mb-4`}>
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <p className="text-sm text-gray-600">
                  {getLeadsByStage(stage.id).length} leads
                </p>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[500px] p-2 rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {getLeadsByStage(stage.id).map((lead, index) => (
                      <LeadCard key={lead._id} lead={lead} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default LeadKanban;
