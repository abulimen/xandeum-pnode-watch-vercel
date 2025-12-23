'use client';

import { useEffect } from 'react';
import { useNodes } from '@/hooks/useNodes';
import { useAppLoading } from '@/contexts/AppLoadingContext';

/**
 * This component doesn't render anything visible.
 * It connects the useNodes hook with the AppLoading context
 * to signal when the initial data fetch is complete.
 */
export function DataLoadingSignal() {
    const { nodes, isLoading } = useNodes();
    const { setInitialLoadComplete, isInitialLoading } = useAppLoading();

    useEffect(() => {
        // When nodes are loaded (not loading anymore, and we have data), mark as complete
        if (!isLoading && nodes.length > 0 && isInitialLoading) {
            setInitialLoadComplete();
        }
    }, [isLoading, nodes.length, isInitialLoading, setInitialLoadComplete]);

    // Also add a timeout fallback in case the request fails or takes too long
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            if (isInitialLoading) {
                setInitialLoadComplete();
            }
        }, 15000); // 15 second maximum loading time

        return () => clearTimeout(fallbackTimer);
    }, [isInitialLoading, setInitialLoadComplete]);

    return null;
}
