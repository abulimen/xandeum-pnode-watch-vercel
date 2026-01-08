'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check, ExternalLink, RefreshCw, Pencil } from 'lucide-react';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface CopilotMessageProps {
    message: Message;
    isLast?: boolean;
    onCopy?: (content: string) => void;
    onRegenerate?: () => void;
    onEdit?: (messageId: string, newContent: string) => void;
    showActions?: boolean;
}

// Custom Code Block with Copy Button
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
    const [copied, setCopied] = useState(false);
    const language = className?.replace('language-', '') || 'text';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3">
            <div className="flex items-center justify-between bg-black/40 text-white/40 text-[10px] px-3 py-1.5 rounded-t-lg border-b border-white/5">
                <span className="font-mono uppercase tracking-wide">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <pre className="bg-black/60 text-white/80 p-3 rounded-b-lg overflow-x-auto text-xs font-mono">
                <code>{codeString}</code>
            </pre>
        </div>
    );
}

// Inline Code
function InlineCode({ children }: { children: React.ReactNode }) {
    return (
        <code className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
            {children}
        </code>
    );
}

// Custom Link
function CustomLink({ href, children }: { href?: string; children: React.ReactNode }) {
    const isExternal = href?.startsWith('http');
    return (
        <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 inline-flex items-center gap-0.5"
        >
            {children}
            {isExternal && <ExternalLink className="h-2.5 w-2.5" />}
        </a>
    );
}

// Custom components for ReactMarkdown
const markdownComponents = {
    code: ({ inline, className, children, ...props }: any) => {
        if (inline) {
            return <InlineCode>{children}</InlineCode>;
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    a: ({ href, children }: any) => <CustomLink href={href}>{children}</CustomLink>,
    p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 space-y-0.5 text-white/70">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 space-y-0.5 text-white/70">{children}</ol>,
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-white">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-sm font-bold mb-2 mt-2 first:mt-0 text-white">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xs font-semibold mb-1 mt-2 first:mt-0 text-white">{children}</h3>,
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-2 border-emerald-500/50 pl-3 italic text-white/50 my-2 text-xs">
            {children}
        </blockquote>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-2">
            <table className="min-w-full border border-white/10 rounded-lg overflow-hidden text-xs">
                {children}
            </table>
        </div>
    ),
    th: ({ children }: any) => (
        <th className="bg-white/5 px-2 py-1.5 text-left text-[10px] font-semibold border-b border-white/10 text-white/70">
            {children}
        </th>
    ),
    td: ({ children }: any) => (
        <td className="px-2 py-1.5 text-[11px] border-b border-white/5 text-white/60">{children}</td>
    ),
    hr: () => <hr className="my-3 border-white/10" />,
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-white/80">{children}</em>,
};

// Regex to match node IDs
const NODE_ID_REGEX = /\b([A-HJ-NP-Za-km-z1-9]{8}-[0-9a-zA-Z]+)\b/g;

function processNodeLinks(content: string): string {
    return content.replace(NODE_ID_REGEX, (match) => `[${match}](/nodes/${match})`);
}

export function CopilotMessage({ message, isLast, onCopy, onRegenerate, onEdit, showActions = true }: CopilotMessageProps) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        onCopy?.(message.content);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    return (
        <div className={cn(
            "flex w-full gap-3 group",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Avatar */}
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isUser
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                    : "bg-emerald-500/10 border border-emerald-500/20"
            )}>
                {isUser ? (
                    <User className="h-4 w-4 text-white" />
                ) : (
                    <Bot className="h-4 w-4 text-emerald-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1 min-w-0">
                <div className={cn(
                    "overflow-hidden rounded-xl px-3 py-2.5 text-[13px]",
                    isUser
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                        : "bg-white/5 border border-white/5 text-white/80"
                )}>
                    {isUser ? (
                        isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-white/20 text-white rounded-lg p-2 text-sm resize-none min-h-[60px] focus:outline-none"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1 text-[11px] text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        className="px-3 py-1 text-[11px] bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )
                    ) : (
                        <div className="prose-copilot">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {processNodeLinks(message.content)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                {showActions && !isEditing && message.content && (
                    <div className={cn(
                        "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        isUser ? "justify-end" : "justify-start"
                    )}>
                        {/* Copy button - for assistant messages */}
                        {!isUser && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 rounded-md hover:bg-white/5 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}

                        {/* Regenerate button - only for last assistant message */}
                        {!isUser && isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 rounded-md hover:bg-white/5 transition-colors"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Retry
                            </button>
                        )}

                        {/* Edit button - for user messages */}
                        {isUser && onEdit && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
