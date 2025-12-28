import { geminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string(),
  parentNodeId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, parentNodeId } = generateSchema.parse(body);

    const prompt = `
      You are an expert tutor creating a structured learning path for a student who knows nothing about this topic.
      The topic is: "${topic}".
      ${parentNodeId ? `This is a deeper dive into the specific concept: "${parentNodeId}".` : "This is the very beginning. Start with the absolute basics."}

      Your goal is to explain this concept clearly and sequentially.
      Generate 3 to 4 nodes that form a logical "Chapter 1" to understand this.
      
      Rules:
      1. First node MUST be a clear, simple definition (ELI5 style).
      2. Subsequent nodes should be key components explained simply.
      4. INCLUDE A MERMAID DIAGRAM code (graph TD or sequenceDiagram) for each node.
      IMPORTANT: When writing the diagram, ALWAYS quote the node labels to handle special characters.
      Example: A["Concept (Detail)"] --> B["Other Concept"]
      
      Return ONLY valid JSON in the following format:
      {
        "nodes": [
          { 
            "label": "1. What is X?", 
            "description": "Simple 2-sentence explanation.",
            "diagram": "graph TD; A[\"Concept\"] --> B[\"Explanation (with context)\"];"
          }
        ]
      }
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Cleanup potential markdown fences if model outputs them despite instructions
    const jsonStr = responseText.replace(/```json\n?|\n?```/g, "").trim();

    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Graph generation error:", error);
    return NextResponse.json({ error: "Failed to generate graph" }, { status: 500 });
  }
}
