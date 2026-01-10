'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function LiveVisitorWidget() {
    const [count] = useState(1); // Real view: just you right now!

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
                <div className="text-5xl font-thin tracking-tighter tabular-nums absolute">
                    {count}
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                <Users className="w-3.5 h-3.5" />
                <span>Visiting</span>
            </div>

            {/* Tooltip hint */}
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/40 font-mono">
                (That's you!)
            </div>
        </motion.div>
    );
}
