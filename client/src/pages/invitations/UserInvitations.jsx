import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserInvitations, reset } from '../../store/invitationSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const UserInvitations = () => {
  const dispatch = useDispatch();
  
  const { userInvitations, isLoading, isError, message } = useSelector(
    (state) => state.invitations
  );
  
  useEffect(() => {
    dispatch(getUserInvitations());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Invitations</h1>
        
        {isError && <Alert variant="danger" message={message} className="mb-4" />}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : userInvitations && userInvitations.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {userInvitations.map((invitation) => (
                <li key={invitation._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {invitation.project.logo ? (
                          <img 
                            src={invitation.project.logo} 
                            alt={invitation.project.name}
                            className="h-12 w-12 rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-medium text-lg">
                              {invitation.project.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-900">{invitation.project.name}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Invited by {invitation.inviter.name}</span>
                          <span className="mx-2">•</span>
                          <span>
                            Role: <span className="font-medium">{invitation.role.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                      <Link to={`/invitations/${invitation.token}`}>
                        <Button variant="primary" size="sm">
                          View Invitation
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {invitation.project.description && (
                    <p className="mt-2 text-sm text-gray-600 ml-16">{invitation.project.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pending invitations</h3>
            <p className="mt-1 text-gray-500">You don't have any pending project invitations.</p>
            <div className="mt-6">
              <Link to="/projects">
                <Button variant="primary">View My Projects</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserInvitations;