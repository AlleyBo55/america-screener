"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const RetroLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
            {/* Retro Hourglass Animation (CSS/Divs) or Progress Bar */}
            <div className="w-64">
                <div className="flex justify-between text-win96-black font-retro mb-1 text-lg">
                    <span>Loading...</span>
                    <span>100%</span>
                </div>
                <div className="win96-bevel-in bg-win96-white p-0.5 h-6">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-win96-blue flex items-center justify-center"
                    >
                        {/* Moving blocks pattern for that authentic Win95 feel */}
                        <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.5)_10px,rgba(255,255,255,0.5)_20px)]" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
