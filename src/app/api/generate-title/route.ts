import { geminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userInput } = await req.json();

        const prompt = `Create a short title (2-4 words) from this user request. Preserve the specific focus, not just the general topic.

User said: "${userInput}"

Examples:
- "teach me about quantum computing" → "Quantum Computing"
- "explain how react hooks work" → "React Hooks"
- "teach me how to talk, behave and lead like a leader in group settings" → "Group Leadership Skills"
- "help me understand machine learning for image recognition" → "ML Image Recognition"
- "how to invest in stock market for beginners" → "Stock Market Basics"

Keep the SPECIFIC focus (e.g., "group settings", "for beginners", "image recognition") in the title when present.

Return ONLY the short title (2-5 words), nothing else:`;

        const result = await geminiModel.generateContent(prompt);
        const title = result.response.text().trim().replace(/^["']|["']$/g, '');

        return NextResponse.json({ title });
    } catch (error) {
        console.error("Title generation error:", error);
        // Fallback to simple extraction
        return NextResponse.json({ title: "New Topic" });
    }
}
