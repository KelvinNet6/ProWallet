
// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('paySheetAccount');
    localStorage.removeItem('authToken');
    window.location.href = "index.html";
});

// Open and close modal for viewing all transactions
const viewAllTransactionsBtn = document.getElementById("view-all-transactions-btn");
const modal = document.getElementById("transactions-modal");
const closeModal = document.getElementById("close-modal");
const body = document.body;

viewAllTransactionsBtn.addEventListener("click", () => {
    modal.style.display = "block";
    body.style.overflow = "hidden";
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    body.style.overflow = "auto";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
        body.style.overflow = "auto";
    }
});

// Function to fetch and display transactions
async function fetchTransactions() {
    const paySheetAccount = localStorage.getItem("paySheetAccount");

    if (paySheetAccount) {
        try {
            const apiUrl = "https://0.0.0.0:44323/api/epaywallet/account/transactions";

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
                    "X-API-Key": localStorage.getItem("gcpApiKey"),
                    "X-Project-ID": localStorage.getItem("gcpProjectId")
                }
            });

            if (response.ok) {
                const userData = await response.json();
                return userData;
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Failed to fetch transaction data');
        }
    }
    return null;
}

// Initialize page data
window.addEventListener('load', async function() {
    try {
        const userData = await fetchTransactions();
        
        if (userData) {
            // Update account name
            document.getElementById("account-name").textContent = `PaySheet Account: ${userData.accountName}`;

            // Populate recent transactions
            const recentTransactionsContainer = document.getElementById("recent-transactions");
            recentTransactionsContainer.innerHTML = "";
            userData.recentTransactions.forEach(transaction => {
                const transactionDiv = document.createElement("div");
                transactionDiv.classList.add("transaction-item");
                transactionDiv.innerHTML = `
                    <span class="type">${transaction.type}</span>
                    <span class="amount">${transaction.amount}</span>
                    <span class="date">${transaction.date}</span>
                `;
                recentTransactionsContainer.appendChild(transactionDiv);
            });

            // Populate all transactions in the modal
            const allTransactionsContainer = document.getElementById("all-transactions");
            allTransactionsContainer.innerHTML = "";
            userData.allTransactions.forEach(transaction => {
                const transactionDiv = document.createElement("div");
                transactionDiv.classList.add("transaction-item");
                transactionDiv.innerHTML = `
                    <span class="type">${transaction.type}</span>
                    <span class="amount">${transaction.amount}</span>
                    <span class="date">${transaction.date}</span>
                `;
                allTransactionsContainer.appendChild(transactionDiv);
            });

            // Initialize transaction chart
            initializeTransactionChart(userData.recentTransactions);
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        alert('An error occurred. Please try again later.');
    }
});

function initializeTransactionChart(transactions) {
    if (!transactions || transactions.length === 0) {
        console.log('No transaction data available');
        return;
    }
    const canvas = document.getElementById('transactionChart');
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: transactions.map(t => t.date),
            datasets: [{
                label: 'Transaction Amount (K)',
                data: transactions.map(t => parseInt(t.amount.replace('K', '').replace(',', ''))),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
