import { TokenPair } from '@/types/token';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Twitter, Send, AlertTriangle, ShieldCheck,
    TrendingUp, Activity, BarChart3, Copy, Users,
    ExternalLink, Calendar, Lock, Unlock, Zap, DollarSign, Clock
} from 'lucide-react';
import { useState } from 'react';
import { Toast } from '@/components/ui/Toast';
import { RugCheckReport } from '@/lib/services/rugcheckService';
import { HolderDistribution, shortenAddress } from '@/lib/services/solanafmService';
import { YosemiteWindow } from '@/components/ui/YosemiteWindow';

interface TokenDetailViewProps {
    token: TokenPair;
    onClose: () => void;
    rugCheckData?: RugCheckReport | null;
    holderData?: HolderDistribution | null;
    isLoadingAnalysis?: boolean;
}

type TimeFrame = 'm5' | 'h1' | 'h6' | 'h24';

export function TokenDetailView({
    token,
    onClose,
    rugCheckData = null,
    holderData = null,
    isLoadingAnalysis = false,
}: TokenDetailViewProps) {
    const [showToast, setShowToast] = useState(false);
    const [txnTimeframe, setTxnTimeframe] = useState<TimeFrame>('h24');

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(token.baseToken.address);
        setShowToast(true);
    };

    // Calculate Safety Score for Display (100% Safe = 0 Risk Score)
    const riskScore = rugCheckData?.scoreNormalized ?? 0;
    const safetyScore = Math.max(0, 100 - riskScore); // Invert score: 0 risk -> 100 safe

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                    {showToast && <Toast message="Address Copied" onClose={() => setShowToast(false)} />}
                </AnimatePresence>

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
                    onClick={onClose}
                />

                {/* Desktop View: Yosemite Window */}
                <motion.div
                    key="desktop-modal"
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="hidden md:flex relative z-10 w-full max-w-4xl max-h-[85vh] pointer-events-auto"
                >
                    <YosemiteWindow
                        title={`${token.baseToken.name} Info`}
                        onClose={onClose}
                        className="w-full h-full shadow-2xl"
                        icon="ℹ️"
                    >
                        <div className="flex h-full bg-[#f6f6f6]">
                            {/* Sidebar: General Info */}
                            <div className="w-80 border-r border-gray-300 bg-[#ececec]/50 flex flex-col p-6 overflow-y-auto">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-24 h-24 mb-4 rounded-[20px] shadow-sm bg-white p-2">
                                        {token.info?.imageUrl ? (
                                            <img src={token.info.imageUrl} alt={token.baseToken.name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                                                🦅
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{token.baseToken.name}</h2>
                                    <span className="text-sm text-gray-500 font-medium mt-1">{token.baseToken.symbol}</span>
                                </div>

                                <div className="bg-white/50 rounded-lg border border-gray-200 p-3 mb-6 shadow-sm">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contract Address</div>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="flex items-center gap-2 w-full text-xs font-mono text-gray-600 hover:text-blue-500 transition-colors bg-white border border-gray-200 rounded px-2 py-1.5 shadow-sm"
                                    >
                                        <span className="truncate">{shortenAddress(token.baseToken.address, 10)}</span>
                                        <Copy className="w-3 h-3 flex-shrink-0 ml-auto" />
                                    </button>
                                </div>

                                <div className="mt-auto space-y-2">
                                    {token.info?.websites?.map((w, i) => (
                                        <a key={i} href={w.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            {w.label || 'Website'}
                                        </a>
                                    ))}
                                    {token.info?.socials?.map((s, i) => (
                                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            {s.type === 'twitter' ? <Twitter className="w-4 h-4 text-sky-500" /> : <Send className="w-4 h-4 text-blue-400" />}
                                            {s.type === 'twitter' ? 'Twitter' : 'Telegram'}
                                        </a>
                                    ))}
                                    <a href={`https://dexscreener.com/solana/${token.pairAddress}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2 bg-america-blue border border-blue-700 rounded-lg text-sm font-medium text-white hover:bg-blue-700 hover:shadow-md transition-all shadow-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        DexScreener
                                    </a>
                                </div>
                            </div>

                            {/* Main Content: Stats & Analysis */}
                            <div className="flex-1 overflow-y-auto p-8">
                                {/* Key Stats Row */}
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    <div className="col-span-1">
                                        <div className="text-sm font-medium text-gray-500 mb-1">Price USD</div>
                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                            ${parseFloat(token.priceUsd).toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${token.priceChange.h24 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {token.priceChange.h24 >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                                            {Math.abs(token.priceChange.h24).toFixed(2)}% (24h)
                                        </div>
                                    </div>

                                    <StatItem label="Market Cap" value={`$${(token.fdv || 0).toLocaleString()}`} icon={<BarChart3 className="w-4 h-4 text-gray-400" />} />
                                    <StatItem label="Liquidity" value={`$${token.liquidity.usd.toLocaleString()}`} icon={<Zap className="w-4 h-4 text-gray-400" />} />
                                </div>

                                {/* Transaction Stats with Timeframes */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            <Activity className="w-4 h-4 text-gray-500" />
                                            Transactions
                                        </h3>
                                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                            {(['m5', 'h1', 'h6', 'h24'] as TimeFrame[]).map((tf) => (
                                                <button
                                                    key={tf}
                                                    onClick={() => setTxnTimeframe(tf)}
                                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${txnTimeframe === tf
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    {tf === 'm5' ? '5M' : tf.toUpperCase().replace('H', 'H')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Buys</div>
                                            <div className="text-lg font-bold text-green-600">
                                                {token.txns[txnTimeframe].buys.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Sells</div>
                                            <div className="text-lg font-bold text-red-500">
                                                {token.txns[txnTimeframe].sells.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Volume</div>
                                            <div className="text-lg font-bold text-gray-900">
                                                ${token.volume[txnTimeframe].toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200 w-full mb-8" />

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Risk Analysis Column */}
                                    <div>
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                            <ShieldCheck className="w-4 h-4 text-gray-500" />
                                            Security Check
                                        </h3>

                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                                <span className="text-sm font-medium text-gray-600">Safety Score</span>
                                                {rugCheckData ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${safetyScore >= 90 ? 'bg-green-100 text-green-700' :
                                                        safetyScore >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {safetyScore}% Safe
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Loading...</span>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <SecurityRow label="Mint Authority" isSafe={!rugCheckData?.mintAuthority} safeText="Revoked" dangerText="Active" />
                                                <SecurityRow label="Freeze Authority" isSafe={!rugCheckData?.freezeAuthority} safeText="Revoked" dangerText="Active" />
                                                <SecurityRow label="Liquidity Locked" isSafe={(rugCheckData?.lpLockedPct || 0) > 90} safeText={`${(rugCheckData?.lpLockedPct || 0).toFixed(1)}%`} dangerText={`${(rugCheckData?.lpLockedPct || 0).toFixed(1)}%`} warningCondition={(rugCheckData?.lpLockedPct || 0) > 0 && (rugCheckData?.lpLockedPct || 0) <= 90} />
                                            </div>
                                        </div>

                                        {rugCheckData?.risks && rugCheckData.risks.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {rugCheckData.risks.slice(0, 3).map((risk, idx) => (
                                                    <div key={idx} className="flex gap-2 items-start p-2 rounded bg-red-50 border border-red-100 text-xs text-red-700">
                                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                        <span>{risk.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Holders Column */}
                                    <div>
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            Distribution
                                        </h3>

                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-medium text-gray-500">Top 10 Concentration</span>
                                                <span className="text-lg font-bold text-gray-900">{holderData?.topHoldersConcentration.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(holderData?.topHoldersConcentration || 0) > 50 ? 'bg-red-500' : 'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, holderData?.topHoldersConcentration || 0)}%` }}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Top Holders</div>
                                                {holderData?.topHolders.slice(0, 5).map((holder, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="font-mono text-gray-500">{shortenAddress(holder.address, 6)}</span>
                                                        <span className="font-medium text-gray-700">{holder.percentage.toFixed(2)}%</span>
                                                    </div>
                                                ))}
                                                {(!holderData?.topHolders || holderData.topHolders.length === 0) && (
                                                    <div className="text-center text-gray-400 text-xs py-2">No holder data available</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </YosemiteWindow>
                </motion.div>

                {/* Mobile View: Slide-up Sheet */}
                <motion.div
                    key="mobile-sheet"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="md:hidden fixed inset-x-0 bottom-0 top-[10vh] bg-[#f2f2f7] rounded-t-[20px] overflow-hidden flex flex-col pointer-events-auto shadow-2xl z-50"
                >
                    {/* Mobile Header */}
                    <div className="px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                        <div className="w-8" /> {/* Spacer */}
                        <div className="w-12 h-1 bg-gray-300 rounded-full absolute left-1/2 -translate-x-1/2 top-2" /> {/* Handle */}
                        <span className="font-semibold text-gray-900 mt-2">{token.baseToken.symbol}</span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold mt-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                {token.info?.imageUrl ? (
                                    <img src={token.info.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">🦅</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold truncate">{token.baseToken.name}</h2>
                                <button
                                    onClick={handleCopyAddress}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md mt-1 w-fit"
                                >
                                    <span className="font-mono">{shortenAddress(token.baseToken.address, 6)}</span>
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                            <div className="text-sm text-gray-500 mb-1">Current Price</div>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                                ${parseFloat(token.priceUsd).toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${token.priceChange.h24 >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {token.priceChange.h24 >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                {Math.abs(token.priceChange.h24).toFixed(2)}%
                            </div>
                        </div>

                        {/* Mobile Txns Stats */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Activity (24h)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <MobileStatCard label="Buys" value={token.txns.h24.buys.toLocaleString()} />
                                <MobileStatCard label="Sells" value={token.txns.h24.sells.toLocaleString()} />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <MobileStatCard label="Market Cap" value={`$${(token.fdv || 0).toLocaleString()}`} />
                            <MobileStatCard label="Liquidity" value={`$${token.liquidity.usd.toLocaleString()}`} />
                            <MobileStatCard label="Vol (24h)" value={`$${token.volume.h24.toLocaleString()}`} />
                            <MobileStatCard label="Age" value={`${token.ageMinutes}m`} />
                        </div>

                        {/* Links */}
                        <div className="flex gap-3 overflow-x-auto py-2">
                            {token.info?.websites?.map((w, i) => (
                                <a key={i} href={w.url} className="flex-none px-4 py-2 bg-white rounded-xl text-sm font-medium text-blue-600 shadow-sm">
                                    Website
                                </a>
                            ))}
                            <a href={`https://dexscreener.com/solana/${token.pairAddress}`} className="flex-none px-4 py-2 bg-america-blue rounded-xl text-sm font-medium text-white shadow-sm ml-auto">
                                DexScreener
                            </a>
                        </div>

                        {/* Security Simple */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Security</h3>
                            <div className="space-y-3">
                                <SecurityRow label="Mint Auth" isSafe={!rugCheckData?.mintAuthority} safeText="Revoked" dangerText="Active" />
                                <SecurityRow label="LP Locked" isSafe={(rugCheckData?.lpLockedPct || 0) > 90} safeText={`${(rugCheckData?.lpLockedPct || 0).toFixed(1)}%`} dangerText="Low" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Sub-components for Cleaner Code

function StatItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-1">
                {icon} {label}
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
    );
}

function MobileStatCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-white p-3 rounded-xl shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-bold text-gray-900 truncate">{value}</div>
        </div>
    );
}

function SecurityRow({ label, isSafe, safeText, dangerText, warningCondition }: { label: string, isSafe: boolean, safeText: string, dangerText: string, warningCondition?: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{label}</span>
            <div className={`flex items-center gap-1.5 font-medium ${isSafe ? 'text-green-600' : warningCondition ? 'text-yellow-600' : 'text-red-500'
                }`}>
                {isSafe ? <ShieldCheck className="w-4 h-4" /> : warningCondition ? <AlertTriangle className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {isSafe ? safeText : dangerText}
            </div>
        </div>
    );
}
