import React from 'react';

const Container = ({ 
  children, 
  className = '', 
  size = 'default' 
}) => {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
    full: 'max-w-none'
  };

  return (
    <div className={`
      ${sizes[size]} 
      mx-auto 
      px-4 
      sm:px-6 
      lg:px-8 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Container;
