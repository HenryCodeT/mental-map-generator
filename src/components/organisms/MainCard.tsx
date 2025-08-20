import React from 'react';
import GenerateForm from '../molecules/GenerateForm';
import DownloadButton from '../molecules/DownloadButton';

interface MainCardProps {
  text: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  onDownload: () => void;
  isMapGenerated: boolean;
}

const MainCard = ({ text, onTextChange, onGenerate, onDownload, isMapGenerated }: MainCardProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col space-y-6">
      <GenerateForm
        text={text}
        onTextChange={onTextChange}
        onGenerate={onGenerate}
      />
      {isMapGenerated && (
        <div className="flex justify-end">
          <DownloadButton onClick={onDownload} />
        </div>
      )}
    </div>
  );
};

export default MainCard;