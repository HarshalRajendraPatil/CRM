import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProjectPipelines,
  deletePipeline,
  clearPipelines
} from '../../../store/projectSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import PipelineDetail from '../pipeline/PipelineDetail';
import CreatePipelineSidebar from '../pipeline/CreatePipelineSidebar';
import EditPipelineSidebar from '../pipeline/EditPipelineSidebar';

const PipelinesTab = ({ projectId, hasManagerAccess }) => {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dispatch = useDispatch();

  const { pipelines, currentProjectId, isLoading, isError, message } = useSelector(
    (state) => state.projects
  );

  useEffect(() => {
    // Only fetch when projectId changes AND differs from what is currently loaded.
    // This prevents an infinite loop while ensuring each CRM gets its own data.
    if (projectId && projectId !== currentProjectId) {
      dispatch(clearPipelines());          // Wipe stale data from previous project
      dispatch(getProjectPipelines(projectId));
    }
  }, [dispatch, projectId, currentProjectId]);


  const toggleCreateModal = () => {
    setShowCreateModal(!showCreateModal);
  };

  const toggleEditModal = () => {
    setShowEditModal(!showEditModal);
  };

  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(!showDeleteConfirm);
  };

  const handleSelectPipeline = (pipeline) => {
    setSelectedPipeline(pipeline);
  };

  const handleDeletePipeline = async () => {
    if (selectedPipeline) {
      await dispatch(deletePipeline({
        projectId,
        pipelineId: selectedPipeline._id
      }));
      // Refresh pipelines list after deletion
      dispatch(getProjectPipelines(projectId));
      setSelectedPipeline(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleBackToPipelines = () => {
    setSelectedPipeline(null);
  };

  // If a pipeline is selected, show its details
  if (selectedPipeline) {
    return (
      <PipelineDetail
        projectId={projectId}
        pipeline={selectedPipeline}
        onBack={handleBackToPipelines}
        onEdit={toggleEditModal}
        onDelete={toggleDeleteConfirm}
        hasManagerAccess={hasManagerAccess}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Pipelines</h2>
        {/* {hasManagerAccess && (
          <Button 
            variant="primary"
            onClick={toggleCreateModal}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          >
            Create Pipeline
          </Button>
        )} */}
      </div>

      {isError && <Alert variant="danger" message={message} className="mb-4" />}

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : pipelines && pipelines.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No pipelines yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating your first pipeline.</p>
          {hasManagerAccess && (
            <div className="mt-6">
              <Button variant="primary" onClick={toggleCreateModal}>Create a Pipeline</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines && pipelines.map((pipeline) => (
            <div
              key={pipeline._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleSelectPipeline(pipeline)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{pipeline.name}</h3>
                  <div className="flex gap-2">
                    {pipeline.type && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded capitalize">{pipeline.type}</span>
                    )}
                    {pipeline.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {pipeline.description || 'No description provided'}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {pipeline.stages ? pipeline.stages.length : 0} stages
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                <div className="text-indigo-600 text-sm font-medium">View Pipeline →</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Pipeline Sidebar */}
      {showCreateModal && (
        <CreatePipelineSidebar
          projectId={projectId}
          onClose={toggleCreateModal}
        />
      )}

      {/* Edit Pipeline Sidebar */}
      {showEditModal && selectedPipeline && (
        <EditPipelineSidebar
          projectId={projectId}
          pipeline={selectedPipeline}
          onClose={toggleEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPipeline && (
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
                Are you sure you want to delete "{selectedPipeline.name}"? This action cannot be undone and all pipeline data will be permanently lost.
              </p>

              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={toggleDeleteConfirm}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeletePipeline}
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
  );
};

export default PipelinesTab;