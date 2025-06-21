// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('paySheetAccount');
    window.location.href = "index.html";
});

// Add message function to display chat bubbles
function addMessage(sender, message, loading = false, type = '') {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", sender === "ai" ? "ai-bubble" : "user-bubble");

    if (loading) {
        messageDiv.classList.add("loading");
        if (['transfer', 'withdrawal', 'contactless'].includes(type)) {
            messageDiv.innerHTML = `
                <div class="transaction-progress">
                    <div class="progress-label">${type.charAt(0).toUpperCase() + type.slice(1)} Processing</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="${type}-progress"></div>
                    </div>
                    <div class="progress-status" id="${type}-status">Initializing...</div>
                </div>
            `;
            simulateTransactionProgress(type);
        } else {
            messageDiv.innerHTML = `<p>${message} <span class="dots">...</span></p>`;
        }
    } else {
        messageDiv.innerHTML = `<p>${message}</p>`;
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({ sender, message });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return messageDiv;
}

function simulateTransactionProgress(type) {
    let progress = 0;
    const progressFill = document.getElementById(`${type}-progress`);
    const statusText = document.getElementById(`${type}-status`);
    const stages = {
        0: 'Initializing...',
        25: 'Verifying details...',
        50: 'Processing transaction...',
        75: 'Confirming...',
        100: 'Completed!'
    };

    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
            return;
        }
        progress += 1;
        progressFill.style.width = `${progress}%`;
        if (stages[progress]) statusText.textContent = stages[progress];
    }, 50);
}

window.addEventListener('load', function () {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory.forEach(msg => addMessage(msg.sender, msg.message));
});

let currentState = null;
let accountNumber = '';
let emailAddress = '';
let pinAttempts = 0;
const MAX_PIN_ATTEMPTS = 3;
let requestQueue = [];

function processNextRequest() {
    if (requestQueue.length > 0) {
        const nextRequest = requestQueue.shift();
        handleRequest(nextRequest);
    }
}

function handleRequest(request) {
    const loadingMessage = addMessage('ai', '...', true);

    setTimeout(() => {
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }

        switch (request) {
            case "1":
                const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
                if (storedAccount && storedAccount.paySheetNumber) {
                    accountNumber = storedAccount.paySheetNumber;
                    currentState = 'awaitingPin';
                    addMessage('ai', 'ProWallet number retrieved. Please enter your 4-digit PIN.');
                } else {
                    addMessage('ai', 'Please provide your ProWallet number.');
                    currentState = 'awaitingPayCo';
                }
                break;
            case "2":
                addMessage('ai', 'Our standard transaction fee is 2% per transfer.');
                break;
            case "3":
                addMessage('ai', 'The withdrawal fee is $1.50 per transaction.');
                break;
            case "4":
                addMessage('ai', 'Share your location to find the nearest agent.');
                break;
            case "5":
                addMessage('ai', 'ProWallet is a payment platform simplifying transactions.');
                break;
            case "6":
                addMessage('ai', 'Visit the Transfer Funds page to send money.');
                break;
            case "7":
                addMessage('ai', 'Visit the Cash Out page to withdraw funds.');
                break;
            case "8":
                addMessage('ai', 'Security Tips:\n- Keep your number private\n- Use 2FA\n- Monitor transactions');
                break;
            case "9":
                addMessage('ai', 'Contact Support:\n- Email: support@paysheet.com\n- Phone: 1-800-PAYSHEET');
                break;
            case "10":
                addMessage('ai', 'Limits:\n- Daily: MWK 10M\n- Weekly: MWK 25M\n- Monthly: MWK 50M');
                break;
            case "11":
                showProcessOverview();
                break;
            case "12":
                showTransactionOverview();
                break;
            default:
                addMessage('ai', 'Please choose an option (1-12).');
        }
        processNextRequest();
    }, 1000);
}

async function getSystemMetrics() {
    return {
        transactionSuccess: Math.floor(Math.random() * 13 + 85),
        authSuccess: Math.floor(Math.random() * 10 + 90),
        activeUsers: Math.floor(Math.random() * 900 + 100),
        cpuUsage: Math.floor(Math.random() * 50 + 40),
        memoryUsage: Math.floor(Math.random() * 50 + 30),
        dailyTransactions: Math.floor(Math.random() * 4000 + 1000)
    };
}

async function showProcessOverview() {
    const metrics = await getSystemMetrics();
    addMessage('ai', 'Generating system overview...');
    const overviewMessage = `System Overview:\n\n• Transaction Success Rate: ${metrics.transactionSuccess}%\n• Authentication Success: ${metrics.authSuccess}%\n• Active Users: ${metrics.activeUsers}\n• CPU Usage: ${metrics.cpuUsage}%\n• Memory Usage: ${metrics.memoryUsage}%\n• Daily Transactions: ${metrics.dailyTransactions}`;
    addMessage('ai', overviewMessage);
}

function showTransactionOverview() {
    const demo = {
        transfers: [5000, 3000, 7500],
        withdrawals: [2000, 4000, 1500],
        contactless: [1000, 500, 2000]
    };

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", "ai-bubble");

    const canvas = document.createElement("canvas");
    canvas.id = "transactionChart";
    canvas.style.width = "100%";
    canvas.style.height = "300px";
    messageDiv.appendChild(canvas);
    document.getElementById("chat-window").appendChild(messageDiv);

    const ctx = canvas.getContext("2d");
    const sum = arr => arr.reduce((a, b) => a + b, 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Transfers', 'Withdrawals', 'Contactless'],
            datasets: [{
                label: 'Total (MWK)',
                data: [sum(demo.transfers), sum(demo.withdrawals), sum(demo.contactless)],
                backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount (MWK)' }
                }
            }
        }
    });
}

document.getElementById("send-btn").addEventListener("click", function () {
    const userInput = document.getElementById("user-query").value.trim();
    if (!userInput) return;
    addMessage('user', userInput);
    document.getElementById("user-query").value = '';

    if (userInput.toLowerCase() === "start") {
        const helpMessage = `Welcome to ProWallet! Choose an option:\n\n1. Check Balance\n2. Transfer Fee Info\n3. Withdrawal Fee Info\n4. Nearest Agent\n5. About\n6. Transfer Guide\n7. Cash Out Guide\n8. Security Tips\n9. Support\n10. Limits\n11. System Overview\n12. Transactions Chart`;
        addMessage('ai', helpMessage);
        return;
    }

    switch (currentState) {
        case 'awaitingPayCo':
            checkPayCoNumber(userInput);
            return;
        case 'awaitingPin':
            if (userInput.length !== 4 || isNaN(userInput)) {
                addMessage('ai', 'Enter a valid 4-digit PIN.');
            } else {
                verifyPin(userInput);
            }
            return;
        case 'awaitingEmail':
            emailAddress = userInput;
            fetchBalance(accountNumber, emailAddress);
            return;
    }

    requestQueue.push(userInput);
    processNextRequest();
});

