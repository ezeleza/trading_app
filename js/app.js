// Load settings
fetch('data/settings.json')
    .then(response => response.json())
    .then(settings => {
        // Show account balance
        document.getElementById("balance").textContent = `$${settings.account_balance}`;

        // Show watchlist
        const watchlistEl = document.getElementById("watchlist");
        settings.watchlist.forEach(coin => {
            const li = document.createElement("li");
            li.textContent = coin;
            watchlistEl.appendChild(li);
        });
    })
    .catch(error => console.error("Error loading settings:", error));
// Load settings
fetch('data/settings.json')
    .then(response => response.json())
    .then(settings => {
        // Show account balance
        document.getElementById("balance").textContent = `$${settings.account_balance}`;

        // Show watchlist
        const watchlistEl = document.getElementById("watchlist");
        settings.watchlist.forEach(coin => {
            const li = document.createElement("li");
            li.textContent = coin;
            li.style.cursor = "pointer";

            // On click: fetch live price
            li.addEventListener("click", () => {
                fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`)
                    .then(res => res.json())
                    .then(data => {
                        const details = data[coin.toLowerCase()];
                        if (details) {
                            document.getElementById("coin-details").innerHTML = `
                                <h3>${coin}</h3>
                                <p>Price: $${details.usd.toLocaleString()}</p>
                                <p>24h Change: ${details.usd_24h_change.toFixed(2)}%</p>
                            `;
                        } else {
                            document.getElementById("coin-details").innerHTML = `<p>No data for ${coin}</p>`;
                        }
                    })
                    .catch(err => console.error("API error:", err));
            });

            watchlistEl.appendChild(li);
        });
    })
    .catch(error => console.error("Error loading settings:", error));
