'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface YosemiteWindowProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
}

export const YosemiteWindow: React.FC<YosemiteWindowProps> = ({
    title = "Finder",
    children,
    className = "",
    icon,
    onClose
}) => {
    return (
        <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`window-container bg-opacity-95 flex flex-col ${className}`}
        >
            {/* Title Bar (Yosemite Style: Gray/Translucent, Flat Buttons) */}
            <div className={`
                h-10 flex items-center justify-between px-4 select-none
                bg-gray-100/90 border-b border-gray-300/50 backdrop-blur-md
                rounded-t-[inherit]
            `}>
                {/* Traffic Lights */}
                <div className="traffic-lights group">
                    <div className="traffic-light red cursor-pointer hover:bg-[#FF5F56]/80 active:bg-[#BF4C45]" onClick={onClose} />
                    <div className="traffic-light yellow cursor-pointer hover:bg-[#FFBD2E]/80 active:bg-[#BF8E22]" />
                    <div className="traffic-light green cursor-pointer hover:bg-[#27C93F]/80 active:bg-[#1D9730]" />
                </div>

                {/* Title */}
                <div className="flex items-center gap-2 opacity-90 absolute left-1/2 -translate-x-1/2">
                    {icon && <span className="w-4 h-4 flex items-center justify-center text-gray-500">{icon}</span>}
                    <span className="text-sm font-medium text-gray-700 font-sans tracking-wide">
                        {title}
                    </span>
                </div>

                {/* Spacer to balance flex */}
                <div className="w-12" />
            </div>

            {/* Window Content */}
            <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
                {children}
            </div>
        </motion.div>
    );
};
