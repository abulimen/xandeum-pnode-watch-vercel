/**
 * Install Prompt Modal
 * Shows a gentle install prompt on the user's second page visit
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share, Plus, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STORAGE_KEY = 'pwa-page-visits';
const DISMISSED_KEY = 'pwa-install-prompt-dismissed';

// Detect platform
function getPlatform() {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'desktop';
}

export function InstallPromptModal() {
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const platform = getPlatform();

    useEffect(() => {
        // Skip if already dismissed
        if (localStorage.getItem(DISMISSED_KEY)) return;

        // Skip if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Track page visits
        const visits = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];

        // Only add if not already visited
        if (!visits.includes(pathname)) {
            visits.push(pathname);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
        }

        // Show modal on second unique page visit
        if (visits.length === 2) {
            // Delay to not interrupt user immediately
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    const handleDismiss = () => {
        setShowModal(false);
        setShowInstructions(false);
        localStorage.setItem(DISMISSED_KEY, 'true');
    };

    const handleShowInstructions = () => {
        setShowModal(false);
        setTimeout(() => setShowInstructions(true), 100);
    };

    return (
        <>
            {/* Initial Prompt Modal */}
            <Dialog open={showModal} onOpenChange={(open) => {
                setShowModal(open);
                if (!open) localStorage.setItem(DISMISSED_KEY, 'true');
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Sparkles className="h-5 w-5 text-primary" />
                            </motion.div>
                            Enjoying pNode Watch?
                        </DialogTitle>
                        <DialogDescription>
                            Install the app for a better experience with faster load times and offline access.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Smartphone className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Works like a native app</p>
                                <p className="text-sm text-muted-foreground">Quick access from your home screen</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={handleDismiss}
                            >
                                Maybe Later
                            </Button>
                            <Button
                                className="flex-1 gap-2"
                                onClick={handleShowInstructions}
                            >
                                <Download className="h-4 w-4" />
                                Install App
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Instructions Modal */}
            <Dialog open={showInstructions} onOpenChange={(open) => {
                setShowInstructions(open);
                if (!open) localStorage.setItem(DISMISSED_KEY, 'true');
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            Install pNode Watch
                        </DialogTitle>
                        <DialogDescription>
                            Follow these steps to add the app to your device
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue={platform} className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="ios">iOS</TabsTrigger>
                            <TabsTrigger value="android">Android</TabsTrigger>
                            <TabsTrigger value="desktop">Desktop</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ios" className="mt-4 space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium text-sm">Tap the Share button</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Share className="h-3 w-3" /> at the bottom of Safari
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium text-sm">Tap "Add to Home Screen"</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> in the share menu
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                                <div>
                                    <p className="font-medium text-sm">Tap "Add"</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="android" className="mt-4 space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium text-sm">Tap the menu button</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MoreVertical className="h-3 w-3" /> in Chrome (top right)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium text-sm">Tap "Install app"</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                                <div>
                                    <p className="font-medium text-sm">Tap "Install"</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="desktop" className="mt-4 space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium text-sm">Look for the install icon</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Download className="h-3 w-3" /> in your browser's address bar
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium text-sm">Click "Install"</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button onClick={handleDismiss} className="w-full mt-4">
                        Got It
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

