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
            }, 2000); // Simulate a delay (e.g., fetching balance)
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
            document.getElementById("user-query").value = '';  // Clear the input field

            // Handle Context Awareness (if user has already provided PaySheet number)
            const userContext = JSON.parse(sessionStorage.getItem('userContext')) || {};
            if (userContext.lastInteraction) {
                addMessage('ai', `Last time, you asked about your ${userContext.lastInteraction}. How can I assist you today?`);
            }

            // **Check if the user asks for the PaySheet number**
            if (userInput.toLowerCase().includes('paysheet number') || userInput.toLowerCase().includes('account number')) {
                const storedAccount = sessionStorage.getItem("paySheetAccount");
                if (storedAccount) {
                    const accountData = JSON.parse(storedAccount);
                    addMessage('ai', `Your PaySheet number is: ${accountData.accountName}`);  // Show the account number
                } else {
                    addMessage('ai', 'Sorry, I cannot find your PaySheet number. Please log in first.');
                }
                return;  // End the function here if PaySheet number is asked
            }

            // If we are waiting for a PaySheet number
            if (isWaitingForPaySheet) {
                checkPaySheetNumber(userInput);  // Validate PaySheet number
                return;  // End here if we're verifying the PaySheet number
            }

            // If we are waiting for an email address
            if (isWaitingForEmail) {
                emailAddress = userInput;  // Store email address
                fetchBalance(accountNumber, emailAddress);  // Fetch balance
                return;
            }

            // Main interaction flow
            if (userInput.toLowerCase().includes('balance')) {
                isWaitingForPaySheet = true;
                addMessage('ai', 'Please provide your PaySheet number first.');
                return;
            } else if (userInput.toLowerCase().includes('hi') || userInput.toLowerCase().includes('hello')) {
                addMessage('ai', 'Hello! How can I help you today?');
            } else {
                // Handle other inquiries (fees, agents, etc.)
                let aiResponse = '';
                if (userInput.toLowerCase().includes('transfer fee')) {
                    aiResponse = 'Our standard transaction fee is 2% per transfer. For international transfers, there is an additional $5 charge.';
                } else if (userInput.toLowerCase().includes('withdrawal fee') || userInput.toLowerCase().includes('cash out fee')) {
                    aiResponse = 'The withdrawal fee for cashing out is $1.50 per transaction.';
                } else if (userInput.toLowerCase().includes('nearest agent') || userInput.toLowerCase().includes('find payment agent')) {
                    aiResponse = 'I can help you find the nearest payment collection agent. Please share your location (city or use your current location).';
                } else if (userInput.toLowerCase().includes('stock news')) {
                     fetchStockNews();
                return;
               }else if (userInput.toLowerCase().includes('fx trading signals')) {
                     fetchFXTradingSignals();
                     return;
                  } else if (userInput.toLowerCase().includes('fx news')) {
                          fetchFXNews();
                            return;
                  } else if (userInput.toLowerCase().includes('fx trading lessons')) {
                         let topic = userInput.replace('fx trading lessons', '').trim(); // Extract lesson type
                         fetchFXLesson(topic || "beginner"); // Default to beginner
                         return;
                } else {
                    aiResponse = 'I didn\'t quite understand that. Could you try again?';
                }

                addMessage('ai', aiResponse);
            }

            // Add to request queue for multitasking
            requestQueue.push(userInput);
            processNextRequest();
        });

        // Function to check PaySheet number from the integrated API
        function checkPaySheetNumber(paySheetNumber) {
            const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/check/paysheet/${paySheetNumber}`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.isValid) {
                        // If the PaySheet number is valid
                        accountNumber = paySheetNumber;
                        isWaitingForPaySheet = false;  // Reset PaySheet waiting flag
                        isWaitingForEmail = true;  // Set to waiting for email address

                        addMessage('ai', 'PaySheet number verified successfully! Now, please provide your email address.');
                    } else {
                        // If the PaySheet number is invalid
                        addMessage('ai', 'Sorry, the PaySheet number you entered is invalid. Please check and try again.');
                        isWaitingForPaySheet = false;  // Reset flag in case of invalid number
                    }
                })
                .catch(error => {
                    addMessage('ai', 'Sorry, there was an error verifying your PaySheet number. Please try again later.');
                    console.error('Error checking PaySheet number:', error); // For debugging purposes
                });
        }

        // Function to fetch balance using PaySheet number and email address
        function fetchBalance(accountNumber, emailAddress) {
            const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}`;
            
            fetch(apiUrl)  // Use dynamic values from the arguments
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.balance !== undefined) {
                        const balance = data.balance;  // Assume the response contains a 'balance' field
                        addMessage('ai', `Your current wallet balance is K${balance}.`);
                    } else {
                        addMessage('ai', 'Error: Unable to fetch balance. Please check your account details or try again later.');
                    }
                })
                .catch(error => {
                    addMessage('ai', 'Sorry, there was an error fetching your balance. Please try again later.');
                    console.error('Error fetching balance:', error); // For debugging purposes
                });
        }

       window.addEventListener('load', function() {
    setTimeout(function() {
        let greetingMessage = "Hello! I'm PaySheet AI assistant. ";
        greetingMessage += "I can assist you with the following:<br><br>";
        greetingMessage += "1. Check PaySheet Number<br>"; 
        greetingMessage += "2. Check PaySheet Balance<br>";
        greetingMessage += "3. Transfer Fee Charges<br>";
        greetingMessage += "4. Cashout Fee Charges<br>";
        greetingMessage += "5. Locating nearest Agent<br>";
        greetingMessage += "6. Stock News<br>";
        greetingMessage += "7. FX Trading Signals<br>";
        greetingMessage += "8. FX Trading Lessons";

        // Add the message to the chat
        addMessage('ai', greetingMessage);

        // Additional greeting message (Welcome)
        addMessage('ai', 'Welcome to PaySheet! How can I assist you today?');
    }, 1000); // AI greets the user and provides services after 1 second
});

