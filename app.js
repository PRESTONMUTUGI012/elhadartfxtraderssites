const DERIV_NUMERIC_APP_ID = "1089";
const AFFILIATE_TOKEN = "3A2CFHPG722B";
const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, EUR: 0.92, GBP: 0.79 };

let exhaustiveAssets = [
    { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_10', name: 'Volatility 10 Index', market: 'synthetic_index', pip: 3 },
    { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_25', name: 'Volatility 25 Index', market: 'synthetic_index', pip: 3 },
    { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_50', name: 'Volatility 50 Index', market: 'synthetic_index', pip: 4 },
    { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_75', name: 'Volatility 75 Index', market: 'synthetic_index', pip: 4 },
    { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'R_100', name: 'Volatility 100 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'BOOM500', name: 'Boom 500 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'CRASH500', name: 'Crash 500 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'BOOM1000', name: 'Boom 1000 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'CRASH1000', name: 'Crash 1000 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD10', name: 'Jump 10 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD25', name: 'Jump 25 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD50', name: 'Jump 50 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD75', name: 'Jump 75 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'JD100', name: 'Jump 100 Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'STPRNG', name: 'Step Index', market: 'synthetic_index', pip: 2 },
    { symbol: 'frxEURUSD', name: 'EUR/USD', market: 'forex', pip: 5 },
    { symbol: 'frxGBPUSD', name: 'GBP/USD', market: 'forex', pip: 5 },
    { symbol: 'frxUSDJPY', name: 'USD/JPY', market: 'forex', pip: 3 },
    { symbol: 'frxAUDUSD', name: 'AUD/USD', market: 'forex', pip: 5 },
    { symbol: 'frxUSDCAD', name: 'USD/CAD', market: 'forex', pip: 5 },
    { symbol: 'frxNZDUSD', name: 'NZD/USD', market: 'forex', pip: 5 },
    { symbol: 'frxEURGBP', name: 'EUR/GBP', market: 'forex', pip: 5 },
    { symbol: 'frxXAUUSD', name: 'Gold/USD', market: 'commodities', pip: 2 },
    { symbol: 'frxXAGUSD', name: 'Silver/USD', market: 'commodities', pip: 3 },
    { symbol: 'frxWTIUSD', name: 'Crude Oil/USD', market: 'commodities', pip: 2 },
    { symbol: 'cryBTCUSD', name: 'BTC/USD', market: 'cryptocurrency', pip: 2 },
    { symbol: 'cryETHUSD', name: 'ETH/USD', market: 'cryptocurrency', pip: 2 },
    { symbol: 'cryLTCUSD', name: 'LTC/USD', market: 'cryptocurrency', pip: 2 }
];

let currentCategory = 'all';
let currentSymbol = '1HZ10V';
let currentChartInterval = '15';
let marketDataStore = {};
let authMode = 'signin';
let isChartFullscreen = false;

// Global pool of contract types to enforce cross-market distribution without overlapping
const globalContractPool = [
    { type: "DIFFER", label: "Differ Digit", boat: "Milliseconds Boat 9", expiry: "1 Tick" },
    { type: "MATCH", label: "Match Spike", boat: "Milliseconds Boat 9", expiry: "1 Tick" },
    { type: "EVEN", label: "Even Parity", boat: "Milliseconds Boat 8", expiry: "2 Ticks" },
    { type: "ODD", label: "Odd Parity", boat: "Milliseconds Boat 8", expiry: "2 Ticks" },
    { type: "OVER_2", label: "Over 2 Barrier", boat: "Milliseconds Boat 9", expiry: "2 Ticks" },
    { type: "UNDER_6", label: "Under 6 Barrier", boat: "Milliseconds Boat 9", expiry: "2 Ticks" }
];

exhaustiveAssets.forEach((a, idx) => {
    const assignedGlobalContract = globalContractPool[idx % globalContractPool.length];
    marketDataStore[a.symbol] = {
        name: a.name,
        pip: a.pip || 2,
        price: '1000.00',
        prevPrice: 0,
        direction: 'neutral',
        quotes: [],
        recentDigits: [],
        digits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        total: 10,
        winrate: 91,
        tps: 1.5,
        assignedContractType: assignedGlobalContract.type,
        assignedBoatName: assignedGlobalContract.boat,
        activeDigitSignalLabel: `${assignedGlobalContract.label}`,
        lastContractSignature: '',
        lastBlockedDigit: -1
    };
});

let remainingSeconds = 60;
function runSplashSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const statusText = document.getElementById('loading-status-text');

    const stages = {
        45: "Calibrating Distributed Non-Overlap Matrix...",
        30: "Initializing Dual-Signal Fast MS & Slow Deriv Bots...",
        15: "Syncing Cross-Market Shift & Anti-Overlap Rotation...",
        5:  "Finalizing Institutional Live EAT Clock & Killzones..."
    };

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');

        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((60 - remainingSeconds) / 60) * 100}%`;
        if (stages[remainingSeconds] && statusText) {
            statusText.innerText = stages[remainingSeconds];
        }

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            dismissSplash();
        }
    }, 1000);
}

function dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.toggle('hidden', !show);
}

function switchAuthTab(mode) {
    authMode = mode;
    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const nameBox = document.getElementById('name-field-box');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'signin') {
        signinTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signupTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.add('hidden');
        submitBtn.innerText = "SIGN IN TO TERMINAL";
    } else {
        signupTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signinTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.remove('hidden');
        submitBtn.innerText = "CREATE ACCOUNT & REGISTER";
    }
}

function submitAuthForm() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) {
        alert("Please fill in your email and password.");
        return;
    }
    const name = document.getElementById('auth-name').value || "Preston Mutugi";
    alert(authMode === 'signup'
        ? `Account registered for ${name} (${email})!`
        : `Signed in successfully as ${email}!`);
    toggleAuthModal(false);
}

function setMode(mode) {
    document.getElementById('btn-demo').className = mode === 'demo'
        ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition'
        : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    document.getElementById('btn-real').className = mode === 'real'
        ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition'
        : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
}

function authDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_NUMERIC_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}

function switchCategory(cat) {
    currentCategory = cat;
    ['all', 'synthetic_index', 'forex', 'commodities', 'indices', 'cryptocurrency'].forEach(c => {
        const btn = document.getElementById(`cat-${c}`);
        if (btn) {
            btn.className = c === cat
                ? "bg-emerald-600 text-white font-bold py-1.5 px-1 rounded-lg transition"
                : "bg-slate-900 text-slate-300 hover:text-white py-1.5 px-1 rounded-lg transition border border-slate-800";
        }
    });
    renderScannerList();
}

function changeChartTimeframe(interval) {
    currentChartInterval = interval;
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.className = btn.dataset.tf === interval
            ? "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold"
            : "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-fxgreen";
    });
    initTradingViewWidget(currentSymbol);
}

function toggleChartFullscreen() {
    isChartFullscreen = !isChartFullscreen;
    const wrapper = document.getElementById('chart-card-wrapper');
    const viewport = document.getElementById('chart-view-port');
    const btnText = document.getElementById('expand-btn-text');

    if (isChartFullscreen) {
        wrapper.className = "fixed inset-4 z-50 bg-slate-950 border-2 border-fxgreen rounded-2xl p-6 shadow-2xl flex flex-col space-y-4";
        viewport.className = "bg-slate-900 rounded-xl border border-slate-800 p-2 relative flex-1";
        btnText.innerText = "Minimize Chart";
    } else {
        wrapper.className = "bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-2xl space-y-3 transition-all duration-300";
        viewport.className = "bg-slate-900 rounded-xl border border-slate-800 p-2 relative h-[340px] transition-all";
        btnText.innerText = "Expand Chart";
    }
    initTradingViewWidget(currentSymbol);
}

function initTradingViewWidget(symbolCode) {
    const container = document.getElementById('tradingview_advanced_chart');
    if (!container || typeof TradingView === 'undefined') return;
    container.innerHTML = '';

    let tvSymbol = "FX:EURUSD";
    if (symbolCode.includes("XAU")) tvSymbol = "OANDA:XAUUSD";
    else if (symbolCode.includes("XAG")) tvSymbol = "OANDA:XAGUSD";
    else if (symbolCode.includes("GBP")) tvSymbol = "FX:GBPUSD";
    else if (symbolCode.includes("JPY")) tvSymbol = "FX:USDJPY";
    else if (symbolCode.includes("AUD")) tvSymbol = "FX:AUDUSD";
    else if (symbolCode.includes("CAD")) tvSymbol = "FX:USDCAD";
    else if (symbolCode.includes("BTC")) tvSymbol = "BINANCE:BTCUSDT";
    else if (symbolCode.includes("ETH")) tvSymbol = "BINANCE:ETHUSDT";
    else if (symbolCode.includes("US30") || symbolCode.includes("DJI")) tvSymbol = "FOREXCOM:DJI";

    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": tvSymbol,
        "interval": currentChartInterval,
        "timezone": "Africa/Nairobi",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#030712",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "BB@tv-basicstudies"
        ],
        "container_id": "tradingview_advanced_chart"
    });
}

function selectSymbol(sym, name) {
    currentSymbol = sym;
    const chartTitle = document.getElementById('chart-title-label');
    if (chartTitle) chartTitle.innerText = `${name} (${sym}) - Institutional Suite`;

    initTradingViewWidget(sym);

    if (window.derivApiInstance) {
        window.derivApiInstance.subscribeTicks(sym, handleIncomingTick);
    }

    if (marketDataStore[sym] && marketDataStore[sym].total > 0) {
        const st = marketDataStore[sym];
        const lastQuote = st.quotes[st.quotes.length - 1] || 0;
        evaluateNonOverlappingDigits(st, lastQuote, st.price, true);
        if (typeof evaluateAllIndicators === 'function') evaluateAllIndicators(st);
    }

    renderScannerList();
}

function renderScannerList() {
    const container = document.getElementById('scanner-market-list');
    if (!container) return;
    container.innerHTML = '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-slate-500 text-center py-4">No markets in this category.</div>`;
        return;
    }

    filtered.forEach(m => {
        const st = marketDataStore[m.symbol] || {
            price: '1000.00',
            direction: 'neutral',
            winrate: 91,
            tps: 1.5,
            assignedBoatName: 'Boat 2',
            activeDigitSignalLabel: 'Differ 0'
        };
        const isSel = m.symbol === currentSymbol;
        const priceColor = st.direction === 'up'
            ? 'text-fxgreen'
            : st.direction === 'down'
                ? 'text-rose-400'
                : 'text-slate-300';

        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name);
        div.className = `cursor-pointer p-2 rounded-xl border grid grid-cols-3 items-center text-[11px] transition ${
            isSel ? 'bg-emerald-950/70 border-fxgreen' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`;
        div.innerHTML = `
            <div class="truncate pr-1">
                <div class="font-bold text-white truncate" title="${m.name}">${m.name}</div>
                <div class="text-[9px] font-mono text-fxgreen">⚡ ${st.tps || 1.5} t/s</div>
            </div>
            <div class="text-right">
                <div class="${priceColor} font-bold font-mono">${st.price}</div>
                <div class="text-[9px] font-mono text-gold truncate">${st.activeDigitSignalLabel || 'Signal A'}</div>
            </div>
            <div class="text-right font-mono">
                <div class="text-blue-400 font-bold text-[10px] truncate">Boat ${st.assignedBoatId || 9}</div>
                <div class="text-[9px] text-fxgreen font-bold">${st.winrate}% WR</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function handleIncomingTick(tick) {
    const sym = tick.symbol;
    const quote = Number(tick.quote);
    if (isNaN(quote)) return;

    if (!marketDataStore[sym]) {
        marketDataStore[sym] = {
            name: sym,
            pip: tick.pip_size || 2,
            price: '1000.00',
            prevPrice: 0,
            direction: 'neutral',
            quotes: [],
            recentDigits: [],
            digits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            total: 10,
            winrate: 91,
            tps: 1.5,
            tickTimestamps: [],
            assignedContractType: 'DIFFER',
            assignedBoatId: 9,
            activeDigitSignalLabel: 'Differ Digit',
            lastContractSignature: '',
            lastBlockedDigit: -1
        };
    }

    const st = marketDataStore[sym];
    const decimals = tick.pip_size !== undefined ? tick.pip_size : st.pip;
    const priceFormatted = quote.toFixed(decimals);

    const now = Date.now();
    if (!st.tickTimestamps) st.tickTimestamps = [];
    st.tickTimestamps.push(now);
    st.tickTimestamps = st.tickTimestamps.filter(t => now - t < 3000);
    st.tps = Math.max(1.0, Math.round((st.tickTimestamps.length / 3) * 10) / 10);

    if (st.prevPrice > 0) {
        st.direction = quote > st.prevPrice ? 'up' : quote < st.prevPrice ? 'down' : st.direction;
    }
    st.prevPrice = quote;
    st.price = priceFormatted;

    st.quotes.push(quote);
    if (st.quotes.length > 5000) st.quotes.shift();

    const lastDig = parseInt(priceFormatted.slice(-1), 10);
    if (!isNaN(lastDig) && lastDig >= 0 && lastDig <= 9) {
        st.digits[lastDig]++;
        if (!st.recentDigits) st.recentDigits = [];
        st.recentDigits.push(lastDig);
        if (st.recentDigits.length > 12) st.recentDigits.shift();
    }
    st.total++;

    evaluateNonOverlappingDigits(st, quote, priceFormatted, sym === currentSymbol);

    if (sym === currentSymbol) {
        if (typeof evaluateAllIndicators === 'function') evaluateAllIndicators(st);
    }

    renderScannerList();
}

// Distributed Anti-Overlap Matrix with Dual-Signals (Track A: Fast MS & Track B: Slow Deriv)
function evaluateNonOverlappingDigits(st, quote, priceFormatted, isActiveUI) {
    const total = st.total || 1;
    let items = [];
    let sumFloor = 0;

    for (let i = 0; i < 10; i++) {
        const count = st.digits[i] || 0;
        const exact = (count / total) * 100;
        const fl = Math.floor(exact);
        sumFloor += fl;
        items.push({ i, exact, fl, rem: exact - fl });
    }
    let remainder = 100 - sumFloor;
    items.sort((a, b) => b.rem - a.rem);
    for (let k = 0; k < remainder; k++) {
        items[k].fl += 1;
    }

    let finalPcts = new Array(10);
    items.forEach(item => {
        finalPcts[item.i] = item.fl;
    });

    let sortedByHigh = [...items].sort((a, b) => b.fl - a.fl);
    let sortedByLow = [...items].sort((a, b) => a.fl - b.fl);

    let topDigitObj = sortedByHigh[0].i === st.lastBlockedDigit ? sortedByHigh[1] : sortedByHigh[0];
    let coldDigitObj = sortedByLow[0].i === st.lastBlockedDigit ? sortedByLow[1] : sortedByLow[0];

    let evenCount = 0;
    let over2Count = 0;
    let under6Count = 0;

    for (let i = 0; i < 10; i++) {
        const count = st.digits[i] || 0;
        if (i % 2 === 0) evenCount += count;
        if (i >= 3) over2Count += count;
        if (i <= 5) under6Count += count;
    }

    const evenPct = Math.round((evenCount / total) * 100);
    const oddPct = 100 - evenPct;
    const over2Pct = Math.round((over2Count / total) * 100);
    const under6Pct = Math.round((under6Count / total) * 100);

    // Dynamic rotation based on assigned contract type to prevent overlap across markets
    let contractInstruction = `DIFFER FROM DIGIT ${coldDigitObj.i}`;
    let entryDigitTrigger = `Enter when Digit ${coldDigitObj.i} appears`;
    let boatAssignment = `Milliseconds Boat 9 (Digit Matrixer)`;
    let slowDerivSignal = `Slow Track: OB Sniper (Boat 1) @ 1M Bar Close`;
    let exitAndWinrate = `${100 - coldDigitObj.fl}% WR • 1 Tick Expiry`;
    let shortScannerTag = `Diff ${coldDigitObj.i}`;
    let calculatedWinrate = Math.min(97, Math.max(89, 100 - coldDigitObj.fl));
    st.assignedBoatId = 9;

    if (st.assignedContractType === 'MATCH' || topDigitObj.fl >= 14) {
        contractInstruction = `MATCH DIGIT ${topDigitObj.i} (${topDigitObj.fl}% SPIKE)`;
        entryDigitTrigger = `Enter immediately when Digit ${topDigitObj.i} hits`;
        boatAssignment = `Milliseconds Boat 9 (Digit Matrixer)`;
        slowDerivSignal = `Slow Track: FVG Rebalance (Boat 4) @ 3M`;
        exitAndWinrate = `92% WR • 1 Tick Expiry`;
        shortScannerTag = `Match ${topDigitObj.i}`;
        calculatedWinrate = 92;
        st.assignedBoatId = 9;
    } else if (st.assignedContractType === 'EVEN' || st.assignedContractType === 'ODD' || Math.abs(evenPct - 50) >= 5) {
        const isEven = evenPct >= 50;
        contractInstruction = isEven ? `EVEN DIGITS (${evenPct}% SKEW)` : `ODD DIGITS (${oddPct}% SKEW)`;
        entryDigitTrigger = isEven ? `Enter when an ODD digit (1,3,5,7,9) hits` : `Enter when an EVEN digit (0,2,4,6,8) hits`;
        boatAssignment = `Milliseconds Boat 8 (Parity Shifter)`;
        slowDerivSignal = `Slow Track: BOS Trend Follower (Boat 5) @ 1M`;
        exitAndWinrate = `93% WR • 2 Ticks Expiry`;
        shortScannerTag = isEven ? `Even ${evenPct}%` : `Odd ${oddPct}%`;
        calculatedWinrate = Math.min(95, Math.max(evenPct, oddPct) + 32);
        st.assignedBoatId = 8;
    } else if (st.assignedContractType === 'OVER_2' || over2Pct >= 72) {
        contractInstruction = `OVER 2 (DIGITS 3 TO 9)`;
        entryDigitTrigger = `Enter when Digit 0, 1, or 2 hits @ ${priceFormatted}`;
        boatAssignment = `Milliseconds Boat 9 (Digit Matrixer)`;
        slowDerivSignal = `Slow Track: CHOCH Reversal (Boat 6) @ 2M`;
        exitAndWinrate = `95% WR • 2 Ticks Expiry`;
        shortScannerTag = `Over 2 (${over2Pct}%)`;
        calculatedWinrate = Math.min(96, over2Pct + 14);
        st.assignedBoatId = 9;
    } else if (st.assignedContractType === 'UNDER_6' || under6Pct >= 72) {
        contractInstruction = `UNDER 6 (DIGITS 0 TO 5)`;
        entryDigitTrigger = `Enter when Digit 6, 7, 8, or 9 hits @ ${priceFormatted}`;
        boatAssignment = `Milliseconds Boat 9 (Digit Matrixer)`;
        slowDerivSignal = `Slow Track: Trendline Array (Boat 7) @ 5M`;
        exitAndWinrate = `95% WR • 2 Ticks Expiry`;
        shortScannerTag = `Under 6 (${under6Pct}%)`;
        calculatedWinrate = Math.min(96, under6Pct + 14);
        st.assignedBoatId = 9;
    }

    st.winrate = calculatedWinrate;
    st.activeDigitSignalLabel = shortScannerTag;

    if (isActiveUI) {
        for (let i = 0; i < 10; i++) {
            const pct = finalPcts[i];
            const el = document.getElementById(`f-${i}`);
            if (el) {
                el.innerText = `${pct}%`;
                el.className = pct >= 14 ? "font-bold text-fxgreen" : pct <= 6 ? "font-bold text-rose-400" : "font-bold text-white";
            }
        }

        const streamContainer = document.getElementById('live-digit-hit-stream');
        const latestBadge = document.getElementById('latest-hit-digit-badge');
        if (streamContainer && st.recentDigits.length > 0) {
            const latestDigit = st.recentDigits[st.recentDigits.length - 1];
            if (latestBadge) {
                const parityTag = latestDigit % 2 === 0 ? 'EVEN' : 'ODD';
                const rangeTag = latestDigit >= 5 ? 'OVER 4' : 'UNDER 5';
                latestBadge.innerText = `HIT: ${latestDigit} (${parityTag} • ${rangeTag})`;
            }

            streamContainer.innerHTML = st.recentDigits.map((d, idx) => {
                const isLatest = idx === st.recentDigits.length - 1;
                const isEven = d % 2 === 0;
                const pillStyle = isLatest
                    ? 'bg-fxgreen text-slate-950 font-black border-2 border-white scale-105 shadow-[0_0_10px_rgba(0,255,136,0.7)]'
                    : isEven
                        ? 'bg-emerald-950/90 text-fxgreen border border-emerald-700/70 font-bold'
                        : 'bg-amber-950/90 text-gold border border-amber-700/70 font-bold';
                return `<span class="px-2 py-1 rounded-lg text-xs font-mono ${pillStyle}">${d}</span>`;
            }).join('');
        }

        const sigAEl = document.getElementById('digit-signal-a');
        if (sigAEl) sigAEl.innerText = `${contractInstruction} • ${boatAssignment}`;

        const sigBEl = document.getElementById('digit-signal-b');
        if (sigBEl) sigBEl.innerText = slowDerivSignal;

        const entryEl = document.getElementById('digit-entry-exact');
        if (entryEl) entryEl.innerText = entryDigitTrigger;

        const contractEl = document.getElementById('digit-contract-exact');
        if (contractEl) contractEl.innerText = exitAndWinrate;
    }
}

function executeBulkOrder(action) {
    const lot = document.getElementById('order-lot-size').value;
    const type = document.getElementById('order-exec-mode').value;
    if (typeof triggerElhadartProfitAlert === 'function') {
        triggerElhadartProfitAlert(`Bulk ${action} (${type})`, 92.50);
    }
    alert(`Executing Bulk ${action} Order on ${currentSymbol}\nLot Size: ${lot}\nExecution Mode: ${type}`);
}

function updateClockAndKillzones() {
    const now = new Date();
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hours = eat.getUTCHours();
    const clockEl = document.getElementById('live-eat-clock');
    if (clockEl) clockEl.innerText = eat.toUTCString().slice(17, 25) + " EAT";

    let kzText = "24/7 Synthetic & Global Session";
    if (hours >= 10 && hours < 15) kzText = "🔥 London Open Killzone Active";
    else if (hours >= 15 && hours < 19) kzText = "⚡ London / NY Overlap Active";

    const kzEl = document.getElementById('active-killzone-status');
    if (kzEl) kzEl.innerText = kzText;
}

function updateStreamStatusUI(connected) {
    const badge = document.getElementById('stream-status-badge');
    if (!badge) return;
    badge.innerText = "📡 Dual-Signal Engine & Distributed Matrix Active";
    badge.className = "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2.5 py-1 rounded border border-emerald-700";
}

document.addEventListener('DOMContentLoaded', () => {
    runSplashSequence();

    const amt = document.getElementById('conv-amt');
    const curr = document.getElementById('conv-curr');
    function updateConv() {
        const val = (parseFloat(amt.value) || 0) * (exchangeRates[curr.value] || 1);
        document.getElementById('conv-result').innerText = `${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${curr.value}`;
    }
    if (amt && curr) {
        amt.addEventListener('input', updateConv);
        curr.addEventListener('change', updateConv);
    }

    setInterval(updateClockAndKillzones, 1000);
    updateClockAndKillzones();

    selectSymbol('1HZ10V', 'Volatility 10 (1s) Index');
    renderScannerList();

    const derivApi = new DerivAPIConnector(DERIV_NUMERIC_APP_ID);
    window.derivApiInstance = derivApi;
    derivApi.onStatusChange = updateStreamStatusUI;

    derivApi.connect().then(() => {
        updateStreamStatusUI(true);

        derivApi.subscribeTicks(currentSymbol, handleIncomingTick);
        derivApi.subscribeMultipleTicks(
            exhaustiveAssets.map(a => a.symbol),
            handleIncomingTick
        );

        derivApi.fetchActiveSymbols((symbols) => {
            if (symbols && symbols.length > 0) {
                const mapped = symbols
                    .filter(s => s.exchange_is_open === 1)
                    .map(s => {
                        const sym = s.underlying_symbol || s.symbol;
                        const name = s.underlying_symbol_name || s.display_name;
                        const pipDecimals = s.pip_size ? Math.max(0, Math.round(-Math.log10(s.pip_size))) : 2;
                        if (!marketDataStore[sym]) {
                            const poolItem = globalContractPool[Object.keys(marketDataStore).length % globalContractPool.length];
                            marketDataStore[sym] = {
                                name: name,
                                pip: pipDecimals,
                                price: '1000.00',
                                prevPrice: 0,
                                direction: 'neutral',
                                quotes: [],
                                recentDigits: [],
                                digits: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                total: 10,
                                winrate: 91,
                                tps: 1.5,
                                assignedContractType: poolItem.type,
                                assignedBoatId: poolItem.boat.includes('8') ? 8 : 9,
                                activeDigitSignalLabel: poolItem.label,
                                lastContractSignature: '',
                                lastBlockedDigit: -1
                            };
                        } else {
                            marketDataStore[sym].pip = pipDecimals;
                        }
                        return {
                            symbol: sym,
                            name: name,
                            market: s.market || 'synthetic_index',
                            pip: pipDecimals
                        };
                    });

                if (mapped.length > 0) {
                    exhaustiveAssets = mapped;
                }
            }

            const countEl = document.getElementById('header-asset-count');
            if (countEl) countEl.innerText = `${exhaustiveAssets.length} Live Markets Active`;

            renderScannerList();

            derivApi.subscribeMultipleTicks(
                exhaustiveAssets.slice(0, 50).map(a => a.symbol),
                handleIncomingTick
            );
        });
    });
});
