// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem('paySheetAccount'); 
    window.location.href = "index.html";
});

// Initialize forex rates for GBP/ZAR, USD/ZAR, and AUD/ZAR
// Initialize forex rates for GBP/ZAR, USD/ZAR, and AUD/ZAR
let currentRates = {
    GBPtoZAR: 20, 
    USDtoZAR: 15, 
    AUDtoZAR: 12  
};

// Initialize balance in MWK and display in ZAR
let balanceMWK = 100000;  // Example MWK balance
let balanceZAR = convertMWKtoZAR(balanceMWK);  // Convert initial balance to ZAR
let tradeID = 1;
const activeTrades = [];

// Replace with your actual Alpha Vantage API key
const apiKey = "QZUV32Y1PXFKGEBY";
const baseUrl = "https://www.alphavantage.co/query";

// Function to open a new trade
function openTrade(action, amount, currencyPair) {
    // Check if amount is entered
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return; // Exit the function if no valid amount is entered
    }

    // Get the current exchange rate based on the selected currency pair
    let openRate = 0;
    
    if (currencyPair === "GBP/ZAR") {
        openRate = currentRates.GBPtoZAR;
    } else if (currencyPair === "USD/ZAR") {
        openRate = currentRates.USDtoZAR;
    } else if (currencyPair === "AUD/ZAR") {
        openRate = currentRates.AUDtoZAR;
    }

    // Check if the balance is sufficient
    if (balanceZAR < amount) {
        alert("Insufficient balance to complete the trade.");
        return; // Exit the function if the balance is insufficient
    }

    // Create a new trade object
    const newTrade = {
        id: tradeID++, // Increment the trade ID for each new trade
        action: action, // "Buy" or "Sell"
        amount: amount, // Amount of currency
        pair: currencyPair, // Currency pair (e.g., "GBP/ZAR")
        openRate: openRate, // Rate at which the trade was opened
        status: "Open" // Trade status (open when it is just created)
    };

    // Add the new trade to the active trades array
    activeTrades.push(newTrade);

    // Save the active trades in localStorage for persistence
    localStorage.setItem('activeTrades', JSON.stringify(activeTrades));

    // Update the trade monitor popup to display the new trade
    updateTradeMonitorPopup();

    // Update the trade history (if you have a trade history table or section)
    updateTradeHistory();

    // Optionally log the trade for debugging
    console.log(`Trade opened: ${action} ${amount} ${currencyPair} at rate ${openRate}`);

    // Update the balance after the trade (deduct the amount)
    balanceZAR -= amount;  // Deduct the amount from the balance
    updateBalanceDisplay();  // Update the displayed balance
}

document.getElementById('buy-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount-input').value); // Get the amount entered by the user
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Buy", amount, selectedCurrencyPair);
});

document.getElementById('sell-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount-input').value); // Get the amount entered by the user
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Sell", amount, selectedCurrencyPair);
});


// Example usage for Buy button (assuming you are calling this when the Buy button is clicked)
document.getElementById('buy-btn').addEventListener('click', () => {
    const amount = 100;
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Buy", amount, selectedCurrencyPair);
});

// Example usage for Sell button (assuming you are calling this when the Sell button is clicked)
document.getElementById('sell-btn').addEventListener('click', () => {
    const amount = 50;
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Sell", amount, selectedCurrencyPair);
});


// Example usage for Buy button (assuming you are calling this when the Buy button is clicked)
document.getElementById('buy-btn').addEventListener('click', () => {
    const amount = 100; // Example amount for the trade (can be dynamic based on user input)
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Buy", amount, selectedCurrencyPair);
});

// Example usage for Sell button (assuming you are calling this when the Sell button is clicked)
document.getElementById('sell-btn').addEventListener('click', () => {
    const amount = 50; // Example amount for the trade (can be dynamic based on user input)
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Sell", amount, selectedCurrencyPair);
});


// Forex chart setup (adjusted for GBP/ZAR, USD/ZAR, AUD/ZAR)
const ctx = document.getElementById('forexChart').getContext('2d');
const forexChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'GBP/ZAR Price',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            },
            {
                label: 'USD/ZAR Price',
                data: [],
                borderColor: 'rgba(255, 159, 64, 1)',
                fill: false
            },
            {
                label: 'AUD/ZAR Price',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { type: 'linear', position: 'bottom' },
            y: { beginAtZero: false }
        }
    }
});

