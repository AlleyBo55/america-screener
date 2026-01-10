'use client';

import { TokenPair, SortKey } from '@/types/token';
import { TokenRow } from './TokenRow';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TokenTableProps {
    tokens: TokenPair[];
    isLoading: boolean;
    sortKey: SortKey;
    sortDirection: 'asc' | 'desc';
    onSort: (key: SortKey) => void;
    isMobile?: boolean;
    onTokenSelect: (token: TokenPair) => void;
}

export const TokenTable: React.FC<TokenTableProps> = ({
    tokens,
    isLoading,
    sortKey,
    sortDirection,
    onSort,
    isMobile = false,
    onTokenSelect
}) => {

    // Sort Indicator Helper
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortKey !== columnKey) return null;
        return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    }

    const headers: { key: SortKey; label: string; className: string; paddingLeft?: string }[] = [
        { key: 'name', label: 'Name', className: 'justify-start w-1/4', paddingLeft: '60px' },
        { key: 'price', label: 'Price', className: 'justify-end w-[15%]' },
        { key: 'age', label: 'Age', className: 'justify-end w-[10%]' },
        { key: 'volume', label: 'Volume (24h)', className: 'justify-end w-[15%]' },
        { key: 'priceChange', label: 'Change (24h)', className: 'justify-end w-[15%]' },
        { key: 'liquidity', label: 'Liquidity', className: 'justify-end w-[15%] pr-4' },
    ];

    return (
        <div className="flex-1 overflow-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Desktop: Standard Table Header */}
            {!isMobile && (
                <div className="sticky top-0 z-10 flex items-center w-full h-8 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 select-none">
                    {headers.map((header) => (
                        <div
                            key={header.key}
                            onClick={() => onSort(header.key)}
                            className={`
                                ${header.className} 
                                h-full flex items-center cursor-pointer hover:bg-gray-200/50 transition-colors
                                truncate border-r border-gray-200/50 last:border-none
                            `}
                            style={{
                                paddingLeft: 'paddingLeft' in header ? header.paddingLeft : undefined
                            }}
                        >
                            {header.label}
                            <SortIcon columnKey={header.key} />
                        </div>
                    ))}
                </div>
            )}

            {/* List Content */}
            <div className="w-full">
                {isLoading ? (
                    // Skeleton Loading
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 border-b border-gray-100 animate-pulse bg-gray-50/50" />
                    ))
                ) : tokens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                        <p>No items found</p>
                    </div>
                ) : (
                    tokens.map((token, index) => (
                        <TokenRow
                            key={token.pairAddress}
                            token={token}
                            index={index}
                            isMobile={isMobile}
                            onClick={() => onTokenSelect(token)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
