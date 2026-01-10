/**
 * SolanaFM Service
 * 
 * API service for token holder distribution data
 * Uses singleton fetcher for rate limiting
 */

import { fetcher } from '@/lib/api/fetcher';

const SOLANAFM_API = process.env.NEXT_PUBLIC_SOLANAFM_API_URL || 'https://api.solana.fm/v0';

// Cache with TTL
const cache = new Map<string, { data: HolderDistribution; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// Types
// ============================================

export interface TokenHolder {
    address: string;
    balance: number;
    percentage: number;
}

export interface HolderDistribution {
    mint: string;
    totalHolders: number;
    topHolders: TokenHolder[];
    topHoldersConcentration: number;
    fetchedAt: number;
}

// ============================================
// Helpers
// ============================================

function createEmptyDistribution(mintAddress: string): HolderDistribution {
    return {
        mint: mintAddress,
        totalHolders: 0,
        topHolders: [],
        topHoldersConcentration: 0,
        fetchedAt: Date.now(),
    };
}

export function shortenAddress(address: string, chars = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch holder distribution for a token
 */
export async function getHolderDistribution(mintAddress: string): Promise<HolderDistribution | null> {
    // Check cache
    const cached = cache.get(mintAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        // SolanaFM usually uses v0, checking both just in case or standardizing
        const baseUrl = SOLANAFM_API.endsWith('/') ? SOLANAFM_API.slice(0, -1) : SOLANAFM_API;
        const url = `${baseUrl}/tokens/${mintAddress}/holders?page=1&pageSize=10`;

        const data = await fetcher.fetch<any>(
            url,
            { dedupeKey: `solanafm:${mintAddress}` }
        );

        console.log('[SolanaFM Debug] Raw Data:', JSON.stringify(data, null, 2));

        const holders: TokenHolder[] = [];
        let totalSupply = 0;

        if (data.result && Array.isArray(data.result)) {
            // Calculate total supply
            for (const holder of data.result) {
                totalSupply += parseFloat(holder.amount || holder.balance || '0');
            }

            // Calculate percentages
            for (const holder of data.result) {
                const balance = parseFloat(holder.amount || holder.balance || '0');
                const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

                holders.push({
                    address: holder.owner || holder.address || 'Unknown',
                    balance,
                    percentage: Math.round(percentage * 100) / 100,
                });
            }
        }

        holders.sort((a, b) => b.balance - a.balance);

        const topHoldersConcentration = holders
            .slice(0, 10)
            .reduce((sum, h) => sum + h.percentage, 0);

        const distribution: HolderDistribution = {
            mint: mintAddress,
            totalHolders: data.totalItems || data.total || holders.length,
            topHolders: holders.slice(0, 10),
            topHoldersConcentration: Math.round(topHoldersConcentration * 100) / 100,
            fetchedAt: Date.now(),
        };

        cache.set(mintAddress, { data: distribution, timestamp: Date.now() });
        return distribution;
    } catch (error) {
        console.warn('[SolanaFMService] Failed to fetch holders:', error);
        return createEmptyDistribution(mintAddress);
    }
}

/**
 * Clear cache
 */
export function clearCache(): void {
    cache.clear();
}
