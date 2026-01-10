'use client';

import { TokenPair } from '@/types/token';
import { Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TokenRowProps {
    token: TokenPair;
    index: number;
    isMobile?: boolean;
    onClick: () => void;
}

export const TokenRow: React.FC<TokenRowProps> = ({ token, index, isMobile, onClick }) => {
    const [imgError, setImgError] = useState(false);
    const isEven = index % 2 === 0;

    const [timeString, setTimeString] = useState<string>('');

    useEffect(() => {
        if (!token.pairCreatedAt) {
            setTimeString('Now');
            return;
        }
        const diff = Date.now() - token.pairCreatedAt;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) setTimeString(`${days}d`);
        else if (hours > 0) setTimeString(`${hours}h`);
        else setTimeString(`${mins}m`);
    }, [token.pairCreatedAt]);

    // Formatting Helpers
    const formatPrice = (price?: string) => {
        if (!price) return '0.00';
        const num = parseFloat(price);
        if (num < 0.000001) return num.toExponential(4);
        return num.toFixed(6);
    };

    const formatCurrency = (val?: number) => {
        if (!val) return '$0';
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toFixed(2)}`;
    };


    const priceChange = token.priceChange?.h24 || 0;
    const isPositive = priceChange >= 0;

    // --- MOBILE VIEW (iOS Music App Style) ---
    if (isMobile) {
        return (
            <div
                onClick={onClick}
                className="flex items-center w-full p-2 border-b border-gray-200/60 active:bg-gray-200 transition-colors bg-white cursor-pointer"
            >
                {/* 1. Album Art (Token Image) */}
                <div className="w-[42px] h-[42px] shrink-0 mr-3 rounded-[4px] shadow-sm overflow-hidden bg-gray-100 border border-gray-200">
                    {token.info?.imageUrl && !imgError ? (
                        <img
                            src={token.info.imageUrl}
                            alt={token.baseToken.symbol}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-bold">
                            {token.baseToken.symbol.slice(0, 2)}
                        </div>
                    )}
                </div>

                {/* 2. Song Info (Name & Artist/Symbol) */}
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-black text-[15px] truncate leading-tight">
                        {token.baseToken.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[13px] text-gray-500 truncate mt-0.5">
                        <span className="text-gray-900">{token.baseToken.symbol}</span>
                        <span className="text-[10px]">•</span>
                        <span>{timeString}</span>
                    </div>
                </div>

                {/* 3. Right Side (Price/Duration & Action) */}
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-[13px] font-bold text-black font-mono">
                        {formatPrice(token.priceUsd)}
                    </span>
                    {/* Change Badge (like 'Explicit' tag or duration) */}
                    <div className={`
                        mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight
                        ${isPositive ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-red-600'}
                    `}>
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                </div>
            </div>
        );
    }

    // --- DESKTOP VIEW (Yosemite Finder List) ---
    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center w-full h-[52px] text-sm text-gray-700 
                border-b border-gray-100 cursor-pointer
                ${isEven ? 'bg-white' : 'bg-[#F2F6FA]'} 
                hover:bg-[#3478F6] hover:text-white transition-colors duration-100 ease-linear
            `}
        >
            {/* 1. Name Column (with Icon) */}
            <div className="pl-4 w-1/4 flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded shrink-0 bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-200/50">
                    {token.info?.imageUrl && !imgError ? (
                        <img
                            src={token.info.imageUrl}
                            alt={token.baseToken.symbol}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-xs font-bold text-gray-400">
                            {token.baseToken.symbol.slice(0, 2)}
                        </span>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate group-hover:text-white text-gray-900">
                        {token.baseToken.name}
                    </span>
                    <span className="text-xs opacity-60 group-hover:text-blue-100 flex items-center gap-1">
                        {token.baseToken.symbol}

                    </span>
                </div>
            </div>

            {/* 2. Price */}
            <div className="text-right w-[15%] font-mono group-hover:text-white">
                {formatPrice(token.priceUsd)}
            </div>

            {/* 3. Age */}
            <div className="text-right w-[10%] group-hover:text-white">
                {timeString}
            </div>

            {/* 4. Volume */}
            <div className="text-right w-[15%] group-hover:text-white text-gray-600">
                {formatCurrency(token.volume?.h24)}
            </div>

            {/* 5. Change */}
            <div className={`text-right w-[15%] font-medium ${isPositive ? 'text-green-600' : 'text-red-500'} group-hover:text-white`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </div>

            {/* 6. Liquidity */}
            <div className="text-right w-[15%] pr-4 group-hover:text-white text-gray-600">
                {formatCurrency(token.liquidity?.usd)}
            </div>
        </div>
    );
};
