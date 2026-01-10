'use client';

import { TokenPair } from '@/types/token';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, BarChart3, Layers } from 'lucide-react';

interface NetworkStatsDashboardProps {
    tokens: TokenPair[];
}

export const NetworkStatsDashboard: React.FC<NetworkStatsDashboardProps> = ({ tokens }) => {

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
        <div className="w-full p-4 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardCard
                    label="Total Market Cap"
                    value={formatCurrency(stats.totalMarketCap)}
                    subValue="Eagle Network"
                    subColor="text-green-600"
                    icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                />
                <DashboardCard
                    label="24h Volume"
                    value={formatCurrency(stats.totalVolume24h)}
                    subValue={`Across ${stats.activeCoins} pairs`}
                    subColor="text-blue-600"
                    icon={<BarChart3 className="w-4 h-4 text-gray-400" />}
                />
                <DashboardCard
                    label="24h Transactions"
                    value={formatNumber(stats.txn24h)}
                    subValue="Total Buys & Sells"
                    subColor="text-indigo-600"
                    icon={<Activity className="w-4 h-4 text-gray-400" />}
                />
                <DashboardCard
                    label="Total Liquidity"
                    value={formatCurrency(stats.totalLiquidity)}
                    subValue="Locked Value"
                    subColor="text-purple-600"
                    icon={<Layers className="w-4 h-4 text-gray-400" />}
                />
            </div>
        </div>
    );
};

// Sub-component for Dashboard cards (Light theme for Finder)
const DashboardCard = ({ label, value, subValue, subColor, icon }: { label: string, value: string, subValue: string, subColor: string, icon: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col h-full justify-between gap-1">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>
            <div className={`text-[10px] font-medium ${subColor} flex items-center gap-1`}>
                {subValue}
            </div>
        </div>
    </div>
);