// Function to change chart color based on selected currency pair
function changeChartColor(currencyPair) {
    const chartElement = document.getElementById('forexChart'); // Assuming your chart has this ID
    
    // Define colors for different currency pairs
    const chartColors = {
        "GBP/ZAR": "#4CAF50", // Green for GBP/ZAR
        "USD/ZAR": "#FF5733", // Red for USD/ZAR
        "AUD/ZAR": "#3399FF"  // Blue for AUD/ZAR
    };

    // Set the chart background color based on the selected currency pair
    if (chartColors[currencyPair]) {
        chartElement.style.backgroundColor = chartColors[currencyPair];
    } else {
        chartElement.style.backgroundColor = "#FFFFFF"; // Default to white if no match
    }

    // Optionally change other chart-related colors (e.g., axis, line color) here
    // chartElement.style.color = chartColors[currencyPair]; // Example for changing text color
}

// Example usage: Listen for changes in the currency pair dropdown
document.getElementById('currency-pair-dropdown').addEventListener('change', function() {
    const selectedCurrencyPair = this.value; // Get selected currency pair
    changeChartColor(selectedCurrencyPair); // Update the chart color
});

// Example usage for Buy button (assuming you are calling this when the Buy button is clicked)
document.getElementById('buy-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount-input').value); // Get the amount entered by the user
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Buy", amount, selectedCurrencyPair);
    changeChartColor(selectedCurrencyPair); // Change the chart color when trade is opened
});

// Example usage for Sell button (assuming you are calling this when the Sell button is clicked)
document.getElementById('sell-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount-input').value); // Get the amount entered by the user
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    openTrade("Sell", amount, selectedCurrencyPair);
    changeChartColor(selectedCurrencyPair); // Change the chart color when trade is opened
});

// Convert MWK to ZAR
function convertMWKtoZAR(mwkAmount) {
    return mwkAmount * 0.011;  // Adjust conversion rate if necessary
}

// Convert ZAR to MWK
function convertZARtoMWK(zarAmount) {
    return zarAmount / 0.011;  // Inverse of the MWK to ZAR rate
}

