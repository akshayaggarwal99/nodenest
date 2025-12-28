import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        // Get headers for custom config
        const headers = req.headers;
        const apiKey = headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        // Image model is usually fixed but enabling override just in case, default to specific image model
        const modelName = "gemini-2.5-flash-image"; // 2.5 has specific flash image model

        if (!apiKey) {
            return NextResponse.json({ error: "No API Key provided" }, { status: 401 });
        }

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const imageModel = genAI.getGenerativeModel({ model: modelName });

        // Generate educational diagram
        const enhancedPrompt = `Create a simple, clean educational diagram: ${prompt}. Style: minimalist, flat design, infographic, clear shapes, no text labels needed.`;

        const result = await imageModel.generateContent({
            contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
            generationConfig: {
                responseModalities: ["image", "text"],
            } as any,
        });

        const response = result.response;

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if ((part as any).inlineData) {
                const imageData = (part as any).inlineData;
                const base64Image = `data:${imageData.mimeType};base64,${imageData.data}`;
                return NextResponse.json({ imageUrl: base64Image });
            }
        }

        return NextResponse.json({ error: "No image generated" }, { status: 500 });
    } catch (error) {
        console.error("Image generation error:", error);
        return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }
}
