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

// Set up live data fetch every 30 seconds
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

// Buy/Sell button interaction (adjusted to use the live balance)
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

if (accountNumber && emailAddress) {
    fetchBalance(accountNumber, emailAddress);  // Fetch the balance using stored credentials
} else {
    alert('Account information is missing.');
}

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
        balance += profitLoss;  // Add profit or subtract loss
        updateBalanceDisplay();  // Update the balance display

        // Alert with profit/loss message
        alert(`Trade Closed! ${profitLoss > 0 ? `Profit of K${profitLoss.toFixed(2)}` : `Loss of K${Math.abs(profitLoss).toFixed(2)}`}`);

        // Update the trade history table and close area
        updateTradeHistory();
        updateCloseArea();
    }
}
