import { useSelector } from 'react-redux';

/**
 * Custom hook to check user's access level in the current project
 * @returns {Object} - Object containing access flags for different roles
 */
export const useProjectAccess = () => {
  const { project } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  // Check if user is the project owner
  const isOwner = project && project.owner?._id === user?._id;

  // Get user's role in the project
  const getUserRole = () => {
    if (!project || !user) return null;
    
    if (isOwner) return 'owner';
    
    const member = project.members?.find(
      member => member.user?._id === user._id && member.inviteStatus === 'accepted'
    );
    
    return member ? member.role : null;
  };

  const userRole = getUserRole();

  // Check if user has sales executive access or higher
  const hasSalesExecutiveAccess = project && user && (
    isOwner ||
    project.members?.some(member => 
      member.user?._id === user._id && 
      member.inviteStatus === 'accepted' &&
      ['owner', 'admin', 'manager', 'sales_executive'].includes(member.role)
    )
  );

  // Check if user has support executive access or higher
  const hasSupportExecutiveAccess = project && user && (
    isOwner ||
    project.members?.some(member => 
      member.user?._id === user._id && 
      member.inviteStatus === 'accepted' &&
      ['owner', 'admin', 'manager', 'support_executive'].includes(member.role)
    )
  );

  // Check if user has admin access or higher
  const hasAdminAccess = project && user && (
    isOwner ||
    project.members?.some(member => 
      member.user?._id === user._id && 
      member.inviteStatus === 'accepted' &&
      ['owner', 'admin'].includes(member.role)
    )
  );

  // Check if user has manager access or higher
  const hasManagerAccess = project && user && (
    isOwner ||
    project.members?.some(member => 
      member.user?._id === user._id && 
      member.inviteStatus === 'accepted' &&
      ['owner', 'admin', 'manager'].includes(member.role)
    )
  );

  // Check if user has viewer access or higher (basically any project member)
  const hasViewerAccess = project && user && (
    isOwner ||
    project.members?.some(member => 
      member.user?._id === user._id && 
      member.inviteStatus === 'accepted' &&
      ['owner', 'admin', 'manager', 'sales_executive', 'support_executive', 'viewer'].includes(member.role)
    )
  );

  return {
    isOwner,
    userRole,
    hasSalesExecutiveAccess: !!hasSalesExecutiveAccess,
    hasSupportExecutiveAccess: !!hasSupportExecutiveAccess,
    hasAdminAccess: !!hasAdminAccess,
    hasManagerAccess: !!hasManagerAccess,
    hasViewerAccess: !!hasViewerAccess,
    hasProjectAccess: !!hasViewerAccess // Alias for viewer access
  };
};

export default useProjectAccess;

