// frontend/src/components/common/SkeletonLoading.jsx
import React from 'react';

export default function SkeletonLoading({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
  );
}