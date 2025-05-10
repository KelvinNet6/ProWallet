// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('paySheetAccount'); // Remove data from localStorage
    window.location.href = "index.html";
});

// Add message function to display chat bubbles
function addMessage(sender, message, loading = false, type = '') {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", sender === "ai" ? "ai-bubble" : "user-bubble");

    if (loading) {
        messageDiv.classList.add("loading");
        let progressBar = '';

        if (type === 'transfer' || type === 'withdrawal' || type === 'contactless') {
            progressBar = `
                <div class="transaction-progress">
                    <div class="progress-label">${type.charAt(0).toUpperCase() + type.slice(1)} Processing</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="${type}-progress"></div>
                    </div>
                    <div class="progress-status" id="${type}-status">Initializing...</div>
                </div>
            `;
            messageDiv.innerHTML = progressBar;

            // Simulate progress
            simulateTransactionProgress(type);
        } else {
            messageDiv.innerHTML = `<p>${message} <span class="dots">...</span></p>`;
        }
    } else {
        messageDiv.innerHTML = `<p>${message}</p>`;
        // Save message to localStorage
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

        // Update status text at specific stages
        Object.keys(stages).forEach(stage => {
            if (progress === parseInt(stage)) {
                statusText.textContent = stages[stage];
            }
        });
    }, 50);
}

// Load chat history on page load
window.addEventListener('load', function() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory.forEach(msg => {
        addMessage(msg.sender, msg.message);
    });
});

// Flag to track whether we are expecting a PayCo number or email address
let isWaitingForPayCo = false;
let isWaitingForEmail = false;
let isWaitingForPin = false; // Added flag for PIN verification
let accountNumber = '';
let emailAddress = '';
let pinAttempts = 0; // Added variable to track PIN attempts
const MAX_PIN_ATTEMPTS = 3; // Maximum number of PIN attempts

// Queue to manage multiple requests
let requestQueue = [];

function processNextRequest() {
    if (requestQueue.length > 0) {
        const nextRequest = requestQueue.shift();
        handleRequest(nextRequest);
    }
}

function handleRequest(request) {
    // Show loading indicator
    const loadingMessage = addMessage('ai', '...', true);

    setTimeout(() => {
        // Remove loading message
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }

        switch (request) {
            case "1":
                const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
                if (storedAccount && storedAccount.paySheetNumber) {
                    accountNumber = storedAccount.paySheetNumber;
                    isWaitingForPin = true;
                    addMessage('ai', 'ProWallet number retrieved from your local storage. Please enter your 4-digit PIN.');
                } else {
                    addMessage('ai', 'Please provide your ProWallet number to check the balance.');
                    isWaitingForPayCo = true;
                }
                break;
            case "2":
                addMessage('ai', 'Our standard transaction fee is 2% per transfer.');
                break;
            case "3":
                addMessage('ai', 'The withdrawal fee for cashing out is $1.50 per transaction.');
                break;
            case "4":
                addMessage('ai', 'Please share your location to find the nearest payment collection agent.');
                break;
            case "5":
                addMessage('ai', 'About ProWallet: ProWallet is a comprehensive payment processing platform designed to simplify your financial transactions.');
                break;
            case "6":
                addMessage('ai', 'To transfer funds, please visit the Transfer Funds page or click the TF option in the menu.');
                break;
            case "7":
                addMessage('ai', 'For cash withdrawals, please visit the Cash Out page or click the Cash Out option in the menu.');
                break;
            case "8":
                addMessage('ai', 'For account security tips:\n- Keep your ProWallet number private\n- Enable two-factor authentication\n- Monitor your transactions regularly\n- Report suspicious activity immediately');
                break;
            case "9":
                addMessage('ai', 'Customer Support is available 24/7. You can reach us through:\n- Email: support@paysheet.com\n- Phone: 1-800-PAYSHEET\n- Live Chat: Available on website');
                break;
            case "10":
                addMessage('ai', 'Transaction Limits:\n- Daily Transfer: Up to MWK 10,000,000\n- Weekly Withdrawal: Up to MWK 25,000,000\n- Monthly Transaction: Up to MWK 50,000,000');
                break;
            case "11":
                showProcessOverview();
                break;
            default:
                let helpMessage = `
Please select an option:

1. Check Balance
────────────────────────

2. Transfer Fee Information
────────────────────────

3. Withdrawal Fee Information
────────────────────────

4. Find Nearest Agent
────────────────────────

5. About ProWallet
────────────────────────

6. Transfer Funds Guide
────────────────────────

7. Cash Out Guide
────────────────────────

8. Security Tips
────────────────────────

9. Customer Support
────────────────────────

10. Transaction Limits
────────────────────────

11. Process Overview
────────────────────────`;
                addMessage('ai', helpMessage);
                break;
        }
        processNextRequest();
    }, 1000);
}

