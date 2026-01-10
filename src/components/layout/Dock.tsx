import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

interface DockProps {
    onOpenFinder: () => void;
    isFinderOpen: boolean;
}

export function Dock({ onOpenFinder, isFinderOpen }: DockProps) {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-end gap-3 px-4 pb-3 pt-2 h-16 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-dock will-change-transform"
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
        >
            {/* Finder (Token List) */}
            <DockItem mouseX={mouseX} onClick={onOpenFinder} isOpen={isFinderOpen} label="Finder">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md border border-white/20 relative overflow-hidden">
                    {/* Finder Face Minimal */}
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-300/30" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-300/30" />
                    <span className="text-3xl relative z-10 drop-shadow-md">🦅</span>
                </div>
            </DockItem>

            <DockDivider />

            {/* Meteora App */}
            <a href="https://meteora.ag" target="_blank" rel="noopener noreferrer">
                <DockItem mouseX={mouseX} label="Meteora">
                    <div className="w-full h-full bg-[#1A1A1A] rounded-[18px] flex items-center justify-center shadow-md border border-white/10 overflow-hidden p-1.5">
                        <img
                            src="/meteora-logo.png"
                            alt="Meteora"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </DockItem>
            </a>

            {/* Raydium App */}
            <a href="https://raydium.io" target="_blank" rel="noopener noreferrer">
                <DockItem mouseX={mouseX} label="Raydium">
                    <div className="w-full h-full bg-[#1C1335] rounded-[18px] flex items-center justify-center shadow-md border border-white/10 overflow-hidden p-1.5">
                        <img
                            src="/raydium-logo.jpg"
                            alt="Raydium"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </DockItem>
            </a>

            <DockDivider />

            {/* America.fun App */}
            <a href="https://america.fun" target="_blank" rel="noopener noreferrer">
                <DockItem mouseX={mouseX} label="America.fun">
                    <div className="w-full h-full bg-amber-50 rounded-[18px] flex items-center justify-center shadow-md border border-white/10 overflow-hidden relative group-hover:brightness-110 transition-all">
                        <img
                            src="/america-logo.jpg"
                            alt="America.fun"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </DockItem>
            </a>

            {/* Jupiter App */}
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">
                <DockItem mouseX={mouseX} label="Jupiter">
                    <div className="w-full h-full bg-[#131111] rounded-[18px] flex items-center justify-center shadow-md border border-white/10 overflow-hidden p-1.5">
                        <img
                            src="https://jup.ag/svg/jupiter-logo.svg"
                            alt="Jupiter"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </DockItem>
            </a>

            {/* WLFI App */}
            <a href="https://worldlibertyfinancial.com/" target="_blank" rel="noopener noreferrer">
                <DockItem mouseX={mouseX} label="WLFI">
                    <div className="w-full h-full bg-[#131111] rounded-[18px] flex items-center justify-center shadow-md border border-white/10 overflow-hidden">
                        <img
                            src="/wlfi-logo.jpg"
                            alt="WLFI"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </DockItem>
            </a>
        </div>
    );
}

function DockItem({ mouseX, children, onClick, isOpen, label }: { mouseX: MotionValue<number>, children: React.ReactNode, onClick?: () => void, isOpen?: boolean, label: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [45, 90, 45]);
    const width = useSpring(widthSync, { stiffness: 400, damping: 25 });

    return (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            onClick={onClick}
            className="aspect-square rounded-[18px] relative flex items-center justify-center cursor-pointer group"
        >
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/10">
                {label}
            </div>

            {children}

            {/* Open Indicator */}
            {isOpen && (
                <div className="absolute -bottom-2 w-1 h-1 bg-black/60 rounded-full dark:bg-white/60" />
            )}
        </motion.div>
    );
}

function DockDivider() {
    return <div className="w-px h-8 bg-gray-400/30 self-end mb-2 mx-1" />;
}
