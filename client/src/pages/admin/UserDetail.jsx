import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { 
  getUserById, 
  updateUser, 
  deleteUser, 
  resetUserPassword, 
  toggleUserStatus, 
  reset, 
  clearUser 
} from '../../store/userSlice';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user: currentUser } = useSelector((state) => state.auth);
  const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.users);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
    roleGlobal: '',
    isActive: true,
    isEmailVerified: false
  });
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is system admin
  const isSystemAdmin = currentUser?.roleGlobal === 'system-admin';

  useEffect(() => {
    if (isSystemAdmin && id) {
      dispatch(getUserById(id));
    } else if (!isSystemAdmin) {
      navigate('/dashboard');
    }
    
    // Clean up on unmount
    return () => {
      dispatch(clearUser());
      dispatch(reset());
    };
  }, [isSystemAdmin, id, dispatch, navigate]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        roleGlobal: user.roleGlobal || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
        isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : false
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (isSuccess && message) {
      setSuccessMessage(message || 'Operation completed successfully');
      
      // Reset success state after showing message
      setTimeout(() => {
        dispatch(reset());
        setSuccessMessage('');
      }, 3000);
    }
  }, [isSuccess, message, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch(updateUser({ id, userData: formData }))
      .unwrap()
      .then(() => {
        setSuccessMessage('User updated successfully');
        setEditMode(false);
      });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    dispatch(resetUserPassword({ id, passwordData: { newPassword } }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Password reset successfully');
        setResetPasswordMode(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      });
  };

  const handleToggleStatus = async () => {
    dispatch(toggleUserStatus(id))
      .unwrap()
      .then(() => {
        setSuccessMessage(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      });
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    dispatch(deleteUser(id))
      .unwrap()
      .then(() => {
        navigate('/admin/dashboard', { state: { message: 'User deleted successfully' } });
      });
  };

  // If not system admin, redirect (handled in useEffect)
  if (!isSystemAdmin) {
    return null;
  }

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="flex space-x-2">
          <Link to="/admin/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
      
      {isError && (
        <Alert 
          variant="error" 
          title="Error" 
          message={message} 
          className="mb-6" 
          onClose={() => dispatch(reset())}
        />
      )}
      
      {successMessage && (
        <Alert 
          variant="success" 
          title="Success" 
          message={successMessage} 
          className="mb-6" 
          onClose={() => setSuccessMessage('')}
        />
      )}
      
      {user && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* User header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-20 w-20">
                {user?.profileImage ? (
                  <img 
                    className="h-20 w-20 rounded-full object-cover" 
                    src={user.profileImage} 
                    alt={user.name} 
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-medium text-xl">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user?.roleGlobal === 'system-admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.roleGlobal === 'system-admin' ? 'System Admin' : 'User'}
                  </span>
                  <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user?.isEmailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              <div className="ml-auto">
                {!editMode && !resetPasswordMode && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="primary" 
                      onClick={() => setEditMode(true)}
                    >
                      Edit User
                    </Button>
                    <Button 
                      variant={user?.isActive ? "warning" : "success"} 
                      onClick={handleToggleStatus}
                    >
                      {user?.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={handleDeleteUser}
                      disabled={currentUser._id === user?._id}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* User details */}
          <div className="p-6">
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  
                  <Input
                    label="Profile Image URL"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      name="roleGlobal"
                      value={formData.roleGlobal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={currentUser._id === user?._id}
                    >
                      <option value="user">User</option>
                      <option value="system-admin">System Admin</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input
                          id="isActive"
                          name="isActive"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={handleChange}
                          disabled={currentUser._id === user?._id}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                          Active
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="isEmailVerified"
                          name="isEmailVerified"
                          type="checkbox"
                          checked={formData.isEmailVerified}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isEmailVerified" className="ml-2 block text-sm text-gray-700">
                          Email Verified
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : resetPasswordMode ? (
              <form onSubmit={handleResetPassword}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    required
                    error={passwordError}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    required
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setResetPasswordMode(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isLoading}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="mt-1">{user?.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="mt-1">{user?.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="mt-1">{user?.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="mt-1">{user?.roleGlobal === 'system-admin' ? 'System Admin' : 'User'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Status</p>
                        <p className="mt-1">{user?.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Verification</p>
                        <p className="mt-1">{user?.isEmailVerified ? 'Verified' : 'Not Verified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Login</p>
                        <p className="mt-1">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Created</p>
                        <p className="mt-1">{new Date(user?.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="primary" 
                      onClick={() => setEditMode(true)}
                    >
                      Edit User
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setResetPasswordMode(true)}
                    >
                      Reset Password
                    </Button>
                    <Button 
                      variant={user?.isActive ? "warning" : "success"} 
                      onClick={handleToggleStatus}
                    >
                      {user?.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={handleDeleteUser}
                      disabled={currentUser._id === user?._id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail; 