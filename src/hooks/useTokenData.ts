import { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { TokenPair } from '@/types/token';
import { getAmericaFunTokens } from '@/lib/api/dexscreener';

// Refresh interval (60 seconds to stay well within DexScreener's 300 req/min limit)
const REFRESH_INTERVAL_MS = 60_000;

export function useTokenData(itemsPerPage: number = 25) {
    const [tokens, setTokens] = useState<TokenPair[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    // Defer the search query to keep input responsive
    const deferredQuery = useDeferredValue(searchQuery);

    // Sorting State
    const [sortKey, setSortKey] = useState<string>('age');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch function (reusable)
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const realData = await getAmericaFunTokens();
            if (realData.length > 0) {
                setTokens(realData);
            }
            setLastFetchTime(Date.now());
        } catch (e) {
            console.error('Failed to fetch tokens:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // Auto-Refresh (every 60 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(false); // Silent refresh (no loading spinner)
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Filter Logic (Memoized) - Always keep pinned $AOL at index 0
    const filteredTokens = useMemo(() => {
        if (!deferredQuery) return tokens;

        const lowerQuery = deferredQuery.toLowerCase();

        // Get pinned token (first item if it's $AOL)
        const pinnedToken = tokens[0]?.baseToken.symbol === 'AOL' ? tokens[0] : null;
        const otherTokens = pinnedToken ? tokens.slice(1) : tokens;

        const filtered = otherTokens.filter(t =>
            t.baseToken.name.toLowerCase().includes(lowerQuery) ||
            t.baseToken.symbol.toLowerCase().includes(lowerQuery) ||
            t.pairAddress.toLowerCase().includes(lowerQuery)
        );

        // Always keep pinned at top if it matches or if no query
        if (pinnedToken) {
            const pinnedMatches =
                pinnedToken.baseToken.name.toLowerCase().includes(lowerQuery) ||
                pinnedToken.baseToken.symbol.toLowerCase().includes(lowerQuery);

            if (pinnedMatches || !deferredQuery) {
                return [pinnedToken, ...filtered];
            }
        }

        return filtered;
    }, [deferredQuery, tokens]);

    // Sort Logic (Memoized) - Always keep pinned $AOL at index 0
    const sortedTokens = useMemo(() => {
        // Get pinned token (first item if it's $AOL)
        const pinnedToken = filteredTokens[0]?.baseToken.symbol === 'AOL' ? filteredTokens[0] : null;
        const tokensToSort = pinnedToken ? filteredTokens.slice(1) : filteredTokens;

        const sorted = [...tokensToSort].sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            switch (sortKey) {
                case 'price':
                    valA = parseFloat(a.priceUsd || '0');
                    valB = parseFloat(b.priceUsd || '0');
                    break;
                case 'age':
                    valA = a.pairCreatedAt || 0;
                    valB = b.pairCreatedAt || 0;
                    break;
                case 'priceChange':
                    valA = a.priceChange?.h24 || 0;
                    valB = b.priceChange?.h24 || 0;
                    break;
                case 'volume':
                    valA = a.volume?.h24 || 0;
                    valB = b.volume?.h24 || 0;
                    break;
                case 'liquidity':
                    valA = a.liquidity?.usd || 0;
                    valB = b.liquidity?.usd || 0;
                    break;
                case 'baseToken.name':
                    valA = a.baseToken.name;
                    valB = b.baseToken.name;
                    break;
                default:
                    return 0;
            }

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });

        // Always keep pinned $AOL at the top
        return pinnedToken ? [pinnedToken, ...sorted] : sorted;
    }, [filteredTokens, sortKey, sortDirection]);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [deferredQuery]);

    // Pagination Logic - Pinned token is always visible on all pages
    const totalPages = Math.max(1, Math.ceil((sortedTokens.length - 1) / itemsPerPage)); // -1 for pinned

    const paginatedTokens = useMemo(() => {
        // Always include pinned token at position 0
        const pinnedToken = sortedTokens[0]?.baseToken.symbol === 'AOL' ? sortedTokens[0] : null;
        const tokensWithoutPinned = pinnedToken ? sortedTokens.slice(1) : sortedTokens;

        const start = (currentPage - 1) * itemsPerPage;
        const page = tokensWithoutPinned.slice(start, start + itemsPerPage);

        return pinnedToken ? [pinnedToken, ...page] : page;
    }, [currentPage, itemsPerPage, sortedTokens]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortKey === key && sortDirection === 'desc') {
            direction = 'asc';
        }
        setSortKey(key);
        setSortDirection(direction);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRefresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    return {
        tokens,
        paginatedTokens,
        filteredTokens: sortedTokens,
        loading,
        searchQuery,
        setSearchQuery,
        sortKey,
        sortDirection,
        handleSort,
        currentPage,
        totalPages,
        handlePageChange,
        handleRefresh,
        lastFetchTime,
    };
}
