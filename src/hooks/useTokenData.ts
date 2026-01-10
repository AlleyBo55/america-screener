import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { TokenPair } from '@/types/token';
import { getAmericaFunTokens } from '@/lib/api/dexscreener';
import { generateDummyTokens } from '@/lib/dummyData';

export function useTokenData(itemsPerPage: number = 25) {
    const [tokens, setTokens] = useState<TokenPair[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Defer the search query to keep input responsive
    const deferredQuery = useDeferredValue(searchQuery);

    // Sorting State
    const [sortKey, setSortKey] = useState<string>('age');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Initial Fetch (One-off)
    useEffect(() => {
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const realData = await getAmericaFunTokens().catch(() => []);
                const dummyData = generateDummyTokens(1000);
                // Combine and deduplicate if needed (though IDs should be unique ideally)
                const allTokens = [...realData, ...dummyData];
                setTokens(allTokens);
            } catch (e) {
                console.error("Failed to fetch tokens", e);
                setTokens(generateDummyTokens(1000));
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
    }, []);

    // Filter Logic (Memoized)
    const filteredTokens = useMemo(() => {
        if (!deferredQuery) return tokens;

        const lowerQuery = deferredQuery.toLowerCase();
        return tokens.filter(t =>
            t.baseToken.name.toLowerCase().includes(lowerQuery) ||
            t.baseToken.symbol.toLowerCase().includes(lowerQuery) ||
            t.pairAddress.toLowerCase().includes(lowerQuery)
        );
    }, [deferredQuery, tokens]);

    // Sort Logic (Memoized)
    const sortedTokens = useMemo(() => {
        return [...filteredTokens].sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            // Type-safe Key Access
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
                    // Default string fallback for unhandled keys
                    return 0;
            }

            // Numeric Comparison
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            // String Comparison
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    }, [filteredTokens, sortKey, sortDirection]);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [deferredQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedTokens.length / itemsPerPage);
    const paginatedTokens = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedTokens.slice(start, start + itemsPerPage);
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

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    return {
        tokens,
        paginatedTokens,
        filteredTokens: sortedTokens, // Expose sorted list as 'filteredTokens' for FinderContent compatibility if needed, but semantically 'sorted'
        loading,
        searchQuery,
        setSearchQuery,
        sortKey,
        sortDirection,
        handleSort,
        currentPage,
        totalPages,
        handlePageChange,
        handleRefresh
    };
}
