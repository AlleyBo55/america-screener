import { TokenPair } from '@/types/token';
import { useMemo } from 'react';
import { Activity, BarChart3, DollarSign, Lock, TrendingUp, Zap } from 'lucide-react';

interface FinderStatsProps {
    tokens: TokenPair[];
}

export function FinderStats({ tokens }: FinderStatsProps) {
    const stats = useMemo(() => {
        let totalVol24h = 0;
        let totalMarketCap = 0;
        let totalTxns24h = 0;
        let totalLiquidity = 0;
        let activePairs = 0;

        tokens.forEach(t => {
            totalVol24h += t.volume.h24;
            totalMarketCap += t.marketCap || t.fdv || 0;
            totalTxns24h += (t.txns.h24.buys + t.txns.h24.sells);
            totalLiquidity += t.liquidity.usd;

            if (t.volume.h24 > 0 || (t.txns.h24.buys + t.txns.h24.sells) > 0) {
                activePairs++;
            }
        });

        const volLiqRatio = totalLiquidity > 0 ? totalVol24h / totalLiquidity : 0;

        return {
            totalVol24h,
            totalMarketCap,
            totalTxns24h,
            totalLiquidity,
            activePairs,
            volLiqRatio,
            totalTokens: tokens.length
        };
    }, [tokens]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
                label="Total Vol (24h)"
                value={`$${stats.totalVol24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
            />
            <StatCard
                label="Total Market Cap"
                value={`$${stats.totalMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                icon={<DollarSign className="w-4 h-4 text-green-500" />}
            />
            <StatCard
                label="Active Pairs"
                value={stats.activePairs.toLocaleString()}
                subValue={`of ${stats.totalTokens}`}
                icon={<Activity className="w-4 h-4 text-orange-500" />}
            />
            <StatCard
                label="Total Txns (24h)"
                value={stats.totalTxns24h.toLocaleString()}
                icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
            />
            <StatCard
                label="Total Liquidity"
                value={`$${stats.totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                icon={<Lock className="w-4 h-4 text-cyan-500" />}
            />
            <StatCard
                label="Vol/Liq Ratio"
                value={stats.volLiqRatio.toFixed(2)}
                icon={<Zap className="w-4 h-4 text-yellow-500" />}
            />
        </div>
    );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string, subValue?: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gray-50 rounded-md">
                    {icon}
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <div>
                <div className="text-lg font-bold text-gray-900 leading-none">{value}</div>
                {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
            </div>
        </div>
    );
}