// Function to get system metrics
async function getSystemMetrics() {
    // Generate realistic demo metrics
    return {
        transactionSuccess: Math.floor(Math.random() * (98 - 85) + 85),
        authSuccess: Math.floor(Math.random() * (100 - 90) + 90),
        activeUsers: Math.floor(Math.random() * (1000 - 100) + 100),
        cpuUsage: Math.floor(Math.random() * (90 - 40) + 40),
        memoryUsage: Math.floor(Math.random() * (80 - 30) + 30),
        dailyTransactions: Math.floor(Math.random() * (5000 - 1000) + 1000)
        transactionSuccess: Math.floor(Math.random() * (98 - 85) + 85),
        authSuccess: Math.floor(Math.random() * (100 - 90) + 90),
        activeUsers: Math.floor(Math.random() * (1000 - 100) + 100),
        cpuUsage: Math.floor(Math.random() * (90 - 40) + 40),
        memoryUsage: Math.floor(Math.random() * (80 - 30) + 30)
    };
}

// Function to show process overview
async function showProcessOverview() {
    const metrics = await getSystemMetrics();
    addMessage('ai', 'Generating system overview...');
    
    // Create detailed overview message
    const overviewMessage = `
System Overview:
━━━━━━━━━━━━━━━━━━━━━━━━
• Transaction Success Rate: ${metrics.transactionSuccess}%
• Authentication Success: ${metrics.authSuccess}%
• Active Users: ${metrics.activeUsers}
• CPU Usage: ${metrics.cpuUsage}%
• Memory Usage: ${metrics.memoryUsage}%
• Daily Transactions: ${metrics.dailyTransactions}
`;
    addMessage('ai', overviewMessage);

    // Create a container for the metrics
    const container = document.createElement('div');
    container.className = 'system-metrics';
    container.style.cssText = 'background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;';

    // Add metric sections
    const sections = [
        {
            title: 'Transaction Success Rate',
            value: metrics.transactionSuccess,
            color: '#4CAF50'
        },
        {
            title: 'Authentication Success',
            value: metrics.authSuccess,
            color: '#2196F3'
        },
        {
            title: 'CPU Usage',
            value: metrics.cpuUsage,
            color: '#FF9800'
        },
        {
            title: 'Memory Usage',
            value: metrics.memoryUsage,
            color: '#E91E63'
        }
    ];

    sections.forEach(section => {
        const metricDiv = document.createElement('div');
        metricDiv.style.margin = '15px 0';
        metricDiv.innerHTML = `
            <h4 style="margin-bottom: 10px">${section.title}</h4>
            <div style="background: #eee; height: 20px; border-radius: 10px; overflow: hidden">
                <div style="width: ${section.value}%; background: ${section.color}; height: 100%; transition: width 1s;">
                    <span style="color: white; padding: 0 10px">${section.value}%</span>
                </div>
            </div>
        `;
        container.appendChild(metricDiv);
    });

    // Add active users counter
    const usersDiv = document.createElement('div');
    usersDiv.innerHTML = `
        <h4>Active Users</h4>
        <div style="font-size: 24px; color: #2196F3; font-weight: bold">
            ${metrics.activeUsers} users online
        </div>
    `;
    container.appendChild(usersDiv);

    // Add to chat window
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-bubble', 'ai-bubble');
    messageDiv.appendChild(container);
    document.getElementById('chat-window').appendChild(messageDiv);
    document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;

        // Initialize the resource chart
        setTimeout(() => {
            const ctx = document.getElementById('resourceChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'CPU Usage',
                        data: [65, 59, 80, 81, 56, 55],
                        borderColor: '#4CAF50',
                        tension: 0.4
                    }, {
                        label: 'Memory Usage',
                        data: [45, 70, 65, 89, 90, 75],
                        borderColor: '#2196F3',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }, 100);
    };

    // Handle option 11 for process overview
    if (userInput === "11") {
        showProcessOverview();
        return;
    }

    processNextRequest();
}

