'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import Header from '@/components/organisms/Header';
import MainCard from '@/components/organisms/MainCard';
import { Node, Edge } from '@xyflow/react';
import SummaryCard from '@/components/organisms/SummaryCard';
import MindMapDisplay from '@/components/organisms/MindMapDisplay';
import { mockNodes, mockEdges, mockSummary, longTextMock } from '@/data/mockData';

export default function HomePage() {

  // Initialize state with the mock data
  const [text, setText] = useState(longTextMock);
  const [summary, setSummary] = useState<string[]>(mockSummary);
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [edges, setEdges] = useState<Edge[]>(mockEdges);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const generateSummary = () => {
    const ideas = text.split(/[.\n]/).filter(s => s.trim() !== '').slice(0, 6);
    setSummary(ideas);
    generateMindMap(ideas);
  };

  const generateMindMap = (ideas: string[]) => {
    const newNodes: Node[] = [
      {
        id: '1',
        type: 'input',
        data: { label: 'Main Topic' },
        position: { x: 300, y: 50 },
      },
    ];

    const newEdges: Edge[] = [];

    ideas.forEach((idea, index) => {
      const xPos = 200 + index * 150 * Math.cos(index);
      const yPos = 200 + index * 150 * Math.sin(index);
      const nodeId = `node-${index + 2}`;

      newNodes.push({
        id: nodeId,
        data: { label: idea.trim() },
        position: { x: xPos, y: yPos },
        style: {
          backgroundColor: `hsl(${index * 60}, 70%, 80%)`,
          borderRadius: '9999px',
          padding: '10px 20px',
        },
      });

      newEdges.push({
        id: `edge-${index + 2}`,
        source: '1',
        target: nodeId,
        animated: true,
        style: { stroke: `hsl(${index * 60}, 70%, 50%)` },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const downloadImage = () => {
    if (flowContainerRef.current) {
      toPng(flowContainerRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'mind-map.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Error downloading image', err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <Header />
      <div className="w-full max-w-5xl space-y-8">
        <MainCard
          text={text}
          onTextChange={(e) => setText(e.target.value)}
          onGenerate={generateSummary}
          onDownload={downloadImage}
          isMapGenerated={nodes.length > 0}
        />
        {summary.length > 0 && <SummaryCard summary={summary} />}
        <MindMapDisplay ref={flowContainerRef} nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}