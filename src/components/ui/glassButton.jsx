import React from 'react';

export default function GlassButton({ 
  children, 
  className = "",
  type = 'button',
  onClick,
  isFeature = false,
  ...props 
}) {
  // Determine which base class to use based on isFeature prop
  const baseClass = isFeature ? "feature-button" : "glass-button";
  
  return (
    <button  
      className={`${baseClass} ${className}`}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}