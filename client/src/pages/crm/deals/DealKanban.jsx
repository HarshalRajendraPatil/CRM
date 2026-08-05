import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjectDeals,
  updateDealStatusAction,
  setSelectedDeals,
  bulkUpdateDealsAction,
  bulkDeleteDealsAction
} from '../../../store/dealSlice';
import { getProjectPipelines, clearPipelines } from '../../../store/projectSlice';
import Button from '../../../components/ui/Button';
import {
  formatCurrency,
  formatDate,
  getPriorityColor,
  getInitials
} from '../../../utils/dealUtils';

const DealKanban = ({ projectId, onEditDeal, onViewDeal }) => {
  const dispatch = useDispatch();
  const { deals, selectedDeals } = useSelector((state) => state.deals);
  const { pipelines, currentProjectId } = useSelector((state) => state.projects);

  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectDeals({ projectId }));
      if (projectId !== currentProjectId) {
        dispatch(clearPipelines());
        dispatch(getProjectPipelines(projectId));
      }
    }
  }, [dispatch, projectId, currentProjectId]);

  useEffect(() => {
    // Only set selectedPipeline from pipelines — never depend on selectedPipeline
    // itself to avoid a re-render loop.
    const dealPipelines = pipelines.filter(p => p.type === 'deal');
    const defaultPipeline = dealPipelines.find(p => p.isDefault) || dealPipelines[0];
    if (defaultPipeline) {
      setSelectedPipeline(prev =>
        prev && prev._id === defaultPipeline._id ? prev : defaultPipeline
      );
    }
  }, [pipelines]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const deal = deals.find(d => d._id === draggableId);
    if (!deal) return;

    const newStageId = destination.droppableId;

    try {
      await dispatch(updateDealStatusAction({
        projectId,
        dealId: draggableId,
        status: newStageId
      })).unwrap();
    } catch (error) {
      console.error('Failed to move deal:', error);
    }
  };

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => {
      const status = deal.status;
      const matchesStage = status === stageId;
      if (matchesStage) return true;

      const firstStageId = selectedPipeline?.stages?.[0]?._id;
      const isUnmapped = !selectedPipeline?.stages?.some(s => s._id === status);
      return isUnmapped && stageId === firstStageId;
    });
  };

  const handleDealSelect = (dealId) => {
    const newSelected = selectedDeals.includes(dealId)
      ? selectedDeals.filter(id => id !== dealId)
      : [...selectedDeals, dealId];
    dispatch(setSelectedDeals(newSelected));
  };

  const handleSelectAll = (stageId) => {
    const stageDeals = getDealsByStage(stageId);
    const stageDealIds = stageDeals.map(deal => deal._id);

    const allSelected = stageDealIds.every(id => selectedDeals.includes(id));

    if (allSelected) {
      // Deselect all deals in this stage
      dispatch(setSelectedDeals(selectedDeals.filter(id => !stageDealIds.includes(id))));
    } else {
      // Select all deals in this stage
      dispatch(setSelectedDeals([...new Set([...selectedDeals, ...stageDealIds])]));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedDeals.length === 0) return;

    try {
      await dispatch(bulkUpdateDealsAction({
        projectId,
        dealIds: selectedDeals,
        updates: { status: newStatus }
      }));
      dispatch(setSelectedDeals([]));
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update deal statuses:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeals.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedDeals.length} deal(s)? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        await dispatch(bulkDeleteDealsAction({
          projectId,
          dealIds: selectedDeals
        }));
        dispatch(setSelectedDeals([]));
        setShowBulkActions(false);
      } catch (error) {
        console.error('Failed to delete deals:', error);
      }
    }
  };


  const DealCard = ({ deal, index }) => (
    <Draggable draggableId={deal._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            } ${selectedDeals.includes(deal._id) ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => onViewDeal(deal._id)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedDeals.includes(deal._id)}
                onChange={() => handleDealSelect(deal._id)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {deal.name}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditDeal(deal);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          {/* Value */}
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {formatCurrency(deal.value, deal.currency)}
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-2 mb-3">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: selectedPipeline?.stages?.find(s => s._id === deal.status)?.color || '#e5e7eb', color: '#1f2937' }}
            >
              {selectedPipeline?.stages?.find(s => s._id === deal.status)?.name || 'Unknown'}
            </span>
            {deal.priority && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(deal.priority)}`}>
                {deal.priority}
              </span>
            )}
          </div>

          {/* Customer/Company */}
          <div className="text-xs text-gray-500 mb-2">
            {deal.customer && (
              <div>Customer: {deal.customer.name}</div>
            )}
            {deal.company && (
              <div>Company: {deal.company.name}</div>
            )}
          </div>

          {/* Close Date */}
          {deal.expectedCloseDate && (
            <div className="text-xs text-gray-500 mb-3">
              Close: {formatDate(deal.expectedCloseDate)}
            </div>
          )}

          {/* Assigned User */}
          {deal.assignedTo && (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                {deal.assignedTo.profileImage ? (
                  <img
                    src={deal.assignedTo.profileImage}
                    alt={deal.assignedTo.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {getInitials(deal.assignedTo.name)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600">{deal.assignedTo.name}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  if (!selectedPipeline) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pipelines found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create a pipeline to start organizing your deals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Selector */}
      <div className="flex items-center justify-between">
        {/* Bulk Actions */}
        {selectedDeals.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedDeals.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                    }
                  }}
                >
                  <option value="">Select Stage</option>
                  {selectedPipeline?.stages?.map(stage => (
                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowBulkActions(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {selectedPipeline.stages?.map((stage) => {
            const stageDeals = getDealsByStage(stage._id);
            const stageDealIds = stageDeals.map(deal => deal._id);
            const allSelected = stageDealIds.length > 0 && stageDealIds.every(id => selectedDeals.includes(id));

            return (
              <div key={stage._id} className="flex-shrink-0 w-80">
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => handleSelectAll(stage._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                      />
                      <h3 className="text-sm font-medium text-gray-900">
                        {stage.name}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Stage Description */}
                  {stage.description && (
                    <p className="text-xs text-gray-600 mb-4">
                      {stage.description}
                    </p>
                  )}

                  {/* Deals */}
                  <Droppable droppableId={stage._id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-96 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                      >
                        {stageDeals.map((deal, index) => (
                          <DealCard key={deal._id} deal={deal} index={index} />
                        ))}
                        {provided.placeholder}

                        {stageDeals.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-2 text-sm">No deals in this stage</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DealKanban;
