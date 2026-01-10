import { TokenPair, DexScreenerResponse } from '@/types/token';
import { fetcher } from './fetcher';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// ============================================
// USD1 Token (World Liberty Financial USD)
// ============================================
const USD1_TOKEN_ADDRESS = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB';

// ============================================
// Pinned $AOL Token (america.fun's flagship token)
// ============================================
const AOL_TOKEN_ADDRESS = '2oQNkePakuPbHzrVVkQ875WHeewLHCd2cAwfwiLQbonk';
const AOL_PAIR_ADDRESS = '69ZvRfF9K7c9DsRTouisoeKc7G5Lm1Gz4moKgRjGhsJV';

/**
 * Check if a token address ends with "USA" (america.fun signature)
 */
export function isAmericaFunToken(address: string): boolean {
    return address.toUpperCase().endsWith('USA');
}

/**
 * Check if a pair is paired with USD1
 */
export function isPairedWithUSD1(quoteTokenAddress: string): boolean {
    return quoteTokenAddress === USD1_TOKEN_ADDRESS;
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
function processPair(pair: any, isPinned = false): TokenPair {
    const isAmericaFun = isAmericaFunToken(pair.baseToken?.address || '') || isPinned;
    const ageMinutes = pair.pairCreatedAt ? calculateAgeMinutes(pair.pairCreatedAt) : 0;

    const liquidityUsd = pair.liquidity?.usd || 0;
    const isGraduated = liquidityUsd > 50000;

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
 * Fetch the pinned $AOL token data from DexScreener
 */
export async function fetchPinnedAOL(): Promise<TokenPair | null> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/pairs/solana/${AOL_PAIR_ADDRESS}`,
            { dedupeKey: 'pinned-aol' }
        );

        if (!data.pairs || data.pairs.length === 0) return null;

        return processPair(data.pairs[0], true);
    } catch (error) {
        console.error('Failed to fetch pinned $AOL:', error);
        return null;
    }
}

/**
 * Search for tokens by query
 */
export async function searchTokens(query: string): Promise<TokenPair[]> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`
        );

        if (!data.pairs) return [];

        return data.pairs
            .filter(pair => pair.chainId === 'solana')
            .map(pair => processPair(pair));
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
            .map(pair => processPair(pair));
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
 * Fetch all pairs traded against USD1 on Solana
 * Then filter for tokens whose address ends with "USA"
 */
export async function fetchUSD1Pairs(): Promise<TokenPair[]> {
    try {
        // Search for pairs involving USD1
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/tokens/${USD1_TOKEN_ADDRESS}`,
            { dedupeKey: 'usd1-pairs' }
        );

        if (!data.pairs) return [];

        // Filter for:
        // 1. Solana chain
        // 2. Base token address ends with "USA"
        // 3. Quote token is USD1
        return data.pairs
            .filter(pair => {
                if (pair.chainId !== 'solana') return false;

                const baseAddress = pair.baseToken?.address || '';
                const quoteAddress = pair.quoteToken?.address || '';

                // Accept pairs where either base or quote is USD1, 
                // and the OTHER token ends with USA
                if (quoteAddress === USD1_TOKEN_ADDRESS) {
                    return isAmericaFunToken(baseAddress);
                }
                if (baseAddress === USD1_TOKEN_ADDRESS) {
                    // Reverse case: USD1 is base token, check quote
                    return isAmericaFunToken(quoteAddress);
                }
                return false;
            })
            .map(pair => processPair(pair));
    } catch (error) {
        console.error('Failed to fetch USD1 pairs:', error);
        return [];
    }
}

/**
 * Fetch america.fun tokens from DexScreener
 * Returns pinned $AOL at top + tokens with USA suffix addresses paired with USD1
 */
export async function getAmericaFunTokens(): Promise<TokenPair[]> {
    try {
        // 1. Fetch pinned $AOL first
        const pinnedAOL = await fetchPinnedAOL();

        // 2. Fetch USD1 pairs with USA-ending addresses
        const usd1Pairs = await fetchUSD1Pairs();

        // 3. Also search for USA-related tokens (backup)
        const searchQueries = ['USA solana'];
        const allPairs: TokenPair[] = [...usd1Pairs];
        const seenAddresses = new Set<string>();

        // Mark existing pairs as seen
        for (const pair of usd1Pairs) {
            seenAddresses.add(pair.baseToken.address);
        }

        // Mark $AOL as seen so it's not duplicated
        if (pinnedAOL) {
            seenAddresses.add(pinnedAOL.baseToken.address);
        }

        for (const query of searchQueries) {
            try {
                const data = await fetcher.fetch<DexScreenerResponse>(
                    `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`,
                    { dedupeKey: `search:${query}` }
                );

                if (!data.pairs) continue;

                const filteredPairs = data.pairs
                    .filter(pair => {
                        const baseAddress = pair.baseToken?.address || '';
                        const quoteAddress = pair.quoteToken?.address || '';

                        // Must be Solana + USA-ending address + USD1 pair
                        return pair.chainId === 'solana' &&
                            isAmericaFunToken(baseAddress) &&
                            isPairedWithUSD1(quoteAddress) &&
                            !seenAddresses.has(baseAddress);
                    })
                    .map(pair => {
                        seenAddresses.add(pair.baseToken?.address || '');
                        return processPair(pair);
                    });

                allPairs.push(...filteredPairs);
            } catch (queryError) {
                console.warn(`Query "${query}" failed:`, queryError);
            }
        }

        // Sort by volume (most active first)
        const sortedPairs = allPairs.sort((a, b) => b.volume.h24 - a.volume.h24);

        // Prepend pinned $AOL at the top
        return pinnedAOL ? [pinnedAOL, ...sortedPairs] : sortedPairs;
    } catch (error) {
        console.error('Get america.fun tokens error:', error);
        return [];
    }
}
