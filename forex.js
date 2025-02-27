// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem('paySheetAccount'); // Remove session data
    window.location.href = "index.html";
});

// Initialize balance and forex rate
let balance = 10000; // Starting balance
let currentRate = 1.1250; // Initial forex rate
let tradeID = 1; // ID counter for trades
const activeTrades = []; // Array to store active trades
let updateInterval;

const balanceElement = document.getElementById("balance");
const rateElement = document.getElementById("rate");

// Forex chart setup (unchanged)
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

// Simulate forex rate fluctuation every 3 seconds
setInterval(() => {
    currentRate += (Math.random() - 0.5) * 0.01; // Simulate price fluctuation
    rateElement.innerText = currentRate.toFixed(4);

    // Update the forex chart with the new rate
    forexChart.data.labels.push(Date.now());
    forexChart.data.datasets[0].data.push(currentRate);
    forexChart.update();

    // If the trade monitor popup is open, simulate clicking the trade monitor button to trigger the update
    const tradePopup = document.getElementById("trade-popup");
    if (tradePopup.style.display === "block") {
        // Simulate clicking the "trade-monitor-btn" when the popup is open
        const tradeMonitorBtn = document.getElementById("trade-monitor-btn");
        tradeMonitorBtn.click(); // Trigger the click event programmatically
    }
}, 3000);

// Function to create new trade (either Buy or Sell)
function createTrade(action) {
    return {
        id: tradeID++, // Increment trade ID
        pair: 'EUR/USD',
        action: action,
        amount: 1000, // Simulated amount of the trade
        openRate: currentRate, // Record the rate at the time of trade opening
        status: 'Open' // Status is initially Open
    };
}

// Buy/Sell button interaction
document.getElementById("buy-btn").addEventListener("click", () => {
    const trade = createTrade('Buy');
    activeTrades.push(trade);
    updateTradeHistory(); // Update the main page trade history
    updateCloseArea(); // Update the area with close trade options
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const trade = createTrade('Sell');
    activeTrades.push(trade);
    updateTradeHistory(); // Update the main page trade history
    updateCloseArea(); // Update the area with close trade options
});

// Update the trade history table on the main page
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
            <td>${trade.openRate.toFixed(4)}</td>
            <td><div id="trade-${trade.id}-close" class="close-trade">X Close</div></td>
        `;
        tbody.appendChild(row);

        // Add event listener for closing trade
        const closeTradeElement = document.getElementById(`trade-${trade.id}-close`);
        closeTradeElement.addEventListener("click", () => {
            closeTrade(trade.id);
        });
    });
}

// Function to close a trade (calculates profit/loss based on the current rate)
function closeTrade(tradeID) {
    const trade = activeTrades.find(t => t.id === tradeID);
    if (trade && trade.status === 'Open') {
        const closeRate = currentRate;
        let profitLoss = 0;
        let resultMessage = '';

        // Profit/Loss calculation based on action (Buy or Sell)
        if (trade.action === 'Buy') {
            profitLoss = (closeRate - trade.openRate) * trade.amount;
        } else if (trade.action === 'Sell') {
            profitLoss = (trade.openRate - closeRate) * trade.amount;
        }

        // Update trade status and record profit/loss
        trade.status = 'Closed';
        trade.closeRate = closeRate;
        trade.profitLoss = profitLoss;

        // Update the balance
        balance += profitLoss; // Add profit or subtract loss
        balanceElement.innerText = balance.toFixed(2); // Update balance display

        // Alert with profit/loss message
        alert(`Trade Closed! ${profitLoss > 0 ? `Profit of $${profitLoss.toFixed(2)}` : `Loss of $${Math.abs(profitLoss).toFixed(2)}`}`);

        // Update the trade history table and close area
        updateTradeHistory();
        updateCloseArea();
    }
}

// Monitor trades popup updates
document.addEventListener("DOMContentLoaded", function () {
    const tradeMonitorBtn = document.getElementById("trade-monitor-btn");
    const tradePopup = document.getElementById("trade-popup");
    const closeBtn = document.querySelector(".close-btn");

    const popupBalanceEl = document.getElementById("popup-balance");
    const popupOpenTradesEl = document.getElementById("popup-open-trades");
    const popupProfitEl = document.getElementById("popup-profit");
    const popupLossEl = document.getElementById("popup-loss");
    const tradeListEl = document.getElementById("trade-list");

    let totalProfit = 0;
    let totalLoss = 0;

    // Open the trade monitor popup
    tradeMonitorBtn.addEventListener("click", function () {
        tradePopup.style.display = "block";
        updateTradePopup(); // Initial update when the popup is opened
    });

    // Close the trade monitor popup
    closeBtn.addEventListener("click", function () {
        tradePopup.style.display = "none";
    });

    // Function to update the trade monitor popup
    function updateTradePopup() {
        tradeListEl.innerHTML = ""; // Clear previous trades list
        totalProfit = 0;
        totalLoss = 0;

        activeTrades.forEach(trade => {
            if (trade.status === 'Open') {
                const tradeElement = document.createElement("div");
                const closeButton = document.createElement("button");
                closeButton.innerText = `Close Trade #${trade.id}`;
                closeButton.addEventListener("click", () => closeTradePopupTrade(trade.id));

                let profitLoss = 0;
                let resultMessage = '';

                // Calculate profit/loss based on the current forex rate for open trades
                if (trade.action === 'Buy') {
                    profitLoss = (currentRate - trade.openRate) * trade.amount;
                } else if (trade.action === 'Sell') {
                    profitLoss = (trade.openRate - currentRate) * trade.amount;
                }

                // Display live profit/loss for open trades
                if (profitLoss > 0) {
                    resultMessage = `Profit of $${profitLoss.toFixed(2)}`;
                    totalProfit += profitLoss;
                } else {
                    resultMessage = `Loss of $${Math.abs(profitLoss).toFixed(2)}`;
                    totalLoss += Math.abs(profitLoss);
                }

                tradeElement.innerHTML = `Trade #${trade.id}: ${trade.pair} (${trade.action}) - ${resultMessage}`;
                tradeElement.appendChild(closeButton);
                tradeListEl.appendChild(tradeElement);
            }
        });

        // Update the profit and loss displays in the popup
        popupProfitEl.textContent = totalProfit.toFixed(2);
        popupLossEl.textContent = totalLoss.toFixed(2);
        popupOpenTradesEl.textContent = activeTrades.filter(t => t.status === 'Open').length;

        // Update the balance in the popup
        popupBalanceEl.textContent = balance.toFixed(2);
    }

    // Close trade from the popup
    function closeTradePopupTrade(tradeID) {
        closeTrade(tradeID); // Close the trade
        updateTradePopup(); // Recalculate and update the popup data
    }
});
