"use client";

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatPanel } from '@/components/chat/ChatPanel';
import useFlowStore from '@/store/useFlowStore';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { sidebarOpen, toggleSidebar } = useFlowStore();

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            <Header />
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar />

                {/* Sidebar Toggle Button (Floating or integrated) */}
                <div className="absolute top-4 left-4 z-10">
                    {!sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="p-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <PanelLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                        </button>
                    )}
                </div>

                <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
                    {children}
                </main>

                {/* Chat Panel placeholder will go here */}
                <ChatPanel />
            </div>
        </div>
    );
}
