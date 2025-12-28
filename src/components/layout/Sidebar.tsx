"use client";

import React, { useState, useEffect } from 'react';
import useFlowStore, { SessionData } from '@/store/useFlowStore';
import { History, Plus, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/settings/SettingsModal';

export function Sidebar() {
    const { sidebarOpen, storedSessions, loadSessions, loadSession, deleteSession, createNewSession, currentSessionId } = useFlowStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Don't trigger loadSession
        if (confirm('Delete this session?')) {
            await deleteSession(id);
        }
    };

    return (
        <aside className={cn(
            "bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 shrink-0 z-20",
            sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}>
            {/* New Nest Button */}
            <div className="p-5 pb-2">
                <button
                    onClick={createNewSession}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded-lg shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                    <Plus size={20} />
                    New Nest
                </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                <div>
                    <div className="px-2 mb-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Recent Sessions</div>
                    <div className="space-y-1">
                        <div className="space-y-1">
                            {Object.keys(storedSessions).length === 0 ? (
                                <div className="px-3 py-2.5 text-sm text-zinc-500 italic">No saved sessions</div>
                            ) : (
                                // Sort by most recently updated
                                Object.values(storedSessions)
                                    .sort((a: SessionData, b: SessionData) => b.updatedAt - a.updatedAt)
                                    .map((session: SessionData) => (
                                        <div
                                            key={session.id}
                                            onClick={() => loadSession(session.id)}
                                            className={cn(
                                                "group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all text-left cursor-pointer",
                                                currentSessionId === session.id
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                            )}
                                        >
                                            <History size={18} className="shrink-0" />
                                            <span className="truncate flex-1">{session.title}</span>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                                title="Delete session"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-zinc-700 shadow-sm">
                        <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-300">NodeNest Pro</span>
                        <span className="text-[10px] text-zinc-600">v1.2.0 Beta</span>
                    </div>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </aside>
    );
}
