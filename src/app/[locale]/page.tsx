"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import Header from "@/components/organisms/Header";
import MainCard from "@/components/organisms/MainCard";
import { Node, Edge } from "@xyflow/react";
import SummaryCard from "@/components/organisms/SummaryCard";
import MindMapDisplay from "@/components/organisms/MindMapDisplay";

export default function HomePage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.key_points || []);
      setNodes(data.mindmap?.nodes || []);
      setEdges(data.mindmap?.edges || []);
    } catch (err: unknown) {
      console.error("Error generating summary/mindmap:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (flowContainerRef.current) {
      toPng(flowContainerRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "mind-map.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading image", err);
          setError("Failed to download image.");
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <Header />
      <div className="w-full max-w-5xl space-y-8">
        {isLoading ? (
          <div className="w-full max-w-5xl flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="text-red-500 text-center p-4 rounded bg-red-100">
                {error}
              </div>
            )}
            <MainCard
              text={text}
              onTextChange={(e) => setText(e.target.value)}
              onGenerate={generateSummary}
              onDownload={downloadImage}
              isMapGenerated={nodes.length > 0}
            />
            {summary.length > 0 && <SummaryCard summary={summary} />}
            <MindMapDisplay
              ref={flowContainerRef}
              nodes={nodes}
              edges={edges}
            />
          </>
        )}
      </div>
    </div>
  );
}
