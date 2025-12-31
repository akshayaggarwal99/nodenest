import React, { useState } from 'react';
import { Menu, Save, Check, LayoutGrid, Settings, MessageSquare } from 'lucide-react';
import useFlowStore from '@/store/useFlowStore';
import { InputBar } from '@/components/input/InputBar';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { cn } from '@/lib/utils';

export function Header() {
    const { toggleSidebar, saveSession, nodes, chatOpen, toggleChat, settingsOpen, toggleSettings, setSettingsOpen } = useFlowStore();
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        const title = nodes.find(n => n.data.isRoot)?.data.label || "Untitled Graph";
        await saveSession(title);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-5 z-30 shrink-0 relative">
            {/* Left Section: Logo + Toggle */}
            <div className="flex items-center gap-4 md:gap-6">
                <div
                    onClick={toggleSidebar}
                    className="flex items-center gap-2.5 cursor-pointer group"
                >
                    <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
                        <LayoutGrid size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white hidden md:block">NodeNest</span>
                </div>
                {/* Hamburger only visible on desktop when needed */}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors hidden md:block"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-1 max-w-2xl mx-2 md:mx-6">
                <InputBar />
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 md:gap-3">
                <button
                    onClick={toggleChat}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        chatOpen ? "text-green-400 bg-green-500/10" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                    title="Toggle Chat"
                >
                    <MessageSquare size={20} />
                </button>
                <button
                    onClick={toggleSettings}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        settingsOpen ? "text-green-400 bg-green-500/10" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                >
                    <Settings size={20} />
                </button>
                <div className="w-px h-6 bg-zinc-800 mx-1 hidden md:block" />
                <a
                    href="https://github.com/akshayaggarwal99/nodenest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden md:block"
                >
                    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                </a>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-sm font-medium text-zinc-300 transition-colors"
                >
                    {saved ? <Check size={16} className="text-green-500" /> : <Save size={16} />}
                    <span className="hidden md:inline">{saved ? "Saved" : "Save"}</span>
                </button>
            </div>
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </header>
    );
}
