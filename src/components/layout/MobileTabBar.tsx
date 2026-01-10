'use client';

import { Music, Search, Globe, Rocket } from 'lucide-react';

interface MobileTabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white/95 backdrop-blur-xl border-t border-gray-300 z-50 flex items-center justify-around pb-safe safe-area-bottom">
            {/* 1. Tokens (Home) */}
            <TabItem
                icon={<Music className="w-6 h-6" />}
                label="Tokens"
                isActive={activeTab === 'tokens'}
                onClick={() => onTabChange('tokens')}
            />

            {/* 2. America.fun (External) */}
            <a href="https://america.fun" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                <TabItem
                    icon={<Globe className="w-6 h-6" />}
                    label="America"
                    isActive={false}
                    onClick={() => { }} // Handled by <a>
                />
            </a>

            {/* 3. Jupiter (External) */}
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                <TabItem
                    icon={<Rocket className="w-6 h-6" />}
                    label="Jupiter"
                    isActive={false}
                    onClick={() => { }} // Handled by <a>
                />
            </a>

            {/* 4. Search (Activates Search Mode) */}
            <TabItem
                icon={<Search className="w-6 h-6" />}
                label="Search"
                isActive={activeTab === 'search'}
                onClick={() => onTabChange('search')}
            />
        </div>
    );
}

function TabItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-[#FF2D55]' : 'text-gray-400'}`}
        >
            <div className="mb-0.5">
                {icon}
            </div>
            <span className="text-[10px] font-medium tracking-tight">
                {label}
            </span>
        </button>
    );
}
