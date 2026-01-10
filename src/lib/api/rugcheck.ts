/**
 * RugCheck API Client
 * 
 * Provides token risk analysis data from RugCheck.xyz
 * Free API with rate limiting - no API key required for basic usage
 * 
 * @see https://api.rugcheck.xyz/swagger/index.html
 */

const RUGCHECK_API = 'https://api.rugcheck.xyz';

// Simple in-memory cache with TTL
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
    score: number;           // Raw score (higher = more risk)
    scoreNormalized: number; // 0-100 normalized (higher = safer)
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

export interface RugCheckSummary {
    mint: string;
    score: number;
    scoreNormalized: number;
    lpLockedPct: number;
    risks: RugCheckRisk[];
    tokenType: string;
}

// ============================================
// Helper Functions
// ============================================

function normalizeScore(score: number): number {
    // RugCheck scores: higher = more risk
    // We invert and normalize to 0-100 where higher = safer
    // Typical scores range from 0 to ~10000
    const maxScore = 10000;
    const normalized = Math.max(0, Math.min(100, 100 - (score / maxScore) * 100));
    return Math.round(normalized);
}

function determineRiskLevel(score: number): 'Good' | 'Warn' | 'Danger' | 'Unknown' {
    // Based on normalized score (higher = safer)
    const normalized = normalizeScore(score);
    if (normalized >= 70) return 'Good';
    if (normalized >= 40) return 'Warn';
    if (normalized >= 0) return 'Danger';
    return 'Unknown';
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch detailed token report from RugCheck
 * Uses caching to reduce API calls
 */
export async function getTokenReport(mintAddress: string): Promise<RugCheckReport | null> {
    // Check cache first
    const cached = cache.get(mintAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const response = await fetch(`${RUGCHECK_API}/v1/tokens/${mintAddress}/report/summary`, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('[RugCheck] Rate limited, using fallback');
                return null;
            }
            if (response.status === 404) {
                // Token not found in RugCheck - return unknown status
                return createUnknownReport(mintAddress);
            }
            throw new Error(`RugCheck API error: ${response.status}`);
        }

        const data = await response.json();

        const report: RugCheckReport = {
            mint: mintAddress,
            score: data.score || 0,
            scoreNormalized: data.score_normalised || normalizeScore(data.score || 0),
            riskLevel: determineRiskLevel(data.score || 0),
            risks: (data.risks || []).map((r: { name: string; description: string; level: string; score: number; value?: string }) => ({
                name: r.name || 'Unknown',
                description: r.description || '',
                level: (r.level || 'info') as 'info' | 'warn' | 'danger',
                score: r.score || 0,
                value: r.value,
            })),
            lpLockedPct: data.lpLockedPct || 0,
            freezeAuthority: data.freezeAuthority || null,
            mintAuthority: data.mintAuthority || null,
            creator: data.creator,
            createdAt: data.createAt,
            isVerified: data.verification?.jup_verified || false,
            tokenProgram: data.tokenProgram || 'Unknown',
        };

        // Cache the result
        cache.set(mintAddress, { data: report, timestamp: Date.now() });

        return report;
    } catch (error) {
        console.error('[RugCheck] Failed to fetch report:', error);
        return null;
    }
}

/**
 * Bulk fetch token summaries (more efficient for lists)
 */
export async function getBulkTokenSummaries(mintAddresses: string[]): Promise<Map<string, RugCheckSummary>> {
    const results = new Map<string, RugCheckSummary>();

    if (mintAddresses.length === 0) return results;

    try {
        const response = await fetch(`${RUGCHECK_API}/v1/bulk/tokens/summary`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mints: mintAddresses }),
        });

        if (!response.ok) {
            console.warn('[RugCheck] Bulk summary failed:', response.status);
            return results;
        }

        const data = await response.json();

        for (const report of (data.reports || [])) {
            if (report.mint) {
                results.set(report.mint, {
                    mint: report.mint,
                    score: report.score || 0,
                    scoreNormalized: report.score_normalised || normalizeScore(report.score || 0),
                    lpLockedPct: report.lpLockedPct || 0,
                    risks: report.risks || [],
                    tokenType: report.tokenType || 'Unknown',
                });
            }
        }

        return results;
    } catch (error) {
        console.error('[RugCheck] Bulk summary error:', error);
        return results;
    }
}

/**
 * Create a fallback report for unknown tokens
 */
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

/**
 * Clear the cache (useful for refresh)
 */
export function clearRugCheckCache(): void {
    cache.clear();
}
