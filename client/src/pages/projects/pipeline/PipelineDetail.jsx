import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getPipelineById, 
  createStage, 
  updateStage, 
  deleteStage, 
  reorderStages, 
  reset,
  deletePipeline
} from '../../../store/projectSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import CreateStageSidebar from './CreateStageSidebar';
import EditStageSidebar from './EditStageSidebar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EditPipelineSidebar from './EditPipelineSidebar';
import { useNavigate } from 'react-router-dom';

const PipelineDetail = ({ projectId, pipeline, onBack, hasManagerAccess }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showEditPipeline, setShowEditPipeline] = useState(false);
  const [showDeleteConfirmPipeline, setShowDeleteConfirmPipeline] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, isError, message } = useSelector(
    (state) => state.projects
  );
  
  // Monitor pipeline updates from props
  useEffect(() => {
    // Clean up on unmount
    return () => {
      dispatch(reset());
    };
  }, [dispatch, pipeline]);
  
  const toggleCreateModal = () => {
    setShowCreateModal(!showCreateModal);
  };
  
  const toggleEditModal = (stage = null) => {
    setSelectedStage(stage);
    setShowEditModal(!showEditModal);
  };

  const toggleEditPipeline = () => {
    setShowEditPipeline(!showEditPipeline);
  };
  
  const toggleDeleteConfirmPipeline = () => {
    setShowDeleteConfirmPipeline(!showDeleteConfirmPipeline);
  };

  const onDelete = async () => {
    await dispatch(deletePipeline({
      projectId,
      pipelineId: pipeline._id
    }));
    navigate(`/projects/${projectId}`);
  };
  
  const toggleDeleteConfirm = (stage = null) => {
    setSelectedStage(stage);
    setShowDeleteConfirm(!showDeleteConfirm);
  };
  
  const handleDeleteStage = async () => {
    if (selectedStage) {
      await dispatch(deleteStage({
        projectId,
        pipelineId: pipeline._id,
        stageId: selectedStage._id
      }));
      // Refresh pipeline data after stage deletion
      dispatch(getPipelineById({ projectId, pipelineId: pipeline._id }));
      setShowDeleteConfirm(false);
    }
  };
  
  const handleDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // If position didn't change
    if (sourceIndex === destinationIndex) {
      return;
    }
    
    // Get all stage IDs in the new order
    const stageIds = pipeline.stages.map(stage => stage._id);
    
    // Move the dragged stage ID to the new position
    const [removed] = stageIds.splice(sourceIndex, 1);
    stageIds.splice(destinationIndex, 0, removed);
    
    // Dispatch reorder action
    dispatch(reorderStages({
      projectId,
      pipelineId: pipeline._id,
      stageIdsInOrder: stageIds
    }));
  };

  // Show edit pipeline sidebar as an overlay, not a replacement
  const renderEditPipelineSidebar = () => {
    if (showEditPipeline) {
      return (
        <EditPipelineSidebar
          projectId={projectId}
          pipeline={pipeline}
          onClose={toggleEditPipeline}
        />
      );
    }
    return null;
  };
  
  return (
    <>
      {renderEditPipelineSidebar()}
      <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{pipeline.name}</h2>
        {pipeline.isDefault && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
        )}
      </div>
      
      {pipeline.description && (
        <p className="text-gray-600 mb-6">{pipeline.description}</p>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Pipeline Stages</h3>
        <div className="flex space-x-2">
          {hasManagerAccess && (
            <Button 
              variant="secondary"
              onClick={toggleCreateModal}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Add Stage
            </Button>
          )}
          {hasManagerAccess && (
            <Button 
              variant="primary"
              onClick={toggleEditPipeline}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              }
            >
              Edit Pipeline
            </Button>
          )}
          {hasManagerAccess && (
            <Button 
              variant="danger"
              onClick={toggleDeleteConfirmPipeline}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Delete Pipeline
            </Button>
          )}
        </div>
      </div>
      
      {isError && <Alert variant="danger" message={message} className="mb-4" />}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages" direction="horizontal">
            {(provided) => (
              <div 
                className="flex overflow-x-auto pb-4 space-x-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {pipeline.stages && pipeline.stages.map((stage, index) => (
                  <Draggable 
                    key={stage._id} 
                    draggableId={stage._id} 
                    index={index}
                    isDragDisabled={!hasManagerAccess}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex-shrink-0 w-64 bg-white border rounded-lg shadow-sm ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          borderLeftWidth: '4px',
                          borderLeftColor: stage.color || '#4A5568'
                        }}
                      >
                        <div 
                          className="p-4 flex justify-between items-start"
                          {...provided.dragHandleProps}
                        >
                          <div>
                            <h4 className="font-medium text-gray-800">{stage.name}</h4>
                            {stage.isDefault && (
                              <span className="mt-1 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {hasManagerAccess && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => toggleEditModal(stage)}
                                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => toggleDeleteConfirm(stage)}
                                className="p-1 rounded-full text-red-500 hover:bg-red-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      
      {/* Create Stage Sidebar */}
      {showCreateModal && (
        <CreateStageSidebar 
          projectId={projectId}
          pipelineId={pipeline._id}
          onClose={toggleCreateModal}
        />
      )}
      
      {/* Edit Stage Sidebar */}
      {showEditModal && selectedStage && (
        <EditStageSidebar 
          projectId={projectId}
          pipelineId={pipeline._id}
          stage={selectedStage}
          onClose={toggleEditModal}
        />
      )}
      
      {/* Delete Stage Confirmation Modal */}
      {showDeleteConfirm && selectedStage && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Stage?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete the stage "{selectedStage.name}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => toggleDeleteConfirm()}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteStage}
                  isLoading={isLoading}
                >
                  Delete Stage
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Pipeline Confirmation Modal */}
      {showDeleteConfirmPipeline && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Pipeline?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete the pipeline "{pipeline.name}"? This action cannot be undone and all pipeline data will be permanently lost.
              </p>
              
              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={toggleDeleteConfirmPipeline}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    toggleDeleteConfirmPipeline();
                    onDelete();
                  }}
                  isLoading={isLoading}
                >
                  Delete Pipeline
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default PipelineDetail;