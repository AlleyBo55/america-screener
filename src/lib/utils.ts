/**
 * Format a number as USD currency
 */
export function formatUsd(value: number): string {
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    if (value >= 1) {
        return `$${value.toFixed(2)}`;
    }
    if (value >= 0.0001) {
        return `$${value.toFixed(4)}`;
    }
    return `$${value.toExponential(2)}`;
}

/**
 * Format a price with appropriate precision
 */
export function formatPrice(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return '$0.00';

    if (num >= 1) {
        return `$${num.toFixed(2)}`;
    }
    if (num >= 0.0001) {
        return `$${num.toFixed(6)}`;
    }
    // For very small numbers, show significant digits
    const str = num.toFixed(12);
    const match = str.match(/^0\.(0+)([1-9]\d{0,3})/);
    if (match) {
        const zeros = match[1].length;
        const digits = match[2];
        return `$0.0{${zeros}}${digits}`;
    }
    return `$${num.toExponential(2)}`;
}

/**
 * Format percentage change with color indicator
 */
export function formatPercent(value: number): { text: string; isPositive: boolean } {
    const isPositive = value >= 0;
    const text = `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
    return { text, isPositive };
}

/**
 * Format number with abbreviation
 */
export function formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(2)}K`;
    }
    return value.toFixed(0);
}

/**
 * Format age in human readable format
 */
export function formatAge(minutes: number): string {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;

    const months = Math.floor(days / 30);
    return `${months}mo`;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate DexScreener URL for a token
 */
export function getDexScreenerUrl(pairAddress: string): string {
    return `https://dexscreener.com/solana/${pairAddress}`;
}

/**
 * Generate Raydium swap URL
 */
export function getRaydiumUrl(tokenAddress: string): string {
    return `https://raydium.io/swap/?inputMint=sol&outputMint=${tokenAddress}`;
}

/**
 * Generate Jupiter swap URL
 */
export function getJupiterUrl(tokenAddress: string): string {
    return `https://jup.ag/swap/SOL-${tokenAddress}`;
}

/**
 * Generate america.fun token URL
 */
export function getAmericaFunUrl(tokenAddress: string): string {
    return `https://america.fun/token/${tokenAddress}`;
}

/**
 * Generate Solscan URL
 */
export function getSolscanUrl(address: string): string {
    return `https://solscan.io/token/${address}`;
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Class name utility (like clsx but simpler)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
