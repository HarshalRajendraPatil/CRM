import Invitation from '../models/Invitation.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { 
  validateObjectId,
  validateMemberRole
} from '../utils/projectValidation.js';
import { 
  generateInvitationToken, 
  validateInvitationToken,
  calculateExpirationDate
} from '../utils/invitationUtils.js';
import { sendProjectInvitationEmail } from '../utils/emailService.js';
import notificationService from '../utils/notificationService.js';

// @desc    Create a new invitation
// @route   POST /api/invitations
// @access  Private (project owner, admin, or manager)
export const createInvitation = asyncHandler(async (req, res) => {
  console.log('createInvitation', req.body);
  const { email, role, message, expirationDays } = req.body;
  const projectId = req.query.projectId;

  if(email === req.user.email){
    throw new ValidationError('You cannot invite yourself');
  }
  
  // Validate required fields
  if (!projectId || !email) {
    throw new ValidationError('Project ID and email are required');
  }
  
  // Validate ObjectId
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Validate email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }
  
  // Validate role if provided
  if (role) {
    const roleValidation = validateMemberRole(role);
    if (!roleValidation.isValid) {
      throw new ValidationError(roleValidation.message);
    }
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Check if user has permission to invite members
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to invite members to this project');
  }
  
  // Check if user is already a member (need to populate members first)
  await project.populate('members.user', 'email');
  const isMember = project.members.some(
    member => {
      const memberEmail = member.user?.email?.toLowerCase();
      return memberEmail === email.toLowerCase() && member.inviteStatus === 'accepted';
    }
  );
  
  if (isMember) {
    throw new ValidationError('User is already a member of this project');
  }
  
  // Check if there's already a pending invitation for this email and project
  const existingInvitation = await Invitation.findOne({
    project: projectId,
    'invitee.email': email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
  
  if (existingInvitation) {
    throw new ValidationError('An invitation has already been sent to this email');
  }
  
  // Check if user with this email exists
  const invitedUser = await User.findOne({ email: email.toLowerCase() });
  
  // Generate invitation token
  const token = generateInvitationToken();
  
  // Calculate expiration date
  const expiration = calculateExpirationDate(expirationDays || 7);
  
  // Create invitation
  const invitation = await Invitation.create({
    project: projectId,
    inviter: req.user._id,
    invitee: {
      email: email.toLowerCase(),
      user: invitedUser ? invitedUser._id : null
    },
    role: role || 'viewer',
    status: 'pending',
    token,
    message: message || '',
    expiresAt: expiration,
    lastSentAt: new Date()
  });
  
  // Populate invitation with project and inviter details
  await invitation.populate('project', 'name description');
  await invitation.populate('inviter', 'name email profileImage');
  
  // Send invitation email
  try {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/${token}`;
    await sendProjectInvitationEmail(
      email, 
      invitationUrl, 
      project.name, 
      req.user.name, 
      message
    );
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    // Continue with the invitation creation even if email fails
  }
  
  // Create notification if the invited user exists
  if (invitedUser) {
    try {
      await notificationService.createInvitationNotification(invitation);
    } catch (error) {
      console.error('Failed to create invitation notification:', error);
      // Continue with the invitation creation even if notification creation fails
    }
  }
  
  res.status(201).json({
    success: true,
    message: 'Invitation sent successfully',
    data: { invitation }
  });
});

// @desc    Get all invitations for a project
// @route   GET /api/invitations/project/:projectId
// @access  Private (project owner, admin, or manager)
export const getProjectInvitations = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  // Validate ObjectId
  const projectValidation = validateObjectId(projectId);
  if (!projectValidation.isValid) {
    throw new ValidationError(projectValidation.message);
  }
  
  // Find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // Get invitations
  const invitations = await Invitation.find({
    project: projectId,
    status: { $in: ['pending', 'accepted', 'declined'] }
  })
    .populate('invitee.user', 'name email profileImage')
    .populate('inviter', 'name email profileImage')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: { invitations }
  });
});

// @desc    Get all invitations for current user
// @route   GET /api/invitations/me
// @access  Private
export const getUserInvitations = asyncHandler(async (req, res) => {
  // Get user's email
  const userEmail = req.user.email;
  
  // Find pending invitations for user's email
  const invitations = await Invitation.findPendingByEmail(userEmail);
  
  res.json({
    success: true,
    data: { invitations }
  });
});

// @desc    Get invitation by token
// @route   GET /api/invitations/:token
// @access  Public (but token must be valid)
export const getInvitationByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // Validate token format
  const tokenValidation = validateInvitationToken(token);
  if (!tokenValidation.isValid) {
    throw new ValidationError(tokenValidation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findByToken(token);
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if invitation is expired
  if (invitation.isExpired()) {
    throw new ValidationError('Invitation has expired');
  }
  
  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    throw new ValidationError(`Invitation has already been ${invitation.status}`);
  }
  
  res.json({
    success: true,
    data: { invitation }
  });
});

// @desc    Accept invitation
// @route   PUT /api/invitations/:token/accept
// @access  Private
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // Validate token format
  const tokenValidation = validateInvitationToken(token);
  if (!tokenValidation.isValid) {
    throw new ValidationError(tokenValidation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findByToken(token);
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if invitation is expired
  if (invitation.isExpired()) {
    throw new ValidationError('Invitation has expired');
  }
  
  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    throw new ValidationError(`Invitation has already been ${invitation.status}`);
  }
  
  // Check if the invitation email matches the authenticated user's email
  if (invitation.invitee.email.toLowerCase() !== req.user.email.toLowerCase()) {
    throw new ForbiddenError('This invitation was sent to a different email address');
  }
  
  // Update invitation status
  invitation.status = 'accepted';
  invitation.acceptedAt = new Date();
  invitation.invitee.user = req.user._id;
  await invitation.save();
  
  // Update project members
  const project = invitation.project;
  
  // Check if user is already a member
  const existingMemberIndex = project.members.findIndex(
    member => member.user && member.user.toString() === req.user._id.toString()
  );
  
  if (existingMemberIndex !== -1) {
    // Update existing member entry
    project.members[existingMemberIndex].role = invitation.role;
    project.members[existingMemberIndex].inviteStatus = 'accepted';
    project.members[existingMemberIndex].joinedAt = new Date();
  } else {
    // Add new member
    project.members.push({
      user: req.user._id,
      role: invitation.role,
      inviteStatus: 'accepted',
      invitedBy: invitation.inviter,
      invitedAt: invitation.createdAt,
      joinedAt: new Date()
    });
  }
  
  await project.save();
  
  // Update user's projectMembers array
  const userHasProject = req.user.projectMembers.some(
    m => m.project && m.project.toString() === project._id.toString()
  );

  if (!userHasProject) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        projectMembers: {
          project: project._id,
          role: invitation.role,
          joinedAt: new Date()
        }
      }
    });
  } else {
    // Update existing project entry
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { 
          'projectMembers.$[elem].role': invitation.role,
          'projectMembers.$[elem].joinedAt': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.project': project._id }]
      }
    );
  }
  
  res.json({
    success: true,
    message: 'Invitation accepted successfully',
    data: { project }
  });
});

// @desc    Decline invitation
// @route   PUT /api/invitations/:token/decline
// @access  Private
export const declineInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // Validate token format
  const tokenValidation = validateInvitationToken(token);
  if (!tokenValidation.isValid) {
    throw new ValidationError(tokenValidation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findByToken(token);
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if invitation is expired
  if (invitation.isExpired()) {
    throw new ValidationError('Invitation has expired');
  }
  
  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    throw new ValidationError(`Invitation has already been ${invitation.status}`);
  }
  
  // Check if the invitation email matches the authenticated user's email
  if (invitation.invitee.email.toLowerCase() !== req.user.email.toLowerCase()) {
    throw new ForbiddenError('This invitation was sent to a different email address');
  }
  
  // Update invitation status
  invitation.status = 'declined';
  invitation.invitee.user = req.user._id;
  await invitation.save();
  
  // Update project members if there's a pending invitation entry
  const project = invitation.project;
  const memberIndex = project.members.findIndex(
    member => 
      member.user && 
      member.user.toString() === req.user._id.toString() && 
      member.inviteStatus === 'pending'
  );
  
  if (memberIndex !== -1) {
    project.members[memberIndex].inviteStatus = 'declined';
    await project.save();
  }
  
  res.json({
    success: true,
    message: 'Invitation declined successfully'
  });
});

// @desc    Resend invitation
// @route   PUT /api/invitations/:id/resend
// @access  Private (project owner, admin, or manager)
export const resendInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findById(id)
    .populate('project')
    .populate('inviter', 'name email profileImage');
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if user has permission to resend invitation
  const project = invitation.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to resend invitations for this project');
  }
  
  // Check if invitation is already accepted/declined/revoked (can only resend pending or expired)
  if (invitation.status !== 'pending' && invitation.status !== 'expired') {
    throw new ValidationError(`Cannot resend invitation with status: ${invitation.status}`);
  }
  
  // Update invitation
  invitation.status = 'pending';
  invitation.expiresAt = calculateExpirationDate(7); // Reset to 7 days from now
  invitation.lastSentAt = new Date();
  invitation.resendCount += 1;
  
  await invitation.save();
  
  // Send invitation email
  try {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/${invitation.token}`;
    await sendProjectInvitationEmail(
      invitation.invitee.email, 
      invitationUrl, 
      project.name, 
      req.user.name,
      invitation.message
    );
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    // Continue even if email fails
  }
  
  res.json({
    success: true,
    message: 'Invitation resent successfully',
    data: { invitation }
  });
});

// @desc    Cancel invitation
// @route   PUT /api/invitations/:id/cancel
// @access  Private (project owner, admin, or manager)
export const cancelInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findById(id)
    .populate('project');
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if user has permission to cancel invitation
  const project = invitation.project;
  
  if (
    !project.hasPermission(req.user._id, 'manager') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to cancel invitations for this project');
  }
  
  // Check if invitation is already accepted/declined/cancelled
  if (invitation.status !== 'pending' && invitation.status !== 'expired') {
    throw new ValidationError(`Cannot cancel invitation with status: ${invitation.status}`);
  }
  
  // Update invitation status
  invitation.status = 'revoked';
  await invitation.save();
  
  // Remove from project members if there's a pending invitation entry
  const memberIndex = project.members.findIndex(
    member => 
      (member.user && invitation.invitee.user && member.user.toString() === invitation.invitee.user.toString()) || 
      (!member.user && member.email && member.email.toLowerCase() === invitation.invitee.email.toLowerCase())
  );
  
  if (memberIndex !== -1 && project.members[memberIndex].inviteStatus === 'pending') {
    project.members.splice(memberIndex, 1);
    await project.save();
  }
  
  res.json({
    success: true,
    message: 'Invitation cancelled successfully'
  });
});

// @desc    Delete invitation
// @route   DELETE /api/invitations/:id
// @access  Private (project owner, admin, or system-admin)
export const deleteInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId
  const validation = validateObjectId(id);
  if (!validation.isValid) {
    throw new ValidationError(validation.message);
  }
  
  // Find invitation
  const invitation = await Invitation.findById(id)
    .populate('project');
  
  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }
  
  // Check if user has permission to delete invitation
  const project = invitation.project;
  
  if (
    project.owner.toString() !== req.user._id.toString() && 
    !project.hasPermission(req.user._id, 'admin') && 
    req.user.roleGlobal !== 'system-admin'
  ) {
    throw new ForbiddenError('You do not have permission to delete invitations for this project');
  }
  
  // Delete invitation
  await Invitation.findByIdAndDelete(id);
  
  res.json({
    success: true,
    message: 'Invitation deleted successfully'
  });
});

export default {
  createInvitation,
  getProjectInvitations,
  getUserInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  cancelInvitation,
  deleteInvitation
};