// frontend/src/components/common/Card.jsx
import React from 'react';

/**
 * Card modern dengan rounded-2xl, shadow, dan efek hover halus.
 */
export default function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card border border-gray-100 p-6 ${
        hover ? 'hover:shadow-xl hover:border-primary-200 transform hover:-translate-y-1 transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}