'use client';

/**
 * ApiFetcher - Singleton HTTP Client
 * 
 * Production-grade fetcher with:
 * - Rate limiting (token bucket algorithm)
 * - Request deduplication (in-flight cache)
 * - Automatic retry with exponential backoff
 * - Global error event emission
 * 
 * @author AlleyBo55
 */

// ============================================
// Types
// ============================================

export interface FetcherOptions extends RequestInit {
    /** Skip rate limit check (use sparingly) */
    skipRateLimit?: boolean;
    /** Custom retry count (default: 3) */
    retries?: number;
    /** Dedupe key override */
    dedupeKey?: string;
}

export interface RateLimitEvent {
    retryAfterSeconds: number;
    message: string;
}

type RateLimitCallback = (event: RateLimitEvent) => void;

// ============================================
// Singleton Fetcher Class
// ============================================

class ApiFetcher {
    private static instance: ApiFetcher | null = null;

    // Rate limiting state (sliding window)
    private requestTimestamps: number[] = [];
    private readonly MAX_REQUESTS_PER_MINUTE = 250; // DexScreener allows 300, we use 250 as buffer
    private readonly RATE_LIMIT_WINDOW_MS = 60_000;

    // Request deduplication (in-flight cache)
    private inFlightRequests: Map<string, Promise<Response>> = new Map();

    // Rate limit event listeners
    private rateLimitListeners: Set<RateLimitCallback> = new Set();

    // Flag to block all requests when rate limited
    private isRateLimited = false;
    private rateLimitResetTime = 0;

    private constructor() {
        // Private constructor enforces singleton
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): ApiFetcher {
        if (!ApiFetcher.instance) {
            ApiFetcher.instance = new ApiFetcher();
        }
        return ApiFetcher.instance;
    }

    /**
     * Subscribe to rate limit events
     */
    public onRateLimit(callback: RateLimitCallback): () => void {
        this.rateLimitListeners.add(callback);
        return () => {
            this.rateLimitListeners.delete(callback);
        };
    }

    /**
     * Main fetch method with rate limiting and deduplication
     */
    public async fetch<T>(url: string, options: FetcherOptions = {}): Promise<T> {
        const { skipRateLimit = false, retries = 3, dedupeKey, ...fetchOptions } = options;

        // Check if globally rate limited
        if (this.isRateLimited && Date.now() < this.rateLimitResetTime) {
            throw new Error('Rate limited. Please wait.');
        }

        // Rate limit check (unless skipped)
        if (!skipRateLimit) {
            await this.enforceRateLimit();
        }

        // Deduplication key
        const requestKey = dedupeKey || `${fetchOptions.method || 'GET'}:${url}`;

        // Check for in-flight duplicate
        const existingRequest = this.inFlightRequests.get(requestKey);
        if (existingRequest) {
            const response = await existingRequest;
            return response.clone().json();
        }

        // Create the request promise
        const requestPromise = this.executeWithRetry(url, fetchOptions, retries);
        this.inFlightRequests.set(requestKey, requestPromise);

        try {
            const response = await requestPromise;

            // Handle rate limit response (429)
            if (response.status === 429) {
                this.handleRateLimitResponse(response);
                throw new Error('Rate limit exceeded');
            }

            // Parse and return JSON
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } finally {
            // Clean up in-flight cache
            this.inFlightRequests.delete(requestKey);
        }
    }

    /**
     * Enforce client-side rate limit (sliding window)
     */
    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

        // Remove timestamps outside the window
        this.requestTimestamps = this.requestTimestamps.filter(ts => ts > windowStart);

        // Check if at limit
        if (this.requestTimestamps.length >= this.MAX_REQUESTS_PER_MINUTE) {
            const oldestRequest = this.requestTimestamps[0];
            const waitTime = oldestRequest + this.RATE_LIMIT_WINDOW_MS - now;

            // Emit rate limit event
            this.emitRateLimitEvent(Math.ceil(waitTime / 1000));

            // Wait for the oldest request to expire
            await this.sleep(waitTime);
        }

        // Record this request
        this.requestTimestamps.push(now);
    }

    /**
     * Execute fetch with exponential backoff retry
     */
    private async executeWithRetry(
        url: string,
        options: RequestInit,
        retriesLeft: number
    ): Promise<Response> {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers,
                },
            });
            return response;
        } catch (error) {
            if (retriesLeft > 0) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, 3 - retriesLeft) * 1000;
                await this.sleep(delay);
                return this.executeWithRetry(url, options, retriesLeft - 1);
            }
            throw error;
        }
    }

    /**
     * Handle 429 response from server
     */
    private handleRateLimitResponse(response: Response): void {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;

        // Set global rate limit flag
        this.isRateLimited = true;
        this.rateLimitResetTime = Date.now() + retryAfterSeconds * 1000;

        // Emit event for UI
        this.emitRateLimitEvent(retryAfterSeconds);

        // Auto-reset after the period
        setTimeout(() => {
            this.isRateLimited = false;
        }, retryAfterSeconds * 1000);
    }

    /**
     * Emit rate limit event to all listeners
     */
    private emitRateLimitEvent(retryAfterSeconds: number): void {
        const event: RateLimitEvent = {
            retryAfterSeconds,
            message: `Rate limit reached. Retrying in ${retryAfterSeconds}s...`,
        };

        this.rateLimitListeners.forEach(callback => {
            try {
                callback(event);
            } catch (e) {
                console.error('Rate limit listener error:', e);
            }
        });
    }

    /**
     * Utility sleep function
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current request count (for debugging)
     */
    public getRequestCount(): number {
        const now = Date.now();
        const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
        return this.requestTimestamps.filter(ts => ts > windowStart).length;
    }

    /**
     * Check if currently rate limited
     */
    public isCurrentlyRateLimited(): boolean {
        return this.isRateLimited && Date.now() < this.rateLimitResetTime;
    }
}

// Export singleton instance
export const fetcher = ApiFetcher.getInstance();

// Export class for testing
export { ApiFetcher };
