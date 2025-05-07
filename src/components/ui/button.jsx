import React from 'react';

export default function Button({ 
  children, 
  type = 'button',
  variant = 'primary',
  size = 'medium',
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}