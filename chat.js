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

// Add message function to display chat bubbles
function addMessage(sender, message) {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", sender === "ai" ? "ai-bubble" : "user-bubble");
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the latest message
}

// Flag to track whether we are expecting a PaySheet number or email address
let isWaitingForPaySheet = false;
let isWaitingForEmail = false;
let accountNumber = '';
let emailAddress = '';

// Queue to manage multiple requests
let requestQueue = [];

function processNextRequest() {
    if (requestQueue.length > 0) {
        const nextRequest = requestQueue.shift();
        handleRequest(nextRequest);
    }
}

function handleRequest(request) {
    showLoading();  // Show loading spinner

    setTimeout(() => {
        // Process the request here
        addMessage('ai', `Processing: ${request}`);
        hideLoading();
        processNextRequest();
    }, 2000);
}

function showLoading() {
    addMessage('ai', 'Please wait, I am processing your request...');
}

function hideLoading() {
    const loadingMessages = document.querySelectorAll('.loading');
    loadingMessages.forEach(msg => msg.remove());
}

// Handle user input and AI responses
document.getElementById("send-btn").addEventListener("click", function() {
    const userInput = document.getElementById("user-query").value.trim();

    if (!userInput) return;  // Prevent sending empty input

    // Display the user's message in the chat window
    addMessage('user', userInput);

    // Clear the input field immediately after sending the message
    document.getElementById("user-query").value = '';

    // Handle Context Awareness
    const userContext = JSON.parse(sessionStorage.getItem('userContext')) || {};
    if (userContext.lastInteraction) {
        addMessage('ai', `Last time, you asked about your ${userContext.lastInteraction}. How can I assist you today?`);
    }

    // If we are waiting for a PaySheet number
    if (isWaitingForPaySheet) {
        checkPaySheetNumber(userInput);
        return;
    }

    // If we are waiting for an email address
    if (isWaitingForEmail) {
        emailAddress = userInput;
        fetchBalance(accountNumber, emailAddress);
        return;
    }

    // Main interaction flow based on numeric input
    switch(userInput) {
        case "1":
            addMessage('ai', 'Please provide your PaySheet number to check the balance.');
            isWaitingForPaySheet = true;
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
            addMessage('ai', 'About PaySheet: PaySheet is a comprehensive payment processing platform designed to simplify your financial transactions.');
            break;
        default:
            let helpMessage = "Please select an option by entering its number:\n";
            helpMessage += "1. Check Balance\n";
            helpMessage += "2. Transfer Fee Information\n";
            helpMessage += "3. Withdrawal Fee Information\n";
            helpMessage += "4. Find Nearest Agent\n";
            helpMessage += "5. About PaySheet\n";
            addMessage('ai', helpMessage);
    }

    // Add to request queue
    requestQueue.push(userInput);
    processNextRequest();
});

// Function to check PaySheet number from the integrated API
function checkPaySheetNumber(paySheetNumber) {
    const apiUrl = `https://0.0.0.0:5000/api/epaywallet/account/request/check/paysheet/${paySheetNumber}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.isValid) {
                accountNumber = paySheetNumber;
                isWaitingForPaySheet = false;
                isWaitingForEmail = true;
                addMessage('ai', 'PaySheet number verified successfully! Now, please provide your email address.');
            } else {
                addMessage('ai', 'Sorry, the PaySheet number you entered is invalid. Please check and try again.');
                isWaitingForPaySheet = false;
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error verifying your PaySheet number. Please try again later.');
            console.error('Error checking PaySheet number:', error);
        });
}

// Function to fetch balance using PaySheet number and email address
function fetchBalance(accountNumber, emailAddress) {
    const apiUrl = `https://0.0.0.0:44323/Help/Api/GET-api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.balance !== undefined) {
                const balance = data.balance;
                addMessage('ai', `Your current wallet balance is K${balance}.`);
            } else {
                addMessage('ai', 'Error: Unable to fetch balance. Please check your account details or try again later.');
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error fetching your balance. Please try again later.');
            console.error('Error fetching balance:', error);
        });
}

// Initial greeting message
window.addEventListener('load', function() {
    setTimeout(function() {
        let helpMessage = "Welcome to PaySheet! Please select an option by entering its number:\n";
        helpMessage += "1. Check Balance\n";
        helpMessage += "2. Transfer Fee Information\n";
        helpMessage += "3. Withdrawal Fee Information\n";
        helpMessage += "4. Find Nearest Agent\n";
        helpMessage += "5. About PaySheet\n";
        addMessage('ai', helpMessage);
    }, 1000);
});

// Security monitoring functions
function monitorLoginActivity() {
    const apiUrl = `https://0.0.0.0:44323/Help/Api/GET-api/epaywallet/account/request/login/activity`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.failedAttempts > 3) {
                addMessage('ai', 'Warning: Multiple failed login attempts detected. If this was not you, please secure your account immediately.');
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
    const accountNumber = sessionStorage.getItem("paySheetAccount") ? 
        JSON.parse(sessionStorage.getItem("paySheetAccount")).accountName : null;

    if (accountNumber) {
        monitorLoginActivity();
    }
}, 60000);