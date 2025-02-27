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

// Initialize forex rate for MWK/ZAR
let currentRateMWKtoZAR = 1.05; // Initial forex rate for MWK/ZAR (1 MWK = 1.05 ZAR)
let currentRateZARtoMWK = 0.011; // Initial forex rate for ZAR/MWK (1 ZAR = 0.011 MWK)
let tradeID = 1; // ID counter for trades
const activeTrades = []; // Array to store active trades
let balance = 1000; // Initial balance, assuming K1000
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

    // Automatically update the trade monitor popup data when the chart updates
    updateTradeMonitorPopup();  // This will update the trade monitor data without opening the popup
}

// Set up live data fetch every 30 seconds
setInterval(fetchLiveForexRate, 30000);

// Function to create a new trade (either Buy or Sell) for MWK/ZAR
function createTrade(action, amount) {
    const trade = {
        id: tradeID++, // Increment trade ID
        pair: 'MWK/ZAR', // Currency pair updated to MWK/ZAR
        action: action,
        amount: amount, // User-defined trade amount
        openRate: currentRateMWKtoZAR, // Record the rate at the time of trade opening
        status: 'Open' // Status is initially Open
    };
    activeTrades.push(trade);
    updateTradeHistory(); // Update the main page trade history
    updateCloseArea(); // Update the area with close trade options
    
    // Open the trade monitor popup when a trade is created
    openTradeMonitorPopup(trade);  // Automatically open the trade monitor popup when a trade is created
}

// Buy/Sell button interaction (adjusted to use the live balance)
document.getElementById("buy-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); // Get the amount input
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    createTrade('Buy', amount);
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); // Get the amount input
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    createTrade('Sell', amount);
});

// Open the trade monitor popup when the "Monitor Trades" button is clicked
document.getElementById("trade-monitor-btn").addEventListener("click", () => {
    console.log("Trade Monitor Button Clicked!"); // Debugging line to check if the event is firing

    const tradePopup = document.getElementById("trade-popup");
    tradePopup.classList.add("active");  // Add "active" class to show the popup
    updateTradeMonitorPopup();  // Update the popup data when it's opened
});

// Function to open the trade monitor popup
function updateTradeMonitorPopup() {
    console.log("Updating Trade Monitor Popup..."); // Debugging line to check if this function is executing

    const tradePopup = document.getElementById("trade-popup");
    const popupBalanceEl = document.getElementById("popup-balance");
    const popupOpenTrades = document.getElementById("popup-open-trades");
    const popupProfit = document.getElementById("popup-profit");
    const popupLoss = document.getElementById("popup-loss");
    const tradeList = document.getElementById("trade-list");

    if (popupBalanceEl && popupOpenTrades && popupProfit && popupLoss && tradeList) {
        // Update balance, open trades count, profit, and loss in the popup
        popupBalanceEl.innerText = `MWK ${balance.toFixed(2)}`;
        popupOpenTrades.innerText = activeTrades.length;  // Assuming activeTrades is your trade array
        let totalProfit = 0;
        let totalLoss = 0;

        tradeList.innerHTML = "";  // Clear existing trades in the popup

        activeTrades.forEach(trade => {
            const tradeElement = document.createElement("div");
            tradeElement.classList.add("trade-item");
            tradeElement.innerHTML = `
                <p><strong>Trade ID:</strong> ${trade.id}</p>
                <p><strong>Action:</strong> ${trade.action}</p>
                <p><strong>Amount:</strong> MWK ${trade.amount}</p>
                <p><strong>Open Rate:</strong> ${trade.openRate}</p>
                <p><strong>Status:</strong> ${trade.status}</p>
                <hr>
            `;
            tradeList.appendChild(tradeElement);

            // Calculate profit/loss based on the current rate
            const currentRate = currentRateMWKtoZAR;
            const profitLoss = trade.action === "Buy" ? (currentRate - trade.openRate) * trade.amount : (trade.openRate - currentRate) * trade.amount;
            if (profitLoss >= 0) totalProfit += profitLoss;
            else totalLoss += Math.abs(profitLoss);
        });

        // Update the profit and loss in the popup
        popupProfit.innerText = `MWK ${totalProfit.toFixed(2)}`;
        popupLoss.innerText = `MWK ${totalLoss.toFixed(2)}`;
    }
}

// Function to close the trade monitor popup
document.querySelector(".close-btn").addEventListener("click", () => {
    const tradePopup = document.getElementById("trade-popup");
    tradePopup.classList.remove("active");
});

// Function to fetch balance using PaySheet number and email address
function fetchBalance(accountNumber, emailAddress) {
    const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}`;
    
    fetch(apiUrl)  // Use dynamic values from the arguments
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();  // Parse JSON response
        })
        .then(data => {
            // Check if the balance is in the response
            if (data.balance !== undefined) {
                balance = data.balance;  // Update balance with the fetched value
                updateBalanceDisplay();  // Update the balance on the UI
            } else {
                alert('Error: Unable to fetch balance. Please check your account details or try again later.');
            }
        })
        .catch(error => {
            alert('Sorry, there was an error fetching your balance. Please try again later.');
            console.error('Error fetching balance:', error); // For debugging purposes
        });
}

// Function to update the displayed balance in the forex trading interface
function updateBalanceDisplay() {
    const balanceElement = document.getElementById("balance");  // Ensure you have a balance element in the UI
    balanceElement.innerText = `Current Balance: K${balance.toFixed(2)}`;  // Display balance in the format KXXXX
}

// Example to fetch the balance when the page loads or user logs in
const accountNumber = sessionStorage.getItem('paySheetAccount');  // Get PaySheet account number from session storage
const emailAddress = sessionStorage.getItem('userEmail');  // Get user email address from session storage

//if (accountNumber && emailAddress) {
   // fetchBalance(accountNumber, emailAddress);  // Fetch the balance using stored credentials
//} else {
//    alert('Account information is missing.');
//}

// Update the trade history table on the main page
function updateTradeHistory() {
    const tbody = document.querySelector("#trade-history tbody");
    tbody.innerHTML = "";  // Clear previous rows

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

    // Automatically update the trade monitor popup with the latest trade data
    if (activeTrades.length > 0) {
        updateTradeMonitorPopup();  // Keep the trade monitor popup up-to-date
    }
}

// Function to update the trade monitor popup with the latest trade data
function updateTradeMonitorPopup() {
    const tradePopup = document.getElementById("trade-popup");
    const popupBalanceEl = document.getElementById("popup-balance");
    const popupTradeDetails = document.getElementById("popup-trade-details");

    if (popupBalanceEl && popupTradeDetails && tradePopup.classList.contains("active")) {
        popupBalanceEl.innerText = `Balance: K${balance.toFixed(2)}`;
        
        if (activeTrades.length > 0) {
            const trade = activeTrades[activeTrades.length - 1]; // Get the most recent trade
            popupTradeDetails.innerHTML = `
                <p>Trade ID: ${trade.id}</p>
                <p>Pair: ${trade.pair}</p>
                <p>Action: ${trade.action}</p>
                <p>Amount: K${trade.amount}</p>
                <p>Open Rate: ${trade.openRate}</p>
            `;
        }
    }
}
