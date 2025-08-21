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

export async function POST(req: NextRequest) {
  console.log("POST request received.");
  try {
    const { text } = await req.json();
    console.log("Received text from request body:", "text");

    if (!text) {
      console.error("Error: Text is required in the request body.");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

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

    // 5. Configure strict JSON prompt
    console.log("Defining ChatPromptTemplate...");

    const prompt = ChatPromptTemplate.fromTemplate(`
You are an assistant that receives some text and must return a valid JSON with two fields:

1. "key_points": an array of 5 to 7 main ideas or key concepts.
2. "mindmap": an object with two arrays:
    - "nodes": each node must have {{ "id": string, "data": {{ "label": string }}, "position": {{ "x": number, "y": number }} }}
    - "edges": each edge must have {{ "id": string, "source": string, "target": string }}

Output ONLY valid JSON, with no explanation or extra text.

JSON structure example:

{{
  "key_points": ["idea1", "idea2", "..."],
  "mindmap": {{
    "nodes": [
      {{ "id": "1", "data": {{ "label": "Main Topic" }}, "position": {{ "x": 0, "y": 0 }} }},
      {{ "id": "2", "data": {{ "label": "Subtopic A" }}, "position": {{ "x": 200, "y": -100 }} }}
    ],
    "edges": [
      {{ "id": "e1-2", "source": "1", "target": "2" }}
    ]
  }}
}}

Context: {context}
Question: {input}
`);


    console.log("Prompt template defined.");

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
      input: "Generate the JSON with the key points and a mindmap from the provided text.",
    });
    console.log("Chain invocation complete. Result object:", result);

    // 9. Safely get the model output
    console.log("Accessing the 'answer' field from the result...");
    const rawOutput = result.answer;

    if (!rawOutput) {
      console.error("Error: The 'answer' field was not found in the model output.");
      return NextResponse.json({ error: "No text returned from model" }, { status: 500 });
    }
    console.log("Raw model output (before parsing):", rawOutput);

    // 10. Parse JSON
    let output;
    try {
      console.log("Attempting to parse JSON...");
      output = JSON.parse(rawOutput as string);
      console.log("JSON parsing successful.");
      console.log("Generated output:", output);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return NextResponse.json({ error: "Invalid JSON output" }, { status: 500 });
    }

    console.log("Returning final JSON response.");
    return NextResponse.json(output);
  } catch (error) {
    console.error("An unhandled error occurred in the API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}