'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface RateLimitModalProps {
    isOpen: boolean;
    retryAfterSeconds: number;
    onComplete: () => void;
}

export const RateLimitModal: React.FC<RateLimitModalProps> = ({
    isOpen,
    retryAfterSeconds,
    onComplete,
}) => {
    const [countdown, setCountdown] = useState(retryAfterSeconds);

    // Reset countdown when modal opens
    useEffect(() => {
        if (isOpen) {
            setCountdown(retryAfterSeconds);
        }
    }, [isOpen, retryAfterSeconds]);

    // Countdown timer
    useEffect(() => {
        if (!isOpen || countdown <= 0) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, countdown, onComplete]);

    // Manual reload
    const handleManualReload = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
                    >
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-orange-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            API Rate Limit Reached
                        </h2>

                        {/* Description */}
                        <p className="text-gray-400 mb-8">
                            Too many requests. The page will auto-refresh when the cooldown ends.
                        </p>

                        {/* Countdown Ring */}
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background Circle */}
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    className="text-gray-700"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    className="text-orange-500 transition-all duration-1000"
                                    style={{
                                        strokeDasharray: 2 * Math.PI * 45,
                                        strokeDashoffset: 2 * Math.PI * 45 * (1 - countdown / retryAfterSeconds),
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white font-mono">
                                    {countdown}
                                </span>
                            </div>
                        </div>

                        {/* Manual Refresh Button */}
                        <button
                            onClick={handleManualReload}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Now
                        </button>

                        <p className="mt-4 text-xs text-gray-500">
                            Auto-refreshing in {countdown} seconds...
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
