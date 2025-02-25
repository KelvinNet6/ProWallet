// Initialize balance
let balance = 10000; // Starting balance
const balanceElement = document.getElementById("balance"); // The element displaying balance
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
    updateCloseArea();
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const trade = createTrade('Sell');
    activeTrades.push(trade);
    updateTradeHistory();
    updateCloseArea();
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
        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${trade.pair}</td>
            <td>${trade.action}</td>
            <td>${trade.amount}</td>
            <td>${trade.status}</td>
            <td>${trade.openRate.toFixed(4)}</td>
            <td><div id="trade-${trade.id}-close" class="close-trade">X Close</div></td>
        `;
        tbody.appendChild(row);

        // Add event listener for closing trade (click X Close)
        const closeTradeElement = document.getElementById(`trade-${trade.id}-close`);
        closeTradeElement.addEventListener("click", () => {
            closeTrade(trade.id);
        });
    });
}

// Update the chart area with "X Close" link
function updateCloseArea() {
    const closeArea = document.getElementById("close-trade-area");
    closeArea.innerHTML = ""; // Clear previous entries

    activeTrades.forEach(trade => {
        if (trade.status === 'Open') {
            const closeText = document.createElement("div");
            closeText.className = "close-trade";
            closeText.innerText = `X Close Trade #${trade.id}`;
            closeText.addEventListener("click", () => closeTrade(trade.id));
            closeArea.appendChild(closeText);
        }
    });
}

// Close a trade (simulate profit/loss based on the current rate)
function closeTrade(tradeID) {
    const trade = activeTrades.find(t => t.id === tradeID);
    if (trade && trade.status === 'Open') {
        const closeRate = currentRate;

        // Calculate profit or loss based on the action (Buy or Sell)
        let profitLoss = 0;
        let resultMessage = '';
        
        if (trade.action === 'Buy') {
            profitLoss = (closeRate - trade.openRate) * trade.amount;
            if (profitLoss > 0) {
                resultMessage = `Profit of $${profitLoss.toFixed(2)}`;
            } else {
                resultMessage = `Loss of $${Math.abs(profitLoss).toFixed(2)}`;
            }
        } else if (trade.action === 'Sell') {
            profitLoss = (trade.openRate - closeRate) * trade.amount;
            if (profitLoss > 0) {
                resultMessage = `Profit of $${profitLoss.toFixed(2)}`;
            } else {
                resultMessage = `Loss of $${Math.abs(profitLoss).toFixed(2)}`;
            }
        }

        // Update trade status to closed
        trade.status = 'Closed';
        trade.closeRate = closeRate;
        trade.profitLoss = profitLoss;

        // Update the balance
        balance += profitLoss; // Add profit or subtract loss

        // Display updated balance
        balanceElement.innerText = balance.toFixed(2);

        // Display the result message
        alert(`Trade Closed! ${resultMessage}`);

        // Update the table with the latest information
        updateTradeHistory();

        // Update the chart area
        updateCloseArea();
    }
}
     //-------------------------------------------------trade popup-------------------------------------//   
document.addEventListener("DOMContentLoaded", function () {
    const tradeMonitorBtn = document.getElementById("trade-monitor-btn");
    const tradePopup = document.getElementById("trade-popup");
    const closeBtn = document.querySelector(".close-btn");
    const closeTradeBtn = document.getElementById("close-trade-btn");

    const balanceEl = document.getElementById("balance");
    const openTradesEl = document.getElementById("open-trades");
    const profitEl = document.getElementById("profit");
    const lossEl = document.getElementById("loss");

    let balance = 1000; // Starting balance
    let openTrades = 0;
    let profit = 0;
    let loss = 0;
    let tradeInterval;

    // Open trade monitor popup
    tradeMonitorBtn.addEventListener("click", function () {
        tradePopup.style.display = "block";
    });

    // Close popup
    closeBtn.addEventListener("click", function () {
        tradePopup.style.display = "none";
    });

    // Start a trade when button is clicked
    function startTrade() {
        openTrades++;
        openTradesEl.textContent = openTrades;

        tradeInterval = setInterval(() => {
            let fluctuation = (Math.random() * 2 - 1) * 50; // Simulate ±$50 change
            if (fluctuation >= 0) {
                profit += fluctuation;
                profitEl.textContent = profit.toFixed(2);
            } else {
                loss += Math.abs(fluctuation);
                lossEl.textContent = loss.toFixed(2);
            }
        }, 2000);
    }

    // Close trade and update balance
    closeTradeBtn.addEventListener("click", function () {
        if (openTrades > 0) {
            openTrades--;
            openTradesEl.textContent = openTrades;

            balance += profit - loss;
            balanceEl.textContent = balance.toFixed(2);

            profit = 0;
            loss = 0;
            profitEl.textContent = "0";
            lossEl.textContent = "0";

            clearInterval(tradeInterval);
        }
    });

    // Auto-start trade when page loads (for demo)
    startTrade();
});
