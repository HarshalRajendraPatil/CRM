import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getInvitationByToken, acceptInvitation, declineInvitation, reset } from '../../store/invitationSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const InvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { invitation, isLoading, isError, message } = useSelector(
    (state) => state.invitations
  );
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getInvitationByToken(token));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, token]);
  
  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/invitations/${token}`);
      return;
    }
    
    if (invitation && invitation.invitee.email !== user.email) {
      setError(`This invitation was sent to ${invitation.invitee.email}, but you are logged in as ${user.email}. Please log in with the correct account.`);
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      await dispatch(acceptInvitation(token)).unwrap();
      setSuccess('Invitation accepted successfully! Redirecting to project...');
      
      // Redirect to project after a short delay
      setTimeout(() => {
        navigate(`/projects/${invitation.project._id}`);
      }, 2000);
    } catch (err) {
      setError(err || 'Failed to accept invitation');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDecline = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/invitations/${token}`);
      return;
    }
    
    if (invitation && invitation.invitee.email !== user.email) {
      setError(`This invitation was sent to ${invitation.invitee.email}, but you are logged in as ${user.email}. Please log in with the correct account.`);
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      await dispatch(declineInvitation(token)).unwrap();
      setSuccess('Invitation declined successfully!');
      
      // Redirect to projects after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err) {
      setError(err || 'Failed to decline invitation');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : isError ? (
            <div className="p-8">
              <Alert 
                variant="danger" 
                title="Error" 
                message={message || 'Failed to load invitation'} 
              />
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/projects')}
                >
                  Go to Projects
                </Button>
              </div>
            </div>
          ) : invitation ? (
            <>
              <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-indigo-800">Project Invitation</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    You've been invited to join a project
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {invitation.inviter.name} has invited you to join their project on CRM Platform.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <div className="flex items-start">
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
                      <h4 className="text-lg font-medium text-gray-900">{invitation.project.name}</h4>
                      {invitation.project.description && (
                        <p className="mt-1 text-sm text-gray-600">{invitation.project.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700">Your Role</h4>
                  <p className="mt-1 text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invitation.role === 'admin' ? 'bg-red-100 text-red-800' :
                      invitation.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.role === 'sales_executive' ? 'bg-green-100 text-green-800' :
                      invitation.role === 'support_executive' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invitation.role.replace('_', ' ')}
                    </span>
                  </p>
                </div>
                
                {invitation.message && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700">Personal Message</h4>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-700">
                      {invitation.message}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700">Invitation Details</h4>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Invited by:</span>{' '}
                      <span className="text-gray-900">{invitation.inviter.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Invited on:</span>{' '}
                      <span className="text-gray-900">{new Date(invitation.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires on:</span>{' '}
                      <span className="text-gray-900">{new Date(invitation.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {error && <Alert variant="danger" message={error} className="mb-4" />}
                {success && <Alert variant="success" message={success} className="mb-4" />}
                
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button
                    variant="secondary"
                    onClick={handleDecline}
                    disabled={isProcessing || invitation.status !== 'pending'}
                  >
                    Decline Invitation
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAccept}
                    isLoading={isProcessing}
                    disabled={isProcessing || invitation.status !== 'pending'}
                  >
                    Accept Invitation
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8">
              <Alert 
                variant="danger" 
                title="Invitation Not Found" 
                message="The invitation you're looking for doesn't exist or has expired." 
              />
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/projects')}
                >
                  Go to Projects
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InvitationPage;