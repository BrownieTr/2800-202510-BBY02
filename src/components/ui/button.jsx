import React from 'react';

export default function Button({ 
  children, 
  className = '',
  type = 'button',
  onClick,
  ...props 
}) {
  return (
    <button  
      className={`px-3 py-1 rounded-xl bg-blue-600 text-white font-semibold 
      hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 
      shadow hover:shadow-lg transition duration-300 ease-in-out ${className}`}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
