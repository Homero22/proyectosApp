import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };
  
  const sizes = {
    default: 'px-4 py-2 rounded-xl font-medium',
    sm: 'px-3 py-1.5 rounded-lg text-sm font-medium',
    icon: 'p-2 rounded-xl'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
