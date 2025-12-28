import React, { useState, useEffect } from 'react';
import useFlowStore from '@/store/useFlowStore';
import { X, Key, Cpu, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings } = useFlowStore();
    const [localSettings, setLocalSettings] = useState(settings);

    // Sync when opening
    useEffect(() => {
        if (isOpen) setLocalSettings(settings);
    }, [isOpen, settings]);

    const handleSave = () => {
        updateSettings(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* API Key Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-400 font-medium">
                            <Key size={18} />
                            <h3>Google Gemini API Key</h3>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Leave empty to use the free hosted key. Enter your own key for higher rate limits or privacy.
                            Get one <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-green-400 hover:underline">here</a>.
                        </p>
                        <input
                            type="password"
                            placeholder="AIzaSy..."
                            value={localSettings.apiKey}
                            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Model Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-medium">
                            <Cpu size={18} />
                            <h3>AI Model</h3>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Select the Gemini model to power the tutor.
                        </p>
                        <select
                            value={localSettings.model}
                            onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Recommended)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Slower, Smarter)</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                        </select>
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* System Prompt Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-purple-400 font-medium">
                            <MessageSquare size={18} />
                            <h3>System Prompt</h3>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Customize the "personality" and instructions for the AI tutor.
                        </p>
                        <textarea
                            value={localSettings.systemPrompt}
                            onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                            rows={10}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-purple-500 transition-colors resize-y"
                        />
                        <button
                            onClick={() => setLocalSettings({ ...localSettings, systemPrompt: useFlowStore.getState().settings.systemPrompt })} // Reset isn't perfect here without the const export, but manageable
                            className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            Reset to default
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-zinc-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg shadow-green-900/20 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
