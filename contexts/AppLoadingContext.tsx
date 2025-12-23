'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface AppLoadingContextType {
    /** Whether the initial data is still loading */
    isInitialLoading: boolean;
    /** Mark the initial load as complete */
    setInitialLoadComplete: () => void;
    /** Mark the initial load as started (resets to loading) */
    setInitialLoadStarted: () => void;
    /** Time when loading started */
    loadStartTime: number;
}

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined);

interface AppLoadingProviderProps {
    children: ReactNode;
    /** Minimum time to show loading in ms */
    minLoadingTime?: number;
}

export function AppLoadingProvider({ children, minLoadingTime = 1500 }: AppLoadingProviderProps) {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loadStartTime] = useState(() => Date.now());
    const [dataReady, setDataReady] = useState(false);

    // Wait for both: minimum time AND data ready
    useEffect(() => {
        if (!dataReady) return;

        const elapsed = Date.now() - loadStartTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);

        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, remaining);

        return () => clearTimeout(timer);
    }, [dataReady, loadStartTime, minLoadingTime]);

    const setInitialLoadComplete = useCallback(() => {
        setDataReady(true);
    }, []);

    const setInitialLoadStarted = useCallback(() => {
        setIsInitialLoading(true);
        setDataReady(false);
    }, []);

    return (
        <AppLoadingContext.Provider
            value={{
                isInitialLoading,
                setInitialLoadComplete,
                setInitialLoadStarted,
                loadStartTime,
            }}
        >
            {children}
        </AppLoadingContext.Provider>
    );
}

export function useAppLoading() {
    const context = useContext(AppLoadingContext);
    if (context === undefined) {
        throw new Error('useAppLoading must be used within an AppLoadingProvider');
    }
    return context;
}

/**
 * Hook to automatically mark loading complete when nodes are loaded
 * Use this in components that trigger the initial data fetch
 */
export function useMarkLoadedWhenReady(isLoading: boolean, hasData: boolean) {
    const { setInitialLoadComplete, isInitialLoading } = useAppLoading();

    useEffect(() => {
        // When data becomes available (not loading and has data), mark as complete
        if (!isLoading && hasData && isInitialLoading) {
            setInitialLoadComplete();
        }
    }, [isLoading, hasData, isInitialLoading, setInitialLoadComplete]);
}
