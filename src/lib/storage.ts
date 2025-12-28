import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export interface Session {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    nodes: any[];
    edges: any[];
    chatHistory: any[];
}

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

export async function getSessions(): Promise<Session[]> {
    await ensureDataDir();
    try {
        const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or error reading, return empty array
        return [];
    }
}

export async function saveSession(session: Session): Promise<void> {
    const sessions = await getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
        sessions[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
        sessions.unshift({ ...session, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export async function getSessionById(id: string): Promise<Session | undefined> {
    const sessions = await getSessions();
    return sessions.find((s) => s.id === id);
}

export async function deleteSession(id: string): Promise<void> {
    const sessions = await getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(filtered, null, 2));
}
