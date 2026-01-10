import { TokenPair, DexScreenerResponse } from '@/types/token';
import { fetcher } from './fetcher';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

/**
 * Check if a token address ends with "USA" (america.fun signature)
 */
export function isAmericaFunToken(address: string): boolean {
    return address.toUpperCase().endsWith('USA');
}

/**
 * Calculate age in minutes from timestamp
 */
function calculateAgeMinutes(timestamp: number): number {
    return Math.floor((Date.now() - timestamp) / (1000 * 60));
}

/**
 * Process raw pair data and add america.fun specific fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processPair(pair: any): TokenPair {
    const isAmericaFun = isAmericaFunToken(pair.baseToken?.address || '');
    const ageMinutes = pair.pairCreatedAt ? calculateAgeMinutes(pair.pairCreatedAt) : 0;

    // Estimate graduation status based on liquidity threshold
    const liquidityUsd = pair.liquidity?.usd || 0;
    const isGraduated = liquidityUsd > 50000;

    // Estimate bonding curve progress (0-100%)
    const bondingCurveProgress = isGraduated
        ? undefined
        : Math.min(100, Math.round((liquidityUsd / 69000) * 100));

    return {
        chainId: pair.chainId || 'solana',
        dexId: pair.dexId || '',
        pairAddress: pair.pairAddress || '',
        baseToken: {
            address: pair.baseToken?.address || '',
            name: pair.baseToken?.name || 'Unknown',
            symbol: pair.baseToken?.symbol || '???',
            logoUrl: pair.info?.imageUrl || pair.baseToken?.logoUrl,
            decimals: pair.baseToken?.decimals || 9,
        },
        quoteToken: {
            address: pair.quoteToken?.address || '',
            name: pair.quoteToken?.name || '',
            symbol: pair.quoteToken?.symbol || '',
            decimals: pair.quoteToken?.decimals || 9,
        },
        priceNative: pair.priceNative || '0',
        priceUsd: pair.priceUsd || '0',
        volume: {
            h24: pair.volume?.h24 || 0,
            h6: pair.volume?.h6 || 0,
            h1: pair.volume?.h1 || 0,
            m5: pair.volume?.m5 || 0,
        },
        priceChange: {
            h24: pair.priceChange?.h24 || 0,
            h6: pair.priceChange?.h6 || 0,
            h1: pair.priceChange?.h1 || 0,
            m5: pair.priceChange?.m5 || 0,
        },
        liquidity: {
            usd: pair.liquidity?.usd || 0,
            base: pair.liquidity?.base || 0,
            quote: pair.liquidity?.quote || 0,
        },
        txns: {
            h24: pair.txns?.h24 || { buys: 0, sells: 0 },
            h6: pair.txns?.h6 || { buys: 0, sells: 0 },
            h1: pair.txns?.h1 || { buys: 0, sells: 0 },
            m5: pair.txns?.m5 || { buys: 0, sells: 0 },
        },
        fdv: pair.fdv || 0,
        marketCap: pair.marketCap || pair.fdv || 0,
        pairCreatedAt: pair.pairCreatedAt || Date.now(),
        info: pair.info,
        isAmericaFun,
        bondingCurveProgress,
        isGraduated,
        ageMinutes,
    };
}

/**
 * Search for tokens by query - filters for america.fun tokens
 */
export async function searchTokens(query: string): Promise<TokenPair[]> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`
        );

        if (!data.pairs) return [];

        return data.pairs
            .filter(pair => pair.chainId === 'solana' && isAmericaFunToken(pair.baseToken?.address || ''))
            .map(processPair);
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

/**
 * Get token pairs by token address
 */
export async function getTokenPairs(tokenAddress: string): Promise<TokenPair[]> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/tokens/${tokenAddress}`
        );

        if (!data.pairs) return [];

        return data.pairs
            .filter(pair => pair.chainId === 'solana')
            .map(processPair);
    } catch (error) {
        console.error('Get token pairs error:', error);
        return [];
    }
}

/**
 * Get pair by pair address
 */
export async function getPairByAddress(pairAddress: string): Promise<TokenPair | null> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/pairs/solana/${pairAddress}`
        );

        if (!data.pairs || data.pairs.length === 0) return null;

        return processPair(data.pairs[0]);
    } catch (error) {
        console.error('Get pair error:', error);
        return null;
    }
}

/**
 * Search for america.fun tokens (searches for "USA" suffix tokens on Solana)
 * Uses singleton fetcher with built-in rate limiting
 */
export async function getAmericaFunTokens(): Promise<TokenPair[]> {
    try {
        const queries = ['USA', 'america', 'AOL'];
        const allPairs: TokenPair[] = [];
        const seenAddresses = new Set<string>();

        // Execute queries sequentially to respect rate limits
        for (const query of queries) {
            try {
                const data = await fetcher.fetch<DexScreenerResponse>(
                    `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`,
                    { dedupeKey: `search:${query}` }
                );

                if (!data.pairs) continue;

                const filteredPairs = data.pairs
                    .filter(pair => {
                        const address = pair.baseToken?.address || '';
                        return pair.chainId === 'solana' &&
                            isAmericaFunToken(address) &&
                            !seenAddresses.has(address);
                    })
                    .map(pair => {
                        seenAddresses.add(pair.baseToken?.address || '');
                        return processPair(pair);
                    });

                allPairs.push(...filteredPairs);
            } catch (queryError) {
                // If one query fails (e.g., rate limit), continue with others
                console.warn(`Query "${query}" failed:`, queryError);
            }
        }

        // Sort by volume (most active first)
        return allPairs.sort((a, b) => b.volume.h24 - a.volume.h24);
    } catch (error) {
        console.error('Get america.fun tokens error:', error);
        return [];
    }
}
