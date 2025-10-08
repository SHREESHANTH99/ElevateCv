import React from 'react';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 border-indigo-500`}
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
export default LoadingSpinner;
