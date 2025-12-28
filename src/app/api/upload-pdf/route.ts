import { NextResponse } from "next/server";
// @ts-ignore - pdf-parse doesn't have types
import pdf from "pdf-parse";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse PDF
        const data = await pdf(buffer);

        // Extract text and basic info
        const result = {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
            // Truncate text if too long (for context window limits)
            truncatedText: data.text.length > 50000 ? data.text.substring(0, 50000) + "\n\n[Document truncated due to length...]" : data.text
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("PDF parsing error:", error);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }
}
