'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { YosemiteWindow } from '@/components/ui/YosemiteWindow';
import { Dock } from '@/components/layout/Dock';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { LiveVisitorWidget } from '@/components/ui/LiveVisitorWidget';
import { TokenDetailView } from '@/components/features/token/TokenDetailView';
import { FinderContent } from '@/components/features/finder/FinderContent';
import { DesktopStatsWidget } from '@/components/features/stats/DesktopStatsWidget';
import { StickyNote } from '@/components/ui/StickyNote';

import { TokenPair } from '@/types/token';
import { useTokenData } from '@/hooks/useTokenData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  // Data Hook
  const {
    tokens,
    paginatedTokens,
    filteredTokens,
    loading,
    setSearchQuery,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    handlePageChange,
    handleRefresh
  } = useTokenData();

  // View State
  const [selectedToken, setSelectedToken] = useState<TokenPair | null>(null);
  const [isFinderOpen, setIsFinderOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('tokens');
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  // Handle Tab Change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setMobileSearchActive(true);
    } else {
      setMobileSearchActive(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-gray-900 relative">

      {/* 1. Menu Bar */}
      <Header
        onSearch={setSearchQuery}
        onRefresh={handleRefresh}
        isLoading={loading}
        isMobileSearchActive={mobileSearchActive}
        onCloseMobileSearch={() => {
          setMobileSearchActive(false);
          setActiveTab('tokens');
          setSearchQuery('');
        }}
      />

      {/* 2. Main Area */}
      <main className="flex-1 relative w-full h-full md:p-8 flex items-center justify-center">

        {/* Detail View Overlay (Z-Index High) */}
        <AnimatePresence>
          {selectedToken && (
            <TokenDetailView
              token={selectedToken}
              onClose={() => setSelectedToken(null)}
            />
          )}
        </AnimatePresence>

        {/* Desktop: Background Layer */}
        {!selectedToken && (
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
                    tokens={tokens}
                    paginatedTokens={paginatedTokens}
                    filteredTokens={filteredTokens}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                    isMobile={false}
                    onTokenSelect={setSelectedToken}
                  />
                </YosemiteWindow>
              </div>

              {/* Mobile: Full Screen, No Window Frame, Extra Bottom Padding for TabBar */}
              <div className="md:hidden w-full h-full bg-white overflow-hidden flex flex-col pt-0 pb-[60px]">
                <FinderContent
                  loading={loading}
                  tokens={tokens}
                  paginatedTokens={paginatedTokens}
                  filteredTokens={filteredTokens}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  isMobile
                  onTokenSelect={setSelectedToken}
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

    </div>
  );
}
