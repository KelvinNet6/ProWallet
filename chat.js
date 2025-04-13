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
function addMessage(sender, message, loading = false) {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-bubble", sender === "ai" ? "ai-bubble" : "user-bubble");
    if (loading) {
        messageDiv.classList.add("loading");
        messageDiv.innerHTML = `<p>${message} <span class="dots">...</span></p>`;
    } else {
        messageDiv.innerHTML = `<p>${message}</p>`;
        // Save message to localStorage
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({ sender, message });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
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
                //Existing code remains the same
                // Retrieve PayCo number from localStorage if available
                const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
                if (storedAccount && storedAccount.paySheetNumber) {
                    accountNumber = storedAccount.paySheetNumber;
                    isWaitingForPin = true;
                    addMessage('ai', 'PayCo number retrieved from your local storage. Please enter your 4-digit PIN.');
                } else {
                    addMessage('ai', 'Please provide your PayCo number to check the balance.');
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
                addMessage('ai', 'About PayCo: PayCo is a comprehensive payment processing platform designed to simplify your financial transactions.');
                break;
            case "6":
                addMessage('ai', 'To transfer funds, please visit the Transfer Funds page or click the TF option in the menu.');
                break;
            case "7":
                addMessage('ai', 'For cash withdrawals, please visit the Cash Out page or click the Cash Out option in the menu.');
                break;
            case "8":
                addMessage('ai', 'For account security tips:\n- Keep your PayCo number private\n- Enable two-factor authentication\n- Monitor your transactions regularly\n- Report suspicious activity immediately');
                break;
            case "9":
                addMessage('ai', 'Customer Support is available 24/7. You can reach us through:\n- Email: support@paysheet.com\n- Phone: 1-800-PAYSHEET\n- Live Chat: Available on website');
                break;
            case "10":
                addMessage('ai', 'Transaction Limits:\n- Daily Transfer: Up to MWK 10,000,000\n- Weekly Withdrawal: Up to MWK 25,000,000\n- Monthly Transaction: Up to MWK 50,000,000');
                break;
            default:
                let helpMessage = "Please select an option by entering its number:\n\n\n";
                helpMessage += "1. Check Balance\n\n";
                helpMessage += "2. Transfer Fee Information\n\n";
                helpMessage += "3. Withdrawal Fee Information\n\n";
                helpMessage += "4. Find Nearest Agent\n\n";
                helpMessage += "5. About PayCo\v\n";
                helpMessage += "6. Transfer Funds Guide\n\n";
                helpMessage += "7. Cash Out Guide\n\n";
                helpMessage += "8. Security Tips\n\n";
                helpMessage += "9. Customer Support\n\n";
                helpMessage += "10. Transaction Limits\n\n";
                addMessage('ai', helpMessage);
        }
    }, 3000);

    processNextRequest();
}


// Handle user input and AI responses
document.getElementById("send-btn").addEventListener("click", function() {
    const userInput = document.getElementById("user-query").value.trim().toLowerCase();

    if (!userInput) return;  // Prevent sending empty input

    // Display the user's message in the chat window
    addMessage('user', userInput);

    // Clear the input field immediately after sending the message
    document.getElementById("user-query").value = '';

    // Show greeting options if user types "start"
    if (userInput === "start") {
        let helpMessage = "Welcome to PayCo! Please select an option by entering its number:\n\n\n";
        helpMessage += "1. Check Balance\n\n";
        helpMessage += "2. Transfer Fee Information\n\n";
        helpMessage += "3. Withdrawal Fee Information\n\n";
        helpMessage += "4. Find Nearest Agent\n\n";
        helpMessage += "5. About PayCo\v\n";
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
        checkPayCoNumber(userInput);
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
    const apiUrl = `https://YOUR_GOOGLE_CLOUD_API_ENDPOINT/api/epaywallet/account/request/check/paysheet/${payCoNumber}`;

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
                isWaitingForPin = true; // Added PIN verification step
                addMessage('ai', 'PayCo number verified successfully! Please enter your 4-digit PIN.');
            } else {
                addMessage('ai', 'Sorry, the PayCo number you entered is invalid. Please check and try again.');
                isWaitingForPayCo = false;
            }
        })
        .catch(error => {
            addMessage('ai', 'Sorry, there was an error verifying your PayCo number. Please try again later.');
            console.error('Error checking PayCo number:', error);
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

// Initial greeting message
window.addEventListener('load', function() {
    setTimeout(function() {
        addMessage('ai', "Type 'start' to begin chatting with PayCo Assistant!");
    }, 1000);
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