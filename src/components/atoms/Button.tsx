import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 font-semibold rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;