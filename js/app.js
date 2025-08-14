let lastPrices = {};
let trades = JSON.parse(localStorage.getItem("trades") || "[]");
let watchlist = [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
    { id: "binancecoin", symbol: "BNB" },
    { id: "cardano", symbol: "ADA" },
    { id: "solana", symbol: "SOL" }
];

// Notifications
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Load saved balance
document.getElementById("balance-input").value = localStorage.getItem("account_balance") || 5000;
document.getElementById("balance-input").addEventListener("input", e => {
    localStorage.setItem("account_balance", e.target.value);
    updateProgress();
});

// Watchlist
function renderWatchlist() {
    const watchlistEl = document.getElementById("watchlist");
    watchlistEl.innerHTML = "";
    watchlist.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${c.symbol}</strong>: <span id="price-${c.id}" style="color: white;">Loading...</span>`;
        li.style.cursor = "pointer";
        li.addEventListener("click", () => showCoinDetails(c.id, c.symbol));
        watchlistEl.appendChild(li);
    });
}

function showCoinDetails(id, symbol) {
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`)
        .then(res => res.json())
        .then(data => {
            const d = data[id];
            document.getElementById("coin-details").innerHTML = `
                <h3>${symbol}</h3>
                <p>Price: $${d.usd.toLocaleString()}</p>
                <p>24h Change: ${d.usd_24h_change.toFixed(2)}%</p>
            `;
        });
}

// Update prices
function updatePrices() {
    const ids = watchlist.map(c => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
        .then(res => res.json())
        .then(data => {
            watchlist.forEach(c => {
                const priceEl = document.getElementById(`price-${c.id}`);
                if (!priceEl) return;
                const newPrice = data[c.id].usd;
                const oldPrice = lastPrices[c.id];

                priceEl.textContent = `$${newPrice.toLocaleString()}`;
                if (oldPrice) {
                    if (newPrice > oldPrice) priceEl.style.color = "limegreen";
                    else if (newPrice < oldPrice) priceEl.style.color = "red";
                    else priceEl.style.color = "white";

                    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
                    if (Math.abs(changePercent) >= 2) {
                        showNotification(`${c.symbol} Alert`, `${c.symbol} moved ${changePercent.toFixed(2)}% in 1 min`);
                    }
                }

                lastPrices[c.id] = newPrice;
            });
        });
}

// Notifications
function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
}

// Trade Journal
function renderTrades() {
    const tbody = document.querySelector("#trade-journal tbody");
    tbody.innerHTML = "";
    trades.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.coin}</td>
            <td>$${t.entry}</td>
            <td>$${t.exit}</td>
            <td>${t.size}</td>
            <td style="color:${t.pl >= 0 ? 'limegreen' : 'red'};">$${t.pl.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    updateProgress();
}

document.getElementById("add-trade").addEventListener("click", () => {
    const date = prompt("Date (YYYY-MM-DD):");
    const coin = prompt("Coin Symbol:");
    const entry = parseFloat(prompt("Entry Price:"));
    const exit = parseFloat(prompt("Exit Price:"));
    const size = parseFloat(prompt("Position Size:"));

    if (!date || !coin || isNaN(entry) || isNaN(exit) || isNaN(size)) {
        alert("Invalid trade details.");
        return;
    }

    const pl = (exit - entry) * size;
    trades.push({ date, coin, entry, exit, size, pl });
    localStorage.setItem("trades", JSON.stringify(trades));
    renderTrades();
});

// Progress calculation & charts
function updateProgress() {
    const balance = parseFloat(localStorage.getItem("account_balance") || 5000);
    const totalPL = trades.reduce((sum, t) => sum + t.pl, 0);
    const progress = ((totalPL / balance) * 100).toFixed(2);
    document.getElementById("progress-display").value = progress;
    localStorage.setItem("progress", progress);
    updateCharts();
}

// Charts
let dailyChart, weeklyChart, monthlyChart;
function updateCharts() {
    const daily = trades.slice(-1).map(t => t.pl);
    const weekly = trades.slice(-7).map(t => t.pl);
    const monthly = trades.slice(-30).map(t => t.pl);

    const createChart = (ctx, data, label) => {
        if (ctx.chart) ctx.chart.destroy();
        ctx.chart = new Chart(ctx, {
            type: 'line',
            data: { labels: data.map((_,i)=>i+1), datasets: [{ label: label, data: data, borderColor: '#00b894', backgroundColor: 'rgba(0,184,148,0.2)' }]},
            options: { responsive: true, plugins: { legend: { display: true } } }
        });
    };

    createChart(document.getElementById('dailyChart'), daily, 'Daily P/L');
    createChart(document.getElementById('weeklyChart'), weekly, 'Weekly P/L');
    createChart(document.getElementById('monthlyChart'), monthly, 'Monthly P/L');
}

// Init
renderWatchlist();
updatePrices();
renderTrades();
setInterval(updatePrices, 60000);