//--------------------------
        function fetchStockNews() {
    const apiUrl = `https://newsapi.org/v2/everything?q=stock&apiKey=YOUR_NEWS_API_KEY`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.articles.length > 0) {
                let newsMessage = "Here are the latest stock market news:<br>";
                data.articles.slice(0, 3).forEach(article => {
                    newsMessage += `<a href="${article.url}" target="_blank">${article.title}</a><br>`;
                });
                addMessage('ai', newsMessage);
            } else {
                addMessage('ai', "Sorry, no stock news available at the moment.");
            }
        })
        .catch(error => {
            console.error('Error fetching stock news:', error);
            addMessage('ai', "Error retrieving stock news.");
        });
}
//--------------------------
        function fetchFXTradingSignals() {
    const apiUrl = `https://api.tradingview.com/fx-signals?apiKey=YOUR_API_KEY`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.signals.length > 0) {
                let signalsMessage = "Here are the latest Forex trading signals:<br>";
                data.signals.slice(0, 3).forEach(signal => {
                    signalsMessage += `Pair: ${signal.pair} | Signal: ${signal.direction} | Strength: ${signal.strength}<br>`;
                });
                addMessage('ai', signalsMessage);
            } else {
                addMessage('ai', "No FX trading signals available.");
            }
        })
        .catch(error => {
            console.error('Error fetching FX signals:', error);
            addMessage('ai', "Error retrieving FX trading signals.");
        });
}
//-------------------------
        const fxLessons = {
    "beginner": "Forex trading involves buying and selling currency pairs. The most traded pairs are EUR/USD, USD/JPY, and GBP/USD.<br><br>",
    "technical_analysis": "Technical analysis involves studying price charts and indicators like Moving Averages, RSI, and MACD.<br><br>",
    "risk_management": "Always set a Stop-Loss to limit losses. Never risk more than 2% of your capital on a single trade."
};

