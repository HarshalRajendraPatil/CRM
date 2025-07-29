import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendVerification, reset } from '../../store/authSlice';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [resendStatus, setResendStatus] = useState('idle'); // idle, sending, sent, error
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Get token from URL query parameter
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    // If token is present, verify email
    if (token) {
      dispatch(verifyEmail(token));
    }

    return () => {
      dispatch(reset());
    };
  }, [token, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      setVerificationStatus('success');
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
    } else if (isError) {
      setVerificationStatus('error');
    }
  }, [isSuccess, isError, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = () => {
    setResendStatus('sending');
    dispatch(resendVerification())
      .unwrap()
      .then(() => {
        setResendStatus('sent');
        setCountdown(60); // 60 seconds cooldown
      })
      .catch(() => {
        setResendStatus('error');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        {verificationStatus === 'pending' && token && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">Verifying your email...</p>
            <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <Alert
            variant="success"
            title="Email Verified!"
            message="Your email has been successfully verified. You can now access all features of our platform. You will be redirected to your dashboard shortly."
          />
        )}

        {verificationStatus === 'error' && (
          <>
            <Alert
              variant="error"
              title="Verification Failed"
              message={message || "The verification link is invalid or has expired. Please request a new verification link."}
            />
            <div className="mt-6">
              <Button
                variant="primary"
                fullWidth
                onClick={handleResendVerification}
                isLoading={resendStatus === 'sending'}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Resend Verification (${countdown}s)`
                  : 'Resend Verification Email'}
              </Button>
            </div>
          </>
        )}

        {!token && (
          <>
            <Alert
              variant="info"
              title="Verification Required"
              message="Please check your email for a verification link. If you haven't received the email, you can request a new verification link."
            />
            <div className="mt-6">
              <Button
                variant="primary"
                fullWidth
                onClick={handleResendVerification}
                isLoading={resendStatus === 'sending'}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Resend Verification (${countdown}s)`
                  : 'Resend Verification Email'}
              </Button>
            </div>
          </>
        )}

        {resendStatus === 'sent' && (
          <Alert
            variant="success"
            title="Email Sent!"
            message="A new verification email has been sent to your email address. Please check your inbox and spam folder."
          />
        )}

        {resendStatus === 'error' && (
          <Alert
            variant="error"
            title="Error"
            message="Failed to send verification email. Please try again later."
          />
        )}

        <div className="mt-4 text-center">
          <Link to="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 