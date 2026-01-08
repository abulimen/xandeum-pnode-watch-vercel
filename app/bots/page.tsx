/**
 * Bots Page - Telegram and Discord Bot Promotion
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ExternalLink, MessageCircle, Bot, Zap, BarChart3, Coins, Search, Trophy } from 'lucide-react';

// Discord icon component
function DiscordIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

const commands = [
    { command: '/help', description: 'Show all available commands', icon: Bot },
    { command: '/stats', description: 'Get network overview (online nodes, avg uptime)', icon: BarChart3 },
    { command: '/price', description: 'Get XAND token price and 24h change', icon: Coins },
    { command: '/node <id>', description: 'Get details for a specific node', icon: Search },
    { command: '/top [n]', description: 'Show top N nodes by credits (default: 5)', icon: Trophy },
];

export default function BotsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12" data-tour="bots-header">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20">
                            <DiscordIcon className="w-12 h-12 text-[#5865F2]" />
                        </div>
                        <div className="p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20">
                            <TelegramIcon className="w-12 h-12 text-[#0088cc]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        pNode Watch Bots
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Get real-time Xandeum network stats, token prices, and node information
                        directly in your favorite chat app.
                    </p>
                </div>

                {/* Bot Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12" data-tour="bots-cards">
                    {/* Telegram Bot */}
                    <Card className="border-[#0088cc]/30 bg-gradient-to-br from-[#0088cc]/5 to-transparent hover:border-[#0088cc]/50 transition-colors">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#0088cc] text-white">
                                    <TelegramIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Telegram Bot</CardTitle>
                                    <CardDescription>@xpnodewatch_bot</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Add our Telegram bot to get instant access to network stats,
                                token prices, and node monitoring right in your chats.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-[#0088cc]/10 text-[#0088cc]">
                                    <Zap className="w-3 h-3 mr-1" /> Instant Responses
                                </Badge>
                                <Badge variant="secondary" className="bg-[#0088cc]/10 text-[#0088cc]">
                                    <MessageCircle className="w-3 h-3 mr-1" /> Works in Groups
                                </Badge>
                            </div>
                            <Button asChild className="w-full bg-[#0088cc] hover:bg-[#0077b5]">
                                <a href="https://t.me/xpnodewatch_bot" target="_blank" rel="noopener noreferrer">
                                    <TelegramIcon className="w-5 h-5 mr-2" />
                                    Open in Telegram
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Discord Bot */}
                    <Card className="border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/5 to-transparent hover:border-[#5865F2]/50 transition-colors">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#5865F2] text-white">
                                    <DiscordIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Discord Bot</CardTitle>
                                    <CardDescription>Slash Commands</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Invite our Discord bot to your server for network monitoring
                                with intuitive slash commands.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-[#5865F2]/10 text-[#5865F2]">
                                    <Zap className="w-3 h-3 mr-1" /> Slash Commands
                                </Badge>
                                <Badge variant="secondary" className="bg-[#5865F2]/10 text-[#5865F2]">
                                    <MessageCircle className="w-3 h-3 mr-1" /> Server Support
                                </Badge>
                            </div>
                            <Button asChild className="w-full bg-[#5865F2] hover:bg-[#4752C4]">
                                <a
                                    href="https://discord.com/api/oauth2/authorize?client_id=1452450161380032704&permissions=2048&scope=bot%20applications.commands"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <DiscordIcon className="w-5 h-5 mr-2" />
                                    Add to Discord
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Commands Section */}
                <Card className="mb-12" data-tour="bots-commands">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            Available Commands
                        </CardTitle>
                        <CardDescription>
                            Use these commands in Telegram (with /) or Discord (with /)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {commands.map((cmd) => (
                                <div
                                    key={cmd.command}
                                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <cmd.icon className="w-4 h-4 text-primary" />
                                        <code className="font-mono text-sm font-medium text-primary">
                                            {cmd.command}
                                        </code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {cmd.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <div className="text-center p-6 rounded-xl border bg-card">
                        <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                        <p className="text-sm text-muted-foreground">Live network data</p>
                    </div>
                    <div className="text-center p-6 rounded-xl border bg-card">
                        <div className="text-3xl font-bold text-primary mb-2">Free</div>
                        <p className="text-sm text-muted-foreground">No cost to use</p>
                    </div>
                    <div className="text-center p-6 rounded-xl border bg-card">
                        <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                        <p className="text-sm text-muted-foreground">Always available</p>
                    </div>
                    <div className="text-center p-6 rounded-xl border bg-card">
                        <div className="text-3xl font-bold text-primary mb-2">Fast</div>
                        <p className="text-sm text-muted-foreground">Instant responses</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center p-8 rounded-2xl border bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5">
                    <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Get network updates, monitor your nodes, and track XAND prices
                        without leaving your favorite chat app.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button asChild variant="outline" size="lg">
                            <a href="https://t.me/xpnodewatch_bot" target="_blank" rel="noopener noreferrer">
                                <TelegramIcon className="w-5 h-5 mr-2" />
                                Telegram
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a
                                href="https://discord.com/api/oauth2/authorize?client_id=1452450161380032704&permissions=2048&scope=bot%20applications.commands"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <DiscordIcon className="w-5 h-5 mr-2" />
                                Discord
                            </a>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

