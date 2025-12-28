"use client";

import React, { useState, useRef, useEffect } from 'react';
import useFlowStore from '@/store/useFlowStore';
import { cn } from '@/lib/utils';
import { Send, Bot, User as UserIcon, X, Loader2, Image as ImageIcon, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    quickReplies?: string[];
    image?: string;
}

export function ChatPanel() {
    const { chatOpen, toggleChat, chatHistory, setChatHistory, documentContext, setDocumentContext } = useFlowStore();
    const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeQuickReplies, setActiveQuickReplies] = useState<string[]>([]);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isInitialMount = useRef(true);

    // Sync from store to local (only on external changes like loading a session)
    useEffect(() => {
        // Compare by length and last message to detect external changes
        if (chatHistory.length !== messages.length ||
            (chatHistory.length > 0 && messages.length > 0 &&
                chatHistory[chatHistory.length - 1]?.text !== messages[messages.length - 1]?.text)) {
            setMessages(chatHistory);
        }
    }, [chatHistory]);

    // Sync from local to store (debounced, only after initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Only sync if messages actually changed from user interaction
        const timer = setTimeout(() => {
            setChatHistory(messages);
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeQuickReplies]);

    // Auto-resize textarea
    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => setPendingImage(event.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPdf(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.text) {
                setDocumentContext(data.truncatedText || data.text);
                setPdfName(file.name);
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: `📄 I've loaded **${file.name}** (${data.numPages} pages). I'll use this document to help you learn. What would you like to understand from it?`
                }]);
            }
        } catch (error) {
            console.error("PDF upload failed:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't read that PDF. Please try again." }]);
        } finally {
            setUploadingPdf(false);
        }
    };

    const sendMessage = async (userMessage: string, image?: string | null) => {
        if ((!userMessage.trim() && !image) || isLoading) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            text: userMessage || "What can you tell me about this image?",
            image: image || undefined
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = '44px';
        setPendingImage(null);
        setActiveQuickReplies([]);
        setIsLoading(true);

        try {
            const validHistory = messages.filter((_, i) => i > 0 || messages[0].role !== 'model');
            const nodes = useFlowStore.getState().nodes;

            // If canvas is empty, create root node first, then continue chat
            if (nodes.length === 0 && userMessage.trim()) {
                await useFlowStore.getState().generateGraph(userMessage);
                setIsLoading(false);
                return; // generateGraph creates the root and opens chat, done
            }

            const rootNode = nodes.find(n => n.data?.isRoot);
            const currentTopic = rootNode?.data?.label || 'the topic';

            // Get existing labels so AI can avoid duplicates and create proper sub-branches
            const existingLabels = nodes.map(n => n.data?.label).filter(Boolean);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage || "Analyze this image and help me understand it.",
                    currentTopic,
                    image: image || undefined,
                    documentContext: useFlowStore.getState().documentContext,
                    existingLabels,  // Pass existing labels to prevent duplicates
                    history: validHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
                }),
            });

            const data = await response.json();
            console.log("Chat response data:", { quickReplies: data.quickReplies, hasResponse: !!data.response });
            if (data.response) {
                setMessages(prev => [...prev, { role: 'model', text: data.response, quickReplies: data.quickReplies }]);
                // Always update quick replies - clear old ones first, then set new if available
                setActiveQuickReplies(data.quickReplies || []);
                if (data.quickReplies?.length) {
                    console.log("Setting quick replies:", data.quickReplies);
                }
            }
            if (data.graphAction) useFlowStore.getState().addNodesFromChat(data.graphAction);
        } catch (error) {
            console.error("Chat failed:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input, pendingImage);
    };

    const handleQuickReply = (reply: string) => sendMessage(reply);



    return (
        <div className={cn(
            "bg-zinc-900 flex flex-col shrink-0 shadow-xl z-[60] transition-all duration-300",
            // Mobile: Full screen fixed overlay
            "fixed inset-0 w-full h-full md:relative md:inset-auto md:h-auto",
            // Desktop: Side panel with transition
            "md:w-[440px] md:border-l md:border-zinc-800",
            !chatOpen && "hidden md:flex md:w-0 md:border-l-0 overflow-hidden"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Bot size={16} />
                    </div>
                    <span className="font-bold text-sm text-white">Learning Assistant</span>
                </div>
                <button onClick={toggleChat} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#121214]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' && "flex-row-reverse")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                            msg.role === 'user'
                                ? "bg-zinc-700 text-zinc-300"
                                : "bg-green-500 text-black shadow-sm"
                        )}>
                            {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={cn(
                            "px-4 py-3.5 rounded-2xl text-[13.5px] max-w-[90%] leading-relaxed",
                            msg.role === 'user'
                                ? "bg-zinc-800 text-zinc-200 rounded-tr-sm border border-zinc-700"
                                : "bg-green-500 text-black rounded-tl-sm shadow-sm font-medium"
                        )}>
                            {msg.image && (
                                <img src={msg.image} alt="Uploaded" className="rounded-lg mb-3 max-h-40 object-cover" />
                            )}
                            {msg.role === 'model' ? (
                                <ReactMarkdown
                                    components={{
                                        strong: ({ children }) => <span className="font-bold border-b border-black/20">{children}</span>,
                                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                        em: ({ children }) => <em className="italic font-serif font-bold">{children}</em>,
                                        code: ({ children }) => <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono text-xs font-bold mx-0.5">{children}</code>,
                                        ul: ({ children }) => <ul className="bg-black/5 rounded-lg p-3 my-3 border border-black/5 space-y-1.5">{children}</ul>,
                                        li: ({ children }) => <li className="flex items-start gap-2 text-[13px]"><span className="mt-0.5 opacity-70">✓</span><span>{children}</span></li>,
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                <span>{msg.text}</span>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <Bot size={16} />
                        </div>
                        <div className="px-4 py-3 bg-zinc-800 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-zinc-700">
                            <Loader2 size={14} className="animate-spin text-green-400" />
                            <span className="text-xs text-zinc-400">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {pendingImage && (
                <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900">
                    <div className="relative inline-block">
                        <img src={pendingImage || undefined} alt="To upload" className="h-20 rounded-lg object-cover" />
                        <button
                            onClick={() => setPendingImage(null)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Replies - Always Visible Above Input */}
            {activeQuickReplies.length > 0 && !isLoading && (
                <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/95">
                    <div className="flex flex-wrap gap-2">
                        {activeQuickReplies.map((reply, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickReply(reply)}
                                className="px-4 py-2 text-sm font-medium bg-zinc-800 border border-green-500/40 text-green-400 rounded-full hover:bg-green-500 hover:text-black hover:border-green-500 transition-all shadow-sm"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area - Premium Style */}
            <div className="p-5 bg-zinc-900 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-zinc-800 rounded-xl p-2 ring-1 ring-zinc-700/50 focus-within:ring-2 focus-within:ring-green-500 transition-all shadow-sm">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <input type="file" ref={pdfInputRef} accept=".pdf" onChange={handlePdfUpload} className="hidden" />

                    <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={uploadingPdf}
                        className="p-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-700/50 rounded-lg transition-colors group disabled:opacity-50"
                        title="Attach PDF"
                    >
                        {uploadingPdf ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} className="group-hover:rotate-45 transition-transform" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-700/50 rounded-lg transition-colors"
                        title="Upload image"
                    >
                        <ImageIcon size={18} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={pdfName ? `Ask about ${pdfName}...` : "Ask a question..."}
                        className="flex-1 bg-transparent border-0 focus:ring-0 p-2.5 text-sm text-white placeholder-zinc-500 resize-none max-h-32 leading-tight outline-none"
                        style={{ minHeight: '44px', height: '44px' }}
                        disabled={isLoading}
                        rows={1}
                    />

                    <button
                        type="submit"
                        disabled={(!input.trim() && !pendingImage) || isLoading}
                        className="p-2 bg-green-500 hover:bg-green-400 text-black rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:hover:bg-green-500"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-center mt-3 text-[10px] text-zinc-600 font-medium">AI can make mistakes. Please verify important info.</p>
            </div>
        </div>
    );
}
