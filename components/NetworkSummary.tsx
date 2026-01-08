'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Share2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { useNetworkData } from '@/contexts/NetworkDataContext';

interface NetworkSummaryData {
    generatedAt: string;
    title: string;
    content: string;
    keyRecommendation: string;
}

export function NetworkSummary() {
    const [summary, setSummary] = useState<NetworkSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Get current network from context
    const { network } = useNetworkData();

    // Cache key includes network
    const CACHE_KEY = `xandeum_network_summary_v4_${network}`;
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    // Reload summary when network changes
    useEffect(() => {
        // Clear existing summary so UI reflects new network immediately
        setSummary(null);
        setDisplayedContent('');
        setIsTyping(false);
        loadSummary();
    }, [network]);

    // Typewriter effect
    useEffect(() => {
        if (!summary?.content || !isTyping) return;

        let currentIndex = 0;
        const text = summary.content;
        setDisplayedContent('');

        const intervalId = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedContent(prev => prev + text.charAt(currentIndex));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, 15); // Speed of typing

        return () => clearInterval(intervalId);
    }, [summary, isTyping]);

    const loadSummary = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        setDisplayedContent(''); // Reset for typewriter

        try {
            // Check local cache first
            if (!forceRefresh) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < CACHE_TTL) {
                        setSummary(parsed.data);
                        setLoading(false);
                        setIsTyping(true); // Start typing
                        return;
                    }
                }
            }

            // Fetch from API with network parameter
            const url = network !== 'all'
                ? `/api/network-summary?network=${network}`
                : '/api/network-summary';

            const res = await fetch(url, {
                method: forceRefresh ? 'POST' : 'GET',
                cache: 'no-store'
            });

            if (!res.ok) {
                if (res.status === 503) throw new Error('Network data unavailable');
                throw new Error('Failed to generate summary');
            }

            const data = await res.json();
            setSummary(data);

            // Update cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            setIsTyping(true); // Start typing

        } catch (err: any) {
            console.error('Failed to load summary:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!summary) return;
        const text = `${summary.title}\n\n${summary.content}\n\nKey Recommendation:\n${summary.keyRecommendation}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-summary-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Summary downloaded');
    };

    const handleShare = async () => {
        if (!summary) return;
        const text = `${summary.title}\n\n${summary.content}\n\nKey Recommendation:\n${summary.keyRecommendation}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Xandeum Network Summary',
                    text: text,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            await navigator.clipboard.writeText(text);
            toast.success('Summary copied to clipboard');
        }
    };

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-6">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Generation Failed</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
                    <Button variant="outline" onClick={() => loadSummary(true)} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="col-span-1 lg:col-span-2 h-full flex flex-col overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 border-b">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2 tracking-tight">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Intelligent Network Summary
                        </CardTitle>
                        <CardDescription>
                            AI-generated network analysis
                        </CardDescription>
                    </div>
                    {/* <div className="flex items-center gap-1">
                    {summary && (
                        <>
                            <Button variant="ghost" size="icon" onClick={handleDownload} title="Download TXT">
                                <Download className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleShare} title="Share">
                                <Share2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => loadSummary(true)}
                        disabled={loading}
                        className={loading ? "animate-spin" : ""}
                    >
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div> */}
                </CardHeader>

                <CardContent className="flex-1 space-y-6 p-6">
                    {loading && !summary ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-4/5"></div>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-4 tracking-tight">
                                    {summary.title}
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            strong: ({ node, ...props }) => <span className="font-semibold text-primary" {...props} />
                                        }}
                                    >
                                        {isTyping ? displayedContent : summary.content}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {(!isTyping || displayedContent.length > summary.content.length * 0.8) && (
                                <div className="mt-6 p-4 rounded-lg bg-primary/5 border-l-4 border-primary animate-in slide-in-from-bottom-2 duration-700">
                                    <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Key Recommendation
                                    </h4>
                                    <p className="text-sm text-foreground/90 italic">
                                        {summary.keyRecommendation}
                                    </p>
                                </div>
                            )}

                            {summary.generatedAt && (
                                <div className="text-xs text-muted-foreground pt-2 text-right border-t border-border/50 mt-4">
                                    Generated at {new Date(summary.generatedAt).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </motion.div>
    );
}
