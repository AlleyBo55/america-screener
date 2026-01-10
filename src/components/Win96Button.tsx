"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Win96ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'start';
    children: React.ReactNode;
}

export const Win96Button: React.FC<Win96ButtonProps> = ({
    children,
    variant = 'default',
    className = "",
    ...props
}) => {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`
        win96-bevel-out bg-win96-gray active:win96-bevel-in active:bg-win96-gray-light
        px-4 py-1 flex items-center justify-center gap-2
        text-win96-black font-retro text-lg
        disabled:text-win96-gray-dark disabled:cursor-not-allowed
        focus:outline-none focus:ring-1 focus:ring-win96-black focus:ring-dashed focus:ring-offset-1 focus:ring-offset-win96-gray
        ${variant === 'start' ? 'font-bold italic' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    );
};
