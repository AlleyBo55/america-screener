'use client';

import { motion } from 'framer-motion';

interface StickyNoteProps {
    onClick?: () => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -3, scale: 1 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
            className="absolute top-1/4 left-[2%] md:left-[3%] w-64 aspect-square bg-[#FFF7D1] shadow-xl p-6 flex flex-col justify-between cursor-pointer origin-top-center font-serif text-gray-800 transform rotate-[2deg]"
            style={{
                boxShadow: '4px 4px 15px rgba(0,0,0,0.15)',
            }}
        >
            <div className="font-handwriting text-lg leading-relaxed">
                <span className="font-bold text-red-500/80 block mb-2">Reminder:</span>
                Use the <span className="font-bold border-b-2 border-black/10">Finder</span> to analyze full market data, liquidity, and token launches.
            </div>

            <div className="text-xs text-gray-400 font-mono text-right mt-4">
                - Admin
            </div>

            {/* Simulated Tape or Pin (Optional, simplified) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-[1px] -rotate-1 opacity-50" />
        </motion.div>
    );
};
