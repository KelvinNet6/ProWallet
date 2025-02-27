// Initialize balance and forex rate for MWK/ZAR
let balance = 10000; // Starting balance
let currentRateMWKtoZAR = 1.05; // Initial forex rate for MWK/ZAR (1 MWK = 1.05 ZAR)
let currentRateZARtoMWK = 0.011; // Initial forex rate for ZAR/MWK (1 ZAR = 0.011 MWK)
let tradeID = 1; // ID counter for trades
const activeTrades = []; // Array to store active trades
let updateInterval;

// Replace with your actual Alpha Vantage API key
const apiKey = "QZUV32Y1PXFKGEBY"; 

// API endpoint for forex data (use "FX" function for forex rates)
const baseUrl = "https://www.alphavantage.co/query";

// Forex chart setup (adjusted for MWK/ZAR)
const ctx = document.getElementById('forexChart').getContext('2d');
const forexChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'MWK/ZAR Price',
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

// Function to fetch live forex rate for MWK/ZAR from Alpha Vantage API
async function fetchLiveForexRate() {
 const url = `${baseUrl}?function=FX_INTRADAY&from_symbol=MWK&to_symbol=ZAR&interval=5min&apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check for API rate-limit error
        if (data['Note']) {
            console.error('API rate limit exceeded. Please wait a minute before trying again.');
            return;
        }

        if (data["Time Series FX (5min)"]) {
            const latestData = Object.values(data["Time Series FX (5min)"])[0];
            currentRateMWKtoZAR = parseFloat(latestData["4. close"]).toFixed(4); // The closing rate (ZAR/MWK)
            updateRateDisplay(); // Update the displayed rate
            updateChartData(); // Update the chart with the new data
            updateTradePopup(); // Recalculate the open trades' profit/loss based on the new rate
        } else {
            console.error("Error fetching forex data:", data);
        }
    } catch (error) {
        console.error("Error fetching live forex rate:", error);
    }
}

// Function to update the forex rate display on the page
function updateRateDisplay() {
    const rateElement = document.getElementById("rate");
    rateElement.innerText = currentRateMWKtoZAR; // Update the displayed rate with real-time data
}

// Function to update the forex chart with the new rate
function updateChartData() {
    forexChart.data.labels.push(Date.now()); // Add a new timestamp
    forexChart.data.datasets[0].data.push(currentRateMWKtoZAR); // Add the new rate data
    forexChart.update(); // Refresh the chart
}

// Set up live data fetch every 3 seconds (or adjust frequency)
setInterval(fetchLiveForexRate, 30000);

// Function to create a new trade (either Buy or Sell) for MWK/ZAR
function createTrade(action, amount) {
    return {
        id: tradeID++, // Increment trade ID
        pair: 'MWK/ZAR', // Currency pair updated to MWK/ZAR
        action: action,
        amount: amount, // User-defined trade amount
        openRate: currentRateMWKtoZAR, // Record the rate at the time of trade opening
        status: 'Open' // Status is initially Open
    };
}

// Buy/Sell button interaction
document.getElementById("buy-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); // Get the amount input
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    const trade = createTrade('Buy', amount);
    activeTrades.push(trade);
    updateTradeHistory(); // Update the main page trade history
    updateCloseArea(); // Update the area with close trade options
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); // Get the amount input
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    const trade = createTrade('Sell', amount);
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
        const closeRate = currentRateMWKtoZAR;
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
                    profitLoss = (currentRateMWKtoZAR - trade.openRate) * trade.amount;
                } else if (trade.action === 'Sell') {
                    profitLoss = (trade.openRate - currentRateMWKtoZAR) * trade.amount;
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

