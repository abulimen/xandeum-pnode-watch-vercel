/**
 * Widget Gallery Page
 * Showcase embeddable widgets with copy-paste code
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, Code2, ExternalLink, Sparkles } from 'lucide-react';
import { useNodes } from '@/hooks';

interface WidgetConfig {
    id: string;
    name: string;
    description: string;
    previewUrl: string;
}

const widgets: WidgetConfig[] = [
    {
        id: 'network-badge',
        name: 'Network Badge',
        description: 'Compact badge showing node count and health status.',
        previewUrl: '/embed/network-badge',
    },
    {
        id: 'ticker',
        name: 'Network Ticker',
        description: 'Scrolling ticker with live network statistics.',
        previewUrl: '/embed/ticker',
    },
    {
        id: 'node-status',
        name: 'Node Status Card',
        description: 'Display a single node\'s live status, score, and metrics.',
        previewUrl: '/embed/node-status',
    },
    {
        id: 'leaderboard',
        name: 'Top 5 Leaderboard',
        description: 'Show the top 5 highest-ranked nodes in the network.',
        previewUrl: '/embed/leaderboard',
    },
];

function getScriptEmbedCode(widgetId: string, baseUrl: string, nodeId?: string): string {
    const containerId = `xandeum-${widgetId}`;

    const methodNames: Record<string, string> = {
        'network-badge': 'badge',
        'ticker': 'ticker',
        'node-status': 'nodeStatus',
        'leaderboard': 'leaderboard',
    };

    const widgetNames: Record<string, string> = {
        'network-badge': 'Badge',
        'ticker': 'Ticker',
        'node-status': 'Node Status',
        'leaderboard': 'Leaderboard',
    };

    const methodName = methodNames[widgetId] || 'badge';
    const widgetName = widgetNames[widgetId] || 'Widget';
    const nodeIdParam = widgetId === 'node-status' ? ", 'YOUR_NODE_ID'" : '';

    return `<!-- Xandeum ${widgetName} Widget -->
<div id="${containerId}"></div>
<script src="${baseUrl}/widgets/xandeum-widget.js"></script>
<script>
  XandeumWidget.${methodName}('${containerId}'${nodeIdParam});
</script>`;
}

function WidgetPreview({ widget }: { widget: WidgetConfig }) {
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');
    const [embedCode, setEmbedCode] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);
    const containerIdRef = useRef<string>('');

    // Set base URL and embed code only on client side to avoid hydration mismatch
    useEffect(() => {
        const url = window.location.origin;
        setBaseUrl(url);
        setEmbedCode(getScriptEmbedCode(widget.id, url));
    }, [widget.id]);

    // Load and render the widget in preview using the actual script
    const initializeWidget = useCallback(() => {
        if (!previewRef.current || !baseUrl) return;

        // Create unique container ID
        containerIdRef.current = `preview-${widget.id}-${Math.random().toString(36).substr(2, 9)}`;

        // Clear and create container
        previewRef.current.innerHTML = '';
        const container = document.createElement('div');
        container.id = containerIdRef.current;
        previewRef.current.appendChild(container);

        // Type for XandeumWidget
        type XandeumWidgetType = {
            badge: (id: string) => void;
            ticker: (id: string) => void;
            nodeStatus: (id: string, nodeId: string) => void;
            leaderboard: (id: string) => void;
        };

        // Poll for XandeumWidget to be available
        const tryInitWidget = (attempts = 0) => {
            const win = window as unknown as { XandeumWidget?: XandeumWidgetType };
            if (win.XandeumWidget && containerIdRef.current) {
                switch (widget.id) {
                    case 'network-badge':
                        win.XandeumWidget.badge(containerIdRef.current);
                        break;
                    case 'ticker':
                        win.XandeumWidget.ticker(containerIdRef.current);
                        break;
                    case 'node-status':
                        // Use a sample node ID for preview
                        win.XandeumWidget.nodeStatus(containerIdRef.current, 'SAMPLE_NODE');
                        break;
                    case 'leaderboard':
                        win.XandeumWidget.leaderboard(containerIdRef.current);
                        break;
                    default:
                        win.XandeumWidget.badge(containerIdRef.current);
                }
            } else if (attempts < 20) {
                // Retry up to 20 times (2 seconds total)
                setTimeout(() => tryInitWidget(attempts + 1), 100);
            } else {
                console.error('[Widget Preview] XandeumWidget not available after retries');
            }
        };

        // Ensure script is loaded
        const existingScript = document.querySelector('script[src*="xandeum-widget.js"]');

        if (existingScript) {
            // Script exists, wait a bit then try
            setTimeout(() => tryInitWidget(), 100);
        } else {
            const script = document.createElement('script');
            script.src = '/widgets/xandeum-widget.js';
            script.onload = () => tryInitWidget();
            document.body.appendChild(script);
        }
    }, [widget.id, baseUrl]);

    useEffect(() => {
        initializeWidget();
    }, [initializeWidget]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    {widget.name}
                    <span className="ml-auto flex items-center gap-1 text-xs font-normal text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        Script-based
                    </span>
                </CardTitle>
                <CardDescription>{widget.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Live Preview */}
                <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-3">Live Preview:</p>
                    <div
                        ref={previewRef}
                        className={widget.id === 'ticker' ? 'w-full' : 'flex justify-center'}
                    />
                </div>

                {/* Embed Code */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Embed Code</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8"
                            disabled={!embedCode}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1 text-emerald-500" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                    <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{embedCode || 'Loading...'}</code>
                    </pre>
                </div>

                {/* Open in new tab */}
                <a
                    href={widget.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    Open standalone widget
                    <ExternalLink className="h-3 w-3" />
                </a>
            </CardContent>
        </Card>
    );
}

export default function WidgetsPage() {
    const { refetch, lastUpdated, isFetching, isError, responseTime } = useNodes();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <RefreshBar
                lastUpdated={lastUpdated}
                isFetching={isFetching}
                isError={isError}
                responseTime={responseTime}
                onRefresh={refetch}
            />

            <main className="flex-1 container px-4 py-6">
                {/* Page Header */}
                <div className="mb-8" data-tour="widgets-header">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Code2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Embeddable Widgets</h1>
                            <p className="text-muted-foreground">
                                Add network stats to your website
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <Card className="mb-6 bg-primary/5 border-primary/20" data-tour="widgets-instructions">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">How to Use</h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Choose a widget below</li>
                            <li>Copy the embed code</li>
                            <li>Paste it into your website&apos;s HTML</li>
                            <li>The widget will automatically update with live data</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Widgets Grid */}
                <div className="grid gap-6 lg:grid-cols-2" data-tour="widgets-gallery">
                    {widgets.map(widget => (
                        <WidgetPreview key={widget.id} widget={widget} />
                    ))}
                </div>

                {/* Coming Soon */}
                <Card className="mt-6 border-dashed">
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">
                            More widgets coming soon: Node Status Widget, Network Chart, Leaderboard Mini
                        </p>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
