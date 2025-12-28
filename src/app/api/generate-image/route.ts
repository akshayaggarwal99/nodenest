import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

// Gemini image generation model
const imageModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

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
