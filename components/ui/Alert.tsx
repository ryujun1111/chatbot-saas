import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variants = {
    success: {
      container: 'bg-success-50 border-success-200',
      icon: CheckCircle,
      iconColor: 'text-success-600',
      titleColor: 'text-success-900',
      textColor: 'text-success-700',
    },
    error: {
      container: 'bg-error-50 border-error-200',
      icon: XCircle,
      iconColor: 'text-error-600',
      titleColor: 'text-error-900',
      textColor: 'text-error-700',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200',
      icon: AlertCircle,
      iconColor: 'text-warning-600',
      titleColor: 'text-warning-900',
      textColor: 'text-warning-700',
    },
    info: {
      container: 'bg-primary-50 border-primary-200',
      icon: Info,
      iconColor: 'text-primary-600',
      titleColor: 'text-primary-900',
      textColor: 'text-primary-700',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`relative p-4 rounded-lg border ${config.container} ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold mb-1 ${config.titleColor}`}>{title}</h3>
          )}
          <div className={`text-sm ${config.textColor}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-70`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
