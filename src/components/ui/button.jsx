import React from 'react';

export default function Button({ 
  children, 
  className,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  onClick,
  ...props 
}) {
  return (
    <button  
      className="tw-px-4 tw-py-2 tw-rounded-2xl tw-bg-blue-600 
      tw-text-white tw-font-semibold tw-hover:bg-blue-700 tw-focus:outline-none 
      tw-focus:ring-2 tw-focus:ring-blue-400 tw-shadow-md tw-transition 
      tw-duration-300"
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}