// Handle user input and AI responses
// Handle enter key press
document.getElementById("user-query").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("send-btn").click();
    }
});

document.getElementById("send-btn").addEventListener("click", function() {
    const userInput = document.getElementById("user-query").value.trim();
    if (!userInput) return;

    if (!userInput) return;  // Prevent sending empty input

    // Display the user's message in the chat window
    addMessage('user', userInput);

    // Clear the input field immediately after sending the message
    document.getElementById("user-query").value = '';

    // Show greeting options if user types "start"
    if (userInput === "start") {
        let helpMessage = "Welcome to ProWallet! Please select an option by entering its number:\n\n\n";
        helpMessage += "1. Check Balance\n\n";
        helpMessage += "2. Transfer Fee Information\n\n";
        helpMessage += "3. Withdrawal Fee Information\n\n";
        helpMessage += "4. Find Nearest Agent\n\n";
        helpMessage += "5. About ProWallet\v\n";
        helpMessage += "6. Transfer Funds Guide\n\n";
        helpMessage += "7. Cash Out Guide\n\n";
        helpMessage += "8. Security Tips\n\n";
        helpMessage += "9. Customer Support\n\n";
        helpMessage += "10. Transaction Limits\n\n";
        addMessage('ai', helpMessage);
        return;
    }

    // Handle Context Awareness
    const userContext = JSON.parse(sessionStorage.getItem('userContext')) || {};
    if (userContext.lastInteraction) {
        addMessage('ai', `Last time, you asked about your ${userContext.lastInteraction}. How can I assist you today?`);
    }

    // If we are waiting for a PayCo number
    if (isWaitingForPayCo) {
        const storedAccount = JSON.parse(localStorage.getItem('userData'));
        if (storedAccount && storedAccount.payCodeNumber) {
            checkPayCoNumber(storedAccount.payCodeNumber);
        } else {
            checkPayCoNumber(userInput);
        }
        return;
    }

    // If we are waiting for a PIN
    if (isWaitingForPin) {
        if (userInput.length !== 4 || isNaN(userInput)) {
            addMessage('ai', 'Please enter a valid 4-digit PIN.');
            return;
        }
        verifyPin(userInput);
        return;
    }

    // If we are waiting for an email address
    if (isWaitingForEmail) {
        emailAddress = userInput;
        fetchBalance(accountNumber, emailAddress);
        return;
    }

    // Add to request queue
    requestQueue.push(userInput);
    processNextRequest();
});

