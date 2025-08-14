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
