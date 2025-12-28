import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});

// Vision model for image understanding
export const geminiVisionModel = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
});

export const geminiThinkingModel = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
});
