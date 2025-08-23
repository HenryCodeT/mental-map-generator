import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

// 1. Embeddings Configuration
console.log("Initializing OpenAIEmbeddings...");
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. LLM Model Configuration
console.log("Initializing ChatOpenAI model...");
const model = new ChatOpenAI({
  model: "gpt-4o", // Or 'gpt-3.5-turbo'
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0, // For more predictable output
  modelKwargs: { response_format: { type: "json_object" } },
});

console.log("Model initialized with JSON response format.");

// Function to calculate node range based on text length (max 4000 chars)
function calculateNodeRange(textLength: number): { minNodes: number; maxNodes: number; targetNodes: number } {
  // Define categories based on text length (0-4000 characters)
  if (textLength < 200) {
    // Minimum text (titles or very short phrases)
    return { minNodes: 3, maxNodes: 5, targetNodes: 4 };
  } else if (textLength < 600) {
    // Very short text (brief paragraph)
    return { minNodes: 5, maxNodes: 8, targetNodes: 6 };
  } else if (textLength < 1200) {
    // Short text (1-2 paragraphs)
    return { minNodes: 8, maxNodes: 12, targetNodes: 10 };
  } else if (textLength < 2000) {
    // Medium text (3-4 paragraphs)
    return { minNodes: 12, maxNodes: 18, targetNodes: 15 };
  } else if (textLength < 3000) {
    // Long text (5-6 paragraphs)
    return { minNodes: 18, maxNodes: 25, targetNodes: 22 };
  } else {
    // Very long text (7+ paragraphs, up to 4000 chars)
    return { minNodes: 25, maxNodes: 35, targetNodes: 30 };
  }
}

// Function to calculate depth levels based on text size (max 4000 chars)
function calculateDepthLevels(textLength: number): number {
  if (textLength < 400) return 2;    // Main topic + 1 level
  if (textLength < 1000) return 2;   // Main topic + 1 level
  if (textLength < 1800) return 3;   // Main topic + 2 levels
  if (textLength < 2800) return 3;   // Main topic + 2 levels
  return 4;                          // Main topic + 3 levels for long texts
}

