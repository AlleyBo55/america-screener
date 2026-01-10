/**
 * DexScreener Service
 * 
 * API service for fetching token data from DexScreener
 * Uses the singleton fetcher for rate limiting and deduplication
 */

import { fetcher } from '@/lib/api/fetcher';
import { TokenPair, DexScreenerResponse } from '@/types/token';

const DEXSCREENER_API = process.env.NEXT_PUBLIC_DEXSCREENER_API_URL || 'https://api.dexscreener.com/latest/dex';
const USD1_TOKEN_ADDRESS = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB';
const AOL_PAIR_ADDRESS = '69ZvRfF9K7c9DsRTouisoeKc7G5Lm1Gz4moKgRjGhsJV';

// BURGER launch timestamp - baseline for filtering new tokens
// BURGER was the first official token after AOL on america.fun
// Launched June 9, 2025 12:51:48 UTC - only tokens at or after this time are shown
const BURGER_LAUNCH_TIMESTAMP = 1760053908000;

/**
 * Check if token address ends with "USA" (america.fun signature)
 */
export function isAmericaFunToken(address: string): boolean {
    return address.toUpperCase().endsWith('USA');
}

/**
 * Validate pair as america.fun token
 */
function isValidAmericaFunPair(pair: any): boolean {
    if (pair.chainId !== 'solana') return false;

    const baseAddress = pair.baseToken?.address || '';
    const quoteAddress = pair.quoteToken?.address || '';

    if (quoteAddress === USD1_TOKEN_ADDRESS) {
        return baseAddress.toUpperCase().endsWith('USA');
    }
    if (baseAddress === USD1_TOKEN_ADDRESS) {
        return quoteAddress.toUpperCase().endsWith('USA');
    }
    return false;
}

/**
 * Process raw pair data into TokenPair format
 */
function processPair(pair: any): TokenPair {
    const now = Date.now();
    const createdAt = pair.pairCreatedAt || now;
    const ageMinutes = Math.floor((now - createdAt) / 60000);
    // DEBUG: Log age for first few tokens
    if (Math.random() < 0.05) console.log(`[DexScreener] Token ${pair.baseToken?.symbol} Age: ${ageMinutes}m (Created: ${new Date(createdAt).toISOString()})`);

    return {
        chainId: pair.chainId,
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
        baseToken: {
            address: pair.baseToken?.address || '',
            name: pair.baseToken?.name || 'Unknown',
            symbol: pair.baseToken?.symbol || '???',
            decimals: pair.baseToken?.decimals || 9,
            logoUrl: pair.info?.imageUrl,
        },
        quoteToken: {
            address: pair.quoteToken?.address || '',
            name: pair.quoteToken?.name || 'USD1',
            symbol: pair.quoteToken?.symbol || 'USD1',
            decimals: pair.quoteToken?.decimals || 6,
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
        pairCreatedAt: createdAt,
        info: pair.info,
        isAmericaFun: true,
        bondingCurveProgress: pair.bondingCurveProgress,
        isGraduated: pair.bondingCurveProgress === undefined || pair.bondingCurveProgress >= 100,
        ageMinutes: ageMinutes, // Populate ageMinutes
    };
}

/**
 * Fetch pinned $AOL token
 */
async function fetchPinnedAOL(): Promise<TokenPair | null> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/pairs/solana/${AOL_PAIR_ADDRESS}`,
            { dedupeKey: 'aol-pinned' }
        );
        if (data.pairs && data.pairs.length > 0) {
            return processPair(data.pairs[0]);
        }
    } catch (error) {
        console.warn('[DexScreenerService] Failed to fetch pinned AOL:', error);
    }
    return null;
}

/**
 * Fetch all america.fun tokens
 */
export async function getAmericaFunTokens(): Promise<TokenPair[]> {
    const seenAddresses = new Set<string>();
    const allPairs: TokenPair[] = [];

    // 1. Fetch pinned $AOL first
    const pinnedAOL = await fetchPinnedAOL();
    if (pinnedAOL) {
        seenAddresses.add(pinnedAOL.baseToken.address);
    }

    // 2. Search queries
    const searchQueries = [
        'USD1 solana',
        'USA USD1',
        'PATRIOT USD1',
        'DREAM USD1',
        'america USD1',
        'liberty USD1',
        'trump USD1',
        'american USD1',
    ];

    for (const query of searchQueries) {
        try {
            const data = await fetcher.fetch<DexScreenerResponse>(
                `${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`,
                { dedupeKey: `search:${query}` }
            );

            if (!data.pairs) continue;

            for (const pair of data.pairs) {
                const baseAddress = pair.baseToken?.address || '';
                if (seenAddresses.has(baseAddress)) continue;
                if (!isValidAmericaFunPair(pair)) continue;

                // Date filter: skip tokens older than BURGER
                const pairCreatedAt = pair.pairCreatedAt || 0;
                if (pairCreatedAt > 0 && pairCreatedAt < BURGER_LAUNCH_TIMESTAMP) {
                    continue;
                }

                // Filter: Only graduated tokens (bonding curve complete)
                const bondingProgress = pair.bondingCurveProgress;
                if (bondingProgress !== undefined && bondingProgress < 100) {
                    continue;
                }

                // Filter: Must have at least one social (twitter, telegram, etc.)
                const socials = pair.info?.socials || [];
                if (socials.length === 0) {
                    continue;
                }

                seenAddresses.add(baseAddress);
                allPairs.push(processPair(pair));
            }
        } catch (error) {
            console.warn(`[DexScreenerService] Query "${query}" failed:`, error);
        }
    }

    // 3. Backup: fetch USD1 token pairs
    try {
        const usd1Data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/tokens/${USD1_TOKEN_ADDRESS}`,
            { dedupeKey: 'usd1-pairs' }
        );

        if (usd1Data.pairs) {
            for (const pair of usd1Data.pairs) {
                const baseAddress = pair.baseToken?.address || '';
                if (seenAddresses.has(baseAddress)) continue;
                if (!isValidAmericaFunPair(pair)) continue;

                const pairCreatedAt = pair.pairCreatedAt || 0;
                if (pairCreatedAt > 0 && pairCreatedAt < BURGER_LAUNCH_TIMESTAMP) {
                    continue;
                }

                // Filter: Only graduated tokens
                const bondingProgress = pair.bondingCurveProgress;
                if (bondingProgress !== undefined && bondingProgress < 100) {
                    continue;
                }

                // Filter: Must have socials
                const socials = pair.info?.socials || [];
                if (socials.length === 0) {
                    continue;
                }

                seenAddresses.add(baseAddress);
                allPairs.push(processPair(pair));
            }
        }
    } catch (error) {
        console.warn('[DexScreenerService] USD1 pairs fetch failed:', error);
    }

    // Sort by 24h volume
    const sortedPairs = allPairs.sort((a, b) => b.volume.h24 - a.volume.h24);

    // Prepend pinned AOL
    return pinnedAOL ? [pinnedAOL, ...sortedPairs] : sortedPairs;
}

/**
 * Get single token by address
 */
export async function getTokenByAddress(address: string): Promise<TokenPair | null> {
    try {
        const data = await fetcher.fetch<DexScreenerResponse>(
            `${DEXSCREENER_API}/pairs/solana/${address}`,
            { dedupeKey: `pair:${address}` }
        );
        if (data.pairs && data.pairs.length > 0) {
            return processPair(data.pairs[0]);
        }
    } catch (error) {
        console.warn('[DexScreenerService] Failed to fetch token:', error);
    }
    return null;
}
