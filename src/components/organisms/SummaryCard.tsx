import React from 'react';
import SummaryList from '../molecules/SummaryList';

interface SummaryCardProps {
  summary: string[];
}

const SummaryCard = ({ summary }: SummaryCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Points Summary</h2>
      <SummaryList summary={summary} />
    </div>
  );
};

export default SummaryCard;