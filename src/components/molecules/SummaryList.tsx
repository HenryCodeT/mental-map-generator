import React from 'react';

interface SummaryListProps {
  summary: string[];
}

const SummaryList = ({ summary }: SummaryListProps) => {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-600">
      {summary.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  );
};

export default SummaryList;