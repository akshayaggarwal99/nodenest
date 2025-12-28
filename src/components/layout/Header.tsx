import React, { useState } from 'react';
import { Menu, Save, Check, LayoutGrid } from 'lucide-react';
import useFlowStore from '@/store/useFlowStore';
import { InputBar } from '@/components/input/InputBar';

export function Header() {
    const { toggleSidebar, saveSession, nodes } = useFlowStore();
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
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
                        <LayoutGrid size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">NodeNest</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-1 max-w-2xl mx-6">
                <InputBar />
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-sm font-medium text-zinc-300 transition-colors"
                >
                    {saved ? <Check size={16} className="text-green-500" /> : <Save size={16} />}
                    <span>{saved ? "Saved" : "Save"}</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300 ring-2 ring-transparent hover:ring-green-500 cursor-pointer transition-all">
                    U
                </div>
            </div>
        </header>
    );
}
