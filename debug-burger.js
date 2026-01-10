
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

async function fetchTokens() {
    // Specifically search for BURGER
    const q = 'BURGER USD1';

    try {
        const res = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.pairs) {
            console.log('--- FOUND BURGER PAIRS ---');
            for (const p of data.pairs) {
                if (p.chainId !== 'solana') continue;
                console.log(`Symbol: ${p.baseToken.symbol}`);
                console.log(`Name: ${p.baseToken.name}`);
                console.log(`Address: ${p.baseToken.address}`);
                console.log(`CreatedAt: ${p.pairCreatedAt}`);
                console.log(`Date: ${new Date(p.pairCreatedAt).toISOString()}`);
                console.log('--------------------------');
            }
        } else {
            console.log('No BURGER pairs found.');
        }
    } catch (e) {
        console.error(e);
    }
}

fetchTokens();
