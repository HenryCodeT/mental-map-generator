import React from 'react';
import Button from '../atoms/Button';

interface DownloadButtonProps {
  onClick: () => void;
}

const DownloadButton = ({ onClick }: DownloadButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm px-6 py-2 transform-none hover:scale-100"
    >
      Download as PNG
    </Button>
  );
};

export default DownloadButton;