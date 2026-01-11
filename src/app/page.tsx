'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { YosemiteWindow } from '@/components/ui/YosemiteWindow';
import { Dock } from '@/components/layout/Dock';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { LiveVisitorWidget } from '@/components/ui/LiveVisitorWidget';
import { TokenDetailView } from '@/components/features/token/TokenDetailView';
import { FinderContent } from '@/components/features/finder/FinderContent';
import { FinderStats } from '@/components/features/finder/FinderStats';
import { DesktopStatsWidget } from '@/components/features/stats/DesktopStatsWidget';
import { StickyNote } from '@/components/ui/StickyNote';
import { RateLimitModal } from '@/components/ui/RateLimitModal';

import { TokenPair, SortKey } from '@/types/token';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import { motion, AnimatePresence } from 'framer-motion';

// Redux
import {
  useAppDispatch,
  useAppSelector,
  fetchTokensRequest,
  refreshTokensRequest,
  selectTokens,
  selectIsLoading,
  selectPage,
  selectPageSize,
  selectSortKey,
  selectSortDirection,
  selectSearchQuery,
  setPage,
  setSortKey,
  setSearchQuery,
  selectToken,
  closeTokenDetail,
  selectSelectedToken,
  selectIsOpen,
  selectRugCheckData,
  selectHolderData,
  selectIsLoadingAnalysis,
} from '@/store';

