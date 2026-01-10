'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, RotateCw, Wifi, X } from 'lucide-react';

interface HeaderProps {
    onSearch: (query: string) => void;
    onRefresh: () => void;
    isLoading?: boolean;
    isMobileSearchActive?: boolean; // New Prop
    onCloseMobileSearch?: () => void; // New Prop
}

export function Header({ onSearch, onRefresh, isLoading, isMobileSearchActive, onCloseMobileSearch }: HeaderProps) {
    const [searchValue, setSearchValue] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const mobileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
            setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-focus mobile input when search becomes active
    useEffect(() => {
        if (isMobileSearchActive && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [isMobileSearchActive]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchValue);
    };

    const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        onSearch(e.target.value); // Real-time search for iPod feel
    };

    return (
        <header className="sticky top-0 z-50 w-full text-sm font-medium select-none">
            {/* Desktop Menu Bar (Yosemite) + Mobile Navigation Bar (iOS 7) */}
            <div className={`
                w-full flex items-center justify-between transition-all
                
                /* Mobile: iOS 7 Navigation Bar */
                h-[64px] pt-[20px] px-4 bg-white/90 backdrop-blur-xl border-b border-gray-300
                
                /* Desktop: Yosemite Menu Bar */
                md:h-8 md:pt-0 md:bg-white/70 md:vibrancy-light
            `}>

                {/* Left: Brand / Logo / Back Button */}
                <div className="flex items-center gap-4 z-10">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 cursor-default">
                        {/* Mobile: Logo Only (Removed "Edit" as requested) */}
                        <span className="md:hidden text-lg">🦅</span>

                        {/* Desktop: Apple Logo Area */}
                        <span className="hidden md:inline text-lg">🦅</span>
                        <span className="hidden md:inline tracking-tight">America.fun</span>
                    </div>

                    {/* Desktop Menu Items */}
                    <div className="hidden md:flex items-center gap-4 text-gray-600">
                        <span className="hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition-colors">File</span>
                        <span className="hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition-colors">Edit</span>
                        <span className="hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition-colors">View</span>
                        <span className="hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition-colors">Window</span>
                        <span className="hover:bg-black/5 px-2 py-0.5 rounded cursor-pointer transition-colors text-america-blue">Help</span>
                    </div>
                </div>

                {/* Center: Title (Mobile) or Search (Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 w-full text-center pointer-events-none md:pointer-events-auto md:w-auto flex justify-center">

                    {/* Mobile: Title OR Search Input */}
                    <div className="md:hidden flex items-center justify-center w-full px-12">
                        {isMobileSearchActive ? (
                            <div className="relative w-full max-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={mobileInputRef}
                                    type="text"
                                    value={searchValue}
                                    onChange={handleMobileSearchChange}
                                    placeholder="Search Tokens"
                                    className="w-full bg-gray-200/80 rounded-md py-1 pl-7 pr-7 text-sm outline-none text-center focus:text-left focus:bg-gray-200 transition-all placeholder:text-gray-500"
                                />
                                {searchValue && (
                                    <button
                                        onClick={() => { setSearchValue(''); onSearch(''); }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <span className="text-lg font-semibold text-black tracking-tight">
                                Token List
                            </span>
                        )}
                    </div>

                    {/* Desktop Search */}
                    <form onSubmit={handleSearch} className="hidden md:block">
                        <div className="relative group">
                            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors ${searchValue ? 'text-america-blue' : ''}`} />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Search"
                                className="bg-gray-200/50 hover:bg-white/60 focus:bg-white border border-transparent focus:border-america-blue/30 rounded-md w-64 py-0.5 pl-8 pr-2 text-xs transition-all outline-none placeholder:text-gray-500 text-center focus:text-left focus:placeholder-transparent"
                            />
                        </div>
                    </form>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 z-10">
                    {/* Mobile: Cancel Search (if active) OR Refresh */}
                    <div className="md:hidden">
                        {isMobileSearchActive ? (
                            <button
                                onClick={onCloseMobileSearch}
                                className="text-america-blue text-[15px]"
                            >
                                Cancel
                            </button>
                        ) : (
                            <button
                                onClick={onRefresh}
                                disabled={isLoading}
                                className="text-america-blue"
                            >
                                <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>

                    {/* Desktop: Status Icons & Clock */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onRefresh}
                                disabled={isLoading}
                                className={`p-1 rounded hover:bg-black/5 active:bg-black/10 transition-all ${isLoading ? 'animate-spin' : ''}`}
                            >
                                <RotateCw className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <Wifi className="w-3.5 h-3.5 text-gray-600" />
                        </div>

                        <div className="flex items-center gap-2 cursor-default">
                            <span>{date}</span>
                            <span>{time}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
