/**
 * SolanaFM API Client
 * 
 * Provides token holder distribution data
 * Free API with rate limiting - no API key required for basic usage
 * 
 * @see https://solana.fm
 */

const SOLANAFM_API = 'https://api.solana.fm';

// Simple in-memory cache with TTL
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
    topHoldersConcentration: number; // Sum of top 10 holders %
    fetchedAt: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch holder distribution for a token mint
 */
export async function getHolderDistribution(mintAddress: string): Promise<HolderDistribution | null> {
    // Check cache first
    const cached = cache.get(mintAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `${SOLANAFM_API}/v1/tokens/${mintAddress}/holders?page=1&pageSize=10`,
            {
                headers: { 'Accept': 'application/json' },
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('[SolanaFM] Rate limited');
                return null;
            }
            if (response.status === 404) {
                return createEmptyDistribution(mintAddress);
            }
            throw new Error(`SolanaFM API error: ${response.status}`);
        }

        const data = await response.json();

        // Parse holder data
        const holders: TokenHolder[] = [];
        let totalSupply = 0;

        // SolanaFM returns holders with balance and owner
        if (data.result && Array.isArray(data.result)) {
            // First pass: calculate total supply from response
            for (const holder of data.result) {
                const balance = parseFloat(holder.amount || holder.balance || '0');
                totalSupply += balance;
            }

            // Second pass: calculate percentages
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

        // Sort by balance descending
        holders.sort((a, b) => b.balance - a.balance);

        // Calculate top 10 concentration
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

        // Cache the result
        cache.set(mintAddress, { data: distribution, timestamp: Date.now() });

        return distribution;
    } catch (error) {
        console.error('[SolanaFM] Failed to fetch holders:', error);
        return null;
    }
}

/**
 * Create empty distribution for unknown tokens
 */
function createEmptyDistribution(mintAddress: string): HolderDistribution {
    return {
        mint: mintAddress,
        totalHolders: 0,
        topHolders: [],
        topHoldersConcentration: 0,
        fetchedAt: Date.now(),
    };
}

/**
 * Clear the cache (useful for refresh)
 */
export function clearSolanaFMCache(): void {
    cache.clear();
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
