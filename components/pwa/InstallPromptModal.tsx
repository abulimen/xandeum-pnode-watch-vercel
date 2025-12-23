/**
 * Install Prompt Modal
 * Shows a gentle install prompt on the user's second page visit
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InstallAppButton } from './InstallAppButton';

const STORAGE_KEY = 'pwa-page-visits';
const DISMISSED_KEY = 'pwa-install-prompt-dismissed';

export function InstallPromptModal() {
    const pathname = usePathname();
    const [showModal, setShowModal] = useState(false);

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
        localStorage.setItem(DISMISSED_KEY, 'true');
    };

    const handleInstall = () => {
        setShowModal(false);
        localStorage.setItem(DISMISSED_KEY, 'true');
        // The InstallAppButton will handle the actual install flow
    };

    return (
        <AnimatePresence>
            {showModal && (
                <Dialog open={showModal} onOpenChange={setShowModal}>
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
                                <div onClick={handleInstall} className="flex-1">
                                    <InstallAppButton />
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
