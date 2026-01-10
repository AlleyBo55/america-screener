import { TokenPair } from '@/types/token';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Twitter, MessageCircle, AlertTriangle, ShieldCheck, UserCheck, Zap, Activity, TrendingUp, BarChart3, Copy } from 'lucide-react';
import { useState } from 'react';
import { Toast } from '@/components/ui/Toast';

interface TokenDetailViewProps {
    token: TokenPair;
    onClose: () => void;
}

type Timeframe = 'm5' | 'h1' | 'h6' | 'h24';

export function TokenDetailView({ token, onClose }: TokenDetailViewProps) {
    const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('h1');
    const [showToast, setShowToast] = useState(false);

    // Generate simulated data if missing
    const analysis = token.analysis || {
        riskScore: 5,
        auditStatus: 'Unknown',
        bundlerPercentage: 15,
        insiderPercentage: 10,
        kolCount: 3
    };

    // Dynamic Data Helpers
    const getChange = (tf: Timeframe) => token.priceChange?.[tf] || 0;
    const getVolume = (tf: Timeframe) => token.volume?.[tf] || 0;
    const getTxns = (tf: Timeframe) => token.txns?.[tf] || { buys: 0, sells: 0 };

    const currentChange = getChange(activeTimeframe);
    const currentVolume = getVolume(activeTimeframe);
    const { buys, sells } = getTxns(activeTimeframe);

    const isPositive = currentChange >= 0;
    const priceColor = isPositive ? 'text-green-500' : 'text-america-red';
    const bgColor = isPositive ? 'from-green-500/10' : 'from-red-500/10';

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(token.pairAddress);
        setShowToast(true);
    };

    return (
        <>
            <AnimatePresence>
                {showToast && <Toast message="CA Copied" onClose={() => setShowToast(false)} />}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm"
            >
                <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header / Hero */}
                    <div className={`relative p-6 md:p-8 bg-gradient-to-b ${bgColor} to-white transition-colors duration-500`}>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-md shadow-sm z-10"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="flex items-start gap-6">
                            {/* Token Icon */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg bg-white overflow-hidden shrink-0 border-4 border-white"
                            >
                                {token.info?.imageUrl ? (
                                    <img src={token.info.imageUrl} alt={token.baseToken.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-2xl font-bold">
                                        {token.baseToken.symbol.slice(0, 2)}
                                    </div>
                                )}
                            </motion.div>

                            <div className="flex-1 min-w-0 pt-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight truncate">
                                    {token.baseToken.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg font-medium text-gray-500">{token.baseToken.symbol}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />

                                    {/* Copyable Address */}
                                    <button
                                        onClick={handleCopyAddress}
                                        className="flex items-center gap-1.5 text-sm font-mono text-gray-400 hover:text-gray-700 bg-white/50 hover:bg-white px-2 py-0.5 rounded cursor-pointer transition-colors group"
                                    >
                                        <span className="truncate max-w-[120px] md:max-w-none">
                                            {token.pairAddress}
                                        </span>
                                        <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Price Hero */}
                        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <div className={`text-5xl md:text-6xl font-bold tracking-tighter ${priceColor}`}>
                                    ${parseFloat(token.priceUsd || '0').toFixed(6)}
                                </div>
                                <div className={`flex items-center gap-2 mt-2 text-lg font-medium ${priceColor}`}>
                                    <span>{isPositive ? '▲' : '▼'} {Math.abs(currentChange).toFixed(2)}%</span>
                                    <span className="text-gray-400 font-normal text-sm">({activeTimeframe.toUpperCase()})</span>
                                </div>
                            </div>

                            {/* Interactive Timeframe Selector */}
                            <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 self-start md:self-end">
                                {(['m5', 'h1', 'h6', 'h24'] as Timeframe[]).map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setActiveTimeframe(tf)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                                            ${activeTimeframe === tf
                                                ? 'bg-white text-black shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'}
                                        `}
                                    >
                                        {tf.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 md:px-8 md:pb-8">

                        {/* Narrative Summary */}
                        <div className="mb-8 text-lg text-gray-600 leading-relaxed font-medium">
                            {isPositive
                                ? `${token.baseToken.name} is surging in the last ${activeTimeframe.replace('m', ' minute').replace('h', ' hour')}, showing strong buy pressure.`
                                : `Consolidation phase detected for ${token.baseToken.name} over the past ${activeTimeframe.replace('m', ' minute').replace('h', ' hour')}.`
                            }
                            {' '}
                            Current market cap sits at <span className="text-gray-900 font-bold">${(token.fdv || 0).toLocaleString()}</span>.
                        </div>

                        {/* Dynamic Stats Grid */}
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            {activeTimeframe.toUpperCase()} Performance
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {/* 1. Volume */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Volume</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">${currentVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>

                            {/* 2. Buys */}
                            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex flex-col">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Buys</span>
                                </div>
                                <span className="text-xl font-bold text-green-700">{buys}</span>
                            </div>

                            {/* 3. Sells */}
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col">
                                <div className="flex items-center gap-2 text-red-500 mb-1">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Sells</span>
                                </div>
                                <span className="text-xl font-bold text-red-700">{sells}</span>
                            </div>

                            {/* 4. Risk Score (Static) */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Risk</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">{analysis.riskScore}/10</span>
                            </div>
                        </div>


                        {/* Premium Intelligence (Static) */}
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Deep Scan</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {/* Audit */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                                <ShieldCheck className="w-6 h-6 mb-2 text-green-500" />
                                <span className="text-lg font-bold text-gray-900 truncate w-full">{analysis.auditStatus}</span>
                                <span className="text-xs font-semibold text-gray-500 mt-1">Audit</span>
                            </div>

                            {/* Insider */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                                <UserCheck className="w-6 h-6 mb-2 text-purple-500" />
                                <span className="text-2xl font-bold text-gray-900">{analysis.insiderPercentage}%</span>
                                <span className="text-xs font-semibold text-gray-500 mt-1">Insiders</span>
                            </div>

                            {/* KOLs */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                                <Zap className="w-6 h-6 mb-2 text-yellow-500" />
                                <span className="text-2xl font-bold text-gray-900">{analysis.kolCount}</span>
                                <span className="text-xs font-semibold text-gray-500 mt-1">Tracked KOLs</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-3">
                            {token.info?.websites?.map((w, i) => (
                                <a key={i} href={w.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                    {w.label}
                                </a>
                            ))}
                            {token.info?.socials?.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors capitalize"
                                >
                                    {s.type === 'twitter' ? <Twitter className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                    {s.type}
                                </a>
                            ))}
                            {/* DexScreener Link */}
                            <a href={`https://dexscreener.com/solana/${token.pairAddress}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-america-blue hover:opacity-90 rounded-xl text-sm font-semibold text-white transition-colors ml-auto"
                            >
                                View on DexScreener
                            </a>
                        </div>

                    </div>
                </div>
            </motion.div>
        </>
    );
}
