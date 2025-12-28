import { NextResponse } from 'next/server';
import { getSessions, saveSession, deleteSession } from '@/lib/storage';

export async function GET() {
    const sessions = await getSessions();
    const metadata = sessions.map(({ id, title, createdAt, updatedAt }) => ({
        id,
        title,
        createdAt,
        updatedAt,
    }));
    return NextResponse.json(metadata);
}

export async function POST(req: Request) {
    try {
        const sessionData = await req.json();

        if (!sessionData.id || !sessionData.title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await saveSession(sessionData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save session:", error);
        return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing session id" }, { status: 400 });
        }

        await deleteSession(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete session:", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}
