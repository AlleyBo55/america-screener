'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, onClose, duration = 2000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-start justify-center md:justify-end md:p-6 p-0">

            {/* DESKTOP: Yosemite Notification Style */}
            <div className="hidden md:block">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-xl p-3 px-4 flex items-center gap-3 min-w-[280px]"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                        <span className="text-xl">🦅</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">America Screener</h4>
                        <p className="text-gray-600 text-xs font-medium">{message}</p>
                    </div>
                </motion.div>
            </div>

            {/* MOBILE: iPod / iOS 7 Style Overlay */}
            <div className="md:hidden w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-black/80 backdrop-blur-md rounded-[20px] p-6 flex flex-col items-center justify-center min-w-[160px] min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-3">
                        <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide">{message}</span>
                </motion.div>
            </div>

        </div>
    );
}
