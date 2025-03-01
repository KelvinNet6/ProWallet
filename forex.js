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

// Initialize forex rate for MWK/ZAR
let currentRateMWKtoZAR = 1.05; 
let currentRateZARtoMWK = 0.011; 
let tradeID = 1; 
const activeTrades = []; 
let balance = 0; 
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

        if (data['Information'] && data['Information'].includes('premium')) {
            console.error('API rate limit exceeded. Switching to premium features.');
            // Optionally, you can set a timeout to retry the request after waiting for a minute or more
            setTimeout(fetchLiveForexRate, 60000);  // Retry after 1 minute
            return;
        }

        if (data["Time Series FX (5min)"]) {
            const latestData = Object.values(data["Time Series FX (5min)"])[0];
            currentRateMWKtoZAR = parseFloat(latestData["4. close"]).toFixed(4); // The closing rate (ZAR/MWK)
            updateRateDisplay();
            updateChartData();
            updateTradePopup();
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
    rateElement.innerText = currentRateMWKtoZAR; 
}

// Function to update the forex chart with the new rate
function updateChartData() {
    forexChart.data.labels.push(Date.now()); 
    forexChart.data.datasets[0].data.push(currentRateMWKtoZAR); 
    forexChart.update(); 

   
    updateTradeMonitorPopup();  
}

setInterval(fetchLiveForexRate, 30000);

// Function to create a new trade (either Buy or Sell) for MWK/ZAR
function createTrade(action, amount) {
    const trade = {
        id: tradeID++, 
        pair: 'MWK/ZAR', 
        action: action,
        amount: amount, 
        openRate: currentRateMWKtoZAR, 
        status: 'Open' 
    };
    activeTrades.push(trade);

    // Save to localStorage
    localStorage.setItem('activeTrades', JSON.stringify(activeTrades)); 
    updateTradeHistory(); 
    updateCloseArea();

    // Open the trade monitor popup when a trade is created
    openTradeMonitorPopup(trade);  
}

// Buy/Sell button interaction (adjusted to use the live balance)
document.getElementById("buy-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); 
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    createTrade('Buy', amount);
});

document.getElementById("sell-btn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("trade-amount-input").value); 
    if (isNaN(amount) || amount <= 0 || amount > balance) {
        alert("Please enter a valid amount less than or equal to your balance.");
        return;
    }
    createTrade('Sell', amount);
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
        popupBalanceEl.innerText = `MWK ${balance.toFixed(2)}`;
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
                <p><strong>Amount:</strong> MWK ${trade.amount}</p>
                <p><strong>Open Rate:</strong> ${trade.openRate}</p>
                <p><strong>Status:</strong> ${trade.status}</p>
            `;

            // Only show the Close button if the trade is Open
            if (trade.status === "Open") {
                tradeElement.innerHTML += `
                    <button class="close-trade-btn" data-trade-id="${trade.id}">Close Trade</button>
                `;
            }

            tradeList.appendChild(tradeElement);

            // Calculate profit/loss based on the current rate
            const currentRate = currentRateMWKtoZAR;
            const profitLoss = trade.action === "Buy" 
                ? (currentRate - trade.openRate) * trade.amount 
                : (trade.openRate - currentRate) * trade.amount;

            if (profitLoss >= 0) totalProfit += profitLoss;
            else totalLoss += Math.abs(profitLoss);
        });

        // Update the profit and loss in the popup
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
    balanceElement.innerText = `Current Balance: K${balance.toFixed(2)}`;  

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

// function to update trade history table
function updateTradeHistory() {
    const tbody = document.querySelector("#trade-history tbody");
    tbody.innerHTML = ""; 

    // Load active trades from localStorage (if not already loaded)
    const allTrades = activeTrades; 

    allTrades.forEach(trade => {
        let currentAmount = trade.amount; 

        // Calculate the dynamic profit or loss based on the current rate for open trades
        if (trade.status === "Open") {
            const profitLoss = trade.action === "Buy" 
                ? (currentRateMWKtoZAR - trade.openRate) * trade.amount 
                : (trade.openRate - currentRateMWKtoZAR) * trade.amount; 

            currentAmount += profitLoss; // Update amount with profit/loss
        } else if (trade.status === "Closed") {
           
            const profitLoss = trade.action === "Buy" 
                ? (currentRateMWKtoZAR - trade.openRate) * trade.amount 
                : (trade.openRate - currentRateMWKtoZAR) * trade.amount; 

            currentAmount += profitLoss; 
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
        amountCell.textContent = Math.abs(trade.amount); // Display absolute value of amount

        // Apply color based on profit or loss
        if (trade.amount > 0) {
            amountCell.classList.add("profit"); // Blue for profit
        } else if (trade.amount < 0) {
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

// various popups
document.addEventListener("DOMContentLoaded", function() {
    // Elements for Trade Alerts Popup
    const tradeAlertsLink = document.getElementById("trade-alerts-link");
    const tradeAlertsPopup = document.getElementById("trade-alerts-popup");
    const closeAlertsPopup = document.getElementById("close-alerts-popup");

    // Elements for Portfolio Popup
    const portfolioLink = document.getElementById("portfolio-link");
    const portfolioPopup = document.getElementById("portfolio-popup");
    const closePortfolioPopup = document.getElementById("close-portfolio-popup");

    // Elements for Margin Trading Popup
    const marginTradingLink = document.getElementById("margin-trading-link");
    const marginTradingPopup = document.getElementById("margin-trading-popup");
    const closeMarginTradingPopup = document.getElementById("close-margin-trading-popup");

    // Open Trade Alerts Popup
    tradeAlertsLink.addEventListener("click", function (event) {
        event.preventDefault();
        tradeAlertsPopup.style.display = "flex";
    });

    // Open Portfolio Popup
    portfolioLink.addEventListener("click", function (event) {
        event.preventDefault();
        portfolioPopup.style.display = "flex";
    });

    // Open Margin Trading Popup
    marginTradingLink.addEventListener("click", function (event) {
        event.preventDefault();
        marginTradingPopup.style.display = "flex";
    });

    // Close Popups
    closeAlertsPopup.addEventListener("click", function () {
        tradeAlertsPopup.style.display = "none";
    });

    closePortfolioPopup.addEventListener("click", function () {
        portfolioPopup.style.display = "none";
    });

    closeMarginTradingPopup.addEventListener("click", function () {
        marginTradingPopup.style.display = "none";
    });

    // Close the popup if the user clicks outside of it
    window.addEventListener("click", function (event) {
        if (event.target === tradeAlertsPopup) {
            tradeAlertsPopup.style.display = "none";
        }
        if (event.target === portfolioPopup) {
            portfolioPopup.style.display = "none";
        }
        if (event.target === marginTradingPopup) {
            marginTradingPopup.style.display = "none";
        }
    });
});
