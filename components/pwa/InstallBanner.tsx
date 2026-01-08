/**
 * PWA Install Banner
 * Shows a prompt to install the app when available
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Check if user dismissed the banner (30-day cooldown)
function isDismissed(): boolean {
    if (typeof window === 'undefined') return true;
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    // Don't show for 30 days after dismissal
    if (Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000) {
        return true;
    }
    // Dismissal expired - clear it
    localStorage.removeItem('pwa-install-dismissed');
    return false;
}

export function InstallBanner({ className }: { className?: string }) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed - if so, don't even listen for the event
        if (isDismissed()) {
            return;
        }

        // Listen for install prompt (only if not dismissed)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            // Double-check dismissal status in case it changed
            if (isDismissed()) return;
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showBanner || isInstalled) return null;

    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[9999]",
                "rounded-xl border shadow-xl p-4 animate-in slide-in-from-bottom-4 duration-300",
                "bg-background/95 backdrop-blur-xl",
                className
            )}
        >
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Smartphone className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Install pNode Watch</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Get faster access and offline support. Add to your home screen!
                    </p>

                    <div className="flex gap-2 mt-3">
                        <Button
                            size="sm"
                            onClick={handleInstall}
                            className="gap-1"
                        >
                            <Download className="h-3 w-3" />
                            Install
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                        >
                            Not now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