function fetchFXLesson(topic) {
    if (fxLessons[topic]) {
        addMessage('ai', fxLessons[topic]);
    } else {
        addMessage('ai', "Please choose from: Beginner, Technical Analysis, or Risk Management.");
    }
}
//--------------------
        function fetchFXNews() {
    const apiUrl = `https://newsapi.org/v2/everything?q=forex&apiKey=YOUR_NEWS_API_KEY`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.articles.length > 0) {
                let newsMessage = "Here are the latest Forex news:<br>";
                data.articles.slice(0, 3).forEach(article => {
                    newsMessage += `<a href="${article.url}" target="_blank">${article.title}</a><br>`;
                });
                addMessage('ai', newsMessage);
            } else {
                addMessage('ai', "Sorry, no Forex news available at the moment.");
            }
        })
        .catch(error => {
            console.error('Error fetching FX news:', error);
            addMessage('ai', "Error retrieving Forex news.");
        });
}

//----------------------------------------------Function to monitor login attempts and detect fraudulent login activities------------------------------------------------//
    function monitorLoginActivity() {
        const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/login/activity`;
        
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

    // Function to monitor transactions and detect high-value or suspicious transactions
    function monitorTransactions(accountNumber) {
        const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/get/transaction/activity/${accountNumber}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Check for high-value transactions
                data.transactions.forEach(transaction => {
                    if (transaction.amount > 1000) {  // Assume 1000 is the threshold for high-value transactions
                        addMessage('ai', `Alert: A high-value transaction of K${transaction.amount} was detected.`);
                    }
                });

                // Monitor for rapid consecutive transactions (potentially suspicious)
                if (data.transactions.length > 3) {
                    let lastTransaction = data.transactions[data.transactions.length - 1];
                    let secondLastTransaction = data.transactions[data.transactions.length - 2];

                    if (new Date(lastTransaction.date) - new Date(secondLastTransaction.date) < 300000) { // 5 minutes
                        addMessage('ai', 'Warning: Multiple transactions made within a short time period. This could indicate fraudulent activity.');
                    }
                }
            })
            .catch(error => {
                console.error('Error checking transaction activity:', error);
            });
    }

    // Function to monitor account changes (like email change or password change)
    function monitorAccountChanges(accountNumber) {
        const apiUrl = `https://localhost:44323/Help/Api/GET-api/epaywallet/account/request/account/changes/${accountNumber}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.changedEmail) {
                    addMessage('ai', `Alert: Your email address was recently changed to ${data.changedEmail}. If this wasn't you, please reset your password.`);
                }
                if (data.changedPassword) {
                    addMessage('ai', `Alert: Your password was recently changed. If you did not do this, please secure your account.`);
                }
            })
            .catch(error => {
                console.error('Error checking account changes:', error);
            });
    }

    // Regularly monitor account activities (you can set the interval as per your needs)
    setInterval(() => {
        const accountNumber = sessionStorage.getItem("paySheetAccount") ? JSON.parse(sessionStorage.getItem("paySheetAccount")).accountName : null;

        if (accountNumber) {
            monitorLoginActivity();
            monitorTransactions(accountNumber);
            monitorAccountChanges(accountNumber);
        }
    }, 60000); // Check activities every minute (you can adjust this frequency)

    // Handle user input and AI responses
    document.getElementById("send-btn").addEventListener("click", function() {
        const userInput = document.getElementById("user-query").value.trim();
        
        if (!userInput) return;  // Prevent sending empty input

        // Display the user's message in the chat window
        addMessage('user', userInput);

        // Clear the input field immediately after sending the message
        document.getElementById("user-query").value = '';  // Clear the input field

        // Handling fraud alerts based on the query
        if (userInput.toLowerCase().includes('fraud alert') || userInput.toLowerCase().includes('suspicious activity')) {
            addMessage('ai', 'Monitoring your account for any suspicious activity. You will be alerted if any unusual behavior is detected.');
        } else {
            // Handle other queries as usual
            let aiResponse = 'I didn\'t quite understand that. Could you try again?';
            addMessage('ai', aiResponse);
        }
    });
        
