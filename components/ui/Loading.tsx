import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'spinner') {
    return (
      <div className={`inline-block ${className}`}>
        <svg
          className={`animate-spin ${sizeClasses[size]} text-primary-600`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} bg-primary-600 rounded-full animate-pulse`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full bg-primary-600 rounded-full animate-pulse" />
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center gap-4">
      <Loading size="lg" />
      {message && <p className="text-gray-700 font-medium">{message}</p>}
    </div>
  </div>
);
