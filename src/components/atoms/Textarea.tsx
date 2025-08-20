import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

const Textarea = ({ value, onChange, placeholder }: TextareaProps) => {
  return (
    <textarea
      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default Textarea;