// Function to fetch live forex rates for GBP/ZAR, USD/ZAR, and AUD/ZAR
async function fetchLiveForexRate() {
    let url;
    
    // Determine the URL based on the selected currency pair
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    if (selectedCurrencyPair === "GBP/ZAR") {
        url = `${baseUrl}?function=FX_INTRADAY&from_symbol=GBP&to_symbol=ZAR&interval=5min&apikey=${apiKey}`;
    } else if (selectedCurrencyPair === "USD/ZAR") {
        url = `${baseUrl}?function=FX_INTRADAY&from_symbol=USD&to_symbol=ZAR&interval=5min&apikey=${apiKey}`;
    } else if (selectedCurrencyPair === "AUD/ZAR") {
        url = `${baseUrl}?function=FX_INTRADAY&from_symbol=AUD&to_symbol=ZAR&interval=5min&apikey=${apiKey}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data["Time Series FX (5min)"]) {
            const latestData = Object.values(data["Time Series FX (5min)"])[0];
            const latestRate = parseFloat(latestData["4. close"]).toFixed(4);  // Get the latest exchange rate

            // Update the rate for the selected currency pair
            if (selectedCurrencyPair === "GBP/ZAR") {
                currentRates.GBPtoZAR = latestRate;
            } else if (selectedCurrencyPair === "USD/ZAR") {
                currentRates.USDtoZAR = latestRate;
            } else if (selectedCurrencyPair === "AUD/ZAR") {
                currentRates.AUDtoZAR = latestRate;
            }

            updateRateDisplay();  // Update the displayed rate on the page
        }

        updateChartData();  // Update chart data after fetching the rate
    } catch (error) {
        console.error("Error fetching live forex rate:", error);
    }
}

// Function to update the forex rate display on the page
// Function to update the forex rate display and show selected currency pair in a rectangle
function updateRateDisplay() {
    const rateElement = document.getElementById("rate");
    const currencyBox = document.getElementById("currency-box");
    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;

    let selectedRate = "";
    let selectedColor = "";

    if (selectedCurrencyPair === "GBP/ZAR") {
        selectedRate = currentRates.GBPtoZAR;
        selectedColor = '#4bc0c0'; // Teal
    } else if (selectedCurrencyPair === "USD/ZAR") {
        selectedRate = currentRates.USDtoZAR;
        selectedColor = '#ff9f40'; // Orange
    } else if (selectedCurrencyPair === "AUD/ZAR") {
        selectedRate = currentRates.AUDtoZAR;
        selectedColor = '#9966ff'; // Purple
    }

    // Update rate display
    rateElement.innerText = `Current Rate: ${selectedCurrencyPair} ${selectedRate}`;

    // Update currency box display
    currencyBox.innerHTML = `<span>${selectedCurrencyPair}</span>`;
    currencyBox.style.backgroundColor = selectedColor;
    currencyBox.style.color = "#fff"; // White text for contrast
}

// Add event listener for dropdown selection
document.getElementById("currency-pair-dropdown").addEventListener("change", () => {
    updateRateDisplay();  // Update the rate and currency box
});

// Function to update the forex chart with only the selected currency pair
function updateChartData() {
    forexChart.data.labels.push(new Date().toLocaleTimeString()); // Use timestamp for x-axis

    const selectedCurrencyPair = document.getElementById("currency-pair-dropdown").value;
    let selectedRate = 0;
    let selectedColor = "";

    if (selectedCurrencyPair === "GBP/ZAR") {
        selectedRate = currentRates.GBPtoZAR;
        selectedColor = 'rgba(75, 192, 192, 1)'; // Teal
    } else if (selectedCurrencyPair === "USD/ZAR") {
        selectedRate = currentRates.USDtoZAR;
        selectedColor = 'rgba(255, 159, 64, 1)'; // Orange
    } else if (selectedCurrencyPair === "AUD/ZAR") {
        selectedRate = currentRates.AUDtoZAR;
        selectedColor = 'rgba(153, 102, 255, 1)'; // Purple
    }

    // Reset the dataset with only the selected currency pair
    forexChart.data.datasets = [{
        label: `${selectedCurrencyPair} Price`,
        data: forexChart.data.labels.map(() => selectedRate),
        borderColor: selectedColor,
        fill: false
    }];

    forexChart.update(); // Refresh the chart
}

// Modify the event listener for currency selection
document.getElementById("currency-pair-dropdown").addEventListener("change", () => {
    updateRateDisplay();  // Update displayed rate
    updateChartData();    // Update chart with only selected pair
});


// Initial call to fetch forex rates
fetchLiveForexRate();

// Fetch forex rates every 30 seconds to update live data
setInterval(fetchLiveForexRate, 30000);

// Event listener for currency pair selection
document.getElementById("currency-pair-dropdown").addEventListener("change", (e) => {
    fetchLiveForexRate();  // Fetch new data for the selected currency pair
});

// Function to update the trade monitor popup with the active trades
function updateTradeMonitorPopup() {
    const tradePopup = document.getElementById("trade-popup");
    const tradeList = document.getElementById("trade-list");
    const popupBalanceEl = document.getElementById("popup-balance");
    const popupOpenTrades = document.getElementById("popup-open-trades");
    const popupProfit = document.getElementById("popup-profit");
    const popupLoss = document.getElementById("popup-loss");

    if (popupBalanceEl && popupOpenTrades && popupProfit && popupLoss && tradeList) {
        // Update balance and open trades count in the popup
        popupBalanceEl.innerText = `MWK ${balanceMWK.toFixed(2)}`;
        popupOpenTrades.innerText = activeTrades.filter(trade => trade.status === 'Open').length;

        let totalProfit = 0;
        let totalLoss = 0;

        tradeList.innerHTML = "";  

        activeTrades.forEach(trade => {
            const tradeElement = document.createElement("div");
            tradeElement.classList.add("trade-item");
            tradeElement.innerHTML = `
                <p><strong>Trade ID:</strong> ${trade.id}</p>
                <p><strong>Action:</strong> ${trade.action}</p>
                <p><strong>Amount:</strong> ${trade.amount}</p>
                <p><strong>Open Rate:</strong> ${trade.openRate}</p>
                <p><strong>Status:</strong> ${trade.status}</p>
            `;

            if (trade.status === "Open") {
                tradeElement.innerHTML += `
                    <button class="close-trade-btn" data-trade-id="${trade.id}">Close Trade</button>
                `;
            }

            tradeList.appendChild(tradeElement);

            // Calculate profit/loss based on the current rate
            const currentRate = getConversionRateForPair(trade.pair);
            const profitLoss = trade.action === "Buy"
                ? (currentRate - trade.openRate) * trade.amount
                : (trade.openRate - currentRate) * trade.amount;

            if (profitLoss >= 0) totalProfit += profitLoss;
            else totalLoss += Math.abs(profitLoss);
        });

        popupProfit.innerText = `MWK ${totalProfit.toFixed(2)}`;
        popupLoss.innerText = `MWK ${totalLoss.toFixed(2)}`;

        // Add event listeners to close trade buttons (if any)
        const closeTradeButtons = document.querySelectorAll('.close-trade-btn');
        closeTradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeId = e.target.getAttribute('data-trade-id');
                closeTrade(tradeId);  // Close the trade and update the popup
            });
        });
    }
}


//-----------------function to open popup trade monitor--------------//
document.getElementById('trade-monitor-btn').addEventListener('click', function() {
    document.getElementById('trade-popup').classList.toggle('active');  
    updateTradeMonitorPopup();  
});

// Function to close the trade monitor popup
document.querySelector(".close-btn").addEventListener("click", () => {
    const tradePopup = document.getElementById("trade-popup");
    tradePopup.classList.remove("active");
});

// Function to fetch balance using PaySheet number and email address
function fetchBalance(accountNumber, emailAddress) {
    const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();  
        })
        .then(data => {
            // Check if the balance is in the response
            if (data.balance !== undefined) {
                balance = data.balance; 
                updateBalanceDisplay(); 
            } else {
                alert('Error: Unable to fetch balance. Please check your account details or try again later.');
            }
        })
        .catch(error => {
            alert('Sorry, there was an error fetching your balance. Please try again later.');
            console.error('Error fetching balance:', error); 
        });
}

// Update the balance in the UI and save to localStorage
function updateBalanceDisplay() {
    const balanceElement = document.getElementById("balance");

    // Convert the balance from MWK to ZAR using the current exchange rate
    const balanceInZAR = (balance * currentRateMWKtoZAR).toFixed(2); 

    // Display the balance in ZAR
    balanceElement.innerText = `Current Balance: ZAR ${balanceInZAR}`;

    // Save the balance in MWK to localStorage (if needed)
    localStorage.setItem('balance', balance.toFixed(2));
}

// Fetch balance from localStorage on page load (if available)
window.addEventListener('load', () => {
    const savedBalance = localStorage.getItem('balance');
    if (savedBalance) {
        balance = parseFloat(savedBalance);
        updateBalanceDisplay();  
    }
});


// Example to fetch the balance when the page loads or user logs in
const accountNumber = sessionStorage.getItem('paySheetAccount');  
const emailAddress = sessionStorage.getItem('userEmail');  

if (accountNumber && emailAddress) {
    fetchBalance(accountNumber, emailAddress);  
} else {
    alert('Account information is missing.');
}

// Function to close a trade
function closeTrade(tradeId) {
    const tradeIndex = activeTrades.findIndex(trade => trade.id === parseInt(tradeId));
    if (tradeIndex !== -1) {
       
        activeTrades[tradeIndex].status = "Closed";
        
        localStorage.setItem('activeTrades', JSON.stringify(activeTrades));
        
        // Update the trade history table and trade monitor popup
        updateTradeHistory();  
        updateTradeMonitorPopup(); 

        console.log(`Trade ${tradeId} has been closed.`);
    }
}
// On page load, load active trades from localStorage
window.addEventListener('load', () => {
    const storedTrades = localStorage.getItem('activeTrades');
    if (storedTrades) {
        activeTrades = JSON.parse(storedTrades); 
        updateTradeHistory();  
    }
});

// Function to update trade history table
function updateTradeHistory() {
    const tbody = document.querySelector("#trade-history tbody");
    tbody.innerHTML = ""; // Clear the existing rows

    // Load active trades from localStorage (if not already loaded)
    const allTrades = activeTrades; 

    allTrades.forEach(trade => {
        let currentAmount = trade.amount;

        // Calculate the dynamic profit or loss based on the current rate for open trades
        if (trade.status === "Open") {
            const profitLoss = trade.action === "Buy" 
                ? (currentRateMWKtoZAR - trade.openRate) * trade.amount
                : (trade.openRate - currentRateMWKtoZAR) * trade.amount;

            currentAmount += profitLoss; // Update amount with profit/loss in MWK
        } else if (trade.status === "Closed") {
            const profitLoss = trade.action === "Buy" 
                ? (currentRateMWKtoZAR - trade.openRate) * trade.amount
                : (trade.openRate - currentRateMWKtoZAR) * trade.amount;

            currentAmount += profitLoss; // Update amount with profit/loss in MWK
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${trade.pair}</td>
            <td>${trade.action}</td>
            <td>${trade.status === "Closed" ? `MWK ${(trade.amount + currentAmount).toFixed(2)}` : `MWK ${currentAmount.toFixed(2)}`}</td>
            <td>${trade.status}</td>
            <td>${trade.openRate.toFixed(4)}</td>
            <td><div id="trade-${trade.id}-close" class="close-trade">${trade.status === "Open" ? 'X Close' : ''}</div></td>
        `;
        tbody.appendChild(row);

        // Add event listener for closing trade, only if the trade is still "Open"
        if (trade.status === "Open") {
            const closeTradeElement = document.getElementById(`trade-${trade.id}-close`);
            closeTradeElement.addEventListener("click", () => {
                closeTrade(trade.id);
            });
        }
    });

    // Automatically update the trade monitor popup with the latest trade data
    updateTradeMonitorPopup();
}