export default function Home() {
  const dispatch = useAppDispatch();

  // Redux state
  const tokens = useAppSelector(selectTokens);
  const loading = useAppSelector(selectIsLoading);
  const page = useAppSelector(selectPage);
  const pageSize = useAppSelector(selectPageSize);
  const sortKey = useAppSelector(selectSortKey);
  const sortDirection = useAppSelector(selectSortDirection);
  const searchQuery = useAppSelector(selectSearchQuery);

  // Token detail state
  const selectedToken = useAppSelector(selectSelectedToken);
  const isDetailOpen = useAppSelector(selectIsOpen);
  const rugCheckData = useAppSelector(selectRugCheckData);
  const holderData = useAppSelector(selectHolderData);
  const isLoadingAnalysis = useAppSelector(selectIsLoadingAnalysis);

  // Rate Limit Handler
  const { isRateLimited, retryAfterSeconds, handleCountdownComplete } = useRateLimitHandler();

  // View State
  const [isFinderOpen, setIsFinderOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('tokens');
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  // Fetch tokens on mount
  useEffect(() => {
    dispatch(fetchTokensRequest());
  }, [dispatch]);

  // Combined filter + sort in single pass (avoids intermediate array allocation)
  const { sortedTokens, totalPages } = useMemo(() => {
    // 1. Filter by search query
    const query = searchQuery?.toLowerCase() || '';
    const filtered = query
      ? tokens.filter(t =>
        t.baseToken.name.toLowerCase().includes(query) ||
        t.baseToken.symbol.toLowerCase().includes(query) ||
        t.baseToken.address.toLowerCase().includes(query)
      )
      : tokens;

    // 2. Sort with AOL pinned to top
    const sorted = [...filtered].sort((a, b) => {
      // Pin AOL to top (check symbol first for speed)
      const isAolA = a.baseToken.symbol === 'AOL';
      const isAolB = b.baseToken.symbol === 'AOL';
      if (isAolA !== isAolB) return isAolA ? -1 : 1;

      // Sort by selected key
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortKey) {
        case 'age': aVal = a.ageMinutes; bVal = b.ageMinutes; break;
        case 'price': aVal = parseFloat(a.priceUsd); bVal = parseFloat(b.priceUsd); break;
        case 'priceChange': aVal = a.priceChange.h24; bVal = b.priceChange.h24; break;
        case 'volume': aVal = a.volume.h24; bVal = b.volume.h24; break;
        case 'liquidity': aVal = a.liquidity.usd; bVal = b.liquidity.usd; break;
        case 'marketCap': aVal = a.marketCap || a.fdv; bVal = b.marketCap || b.fdv; break;
        case 'txns': aVal = a.txns.h24.buys + a.txns.h24.sells; bVal = b.txns.h24.buys + b.txns.h24.sells; break;
        case 'name': aVal = a.baseToken.name; bVal = b.baseToken.name; break;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return {
      sortedTokens: sorted,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    };
  }, [tokens, searchQuery, sortKey, sortDirection, pageSize]);

  // Paginate (only recalculates when page changes or sorted list changes)
  const paginatedTokens = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedTokens.slice(start, start + pageSize);
  }, [sortedTokens, page, pageSize]);

  // Handlers
  const handleSort = useCallback((key: SortKey) => {
    dispatch(setSortKey(key));
  }, [dispatch]);

  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage));
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshTokensRequest());
  }, [dispatch]);

  const handleTokenSelect = useCallback((token: TokenPair) => {
    dispatch(selectToken(token));
  }, [dispatch]);

  const handleCloseDetail = useCallback(() => {
    dispatch(closeTokenDetail());
  }, [dispatch]);

  // Handle Tab Change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setMobileSearchActive(true);
    } else {
      setMobileSearchActive(false);
      handleSearch('');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-gray-900 relative">

      {/* 1. Menu Bar */}
      <Header
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isLoading={loading}
        isMobileSearchActive={mobileSearchActive}
        onCloseMobileSearch={() => {
          setMobileSearchActive(false);
          setActiveTab('tokens');
          handleSearch('');
        }}
      />

      {/* 2. Main Area */}
      <main className="flex-1 relative w-full h-full md:p-8 flex items-center justify-center">

        {/* Detail View Overlay (Z-Index High) */}
        <AnimatePresence>
          {isDetailOpen && selectedToken && (
            <TokenDetailView
              token={selectedToken}
              onClose={handleCloseDetail}
              rugCheckData={rugCheckData}
              holderData={holderData}
              isLoadingAnalysis={isLoadingAnalysis}
            />
          )}
        </AnimatePresence>

        {/* Desktop: Background Layer */}
        {!isDetailOpen && (
          <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
            <AnimatePresence mode="wait">
              {!isFinderOpen ? (
                // State A: Finder Closed -> Show Full Stats Widget (Centered)
                <motion.div
                  key="full-stats"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                >
                  <DesktopStatsWidget tokens={tokens} />
                </motion.div>
              ) : (
                // State B: Finder Open -> Show Sticky Note (Right Side)
                <div className="absolute inset-0 pointer-events-auto">
                  <StickyNote onClick={() => {
                    // Optional: Highlight Finder?
                  }} />
                </div>
              )}
            </AnimatePresence>

            {/* Brand Watermark (Always Visible but subtle) */}
            <motion.div
              animate={{ opacity: isFinderOpen ? 0.05 : 0.1 }}
              className="absolute bottom-0 right-0 p-16 text-right rotate-0 origin-bottom-right"
            >
              <h1 className="text-8xl font-black text-gray-900 tracking-tighter mix-blend-overlay leading-none">AMERICA</h1>
              <h1 className="text-8xl font-black text-gray-900 tracking-tighter mix-blend-overlay leading-none">SCREENER</h1>
            </motion.div>
          </div>
        )}

        {/* 3. The "Finder" Application Window (Desktop) OR Full Screen List (Mobile) */}
        <AnimatePresence>
          {isFinderOpen && (
            <>
              {/* Desktop: Window Frame */}
              <div className="hidden md:block absolute z-10">
                <YosemiteWindow
                  className="w-[60vw] h-[75vh] shadow-2xl"
                  title="Token List"
                  icon="🦅"
                  onClose={() => setIsFinderOpen(false)}
                >
                  <FinderContent
                    loading={loading}
                    paginatedTokens={paginatedTokens}
                    filteredTokens={sortedTokens}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    currentPage={page}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                    isMobile={false}
                    onTokenSelect={handleTokenSelect}
                  />
                </YosemiteWindow>
              </div>

              {/* Mobile: Full Screen, No Window Frame, Extra Bottom Padding for TabBar */}
              <div className="md:hidden w-full h-full bg-white flex flex-col pt-0 pb-[60px]">
                <FinderContent
                  loading={loading}
                  paginatedTokens={paginatedTokens}
                  filteredTokens={sortedTokens}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  currentPage={page}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  isMobile
                  onTokenSelect={handleTokenSelect}
                />
              </div>
            </>
          )}
        </AnimatePresence>

      </main>

      {/* 4. Desktop Dock */}
      <div className="hidden md:block">
        <LiveVisitorWidget />
        <Dock
          isFinderOpen={isFinderOpen}
          onOpenFinder={() => setIsFinderOpen(!isFinderOpen)}
        />
      </div>

      {/* 5. Mobile Tab Bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 6. Rate Limit Modal (Global) */}
      <RateLimitModal
        isOpen={isRateLimited}
        retryAfterSeconds={retryAfterSeconds}
        onComplete={handleCountdownComplete}
      />

    </div>
  );
}
