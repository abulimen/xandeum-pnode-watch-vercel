/**
 * TourButton Component - Animated tour trigger with Framer Motion
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { HelpCircle, X, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    startTour,
    hasCompletedTour,
    markTourCompleted,
    markGlobalTourDismissed,
    getTourStepsForPage,
    resetAllTours
} from '@/lib/services/tourService';
import '@/styles/driver-theme.css';

export function TourButton() {
    const pathname = usePathname();
    const [showPrompt, setShowPrompt] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    // Get tour ID based on pathname
    const getTourId = () => {
        if (pathname === '/' || pathname === '') return 'dashboard';
        return pathname.replace(/^\//, '').replace(/\//g, '-') || 'home';
    };

    // Check if this is the dashboard/home page
    const isDashboard = pathname === '/' || pathname === '';

    useEffect(() => {
        // Only show auto-prompt on dashboard
        if (!isDashboard) return;

        // Check if this is the first visit to this page
        const tourId = getTourId();
        if (!hasCompletedTour(tourId)) {
            setIsFirstVisit(true);
            // Show prompt after a delay for first-time visitors
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [pathname, isDashboard]);

    const handleStartTour = () => {
        setShowPrompt(false);
        const steps = getTourStepsForPage(pathname);
        if (steps.length > 0) {
            startTour(steps, () => {
                markTourCompleted(getTourId());
                setIsFirstVisit(false);
            });
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        markGlobalTourDismissed(); // Global dismiss as requested
        setIsFirstVisit(false);
    };

    // Don't render anything if there are no tour steps for this page
    const steps = getTourStepsForPage(pathname);
    if (steps.length === 0) return null;

    return (
        <>
            {/* First-visit prompt */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[60] max-w-xs"
                    >
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4">
                                <div className="flex items-start gap-3">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        className="p-2 bg-primary/20 rounded-lg"
                                    >
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm">Welcome to this page!</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Would you like a quick tour of the features?
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="p-1 hover:bg-muted rounded-md transition-colors"
                                    >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDismiss}
                                    className="flex-1 text-xs"
                                >
                                    Skip
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleStartTour}
                                    className="flex-1 text-xs gap-1"
                                >
                                    Start Tour
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual tour trigger button */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 400, damping: 25 }}
                className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 z-[55]"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleStartTour}
                        className="h-10 w-10 rounded-full shadow-lg bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        title="Start page tour"
                        data-tour="tour-button"
                    >
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </motion.div>

                {/* Pulse indicator for first visit */}
                {isFirstVisit && !showPrompt && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary pointer-events-none"
                    />
                )}
            </motion.div>
        </>
    );
}

// Export a function to manually trigger tour (can be called from anywhere)
export function triggerPageTour() {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('startPageTour');
        window.dispatchEvent(event);
    }
}
