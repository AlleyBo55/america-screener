'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TokenTable } from '@/components/features/token/TokenTable';
import { TokenPair, SortKey } from '@/types/token';

interface FinderContentProps {
    loading: boolean;
    paginatedTokens: TokenPair[];
    filteredTokens: TokenPair[];
    sortKey: SortKey;
    sortDirection: 'asc' | 'desc';
    handleSort: (key: SortKey) => void;
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    isMobile?: boolean;
    onTokenSelect: (token: TokenPair) => void;
}

export function FinderContent({
    loading,
    paginatedTokens,
    filteredTokens,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    handlePageChange,
    isMobile = false,
    onTokenSelect
}: FinderContentProps) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center"
                    >
                        <div className="w-8 h-8 border-2 border-america-blue border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <TokenTable
                tokens={paginatedTokens}
                isLoading={false}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                isMobile={isMobile}
                onTokenSelect={onTokenSelect}
            />

            {/* Pagination Bar */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-500 shrink-0 select-none pb-safe">
                <span className="font-medium hidden md:inline">
                    Showing {paginatedTokens.length} of {filteredTokens.length} items
                </span>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 text-gray-700 font-medium"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                    </button>

                    <span className="font-medium text-gray-700 min-w-[80px] text-center">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 text-gray-700 font-medium"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
