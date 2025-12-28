"use client";

import React, { useState } from 'react';
import useFlowStore from '@/store/useFlowStore';
import { Search, Loader2, ArrowRight } from 'lucide-react';

export function InputBar() {
    const [topic, setTopic] = useState('');
    const { generateGraph, isLoading } = useFlowStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || isLoading) return;
        await generateGraph(topic);
        setTopic('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-green-500" />
                ) : (
                    <Search size={18} className="text-zinc-500" />
                )}
            </div>
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn?"
                className="block w-full rounded-lg border-none bg-[#202023] py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:ring-1 focus:ring-green-500 focus:bg-zinc-800 transition-all shadow-sm"
                disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                    type="submit"
                    disabled={!topic.trim() || isLoading}
                    className="text-zinc-600 hover:text-green-500 disabled:opacity-50 disabled:hover:text-zinc-600 transition-colors"
                >
                    <ArrowRight size={18} />
                </button>
            </div>
        </form>
    );
}
