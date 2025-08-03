import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProjectMember, removeProjectMember } from '../../../store/projectSlice';
import { 
  getProjectInvitations, 
  createInvitation, 
  resendInvitation, 
  cancelInvitation 
} from '../../../store/invitationSlice';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import InviteMemberSidebar from '../members/InviteMemberSidebar';

const MembersTab = ({ projectId, project, hasManagerAccess }) => {
  const [showInviteSidebar, setShowInviteSidebar] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [newRole, setNewRole] = useState('');
  
  const dispatch = useDispatch();
  
  const { isLoading: projectLoading, isError: projectError, message: projectMessage } = useSelector(
    (state) => state.projects
  );
  
  const { invitations, isLoading: invitationLoading, isError: invitationError, message: invitationMessage } = useSelector(
    (state) => state.invitations
  );
  
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getProjectInvitations(projectId));
  }, [dispatch, projectId]);
  
  const toggleInviteSidebar = () => {
    setShowInviteSidebar(!showInviteSidebar);
  };
  
  const toggleRoleModal = (member = null) => {
    setSelectedMember(member);
    if (member) {
      setNewRole(member.role);
    }
    setShowRoleModal(!showRoleModal);
  };
  
  const toggleRemoveConfirm = (member = null) => {
    setSelectedMember(member);
    setShowRemoveConfirm(!showRemoveConfirm);
  };
  
  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };
  
  const handleUpdateRole = async () => {
    if (selectedMember && newRole) {
      await dispatch(updateProjectMember({
        projectId,
        memberId: selectedMember.user._id,
        memberData: { role: newRole }
      }));
      toggleRoleModal();
    }
  };
  
  const handleRemoveMember = async () => {
    if (selectedMember) {
      console.log(selectedMember);
      await dispatch(removeProjectMember({
        projectId,
        memberId: selectedMember.user._id
      }));
      toggleRemoveConfirm();
    }
  };
  
  const handleResendInvitation = async (invitationId) => {
    await dispatch(resendInvitation(invitationId));
  };
  
  const handleCancelInvitation = async (invitationId) => {
    await dispatch(cancelInvitation(invitationId));
  };
  
  const isLoading = projectLoading || invitationLoading;
  const isError = projectError || invitationError;
  const errorMessage = projectMessage || invitationMessage;
  
  // Check if user is project owner or system admin
  const isOwnerOrAdmin = project && 
    (project.owner._id === user._id || user.roleGlobal === 'system-admin');
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
        {hasManagerAccess && (
          <Button 
            variant="primary"
            onClick={toggleInviteSidebar}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            }
          >
            Invite Member
          </Button>
        )}
      </div>
      
      {isError && <Alert variant="danger" message={errorMessage} className="mb-4" />}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Active Members */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Active Members</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Users with access to this project
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      {hasManagerAccess && (
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project && project.members.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {member.user.profileImage ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={member.user.profileImage} 
                                  alt={member.user.name} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {member.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.user.name}
                                {project.owner._id === member.user._id && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                            member.role === 'admin' ? 'bg-red-100 text-red-800' :
                            member.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                            member.role === 'sales_executive' ? 'bg-green-100 text-green-800' :
                            member.role === 'support_executive' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        {hasManagerAccess && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {/* Don't show actions for the owner or for yourself if you're not the owner */}
                            {project.owner._id !== member.user._id && (isOwnerOrAdmin || user._id !== member.user._id) && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => toggleRoleModal(member)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Change Role
                                </button>
                                <button
                                  onClick={() => toggleRemoveConfirm(member)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Pending Invitations */}
          {hasManagerAccess && invitations && invitations.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Invitations</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Here you can see all the invitations sent to your project. This includes pending, accepted, declined, expired, cancelled, and removed invitations.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invitations.map((invitation) => (
                        <tr key={invitation._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invitation.invitee.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              Invited by: {invitation.inviter.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invitation.role === 'admin' ? 'bg-red-100 text-red-800' :
                              invitation.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                              invitation.role === 'sales_executive' ? 'bg-green-100 text-green-800' :
                              invitation.role === 'support_executive' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invitation.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invitation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invitation.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {(invitation.status === 'pending' || invitation.status === 'declined') && <button
                                onClick={() => handleResendInvitation(invitation._id)}
                                className="text-indigo-600 hover:text-indigo-900"
                                disabled={invitationLoading}
                              >
                                Resend
                              </button>}
                              {invitation.status === 'pending' && <button
                                onClick={() => handleCancelInvitation(invitation._id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={invitationLoading}
                              >
                                Cancel
                              </button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Invite Member Sidebar */}
      <InviteMemberSidebar 
        projectId={projectId}
        isOpen={showInviteSidebar}
        onClose={toggleInviteSidebar}
      />
      
      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 border border-gray-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Change Role</h2>
              <button
                onClick={() => toggleRoleModal()}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700">
                  Change role for <span className="font-medium">{selectedMember.user.name}</span>
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="support_executive">Support Executive</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => toggleRoleModal()}
                  disabled={projectLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateRole}
                  isLoading={projectLoading}
                >
                  Update Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && selectedMember && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 border border-gray-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Remove Member?</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to remove <span className="font-medium">{selectedMember.user.name}</span> from this project?
              </p>
              
              <div className="flex justify-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => toggleRemoveConfirm()}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleRemoveMember}
                  isLoading={projectLoading}
                >
                  Remove Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersTab;