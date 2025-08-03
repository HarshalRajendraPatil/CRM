import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject, reset } from '../../store/projectSlice';
import { getProjectInvitations } from '../../store/invitationSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EditProjectSidebar from './EditProjectSidebar';
import MembersTab from './tabs/MembersTab';
import PipelinesTab from './tabs/PipelinesTab';
import SettingsTab from './tabs/SettingsTab';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { project, isLoading, isError, message } = useSelector(
    (state) => state.projects
  );
  
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getProjectById(id));
    dispatch(getProjectInvitations(id));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);
  
  const toggleEditModal = () => {
    setShowEditModal(!showEditModal);
  };
  
  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(!showDeleteConfirm);
  };
  
  const handleDeleteProject = async () => {
    await dispatch(deleteProject(id));
    navigate('/projects');
  };
  
  // Check if user is project owner or system admin
  const isOwnerOrAdmin = project && 
    (project.owner._id === user._id || user.roleGlobal === 'system-admin');
  
  // Check if user has manager or higher role
  const hasManagerAccess = project && (
    isOwnerOrAdmin || 
    project.members.some(member => 
      member.user._id === user._id && 
      ['owner', 'admin', 'manager'].includes(member.role)
    )
  );
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-gray-500 text-2xl font-bold">Project not found</div>
          <div className="text-gray-500 text-sm">The project you are looking for does not exist.</div>
          <div className="text-gray-500 text-sm">Please check the URL or go back to the projects page.</div>
          <div className="text-gray-500 text-sm">
            <Link to="/projects" className="text-indigo-600 hover:text-indigo-900">
              Go back to projects
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {isError && <Alert variant="danger" message={message} className="mb-4" />}
        
        {/* Project Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
                  <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                    project.visibility === 'private' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {project.visibility === 'private' ? 'Private' : 'Public'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{project.description || 'No description provided'}</p>
              </div>
              
              <div className="flex space-x-3">
                {hasManagerAccess && (
                  <Button
                    variant="secondary"
                    onClick={toggleEditModal}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    }
                  >
                    Edit
                  </Button>
                )}
                
                {isOwnerOrAdmin && (
                  <Button
                    variant="danger"
                    onClick={toggleDeleteConfirm}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center text-sm text-gray-500">
              <div className="mr-6 mb-2">
                <span className="font-medium text-gray-700">Owner:</span>{' '}
                {project.owner.name}
              </div>
              
              <div className="mr-6 mb-2">
                <span className="font-medium text-gray-700">Members:</span>{' '}
                {project.members.length}
              </div>
              
              {project.industry && (
                <div className="mr-6 mb-2">
                  <span className="font-medium text-gray-700">Industry:</span>{' '}
                  {project.industry}
                </div>
              )}
              
              <div className="mr-6 mb-2">
                <span className="font-medium text-gray-700">Created:</span>{' '}
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('pipelines')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'pipelines'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pipelines
              </button>
              
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Members
              </button>
              
              {hasManagerAccess && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Settings
                </button>
              )}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Pipelines</h3>
                  <p className="text-blue-600 text-2xl font-bold">{project.pipelines?.length || 0}</p>
                  <p className="text-blue-600 mt-1">Total pipelines</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Members</h3>
                  <p className="text-green-600 text-2xl font-bold">{project.members?.length || 0}</p>
                  <p className="text-green-600 mt-1">Team members</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">Activity</h3>
                  <p className="text-purple-600 text-2xl font-bold">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-purple-600 mt-1">Last updated</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('pipelines')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Manage Pipelines</div>
                      <div className="text-sm text-gray-500">View and configure pipelines</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('members')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Team Members</div>
                      <div className="text-sm text-gray-500">Manage project members</div>
                    </div>
                  </button>
                  
                  {hasManagerAccess && (
                    <button
                      onClick={toggleEditModal}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div className="text-left">
                        <div className="font-medium">Edit Project</div>
                        <div className="text-sm text-gray-500">Update project details</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'pipelines' && (
            <PipelinesTab projectId={id} project={project} hasManagerAccess={hasManagerAccess} />
          )}
          
          {activeTab === 'members' && (
            <MembersTab projectId={id} project={project} hasManagerAccess={hasManagerAccess} />
          )}
          
          {activeTab === 'settings' && hasManagerAccess && (
            <SettingsTab projectId={id} project={project} isOwnerOrAdmin={isOwnerOrAdmin} />
          )}
        </div>
      </div>
      
      {/* Edit Project Modal */}
      {showEditModal && (
        <EditProjectSidebar 
          isOpen={showEditModal}
          project={project} 
          onClose={toggleEditModal} 
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 border border-gray-200">
          <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Project?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete "{project.name}"? This action cannot be undone and all project data will be permanently lost.
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
                  onClick={handleDeleteProject}
                  isLoading={isLoading}
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProjectDetail;