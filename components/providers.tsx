/**
 * React Query Provider component
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { AppLoadingProvider } from '@/contexts/AppLoadingContext';
import { NetworkDataProvider } from '@/contexts/NetworkDataContext';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        gcTime: 5 * 60 * 1000, // 5 minutes
                        retry: 3,
                        refetchOnWindowFocus: true,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                themes={['light', 'dark', 'dark-amoled', 'system']}
                disableTransitionOnChange
            >
                <AppLoadingProvider minLoadingTime={1800}>
                    <NetworkDataProvider>
                        <FavoritesProvider>
                            {children}
                        </FavoritesProvider>
                    </NetworkDataProvider>
                </AppLoadingProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

