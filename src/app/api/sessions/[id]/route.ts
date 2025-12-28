import { NextResponse } from 'next/server';
import { getSessionById, deleteSession } from '@/lib/storage';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSessionById(id);

    if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await deleteSession(id);
    return NextResponse.json({ success: true });
}