// Function to populate the trade history table with the active trades data
function populateTradeHistory() {
    const tableBody = document.querySelector("#trade-history-table tbody");
    tableBody.innerHTML = ""; // Clear previous data

    // Use the activeTrades array (not the static trades array)
    const allTrades = activeTrades;

    allTrades.forEach(trade => {
        const row = document.createElement("tr");

        // Create the table cells
        const idCell = document.createElement("td");
        idCell.textContent = trade.id;

        const currencyPairCell = document.createElement("td");
        currencyPairCell.textContent = trade.pair;

        const actionCell = document.createElement("td");
        actionCell.textContent = trade.action;

        const amountCell = document.createElement("td");
        const profitLoss = calculateProfitLoss(trade); // Calculate profit/loss
        const amountInMWK = trade.amount + profitLoss;
        amountCell.textContent = Math.abs(amountInMWK).toFixed(2); // Display absolute value of amount

        // Apply color based on profit or loss
        if (profitLoss > 0) {
            amountCell.classList.add("profit"); // Blue for profit
        } else if (profitLoss < 0) {
            amountCell.classList.add("loss"); // Red for loss
        }

        const statusCell = document.createElement("td");
        statusCell.textContent = trade.status;

        // Append cells to the row
        row.appendChild(idCell);
        row.appendChild(currencyPairCell);
        row.appendChild(actionCell);
        row.appendChild(amountCell);
        row.appendChild(statusCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

// Calculate profit/loss in MWK (considering the action and current rate)
function calculateProfitLoss(trade) {
    let profitLoss = 0;

    // Calculate profit or loss based on the current rate
    if (trade.status === "Open") {
        const currentRate = getConversionRateForPair(trade.pair); // Get the conversion rate for the pair
        profitLoss = trade.action === "Buy"
            ? (currentRate - trade.openRate) * trade.amount
            : (trade.openRate - currentRate) * trade.amount;
    }

    return profitLoss; // Return profit or loss in MWK
}

// Trigger the popup and populate trade history with the updated trades data
const tradeHistoryLink = document.getElementById("trade-history-link");
const tradeHistoryPopup = document.getElementById("trade-history-popup");
const closePopup = document.getElementById("close-popup");

tradeHistoryLink.addEventListener("click", function (event) {
    event.preventDefault();
    tradeHistoryPopup.style.display = "flex";
    populateTradeHistory(); // Populate the trade history when opening the popup with live data
});

closePopup.addEventListener("click", function () {
    tradeHistoryPopup.style.display = "none";
});

// Close the popup if the user clicks outside of it
window.addEventListener("click", function (event) {
    if (event.target === tradeHistoryPopup) {
        tradeHistoryPopup.style.display = "none";
    }
});

window.addEventListener('load', () => {
    const storedTrades = localStorage.getItem('activeTrades');
    if (storedTrades) {
        activeTrades = JSON.parse(storedTrades);  // Load the stored trades
        populateTradeHistory();  // Ensure the history is up-to-date
    }
});
// trade alert popup
// Elements for the Trade Alerts Popup
const tradeAlertsLink = document.getElementById("trade-alerts-link");
const tradeAlertsPopup = document.getElementById("trade-alerts-popup");
const closeAlertsPopup = document.getElementById("close-alerts-popup");

// Show the Trade Alerts Popup when the link is clicked
tradeAlertsLink.addEventListener("click", function (event) {
    event.preventDefault();
    tradeAlertsPopup.style.display = "flex"; // Show the popup
    // Optional: You can populate the popup with dynamic trade alerts data here
    populateTradeAlerts();  // Function to load dynamic content into the popup
});

// Close the Trade Alerts Popup when the close button is clicked
closeAlertsPopup.addEventListener("click", function () {
    tradeAlertsPopup.style.display = "none"; // Hide the popup
});

// Close the popup if the user clicks outside of the popup
window.addEventListener("click", function (event) {
    if (event.target === tradeAlertsPopup) {
        tradeAlertsPopup.style.display = "none"; // Hide the popup if clicked outside
    }
});

// Optional: Function to populate trade alerts dynamically from an API
function populateTradeAlerts() {
    // Example: Replace this URL with the real API endpoint
    const apiUrl = 'https://api.yourtradingplatform.com/alerts'; // Replace with your real API URL
    
    // Make an API request to fetch trade alerts
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const alertContent = document.querySelector('.trade-alerts-popup-content');
            
            // Clear previous alerts
            alertContent.innerHTML = '';
            
            // Loop through the alerts and populate the popup with new data
            data.alerts.forEach(alert => {
                const alertMessage = `
                    <p>${alert.type} ${alert.asset} at ${alert.price} ${alert.currency}</p><br>
                `;
                alertContent.innerHTML += alertMessage;
            });
        })
        .catch(error => {
            console.error('Error fetching trade alerts:', error);
            // Optionally, display a fallback message if there's an error
            const alertContent = document.querySelector('.trade-alerts-popup-content');
            alertContent.innerHTML = '<p>Failed to load trade alerts.</p>';
        });
}

// Call the function periodically to keep the alerts updated
setInterval(populateTradeAlerts, 5000); // Fetch alerts every 5 seconds (adjust as needed)

// Elements for the Portfolio Popup
const portfolioLink = document.getElementById("portfolio-link");
const portfolioPopup = document.getElementById("portfolio-popup");
const closePortfolioPopup = document.getElementById("close-portfolio-popup");

// Show the Portfolio Popup when the link is clicked
portfolioLink.addEventListener("click", function (event) {
    event.preventDefault();
    portfolioPopup.style.display = "flex"; // Show the portfolio popup
    populatePortfolio();  // Populate the popup with portfolio data
});

// Close the Portfolio Popup when the close button is clicked
closePortfolioPopup.addEventListener("click", function () {
    portfolioPopup.style.display = "none"; // Hide the portfolio popup
});

// Close the popup if the user clicks outside of the popup
window.addEventListener("click", function (event) {
    if (event.target === portfolioPopup) {
        portfolioPopup.style.display = "none"; // Hide the popup if clicked outside
    }
});

// Function to populate the MWK/ZAR Portfolio data dynamically
function populatePortfolio() {
    const portfolioContent = document.querySelector('.portfolio-popup .popup-content');
    portfolioContent.innerHTML = `
        <h2>My Portfolio</h2>
        <br>
        <p>Here is your portfolio for trading MWK/ZAR:</p>
<br>
        <h3>Current Balances:</h3>
        <br>
        <ul>
            <li><strong>MWK Balance:</strong> 150,000 MWK</li><br>
            <li><strong>ZAR Balance:</strong> 12,000 ZAR</li>
        </ul>
<br>
        <h3>Open Positions:</h3>
        <br>
        <ul>
            <li><strong>MWK/ZAR Position:</strong> 5,000 MWK @ 0.21 ZAR</li><br>
            <li><strong>ZAR/MWK Position:</strong> 2,000 ZAR @ 45 MWK</li>
        </ul>
<br>
        <h3>Recent Trades:</h3>
        <br>
        <ul>
            <li><strong>Buy:</strong> 10,000 MWK @ 0.20 ZAR</li><br>
            <li><strong>Sell:</strong> 5,000 ZAR @ 0.21 MWK</li>
        </ul>
<br>
        <p>Click to manage your positions, view performance, or make changes.</p>
    `;
}
// Elements for the Margin Trading Popup
const marginTradingLink = document.getElementById("margin-trading-link");
const marginTradingPopup = document.getElementById("margin-trading-popup");
const closeMarginTradingPopup = document.getElementById("close-margin-trading-popup");

// Show the Margin Trading Popup when the link is clicked
marginTradingLink.addEventListener("click", function (event) {
    event.preventDefault();
    marginTradingPopup.style.display = "flex"; // Show the margin trading popup
    populateMarginTrading();  // Populate the popup with margin trading data
});

// Close the Margin Trading Popup when the close button is clicked
closeMarginTradingPopup.addEventListener("click", function () {
    marginTradingPopup.style.display = "none"; // Hide the margin trading popup
});

// Close the popup if the user clicks outside of the popup
window.addEventListener("click", function (event) {
    if (event.target === marginTradingPopup) {
        marginTradingPopup.style.display = "none"; // Hide the popup if clicked outside
    }
});

// Function to populate Margin Trading data dynamically
function populateMarginTrading() {
    const marginTradingContent = document.querySelector('.margin-trading-popup .popup-content');
    marginTradingContent.innerHTML = `
        <h2>Margin Trading Overview</h2>
        <br>
        <p>Here is your margin trading portfolio for MWK/ZAR:</p>
<br>
        <h3>Current Margin Positions:</h3>
        <br>
        <ul>
            <li><strong>Position:</strong> Long 10,000 MWK at 0.21 ZAR</li><br>
            <li><strong>Leverage:</strong> 5x</li><br>
            <li><strong>Margin Used:</strong> 2,000 ZAR</li><br>
            <li><strong>Profit/Loss:</strong> +300 ZAR</li><br>
        </ul>
<br>
        <h3>Outstanding Margin:</h3><br>
        <ul>
            <li><strong>Required Margin:</strong> 1,000 ZAR</li><br>
            <li><strong>Liquidation Price:</strong> 0.15 ZAR</li>
        </ul>
<br>
        <h3>Recent Margin Trades:</h3><br>
        <ul>
            <li><strong>Open:</strong> Long 5,000 MWK @ 0.18 ZAR</li><br>
            <li><strong>Close:</strong> Long 5,000 MWK @ 0.19 ZAR</li>
        </ul>
<br>
        <p>Ensure to monitor your margin levels carefully to avoid liquidation.</p>
    `;
}

function updateChartData() {
    forexChart.data.labels.push(Date.now()); 
    forexChart.data.datasets[0].data.push(currentRateMWKtoZAR); 
    forexChart.update(); 

    // Update balance in chart (converted to ZAR)
    const balanceInZAR = (balance * currentRateMWKtoZAR).toFixed(2);
    // Here you can add the balanceInZAR value to your chart data if necessary
    forexChart.data.datasets.push({
        label: 'Balance in ZAR',
        data: [balanceInZAR], // Push converted balance to chart data
        borderColor: 'rgba(255, 99, 132, 1)', 
        fill: false
    });
    forexChart.update();  // Update the chart
}
