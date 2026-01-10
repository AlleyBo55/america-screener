'use client';

import { TokenPair } from '@/types/token';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, BarChart3, Layers } from 'lucide-react';

interface StatsWidgetProps {
    tokens: TokenPair[];
}

export const DesktopStatsWidget: React.FC<StatsWidgetProps> = ({ tokens }) => {

    // Calculate Stats
    const stats = useMemo(() => {
        let totalMarketCap = 0;
        let totalVolume24h = 0;
        let totalLiquidity = 0;
        let activeCoins = 0;
        let txn24h = 0;

        tokens.forEach(t => {
            // Market Cap (fallback to FDV if mcap missing)
            totalMarketCap += t.marketCap || t.fdv || 0;
            totalVolume24h += t.volume?.h24 || 0;
            totalLiquidity += t.liquidity?.usd || 0;

            // Active if volume > 0 in last 24h
            if ((t.volume?.h24 || 0) > 0) activeCoins++;

            // Txns
            txn24h += (t.txns?.h24?.buys || 0) + (t.txns?.h24?.sells || 0);
        });

        return {
            totalMarketCap,
            totalVolume24h,
            totalLiquidity,
            activeCoins: activeCoins || tokens.length,
            txn24h,
            coinLaunches: tokens.length
        };
    }, [tokens]);

    // Formatting Helpers
    const formatCurrency = (val: number) => {
        if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
        return `$${val.toFixed(2)}`;
    };

    const formatNumber = (val: number) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K`;
        return val.toLocaleString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4 scale-90 md:scale-100 origin-center"
        >
            {/* Main Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 shadow-2xl p-8">
                {/* Background Gradient Mesh */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* 1. Lifetime Volume (Based on 24h for now) */}
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Volume (24h)</span>
                        <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            {formatCurrency(stats.totalVolume24h)}
                        </span>
                        <span className="text-xs text-gray-500">Across {stats.activeCoins} active pairs</span>
                    </div>

                    {/* 2. Coin Launches */}
                    <div className="flex flex-col items-center justify-center space-y-2 border-y md:border-y-0 md:border-x border-white/5 py-6 md:py-0">
                        <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Tokens</span>
                        <span className="text-4xl md:text-5xl font-bold text-white">
                            {formatNumber(stats.coinLaunches)}
                        </span>
                        <span className="text-xs text-blue-400">@america.fun</span>
                    </div>

                    {/* 3. Active Coins */}
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Active Pairs</span>
                        <span className="text-4xl md:text-5xl font-bold text-green-400">
                            {stats.activeCoins}
                        </span>
                        <span className="text-xs text-green-500/80">Trading live right now</span>
                    </div>
                </div>
            </div>

            {/* Sub Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Market Cap"
                    value={formatCurrency(stats.totalMarketCap)}
                    subValue="Eagle Network"
                    subColor="text-green-500"
                    icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                />
                <StatCard
                    label="24h Transactions"
                    value={formatNumber(stats.txn24h)}
                    subValue="Buys & Sells"
                    subColor="text-blue-400"
                    icon={<Activity className="w-4 h-4 text-gray-400" />}
                />
                <StatCard
                    label="Total Liquidity"
                    value={formatCurrency(stats.totalLiquidity)}
                    subValue="Locked Value"
                    subColor="text-purple-400"
                    icon={<Layers className="w-4 h-4 text-gray-400" />}
                />
                <StatCard
                    label="Volume/Liquidity"
                    value={(stats.totalLiquidity > 0 ? (stats.totalVolume24h / stats.totalLiquidity).toFixed(2) : '0')}
                    subValue="Velocity Ratio"
                    subColor="text-orange-400"
                    icon={<BarChart3 className="w-4 h-4 text-gray-400" />}
                />
            </div>
        </motion.div>
    );
};

// Sub-component for smaller cards
const StatCard = ({ label, value, subValue, subColor, icon }: { label: string, value: string, subValue: string, subColor: string, icon: React.ReactNode }) => (
    <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-colors group">
        <div className="flex flex-col h-full justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-wide group-hover:text-white transition-colors">{label}</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className={`text-xs font-medium ${subColor} flex items-center gap-1`}>
                {subValue}
            </div>
        </div>
    </div>
);