// Function to check PayCo number from the integrated API
function checkPayCoNumber(payCoNumber) {
    const apiUrl = `https://YOUR_GOOGLE_CLOUD_API_ENDPOINT/api/epaywallet/account/request/check/paycode/${payCoNumber}`;

    fetch(apiUrl, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "X-API-Key": localStorage.getItem("gcpApiKey"),
            "X-Project-ID": localStorage.getItem("gcpProjectId")
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                accountNumber = payCoNumber;
                isWaitingForPayCo = false;
                if (requestQueue[0] === "1") {
                    // For balance check, proceed directly to email
                    isWaitingForEmail = true;
                    addMessage('ai', 'ProWallet number verified successfully! Please enter your email address.');
                } else {
                    // For PayCode info, ask for PIN
                    isWaitingForPin = true;
                    addMessage('ai', 'ProWallet number verified successfully! Please enter your 4-digit PIN.');
                }
            } else {
                addMessage('ai', 'Sorry, the ProWallet number you entered is invalid. Please check and try again.');
                isWaitingForPayCo = false;
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error verifying your ProWallet number. Please try again later.');
            console.error('Error checking ProWallet number:', error);
        });
}

// Function to fetch balance using PayCo number and email address
function fetchBalance(accountNumber, emailAddress) {
    const apiUrl = `https://0.0.0.0:44323/Help/Api/GET-api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}`;

    fetch(apiUrl, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "X-API-Key": localStorage.getItem("gcpApiKey"),
            "X-Project-ID": localStorage.getItem("gcpProjectId")
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.balance !== undefined) {
                const balance = data.balance;
                const formattedBalance = new Intl.NumberFormat('en-MW', {
                    style: 'currency',
                    currency: 'MWK'
                }).format(balance);
                addMessage('ai', `Your current wallet balance is ${formattedBalance}`);
            } else {
                addMessage('ai', 'Error: Unable to fetch balance. Please check your account details or try again later.');
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error fetching your balance. Please try again later.');
            console.error('Error fetching balance:', error);
        });
}

// Function to verify PIN
function verifyPin(pin) {
    if (window.verifyPinForPayCode) {
        window.verifyPinForPayCode(pin);
        window.verifyPinForPayCode = null;
        return;
    }
    const apiUrl = `https://0.0.0.0:5000/api/epaywallet/account/verify/pin/${accountNumber}/${pin}`;

    fetch(apiUrl, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "X-API-Key": localStorage.getItem("gcpApiKey"),
            "X-Project-ID": localStorage.getItem("gcpProjectId")
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                pinAttempts = 0;
                isWaitingForPin = false;
                isWaitingForEmail = true;
                addMessage('ai', 'PIN verified successfully! Now, please provide your email address.');
            } else {
                pinAttempts++;
                if (pinAttempts >= MAX_PIN_ATTEMPTS) {
                    addMessage('ai', 'Maximum PIN attempts exceeded. Please try again later.');
                    isWaitingForPin = false;
                    pinAttempts = 0;
                } else {
                    addMessage('ai', `Invalid PIN. Please try again. ${MAX_PIN_ATTEMPTS - pinAttempts} attempts remaining.`);
                }
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error verifying your PIN. Please try again later.');
            console.error('Error verifying PIN:', error);
        });
}

