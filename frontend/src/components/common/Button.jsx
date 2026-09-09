// frontend/src/components/common/Button.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponen Button modern.
 * Variant: primary (forest green), secondary (outline), danger, ghost.
 * Ukuran: sm, md, lg.
 * Properti loading menampilkan spinner.
 */
export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  className = '', 
  icon = null, // FontAwesome icon object (opsional)
  children, 
  disabled,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full',
    secondary: 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:scale-105 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 rounded-full',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin className="text-current" />
      ) : (
        icon && <FontAwesomeIcon icon={icon} className="text-current" />
      )}
      {children}
    </button>
  );
}   