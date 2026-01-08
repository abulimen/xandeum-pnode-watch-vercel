'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Sparkles, X, Send, Loader2, Search, Database, Wand2,
    ChevronDown, MessageSquarePlus, Minimize2,
    Coins, HelpCircle, TrendingUp, Users, Bot
} from 'lucide-react';
import { CopilotMessage, Message } from './CopilotMessage';
import { cn } from '@/lib/utils';

type LoadingPhase = 'searching' | 'fetching' | 'generating' | null;

const loadingMessages: Record<string, { icon: React.ReactNode; text: string }> = {
    searching: { icon: <Search className="h-3 w-3" />, text: 'Searching docs...' },
    fetching: { icon: <Database className="h-3 w-3" />, text: 'Fetching data...' },
    generating: { icon: <Wand2 className="h-3 w-3" />, text: 'Generating...' },
};

// Quick prompt suggestions
const QUICK_PROMPTS = [
    { icon: <HelpCircle className="h-3 w-3" />, label: "How to stake?", prompt: "How do I stake XAND tokens?" },
    { icon: <Coins className="h-3 w-3" />, label: "What is STOINC?", prompt: "What is STOINC and how does it work?" },
    { icon: <TrendingUp className="h-3 w-3" />, label: "Best nodes", prompt: "Which pNodes are best for staking?" },
    { icon: <Users className="h-3 w-3" />, label: "Run pNode", prompt: "How can I run my own pNode?" },
];

export function CopilotWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hey! 👋 I'm your Xandeum assistant. Ask me anything about the network, nodes, XAND token, or how to use this dashboard.",
            timestamp: Date.now(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Listen for external trigger events
    useEffect(() => {
        const handleTrigger = (event: CustomEvent<{ message: string }>) => {
            const message = event.detail?.message;
            if (message) {
                setIsOpen(true);
                setTimeout(() => {
                    setInput(message);
                    setTimeout(() => {
                        sendMessage(message, messages);
                    }, 100);
                }, 200);
            }
        };

        window.addEventListener('copilot:trigger', handleTrigger as EventListener);
        return () => window.removeEventListener('copilot:trigger', handleTrigger as EventListener);
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, loadingPhase, scrollToBottom]);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            setLoadingPhase(null);
            return;
        }

        setLoadingPhase('searching');
        const timer1 = setTimeout(() => { if (isLoading) setLoadingPhase('fetching'); }, 800);
        const timer2 = setTimeout(() => { if (isLoading) setLoadingPhase('generating'); }, 1500);

        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, [isLoading]);

    const sendMessage = async (content: string, messagesHistory: Message[]) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        };

        const newMessages = [...messagesHistory, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, currentPage: pathname }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    const errorData = await response.json();
                    let errorMessage = "⏳ I'm a bit overwhelmed right now. Please wait a moment and try again.";
                    if (errorData.code === 'QUOTA_EXCEEDED') {
                        errorMessage = "🔋 I've reached my daily limit. Please try again in a few hours.";
                    } else if (errorData.code === 'RATE_LIMIT') {
                        errorMessage = "⏳ Too many requests! Try again in a few seconds.";
                    }
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessage, timestamp: Date.now() }]);
                    setIsLoading(false);
                    return;
                }
                throw new Error('Failed to fetch response');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now() }]);

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value);
                accumulatedContent += text;
                setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg));
            }
        } catch (error) {
            console.error('Copilot error:', error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "😅 Oops, something went wrong. Let me try again!", timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;
        await sendMessage(input, messages);
    };

    const handleQuickPrompt = async (prompt: string) => {
        if (isLoading) return;
        setInput(prompt);
        await sendMessage(prompt, messages);
    };

    const handleNewChat = () => {
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: "Hey! 👋 I'm your Xandeum assistant. Ask me anything about the network, nodes, XAND token, or how to use this dashboard.",
            timestamp: Date.now(),
        }]);
        setInput('');
    };

    const handleRegenerate = async () => {
        const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIndex === -1) return;
        const actualIndex = messages.length - 1 - lastUserIndex;
        const lastUserMessage = messages[actualIndex];
        const historyUpToUser = messages.slice(0, actualIndex);
        await sendMessage(lastUserMessage.content, historyUpToUser);
    };

    const handleEdit = async (messageId: string, newContent: string) => {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;
        const historyBeforeEdit = messages.slice(0, messageIndex);
        await sendMessage(newContent, historyBeforeEdit);
    };

    const handleCopy = () => { };

    const currentLoadingMessage = loadingPhase ? loadingMessages[loadingPhase] : null;
    const showQuickPrompts = messages.length <= 1 && !isLoading;

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={cn(
                            "fixed z-50",
                            "top-14 inset-x-0 bottom-0 sm:inset-auto sm:top-auto sm:bottom-20 sm:right-4",
                            "sm:w-[380px] sm:h-[520px]"
                        )}
                    >
                        <div className={cn(
                            "flex flex-col h-full w-full overflow-hidden",
                            "bg-[#0a0a0a] sm:rounded-2xl",
                            "border-0 sm:border sm:border-emerald-500/20",
                            "shadow-2xl shadow-black/50"
                        )}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f0f0f]">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                            <Sparkles className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0f0f0f]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Copilot</h3>
                                        <p className="text-[10px] text-white/40">Xandeum AI Assistant</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleNewChat}
                                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                        title="New Chat"
                                    >
                                        <MessageSquarePlus className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Minimize2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-hidden relative">
                                <div
                                    ref={scrollRef}
                                    onScroll={handleScroll}
                                    className="absolute inset-0 overflow-y-auto px-4 py-4 space-y-4"
                                >
                                    {messages.map((msg, index) => (
                                        <CopilotMessage
                                            key={msg.id}
                                            message={msg}
                                            isLast={index === messages.length - 1 && msg.role === 'assistant'}
                                            onCopy={handleCopy}
                                            onRegenerate={handleRegenerate}
                                            onEdit={handleEdit}
                                            showActions={!isLoading}
                                        />
                                    ))}

                                    {/* Quick Prompts */}
                                    {showQuickPrompts && (
                                        <div className="pt-2">
                                            <p className="text-[11px] text-white/30 mb-2">Suggested:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {QUICK_PROMPTS.map((item, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleQuickPrompt(item.prompt)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 transition-all"
                                                    >
                                                        {item.icon}
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Typing Indicator */}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                                                    <div className="flex gap-1">
                                                        <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                                                        <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                                                        <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                                                    </div>
                                                </div>
                                                {currentLoadingMessage && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/30 px-1">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        {currentLoadingMessage.icon}
                                                        <span>{currentLoadingMessage.text}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Scroll to bottom */}
                                <AnimatePresence>
                                    {showScrollButton && !isLoading && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onClick={scrollToBottom}
                                            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-medium shadow-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                            Jump to latest
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-white/5 bg-[#0f0f0f]">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <textarea
                                        ref={inputRef}
                                        placeholder="Ask about Xandeum..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 text-sm min-h-[44px] max-h-[100px] px-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-emerald-500/50 focus:outline-none focus:ring-0 text-white placeholder:text-white/30 resize-none"
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white flex items-center justify-center shrink-0 transition-colors"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="fixed bottom-12 right-4 sm:bottom-12 sm:right-6 z-50"
                        data-tour="copilot-button"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 border border-emerald-400/20"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                            >
                                <Sparkles className="h-6 w-6" />
                            </motion.div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