// Initial greeting message and URL parameter handling
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'balance') {
        setTimeout(() => {
            document.getElementById("user-query").value = "1";
            document.getElementById("send-btn").click();
        }, 1000);
    } else if (action === 'paycode') {
        setTimeout(() => {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                addMessage('ai', 'Please enter your 4-digit PIN to view your PayCode details.');
                isWaitingForPin = true;
                accountNumber = userData.payCodeNumber;

                // Override PIN verification for PayCode info
                window.verifyPinForPayCode = function(pin) {
                    const apiUrl = `https://0.0.0.0:5000/api/epaywallet/account/verify/pin/${accountNumber}/${pin}`;

                    fetch(apiUrl, {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                            "X-API-Key": localStorage.getItem("gcpApiKey"),
                            "X-Project-ID": localStorage.getItem("gcpProjectId")
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.isValid) {
                            const userInfo = `
ProWallet Details:
- Full Name: ${userData.fullName}
- ProWallet Number: ${userData.payCodeNumber}
- Email: ${userData.email}
- Account Status: ${userData.accountStatus}
`;
                            addMessage('ai', userInfo);
                            isWaitingForPin = false;
                            pinAttempts = 0;
                        } else {
                            pinAttempts++;
                            if (pinAttempts >= MAX_PIN_ATTEMPTS) {
                                addMessage('ai', 'Maximum PIN attempts exceeded. Please try again later.');
                                isWaitingForPin = false;
                                pinAttempts = 0;
                            } else {
                                addMessage('ai', `Invalid PIN. Please try again. ${MAX_PIN_ATTEMPTS - pinAttempts} attempts remaining.`);
                            }
                        }
                    })
                    .catch(error => {
                        addMessage('ai', 'Sorry, there was an error verifying your PIN. Please try again later.');
                        console.error('Error verifying PIN:', error);
                    });
                };
            } else {
                addMessage('ai', "Please log in to view your PayCode details.");
            }
        }, 1000);
    } else {
        setTimeout(function() {
            addMessage('ai', "Type 'start' to begin chatting with ProWallet Assistant!");
        }, 1000);
    }
});

// Function to clear chat history
function clearChat() {
    const chatWindow = document.getElementById("chat-window");
    chatWindow.innerHTML = '';
    addMessage('ai', "Chat history cleared. Type 'start' to begin chatting!");
}

// Security monitoring functions
function monitorLoginActivity() {
    const apiUrl = `https://0.0.0.0:44323/Help/Api/GET-api/epaywallet/account/request/login/activity`;

    fetch(apiUrl, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "X-API-Key": localStorage.getItem("gcpApiKey"),
            "X-Project-ID": localStorage.getItem("gcpProjectId")
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.failedAttempts > 3) {
                addMessage('ai', 'Warning: Multiple failed login attempts detected. If this was not you, please secure your account immediately.');

// Demo transaction data
const demoTransactions = {
    transfers: [
        { date: '2024-02-01', amount: 5000, status: 'completed' },
        { date: '2024-02-02', amount: 3000, status: 'completed' },
        { date: '2024-02-03', amount: 7500, status: 'processing' }
    ],
    withdrawals: [
        { date: '2024-02-01', amount: 2000, status: 'completed' },
        { date: '2024-02-02', amount: 4000, status: 'completed' },
        { date: '2024-02-04', amount: 1500, status: 'processing' }
    ],
    contactless: [
        { date: '2024-02-02', amount: 1000, status: 'completed' },
        { date: '2024-02-03', amount: 500, status: 'completed' },
        { date: '2024-02-04', amount: 2000, status: 'processing' }
    ]
};

function showTransactionOverview() {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", "ai-bubble");

    const canvas = document.createElement("canvas");
    canvas.id = "transactionChart";
    messageDiv.appendChild(canvas);

    document.getElementById("chat-window").appendChild(messageDiv);

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Transfers', 'Withdrawals', 'Contactless'],
            datasets: [{
                label: 'Total Transactions (MWK)',
                data: [
                    demoTransactions.transfers.reduce((sum, t) => sum + t.amount, 0),
                    demoTransactions.withdrawals.reduce((sum, t) => sum + t.amount, 0),
                    demoTransactions.contactless.reduce((sum, t) => sum + t.amount, 0)
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (MWK)'
                    }
                }
            }
        }
    });
}

// Add to existing request queue handler for option 11
if (userInput === "11") {
    showTransactionOverview();
    return;
}

            }
            if (data.unusualLoginLocation) {
                addMessage('ai', `Suspicious activity: A login attempt was made from a new location (IP: ${data.unusualLoginLocation}).`);
            }
        })
        .catch(error => {
            console.error('Error checking login activity:', error);
        });
}

// Regular security monitoring
setInterval(() => {
    const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
    const accountNumber = storedAccount ? storedAccount.accountName : null;

    if (accountNumber) {
        monitorLoginActivity();
    }
}, 60000);