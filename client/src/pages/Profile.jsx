import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword, removeProfileImage, reset } from '../store/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import MainLayout from '../layouts/MainLayout';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    variant: 'info',
    message: '',
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Form validation state
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  // Handle API response
  useEffect(() => {
    if (isError) {
      setAlert({
        show: true,
        variant: 'error',
        message: message || 'An error occurred',
      });
    }

    if (isSuccess) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'Profile updated successfully',
      });

      // Reset password form if password was changed
      if (activeTab === 'password') {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, dispatch, activeTab]);

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (profileForm.profileImage && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(profileForm.profileImage)) {
      errors.profileImage = 'Please enter a valid image URL';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (validateProfileForm()) {
      dispatch(updateProfile(profileForm));
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (validatePasswordForm()) {
      dispatch(changePassword(passwordForm));
    }
  };

  // Handle profile image removal
  const handleRemoveProfileImage = () => {
    dispatch(removeProfileImage());
    setProfileForm((prev) => ({
      ...prev,
      profileImage: '',
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white">
                    <span className="text-3xl font-semibold text-indigo-600">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-indigo-100">{user?.email}</p>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.roleGlobal === 'system-admin' ? 'System Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* Alert */}
          {alert.show && (
            <div className="p-4">
              <Alert
                variant={alert.variant}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
              />
            </div>
          )}

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      error={profileErrors.name}
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      error={profileErrors.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {profileForm.profileImage ? (
                          <img
                            src={profileForm.profileImage}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-gray-400">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          name="profileImage"
                          value={profileForm.profileImage}
                          onChange={handleProfileChange}
                          placeholder="Enter image URL (http://example.com/image.jpg)"
                          error={profileErrors.profileImage}
                          className="mb-0"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a URL to an image (JPG, PNG, GIF, WEBP)
                        </p>
                      </div>
                    </div>
                    {profileForm.profileImage && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={handleRemoveProfileImage}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    error={passwordErrors.currentPassword}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    error={passwordErrors.newPassword}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    error={passwordErrors.confirmPassword}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile; 