"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Win96WindowProps {
    title?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    onClose?: () => void;
    isActive?: boolean;
}

export const Win96Window: React.FC<Win96WindowProps> = ({
    title = "america.fun",
    children,
    icon,
    className = "",
    onClose,
    isActive = true
}) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`glass-panel rounded-xl overflow-hidden flex flex-col ${className}`}
        >
            {/* Premium Title Bar */}
            <div className={`
                flex items-center justify-between px-3 py-2
                bg-gradient-to-r from-win96-gray-light/90 to-white/50
                backdrop-blur-md border-b border-white/50
            `}>
                <div className="flex items-center gap-2">
                    {/* Mac-style traffic lights but retro colors */}
                    <div className="flex gap-1.5 mr-2 group">
                        <div className="w-3 h-3 rounded-full bg-america-red border border-america-red/50 shadow-sm cursor-pointer hover:bg-red-400 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-america-gold border border-america-gold/50 shadow-sm cursor-pointer hover:bg-yellow-400 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/30 shadow-sm cursor-pointer hover:bg-green-400 transition-colors" />
                    </div>

                    {icon && <span className="w-4 h-4 flex items-center justify-center opacity-80">{icon}</span>}
                    <span className="text-win96-black font-semibold tracking-wide font-sans text-sm opacity-80">
                        {title}
                    </span>
                </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm relative flex flex-col">
                {children}
            </div>
        </motion.div>
    );
};
