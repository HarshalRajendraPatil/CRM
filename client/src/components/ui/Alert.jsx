import React from 'react';

const variants = {
  success: {
    container: 'bg-emerald-50 border-emerald-500',
    icon: 'text-emerald-500',
    title: 'text-emerald-800',
    text: 'text-emerald-700',
  },
  error: {
    container: 'bg-rose-50 border-rose-500',
    icon: 'text-rose-500',
    title: 'text-rose-800',
    text: 'text-rose-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-500',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    text: 'text-amber-700',
  },
  info: {
    container: 'bg-sky-50 border-sky-500',
    icon: 'text-sky-500',
    title: 'text-sky-800',
    text: 'text-sky-700',
  },
};

const icons = {
  success: (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

const Alert = ({
  variant = 'info',
  title,
  message,
  className = '',
  onClose,
  showIcon = true,
  ...props
}) => {
  const variantClasses = variants[variant] || variants.info;

  return (
    <div
      className={`border-l-4 p-4 mb-4 rounded-md ${variantClasses.container} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        {showIcon && (
          <div className={`flex-shrink-0 mr-3 ${variantClasses.icon}`}>
            {icons[variant]}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${variantClasses.title}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`text-sm mt-1 ${variantClasses.text}`}>
              {message}
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 rounded-md p-1.5 inline-flex ${variantClasses.text} hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none`}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 