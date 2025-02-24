// Simulating Forex data for EUR/USD (static for now)
const rateElement = document.getElementById("rate");
let currentRate = 1.1250;
let tradeID = 1;
const activeTrades = [];

// Chart setup
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
        id: tradeID++,
        pair: 'EUR/USD',
        action: action,
        amount: 1000, // Simulated trade amount
        status: 'Active'
    };
}

// Update trade history table
function updateTradeHistory() {
    const tbody = document.querySelector("#trade-history tbody");
    tbody.innerHTML = ""; // Clear previous rows

    activeTrades.forEach(trade => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${trade.pair}</td>
            <td>${trade.action}</td>
            <td>${trade.amount}</td>
            <td>${trade.status}</td>
        `;
        tbody.appendChild(row);
    });
}
