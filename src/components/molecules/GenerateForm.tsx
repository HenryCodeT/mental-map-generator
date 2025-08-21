import React from "react";
import Button from "../atoms/Button";
import Textarea from "../atoms/Textarea";

interface GenerateFormProps {
  text: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  maxLength?: number;
}

const GenerateForm = ({
  text,
  onTextChange,
  onGenerate,
  maxLength,
}: GenerateFormProps) => {
  return (
    <div className="flex flex-col space-y-6">
      <Textarea
        value={text}
        onChange={onTextChange}
        placeholder="Paste your long text here..."
        maxLength={maxLength}
      />
      <Button
        onClick={onGenerate}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Generate Mind Map
      </Button>
    </div>
  );
};

export default GenerateForm;
