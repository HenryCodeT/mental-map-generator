import React from "react";

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxLength?: number;
}

const Textarea = ({
  value,
  onChange,
  placeholder,
  maxLength,
}: TextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength && e.target.value.length > maxLength) {
      return;
    }
    onChange(e);
  };

  return (
    <div className="relative">
      <textarea
        className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="absolute bottom-2 right-4 text-sm text-gray-500">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default Textarea;
