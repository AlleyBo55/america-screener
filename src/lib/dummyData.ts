import { TokenPair } from "@/types/token";

export function generateDummyTokens(count: number = 1000): TokenPair[] {
    return Array.from({ length: count }).map((_, i) => ({
        chainId: "solana",
        dexId: "raydium",
        url: "https://dexscreener.com/solana/dummy",
        pairAddress: `dummy-address-${i}`,
        baseToken: {
            address: `token-address-${i}USA`,
            name: `America Token ${i}`,
            symbol: `USA${i}`,
        },
        quoteToken: {
            address: "So11111111111111111111111111111111111111112",
            name: "Solana",
            symbol: "SOL",
        },
        priceNative: "0.001",
        priceUsd: (Math.random() * 0.1).toFixed(6),
        txns: {
            h24: { buys: Math.floor(Math.random() * 200) + 10, sells: Math.floor(Math.random() * 100) + 5 },
            h6: { buys: Math.floor(Math.random() * 80) + 2, sells: Math.floor(Math.random() * 40) + 1 },
            h1: { buys: Math.floor(Math.random() * 20), sells: Math.floor(Math.random() * 10) },
            m5: { buys: Math.floor(Math.random() * 5), sells: Math.floor(Math.random() * 2) },
        },
        volume: {
            h24: Math.random() * 100000,
            h6: Math.random() * 25000,
            h1: Math.random() * 5000,
            m5: Math.random() * 1000
        },
        priceChange: {
            h24: (Math.random() * 200) - 80,
            h6: (Math.random() * 100) - 40,
            h1: (Math.random() * 40) - 15,
            m5: (Math.random() * 10) - 5
        },
        liquidity: { usd: Math.random() * 500000, base: 0, quote: 0 },
        fdv: 1000000,
        marketCap: Math.random() * 1000000,
        pairCreatedAt: Date.now() - Math.floor(Math.random() * 10000000),
        info: {
            imageUrl: `https://ui-avatars.com/api/?name=USA+${i}&background=000080&color=fff&size=128`,
            websites: [],
            socials: [],
        },
        ageMinutes: Math.floor(Math.random() * 1440),
        isGraduated: Math.random() > 0.8,
        bondingCurveProgress: Math.floor(Math.random() * 100),
    }));
}
