'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveVisitorWidget() {
    const [count, setCount] = useState(142);

    useEffect(() => {
        // Set initial random count
        setCount(Math.floor(Math.random() * (160 - 110 + 1)) + 110);

        const interval = setInterval(() => {
            setCount(prev => {
                // Random fluctuation between -4 and +6
                const change = Math.floor(Math.random() * 11) - 4;
                let newCount = prev + change;

                // Keep within realistic bounds for this site
                if (newCount < 85) newCount = 85 + Math.floor(Math.random() * 5);
                if (newCount > 340) newCount = 340 - Math.floor(Math.random() * 5);

                return newCount;
            });
        }, 3500); // Update every 3.5s

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-24 right-8 z-0 hidden md:flex flex-col items-center justify-center p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl w-40 h-40 text-white select-none group hover:bg-black/50 transition-colors"
        >
            <div className="flex items-center gap-2 mb-2 opacity-80 uppercase text-[10px] font-bold tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                Live Now
            </div>

            <div className="relative h-12 flex items-center justify-center overflow-hidden mb-1 w-full">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={count}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-5xl font-thin tracking-tighter tabular-nums absolute"
                    >
                        {count.toLocaleString()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                <Users className="w-3.5 h-3.5" />
                <span>Visiting</span>
            </div>
        </motion.div>
    );
}
