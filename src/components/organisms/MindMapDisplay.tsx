"use client";

import React, { forwardRef } from "react";
import {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface MindMapDisplayProps {
  nodes: Node[];
  edges: Edge[];
}

const MindMapDisplay = forwardRef<HTMLDivElement, MindMapDisplayProps>(
  ({ nodes, edges }, ref) => {
    return (
      <div
        className="w-full h-[600px] rounded-xl shadow-lg bg-white overflow-hidden"
        ref={ref}
      >
        {nodes.length > 0 ? (
          <ReactFlow nodes={nodes} edges={edges}>
            <MiniMap />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            Generate a mind map to see it here.
          </div>
        )}
      </div>
    );
  }
);

MindMapDisplay.displayName = "MindMapDisplay";

export default MindMapDisplay;
