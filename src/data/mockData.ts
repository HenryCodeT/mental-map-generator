// Import necessary types from the @xyflow/react library
import { Node, Edge } from '@xyflow/react';

// Sample text for the textarea
export const longTextMock = `Renewable energy is energy that is collected from renewable resources, which are naturally replenished on a human timescale. It is considered a clean alternative to fossil fuels. There are several types of renewable energy, such as solar, wind, hydroelectric, geothermal, and biomass.

Solar energy uses radiation from the sun to generate electricity through photovoltaic panels. It is one of the most well-known and fast-growing sources. Wind energy harnesses the force of the wind with turbines. It is used in both large wind farms and smaller, individual installations.

Hydroelectric energy is based on the movement of water in rivers and reservoirs. It is a very stable and reliable source of energy. Geothermal energy extracts heat from the Earth's interior for heating and electricity generation. Finally, biomass energy uses organic matter to produce energy.`;

// Mock summary points for the summary card
export const mockSummary = [
  'Renewable energy sources are naturally replenished.',
  'Main types include solar, wind, hydroelectric, geothermal, and biomass.',
  'Solar energy: uses photovoltaic panels to convert sunlight into electricity.',
  'Wind energy: harnesses wind power with turbines.',
  'Hydroelectric energy: relies on water movement for stable energy.',
  'Other sources: Geothermal (Earth\'s heat) and biomass (organic matter).'
];

// Mock nodes for the mind map
export const mockNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Renewable Energy' },
    position: { x: 300, y: 50 },
    style: {
      backgroundColor: `hsl(210, 70%, 80%)`,
      borderRadius: '9999px',
      padding: '10px 20px',
    },
  },
  {
    id: 'node-2',
    data: { label: 'Solar Energy' },
    position: { x: 100, y: 150 },
    style: {
      backgroundColor: `hsl(40, 70%, 80%)`,
      borderRadius: '9999px',
      padding: '10px 20px',
    },
  },
  {
    id: 'node-3',
    data: { label: 'Wind Energy' },
    position: { x: 500, y: 150 },
    style: {
      backgroundColor: `hsl(150, 70%, 80%)`,
      borderRadius: '9999px',
      padding: '10px 20px',
    },
  },
  {
    id: 'node-4',
    data: { label: 'Hydroelectric' },
    position: { x: 100, y: 350 },
    style: {
      backgroundColor: `hsl(240, 70%, 80%)`,
      borderRadius: '9999px',
      padding: '10px 20px',
    },
  },
  {
    id: 'node-5',
    data: { label: 'Geothermal & Biomass' },
    position: { x: 500, y: 350 },
    style: {
      backgroundColor: `hsl(300, 70%, 80%)`,
      borderRadius: '9999px',
      padding: '10px 20px',
    },
  },
];

// Mock edges for the mind map
export const mockEdges: Edge[] = [
  { id: 'edge-1', source: '1', target: 'node-2', animated: true, style: { stroke: 'hsl(40, 70%, 50%)' } },
  { id: 'edge-2', source: '1', target: 'node-3', animated: true, style: { stroke: 'hsl(150, 70%, 50%)' } },
  { id: 'edge-3', source: '1', target: 'node-4', animated: true, style: { stroke: 'hsl(240, 70%, 50%)' } },
  { id: 'edge-4', source: '1', target: 'node-5', animated: true, style: { stroke: 'hsl(300, 70%, 50%)' } },
];