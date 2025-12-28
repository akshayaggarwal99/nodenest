import { geminiVisionModel, geminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history, currentTopic, image, documentContext, existingLabels } = await req.json();

        const docContextStr = documentContext
            ? `\n\n## Reference Document\nThe user has uploaded a document. Use this as context:\n---\n${documentContext.substring(0, 15000)}\n---\n`
            : '';

        // Show AI what's already in the notebook to prevent duplicates
        const existingLabelsStr = existingLabels && existingLabels.length > 0
            ? `\n\n## CONCEPTS ALREADY IN NOTEBOOK\n${existingLabels.map((l: string) => `• ${l}`).join('\n')}\n\nNEVER reuse these exact labels. Create unique, specific variations instead.\n`
            : '';

        // Professional prompt crafted with educational psychology principles
        const systemPrompt = `
# Role & Context
You are an expert Socratic tutor teaching "${currentTopic || 'the topic'}". You employ evidence-based learning techniques including scaffolding, elaborative interrogation, and spaced retrieval practice.

# Core Teaching Philosophy
- **Socratic Method**: Guide through questions, never lecture
- **Zone of Proximal Development**: Match complexity to demonstrated understanding
- **Active Recall**: End every response with a retrieval question
- **Conceptual Chunking**: One concept at a time, building on prior knowledge

# Mandatory Response Structure

1. **Acknowledgment** (1 sentence): Validate their answer
2. **Bridge Explanation** (1-2 sentences): Connect to the next concept using analogies
3. **Retrieval Question**: A thoughtful question that tests understanding

Then append:

---GRAPH_ACTION---
{JSON object - ONLY when they demonstrate understanding}

---QUICK_REPLIES---
["Correct Answer", "Common Misconception", "Ask to Explain"]

# When to Add to Notebook (GRAPH_ACTION)

✅ ADD when user:
- Answers correctly ("Yes", "Right", "Got it")
- Shows genuine understanding (restates concept in own words)
- Makes a correct inference

❌ DO NOT ADD when user:
- Just asks a question
- Says "tell me more" (explore first, add after they understand)
- Gives wrong answer (guide them first)

# GRAPH_ACTION Schema

{
  "type": "add_node",
  "label": "Unique Concept Name (2-4 words)",
  "description": "2-3 sentences with: definition + analogy + significance",
  "emoji": "Relevant single emoji",
  "parentLabel": "Existing concept this builds upon (if applicable)"
}

## Label Guidelines
- Must be UNIQUE - check existing concepts above
- Specific, not generic (e.g., "Attention Weights" not "Attention")
- Match the concept's granularity

## Parent Label Guidelines
- **PREFER BROAD BRANCHING**: Connect new major concepts to the Main Topic (Root) or high-level categories.
- **Avoid Deep Chains**: Only parent to the immediate previous node if it represents a strict sub-detail or specific example.
- **Structure**: Aim for a balanced tree (Root → Many Branches), not a single long line.
- Use explicit \`parentLabel\` to control this structure.

# Image Generation (imagePrompt field)

Include imagePrompt ONLY for concepts that are:
- **Structural**: architecture diagrams, system components
- **Spatial**: relationships, hierarchies, comparisons
- **Process-based**: step-by-step flows, transformations
- **Abstract requiring visualization**: embeddings, latent spaces

SKIP imagePrompt for:
- Simple definitions
- Historical facts
- Procedures without visual component
- Concepts explainable through text/analogy

When included, format: "Simple flat diagram of [specific visual], clean educational style"

# Quick Replies Design

Always provide 3 options:
1. **Correct continuation** - confirms understanding, moves forward
2. **Productive misconception** - common error that teaches when addressed
3. **Clarification request** - "Can you explain differently?" variant

# Psychological Techniques Employed

- **Elaborative Interrogation**: "Why do you think...?"
- **Interleaving**: Connect to previously learned concepts
- **Desirable Difficulties**: Make them work for the answer
- **Dual Coding**: Visual + verbal when appropriate
- **Retrieval Strength**: Questions that require active memory, not recognition

# Response Quality Checklist

□ Under 100 words in explanation
□ Ends with genuine question (not rhetorical)
□ Uses concrete analogy
□ Bold key terminology
□ Quick replies are substantive, not "Yes/No"
${existingLabelsStr}${docContextStr}
`;

        let responseText: string;

        if (image) {
            const imagePart = {
                inlineData: {
                    data: image.split(',')[1],
                    mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg'
                }
            };
            const prompt = `${systemPrompt}\n\nUser message: ${message}\n\n[User shared an image - analyze it]`;
            const result = await geminiVisionModel.generateContent([prompt, imagePart]);
            responseText = result.response.text();
        } else {
            const chatSession = geminiModel.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Understood. I will: employ Socratic questioning, add to notebook only when understanding is demonstrated, use unique labels, include imagePrompt only for truly visual concepts, and always end with retrieval questions and substantive quick replies." }] },
                    ...(history || [])
                ],
            });
            const result = await chatSession.sendMessage(message);
            responseText = result.response.text();
        }

        console.log("Raw AI response:", responseText);

        // Store original for parsing
        const originalText = responseText;

        // Parse GRAPH_ACTION and QUICK_REPLIES together
        let graphAction = null;
        let quickReplies: string[] = [];

        if (originalText.includes('---GRAPH_ACTION---')) {
            const graphSplit = originalText.split('---GRAPH_ACTION---');
            responseText = graphSplit[0].trim();  // Clean response is before GRAPH_ACTION
            const afterGraph = graphSplit[1] || '';

            // Extract QUICK_REPLIES from after the graph action
            if (afterGraph.includes('---QUICK_REPLIES---')) {
                const qrSplit = afterGraph.split('---QUICK_REPLIES---');
                const qrSection = qrSplit[1];
                if (qrSection) {
                    try {
                        const startIdx = qrSection.indexOf('[');
                        const endIdx = qrSection.lastIndexOf(']');
                        if (startIdx !== -1 && endIdx > startIdx) {
                            quickReplies = JSON.parse(qrSection.substring(startIdx, endIdx + 1));
                            console.log("Parsed quick replies:", quickReplies);
                        }
                    } catch (e) {
                        console.error("Failed to parse quick replies:", e);
                    }
                }
            }

            // Extract graph action JSON
            try {
                const qrIndex = afterGraph.indexOf('---QUICK_REPLIES---');
                const graphSection = qrIndex > -1 ? afterGraph.substring(0, qrIndex) : afterGraph;
                const jsonMatch = graphSection.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    graphAction = JSON.parse(jsonMatch[0]);
                    console.log("Parsed graph action:", graphAction);
                }
            } catch (e) {
                console.error("Failed to parse graph action:", e);
            }
        } else if (originalText.includes('---QUICK_REPLIES---')) {
            // No graph action, just quick replies
            const qrSplit = originalText.split('---QUICK_REPLIES---');
            responseText = qrSplit[0].trim();
            if (qrSplit[1]) {
                try {
                    const startIdx = qrSplit[1].indexOf('[');
                    const endIdx = qrSplit[1].lastIndexOf(']');
                    if (startIdx !== -1 && endIdx > startIdx) {
                        quickReplies = JSON.parse(qrSplit[1].substring(startIdx, endIdx + 1));
                        console.log("Parsed quick replies (no graph):", quickReplies);
                    }
                } catch (e) {
                    console.error("Failed to parse quick replies:", e);
                }
            }
        }

        console.log("=== RETURNING TO FRONTEND ===", {
            hasResponse: !!responseText,
            hasGraphAction: !!graphAction,
            quickRepliesCount: quickReplies.length,
            quickReplies
        });

        return NextResponse.json({
            response: responseText,
            graphAction,
            quickReplies
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}
