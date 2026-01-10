"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const RetroEagle = () => {
    return (
        <div className="relative w-32 h-32 md:w-48 md:h-48 pointer-events-none">
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-full h-full"
            >
                <Image
                    src="/retro-eagle.png"
                    alt="America.fun Eagle"
                    fill
                    className="object-contain drop-shadow-lg pixelated"
                    style={{ imageRendering: 'pixelated' }}
                />
            </motion.div>

            {/* Sparkles or Stars effect */}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute top-0 right-0 text-america-gold font-retro text-2xl"
            >
                ★
            </motion.div>
        </div>
    );
};