// Function to validate input text
function validateText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: "Text is required" };
  }

  if (text.length > 4000) {
    return { isValid: false, error: "Text exceeds maximum length of 4000 characters" };
  }

  // Validate that text has substantial content (more than 5 words)
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 5) {
    return { isValid: false, error: "Text is too short (minimum 5 words required)" };
  }

  return { isValid: true };
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export async function POST(req: NextRequest) {
  console.log("POST request received.");
  try {
    const { text } = await req.json();

    // Validate input text
    const validation = validateText(text);
    if (!validation.isValid) {
      console.error(`Validation error: ${validation.error}`);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log(`Received text length: ${text.length} characters`);

    // Calculate dynamic ranges based on text length
    const textLength = text.length;
    const { minNodes, maxNodes, targetNodes } = calculateNodeRange(textLength);
    const depthLevels = calculateDepthLevels(textLength);

    console.log(`Calculated node range: ${minNodes}-${maxNodes} nodes (target: ${targetNodes})`);
    console.log(`Calculated depth levels: ${depthLevels}`);

    // 3. Split text into chunks
    console.log("Splitting text into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${docs.length} documents.`);

    // 4. Create in-memory vector store
    console.log("Creating in-memory vector store from documents...");
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    console.log("Vector store created successfully.");

    // 5. Configure dynamic prompt based on text length
    console.log("Defining dynamic ChatPromptTemplate...");

    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert mindmap generator. Analyze the provided text and create a comprehensive hierarchical mindmap structure.

TEXT ANALYSIS:
- Text length: ${textLength} characters
- Expected node range: ${minNodes}-${maxNodes} nodes (target: ${targetNodes})
- Expected hierarchy depth: ${depthLevels} levels

REQUIREMENTS:
1. Extract the main key points/concepts from the text
2. Create a detailed mindmap with approximately ${targetNodes} nodes (range: ${minNodes}-${maxNodes})
3. Organize in a logical hierarchy with ${depthLevels} levels of depth
4. Ensure proper parent-child relationships in the structure
5. Adjust the level of detail based on the text length and complexity

OUTPUT FORMAT: Return ONLY valid JSON with this exact structure:
{{
  "key_points": ["main idea 1", "main idea 2", ...],
  "mindmap": {{
    "nodes": [
      {{ "id": "1", "data": {{ "label": "Main Topic" }}, "position": {{ "x": 0, "y": 0 }} }},
      {{ "id": "2", "data": {{ "label": "Subtopic A" }}, "position": {{ "x": 200, "y": -100 }} }},
      {{ "id": "3", "data": {{ "label": "Detail A1" }}, "position": {{ "x": 400, "y": -150 }} }}
    ],
    "edges": [
      {{ "id": "e1-2", "source": "1", "target": "2" }},
      {{ "id": "e2-3", "source": "2", "target": "3" }}
    ]
  }}
}}

POSITIONING GUIDELINES:
- Main topic at center (x:0, y:0)
- First-level subtopics: x ±200-300, y values spaced appropriately
- Deeper levels: increment x by 200-300 for each level
- Space nodes vertically to avoid overlap (y spacing: 80-120px)
- For ${targetNodes} nodes, distribute evenly in the space

CONTENT GUIDELINES:
- For very short texts (<600 chars): focus only on main concepts
- For medium texts (600-2000 chars): include some details
- For long texts (2000-4000 chars): include comprehensive details and examples
- Ensure nodes are descriptive but concise (3-8 words max)
- Maintain logical relationships between concepts
- Prioritize the most important information from the text

Context: {context}
Input: {input}
`);

    console.log("Dynamic prompt template defined.");

    // 6. Create a document chain
    console.log("Creating combine documents chain...");
    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });
    console.log("Document chain created.");

    // 7. Create a retrieval chain
    console.log("Creating retrieval chain...");
    const retriever = vectorStore.asRetriever();
    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain: documentChain,
    });
    console.log("Retrieval chain created.");

    // 8. Execute the chain
    console.log("Invoking the retrieval chain...");
    const result = await retrievalChain.invoke({
      input: `Generate a mindmap with appropriate detail level for this ${textLength}-character text. Create approximately ${targetNodes} nodes organized in ${depthLevels} hierarchical levels. Focus on the most important concepts.`,
    });
    console.log("Chain invocation complete.");

    // 9. Safely get the model output
    console.log("Accessing the 'answer' field from the result...");
    const rawOutput = result.answer;

    if (!rawOutput) {
      console.error("Error: The 'answer' field was not found in the model output.");
      return NextResponse.json({ error: "No text returned from model" }, { status: 500 });
    }

    // 10. Parse JSON
    let output;
    try {
      console.log("Attempting to parse JSON...");
      output = JSON.parse(rawOutput as string);
      console.log("JSON parsing successful.");
      console.log(`Generated ${output.mindmap?.nodes?.length || 0} nodes and ${output.mindmap?.edges?.length || 0} edges`);

      // Validate that the number of nodes is within the expected range
      const actualNodes = output.mindmap?.nodes?.length || 0;
      if (actualNodes < minNodes || actualNodes > maxNodes) {
        console.warn(`Warning: Generated ${actualNodes} nodes, expected ${minNodes}-${maxNodes}`);
      }

      interface MindmapNode {
        id: string;
        data: { label: string };
        position: { x: number; y: number };
        style?: { backgroundColor: string; color: string; opacity: number };
      }

      if (output.mindmap && output.mindmap.nodes) {
        output.mindmap.nodes = output.mindmap.nodes.map((node: MindmapNode) => {
          const randomBgColor = getRandomColor();

          const textColor = '#333333';

          return {
            ...node,
            style: {
              backgroundColor: randomBgColor,
              color: textColor,
              opacity: 0.4
            }
          };
        });
        console.log("Colors and opacity added to nodes.");
      }

    } catch (err) {
      console.error("Error parsing JSON:", err);
      console.log("Raw output that failed to parse:", rawOutput.substring(0, 200));
      return NextResponse.json({ error: "Invalid JSON output" }, { status: 500 });
    }

    console.log("Returning final JSON response.");
    return NextResponse.json(output);
  } catch (error) {
    console.error("An unhandled error occurred in the API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}