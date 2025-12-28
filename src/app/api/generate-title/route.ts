import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userInput } = await req.json();

        // Dynamic config from headers
        const headers = req.headers;
        const apiKey = headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const modelName = headers.get('x-gemini-model') || "gemini-2.0-flash-exp";

        if (!apiKey) {
            return NextResponse.json({ error: "No API Key provided" }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

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

        const result = await model.generateContent(prompt);
        const title = result.response.text().trim().replace(/^["']|["']$/g, '');

        return NextResponse.json({ title });
    } catch (error) {
        console.error("Title generation error:", error);
        // Fallback to simple extraction
        return NextResponse.json({ title: "New Topic" });
    }
}
