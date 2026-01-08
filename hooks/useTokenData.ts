/**
 * useTokenData Hook
 * Fetches XAND token data from our backend API (which proxies to Jupiter)
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface TokenStats {
    address: string;
    name: string;
    symbol: string;
    logoURI: string;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    priceChange30d: number;
    marketCap: number;
    fdv: number;
    liquidity: number;
    volume24h: number;
    holders: number;
    circulatingSupply: number;
    totalSupply: number;
    lastUpdated: string;
}

async function fetchTokenData(): Promise<TokenStats> {
    const response = await fetch('/api/token');

    if (!response.ok) {
        throw new Error('Failed to fetch token data');
    }

    return response.json();
}

export function useTokenData() {
    const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
        queryKey: ['token-data'],
        queryFn: fetchTokenData,
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000, // Refetch every minute
    });

    return {
        tokenData: data,
        isLoading,
        isRefetching,
        isError,
        error,
        refetch,
    };
}
