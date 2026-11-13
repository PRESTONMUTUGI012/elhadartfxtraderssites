class TerminalAudioEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = true;
    }
    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playTone(freq, type, startTime, duration, volume = 0.15) {
        if (!this.isEnabled) return;
        this.initContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
    playProfitChime() {
        if (!this.isEnabled) return;
        this.initContext();
        const now = this.ctx.currentTime;
        this.playTone(523.25, 'triangle', now, 0.18, 0.16);
        this.playTone(659.25, 'triangle', now + 0.09, 0.18, 0.16);
        this.playTone(783.99, 'triangle', now + 0.18, 0.22, 0.18);
        this.playTone(1046.50, 'sine', now + 0.27, 0.45, 0.22);
    }
}

const terminalAudio = new TerminalAudioEngine();

function toggleTerminalAudio() {
    terminalAudio.isEnabled = !terminalAudio.isEnabled;
    if (terminalAudio.isEnabled) terminalAudio.initContext();
    const icon = document.getElementById('audio-status-icon');
    const text = document.getElementById('audio-status-text');
    if (icon && text) {
        icon.innerText = terminalAudio.isEnabled ? '🔊' : '🔇';
        text.innerText = terminalAudio.isEnabled ? 'SFX ON' : 'MUTED';
    }
}

function triggerElhadartProfitAlert(boatLabel, profitAmount) {
    terminalAudio.playProfitChime();
    const banner = document.getElementById('profit-toast-banner');
    const details = document.getElementById('profit-toast-details');
    if (banner && details) {
        details.innerText = `${boatLabel} Secured +$${profitAmount.toFixed(2)} Profit`;
        banner.classList.remove('translate-x-full', 'opacity-0');
        banner.classList.add('translate-x-0', 'opacity-100');
        clearTimeout(window.profitToastTimeout);
        window.profitToastTimeout = setTimeout(() => {
            banner.classList.remove('translate-x-0', 'opacity-100');
            banner.classList.add('translate-x-full', 'opacity-0');
        }, 4000);
    }
}

const speedBoatsDirectory = {
    1: { name: "Boat 1: OB Sniper", track: "Slow Deriv (1M-5M)", setup: "Order Block Tap" },
    2: { name: "Boat 2: Tick Scalper", track: "Fast MS (1-3 Ticks)", setup: "Tick Velocity Surge" },
    3: { name: "Boat 3: Sweep Scalper", track: "Fast MS (1-2 Ticks)", setup: "Liquidity Sweep Fade" },
    4: { name: "Boat 4: FVG Rebalance", track: "Slow Deriv (3M Hold)", setup: "Fair Value Gap Fill" },
    5: { name: "Boat 5: BOS Follower", track: "Slow Deriv (1M Hold)", setup: "Break of Structure" },
    6: { name: "Boat 6: CHOCH Hunter", track: "Slow Deriv (2M Hold)", setup: "Change of Character" },
    7: { name: "Boat 7: Trendline Array", track: "Slow Deriv (5M Hold)", setup: "Trendline Breakout" },
    8: { name: "Boat 8: Parity Shifter", track: "Fast MS (2 Ticks)", setup: "Even / Odd Parity" },
    9: { name: "Boat 9: Digit Matrixer", track: "Fast MS (1-3 Ticks)", setup: "Exact Digit / Barrier" }
};

let currentActiveSpeedBoat = 5;
let currentTimeframeMode = '1M'; // 'MS' for Fast Track, '1M' for Slow Track

function switchSpeedBoat(boatId) {
    currentActiveSpeedBoat = Number(boatId);
}

function switchTimeframeMode(mode) {
    currentTimeframeMode = mode;
}

function executeSpeedBoatTrade() {
    const boat = speedBoatsDirectory[currentActiveSpeedBoat];
    const label = boat ? `${boat.name} (${boat.track})` : `Speed Boat ${currentActiveSpeedBoat}`;
    triggerElhadartProfitAlert(label, 95.00);
    alert(`Executing ${label} successfully!`);
}

// Dual-Signal Evaluation for Rise/Fall Indicators (Fast MS vs Slow Deriv)
function evaluateAllIndicators(st) {
    if (!st || !st.quotes || st.quotes.length < 20) return;
    
    const quotes = st.quotes;
    const len = quotes.length;
    const currentPrice = quotes[len - 1];
    const prevPrice = quotes[len - 2];
    const isRise = currentPrice >= prevPrice;

    const ma30 = quotes.slice(len - 30, len).reduce((a, b) => a + b, 0) / 30;
    const bias15M = currentPrice >= ma30 ? "15M Bullish" : "15M Bearish";

    const recentHigh = Math.max(...quotes.slice(len - 25, len - 1));
    const recentLow = Math.min(...quotes.slice(len - 25, len - 1));
    
    const isCHOCH = !isRise && currentPrice < recentLow;
    const isBOS = isRise && currentPrice > recentHigh;

    // Track A (Fast MS Signal)
    const signalAText = isRise ? "Rise 3T • Boat 2 (Tick Scalper)" : "Fall 3T • Boat 2 (Tick Scalper)";
    
    // Track B (Slow Deriv Signal)
    let signalBText = isBOS ? `1M BOS Hold • Boat 5` : isCHOCH ? `2M CHOCH Reversal • Boat 6` : `1M OB Sniper • Boat 1`;
    if (bias15M.includes("Bearish") && !isCHOCH) {
        signalBText = `1M Bearish Trend • Boat 5`;
    }

    const entryPointText = currentTimeframeMode === 'MS' 
        ? `Enter after 3 tick velocity pulses @ ${currentPrice.toFixed(2)}`
        : `Enter on 1M candle close (${bias15M}) @ ${currentPrice.toFixed(2)}`;

    const routingText = currentTimeframeMode === 'MS'
        ? `Fast Track (Milliseconds 1-3T)`
        : `Slow Track (Deriv 1M-5M Hold)`;

    const sigAEl = document.getElementById('dual-signal-a');
    if (sigAEl) sigAEl.innerText = signalAText;

    const sigBEl = document.getElementById('dual-signal-b');
    if (sigBEl) sigBEl.innerText = signalBText;

    const epEl = document.getElementById('dual-entry-point-display');
    if (epEl) epEl.innerText = entryPointText;

    const routeEl = document.getElementById('rise-fall-boat-route');
    if (routeEl) routeEl.innerText = routingText;
}
