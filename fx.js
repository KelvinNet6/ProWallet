// Simulating Forex data for EUR/USD (static for now)
const rateElement = document.getElementById("rate");
let currentRate = 1.1250;
let tradeID = 1;
const activeTrades = []; // Array to store active trades

// Forex chart setup (as before)
const ctx = document.getElementById('forexChart').getContext('2d');
const forexChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'EUR/USD Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { type: 'linear', position: 'bottom' },
            y: { beginAtZero: false }
        }
    }
});

// Simulate updating the Forex price every 3 seconds
setInterval(() => {
    currentRate += (Math.random() - 0.5) * 0.01; // Simulate price fluctuation
    rateElement.innerText = currentRate.toFixed(4);

    // Update chart
    forexChart.data.labels.push(Date.now());
    forexChart.data.datasets[0].data.push(currentRate);
    forexChart.update();
}, 3000);

// Buy/Sell button interaction
document.getElementById("buy-btn").addEventListener("click", () => {
    const trade = createTrade('Buy');
    activeTrades.push(trade);
    updateTradeHistory();
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const trade = createTrade('Sell');
    activeTrades.push(trade);
    updateTradeHistory();
});

// Create a new trade (simulation)
function createTrade(action) {
    return {
        id: tradeID++, // Increment ID for each new trade
        pair: 'EUR/USD',
        action: action,
        amount: 1000, // Simulated trade amount
        openRate: currentRate, // Record the rate when the trade is opened
        status: 'Open' // Initially, the trade is open
    };
}

// Update the trade history table
function updateTradeHistory() {
    const tbody = document.querySelector("#trade-history tbody");
    tbody.innerHTML = ""; // Clear previous rows

    activeTrades.forEach(trade => {
        const row = document.createElement("tr");

        // Show the action button to close a trade if the trade is open
        let closeButton = '';
        if (trade.status === 'Open') {
            closeButton = `<button class="close-btn" onclick="closeTrade(${trade.id})">Close</button>`;
        }

        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${trade.pair}</td>
            <td>${trade.action}</td>
            <td>${trade.amount}</td>
            <td>${trade.status}</td>
            <td>${trade.openRate.toFixed(4)}</td>
            <td>${closeButton}</td>
        `;
        tbody.appendChild(row);
    });
}

// Close a trade (simulate profit/loss based on the current rate)
function closeTrade(tradeID) {
    const trade = activeTrades.find(t => t.id === tradeID);
    if (trade && trade.status === 'Open') {
        const closeRate = currentRate;

        // Calculate profit or loss based on the action (Buy or Sell)
        let profitLoss = 0;
        if (trade.action === 'Buy') {
            profitLoss = (closeRate - trade.openRate) * (trade.amount);
        } else if (trade.action === 'Sell') {
            profitLoss = (trade.openRate - closeRate) * (trade.amount);
        }

        // Update trade status to closed
        trade.status = 'Closed';
        trade.closeRate = closeRate;
        trade.profitLoss = profitLoss;

        // Display profit/loss
        alert(`Trade Closed! Profit/Loss: $${profitLoss.toFixed(2)}`);

        // Update the table with the latest information
        updateTradeHistory();
    }
}
