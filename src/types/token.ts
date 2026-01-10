// Token types for america.fun tracker

export interface Token {
  address: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  decimals: number;
}

export interface TokenPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { url: string; label?: string }[];
    socials?: { type: string; url: string }[];
  };
  // Custom fields for america.fun
  isAmericaFun: boolean;
  bondingCurveProgress?: number; // 0-100, undefined if graduated
  isGraduated: boolean;
  ageMinutes: number;
  // Optional analysis data from RugCheck & SolanaFM APIs
  analysis?: {
    // RugCheck data
    riskScore: number;           // 0-100 normalized (higher = safer)
    riskLevel: 'Good' | 'Warn' | 'Danger' | 'Unknown';
    risks: Array<{ name: string; description: string; level: string; score: number }>;
    lpLockedPct: number;
    freezeAuthority: string | null;
    mintAuthority: string | null;
    isVerified: boolean;

    // SolanaFM holder data
    topHoldersConcentration: number;  // Top 10 holders %
    holderCount: number;
    topHolders: Array<{ address: string; percentage: number }>;

    // Legacy fields for compatibility
    auditStatus: string;
    bundlerPercentage: number;
    insiderPercentage: number;
    kolCount: number;

    // Metadata
    isLoading?: boolean;
    fetchedAt?: number;
  };
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: TokenPair[] | null;
}

// Utility type for sorting
export type SortKey = 'age' | 'price' | 'priceChange' | 'volume' | 'liquidity' | 'marketCap' | 'txns' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Filter configuration
export interface FilterConfig {
  minLiquidity?: number;
  minVolume?: number;
  onlyGraduated?: boolean;
  onlyBonding?: boolean;
  searchQuery?: string;
}
