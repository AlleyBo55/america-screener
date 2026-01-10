'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetcher, RateLimitEvent } from '@/lib/api/fetcher';

interface UseRateLimitHandlerReturn {
    isRateLimited: boolean;
    retryAfterSeconds: number;
    handleCountdownComplete: () => void;
}

/**
 * Global hook to listen for rate limit events from the singleton fetcher
 * and manage the rate limit modal state.
 */
export function useRateLimitHandler(): UseRateLimitHandlerReturn {
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(60);

    useEffect(() => {
        // Subscribe to rate limit events from the singleton fetcher
        const unsubscribe = fetcher.onRateLimit((event: RateLimitEvent) => {
            setRetryAfterSeconds(event.retryAfterSeconds);
            setIsRateLimited(true);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    const handleCountdownComplete = useCallback(() => {
        setIsRateLimited(false);
        window.location.reload();
    }, []);

    return {
        isRateLimited,
        retryAfterSeconds,
        handleCountdownComplete,
    };
}
