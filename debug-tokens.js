
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
const BURGER_LAUNCH_TIMESTAMP = 1760053908000; // June 9, 2025

async function fetchTokens() {
    const queries = ['USA USD1', 'BURGER USD1']; // Fetch broad + specific
    const pairs = [];
    const seen = new Set();

    for (const q of queries) {
        try {
            const res = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.pairs) {
                for (const p of data.pairs) {
                    if (p.chainId !== 'solana') continue;
                    if (seen.has(p.pairAddress)) continue;
                    seen.add(p.pairAddress);

                    // Replicate filter logic
                    const created = p.pairCreatedAt || 0;
                    const keep = created >= BURGER_LAUNCH_TIMESTAMP;

                    pairs.push({
                        symbol: p.baseToken.symbol,
                        name: p.baseToken.name,
                        pairCreatedAt: created,
                        date: new Date(created).toISOString(),
                        passedFilter: keep
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Sort by age ASC
    pairs.sort((a, b) => a.pairCreatedAt - b.pairCreatedAt);

    console.log('BURGER TIMESTAMP:', BURGER_LAUNCH_TIMESTAMP, new Date(BURGER_LAUNCH_TIMESTAMP).toISOString());
    console.log('------------------------------------------------');
    console.log('Symbol | CreatedAt | Date | PassedFilter');
    console.log('------------------------------------------------');

    // Show tokens around the cutoff
    const interesting = pairs.filter(p => p.passedFilter || p.symbol.includes('BURGER') || p.symbol.includes('CP'));

    interesting.forEach(p => {
        console.log(`${p.symbol.padEnd(8)} | ${p.pairCreatedAt} | ${p.date} | ${p.passedFilter}`);
    });
}

fetchTokens();
