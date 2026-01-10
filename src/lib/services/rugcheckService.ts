/**
 * RugCheck Service
 * 
 * API service for token risk analysis from RugCheck.xyz
 * Uses singleton fetcher for rate limiting
 */

import { fetcher } from '@/lib/api/fetcher';

const RUGCHECK_API = 'https://api.rugcheck.xyz';

// Cache with TTL
const cache = new Map<string, { data: RugCheckReport; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// Types
// ============================================

export interface RugCheckRisk {
    name: string;
    description: string;
    level: 'info' | 'warn' | 'danger';
    score: number;
    value?: string;
}

export interface RugCheckReport {
    mint: string;
    score: number;
    scoreNormalized: number;
    riskLevel: 'Good' | 'Warn' | 'Danger' | 'Unknown';
    risks: RugCheckRisk[];
    lpLockedPct: number;
    freezeAuthority: string | null;
    mintAuthority: string | null;
    creator?: string;
    createdAt?: string;
    isVerified: boolean;
    tokenProgram: string;
}

// ============================================
// Helpers
// ============================================

function normalizeScore(score: number): number {
    const maxScore = 10000;
    const normalized = Math.max(0, Math.min(100, 100 - (score / maxScore) * 100));
    return Math.round(normalized);
}

function determineRiskLevel(score: number): 'Good' | 'Warn' | 'Danger' | 'Unknown' {
    const normalized = normalizeScore(score);
    if (normalized >= 70) return 'Good';
    if (normalized >= 40) return 'Warn';
    if (normalized >= 0) return 'Danger';
    return 'Unknown';
}

function createUnknownReport(mintAddress: string): RugCheckReport {
    return {
        mint: mintAddress,
        score: 0,
        scoreNormalized: 0,
        riskLevel: 'Unknown',
        risks: [],
        lpLockedPct: 0,
        freezeAuthority: null,
        mintAuthority: null,
        isVerified: false,
        tokenProgram: 'Unknown',
    };
}

function getFromCache(mint: string): RugCheckReport | null {
    const cached = cache.get(mint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }
    return null;
}

function setCache(mint: string, report: RugCheckReport): void {
    cache.set(mint, { data: report, timestamp: Date.now() });
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch token report from RugCheck
 */
export async function getRugCheckReport(mint: string): Promise<RugCheckReport | null> {
    // Check cache
    const cached = getFromCache(mint);
    if (cached) return cached;

    try {
        // Ensure standard url structure
        const baseUrl = RUGCHECK_API.endsWith('/') ? RUGCHECK_API.slice(0, -1) : RUGCHECK_API;

        const data = await fetcher.fetch<any>( // Keep 'any' here as the API response structure might not perfectly match RugCheckReport directly
            `${baseUrl}/tokens/${mint}/report`,
            { dedupeKey: `rugcheck:${mint}` }
        );

        console.log('[RugCheck Debug] Raw Data:', JSON.stringify(data, null, 2));

        // Calculate LP Locked % from markets if root is 0
        let lpLockedPct = data.lpLockedPct || 0;

        if (lpLockedPct === 0 && data.markets && Array.isArray(data.markets)) {
            if (data.markets && Array.isArray(data.markets)) {
                // Find maximum LP locked percentage across any market with liquidity
                // We don't filter by liquidity closely because some locked pools might be the 'main' ones even if reported liquidty is weirdly low in stats
                lpLockedPct = data.markets.reduce((max: number, market: any) => {
                    const marketPct = market.lp?.lpLockedPct || market.lpLockedPct || 0;
                    return Math.max(max, marketPct);
                }, lpLockedPct);
            }
        }

        const report: RugCheckReport = {
            mint: mint,
            score: data.score || 0,
            scoreNormalized: data.score_normalised || normalizeScore(data.score || 0),
            riskLevel: determineRiskLevel(data.score || 0),
            risks: (data.risks || []).map((r: any) => ({
                name: r.name || 'Unknown',
                description: r.description || '',
                level: (r.level || 'info') as 'info' | 'warn' | 'danger',
                score: r.score || 0,
                value: r.value,
            })),
            lpLockedPct: lpLockedPct,
            freezeAuthority: data.freezeAuthority || null,
            mintAuthority: data.mintAuthority || null,
            creator: data.creator,
            createdAt: data.createAt,
            isVerified: data.verification?.jup_verified || false,
            tokenProgram: data.tokenProgram || 'Unknown',
        };

        setCache(mint, report);
        return report;
    } catch (error) {
        console.warn('[RugCheckService] Failed to fetch report:', error);
        return createUnknownReport(mint);
    }
}

/**
 * Clear cache
 */
export function clearCache(): void {
    cache.clear();
}
