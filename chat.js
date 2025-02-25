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
   if (userInput.toLowerCase().includes('about paysheet') || userInput.toLowerCase().includes('what is paysheet')) {
    aiResponse = 'PaySheet is a comprehensive payment processing platform designed to simplify your financial transactions. Whether you\'re looking to transfer funds, withdraw money, locate agents, or access the latest market insights, PaySheet offers all of this and listen Below:<br>';
    aiResponse += '1. Stock News - Stay updated with the latest trends in the stock market.<br>';
    aiResponse += '2. FX Trading Signals - Receive real-time trading signals to guide your forex trades.<br>';
    aiResponse += '3. FX Trading Lessons - Learn forex trading strategies, analysis techniques, and more.<br>';
    aiResponse += '4. Demo FX Trading - Practice trading in a risk-free demo environment to refine your skills.<br>';
    aiResponse += 'Would you like assistance with any of these features?';
    addMessage('ai', aiResponse);
     }
          else if (userInput.toLowerCase().includes('balance')) {
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
    "beginner": "### Beginner: Forex Trading Basics<br><br>Forex trading involves buying and selling currencies on the global market. The goal is to profit from the changes in the exchange rates between two currencies. The Forex market is one of the largest and most liquid financial markets in the world, with a daily trading volume of over $6 trillion.<br><br>",

    "currency_pairs": "### Currency Pairs<br><br>Forex trades always happen in pairs, such as EUR/USD (Euro/US Dollar). The first currency in the pair is the 'base currency,' and the second is the 'quote currency.' The exchange rate tells you how much of the quote currency is needed to purchase one unit of the base currency.<br><br>For example, if EUR/USD is quoted at 1.1500, it means that 1 Euro is worth 1.15 US Dollars.<br><br>",

    "leverage": "### Leverage<br><br>Leverage allows traders to control a larger position with a smaller amount of capital. For example, with 100:1 leverage, you can control $100,000 with just $1,000. While this amplifies potential profits, it also increases the risk of significant losses.<br><br>Leverage should be used with caution, as it can magnify both profits and losses. Traders need to understand their risk tolerance and use leverage responsibly.<br><br>",

    "market_participants": "### Market Participants<br><br>The Forex market is composed of various participants, including individual traders, banks, corporations, and governments. These participants all play a role in influencing market movements and providing liquidity.<br><br>Individual traders can trade through brokers, while banks and corporations are typically involved in larger transactions for business needs like hedging currency risk.<br><br>Governments and central banks also play an important role in influencing currency values through monetary policy and interest rates.<br><br>",

    "market_hours": "### Market Hours<br><br>The Forex market operates 24 hours a day, 5 days a week. It is divided into four major trading sessions: Sydney, Tokyo, London, and New York. This allows traders to participate at almost any time.<br><br>Each trading session is influenced by the economic activity in the respective regions, with the most active and volatile periods often occurring when the major markets overlap.<br><br>The Sydney session starts at 10 PM GMT, Tokyo at 12 AM GMT, London at 8 AM GMT, and New York at 1 PM GMT.<br><br>",

    "scalping": "### Scalping: A Quick Trading Strategy<br><br>Scalping involves making small, quick trades to capture minute price changes. These trades can last from seconds to a few minutes.<br><br>**Advantages:** High frequency of trades, potential for small but consistent profits.<br><br>**Challenges:** Requires significant focus and fast decision-making, high transaction costs due to frequent trading. Scalping can also lead to burnout as it requires constant attention to price action.<br><br>**Ideal for:** Traders who are able to dedicate full attention to the market and thrive in fast-paced environments.<br><br>",

    "swing_trading": "### Swing Trading: Capturing Larger Price Movements<br><br>Swing traders look to capture larger price movements within a short-to-medium time frame (usually from a few hours to several days). They focus on trends and momentum.<br><br>**Advantages:** Less time-intensive than scalping, takes advantage of market trends.<br><br>**Challenges:** Requires good technical analysis skills, can be affected by unexpected news or market changes. Traders need to identify entry and exit points effectively to maximize gains.<br><br>**Ideal for:** Traders with a good understanding of technical analysis and who have flexibility in their schedules.<br><br>",

    "day_trading": "### Day Trading: Quick Trades Within the Same Day<br><br>Day traders open and close positions within the same trading day, without holding overnight positions. The goal is to take advantage of intraday price movements.<br><br>**Advantages:** No overnight risk, quick profits from small price movements.<br><br>**Challenges:** Requires a lot of time and attention, trading costs can add up due to frequent trades. Day trading often leads to higher levels of stress due to the speed of decision-making required.<br><br>**Ideal for:** Traders who are available throughout the day to monitor the markets and are comfortable with quick decision-making.<br><br>",

    "position_trading": "### Position Trading: Long-Term Strategy<br><br>Position traders hold trades for weeks, months, or even years, based on long-term trends or fundamental analysis.<br><br>**Advantages:** Less time spent monitoring the market, potential for larger profits from long-term moves.<br><br>**Challenges:** Requires a strong understanding of fundamental analysis, exposure to longer-term market risks. Traders must be able to withstand periods of drawdown as they wait for their positions to reach full value.<br><br>**Ideal for:** Traders who prefer a more passive approach and are willing to wait for larger moves in the market.<br><br>",

    "risk_management": "### Risk Management: Protecting Your Capital<br><br>Effective risk management is crucial for success in Forex trading. Here are some strategies you can implement:<br><br><ul><li><strong>Stop-Loss Orders:</strong> Automatically closes a trade at a set price to limit potential losses. For example, if you're buying EUR/USD at 1.2000 and set a stop-loss at 1.1900, your position will automatically close if the price drops to 1.1900, limiting your loss to 100 pips.</li><br><li><strong>Take-Profit Orders:</strong> Closes a trade when the market reaches a certain price to lock in profits. For example, if you buy EUR/USD at 1.2000 and set a take-profit at 1.2100, the trade will close once the price reaches that level.</li><br><li><strong>Risk-Reward Ratio:</strong> This ratio helps you determine whether a trade is worth taking based on its potential reward relative to the risk involved. A common ratio is 1:2, where you're willing to risk 1 unit to potentially gain 2 units.</li><br><li><strong>Risk No More Than 2% of Your Capital on a Single Trade:</strong> To ensure long-term profitability, never risk more than 2% of your account balance on one trade. For example, if you have $10,000 in your account, never risk more than $200 on a single trade.</li><br><li><strong>Diversification:</strong> Don’t place all your capital into one trade or one currency pair. Diversifying can help reduce overall risk.</li><br><li><strong>Stay Updated with News:</strong> Market conditions can change quickly due to economic news, geopolitical events, and central bank announcements. Keeping up-to-date can help you avoid unexpected losses.</li><br><li><strong>Psychological Control:</strong> Emotional control is key. Avoid trading based on fear or greed, and stick to your trading plan to minimize emotional decision-making.</li></ul><br><br>",

    "additional_info": "### Additional Information: Forex Market Insights<br><br>Forex trading operates 24 hours a day, 5 days a week. It’s a highly liquid market where traders can use leverage to increase their exposure. Leverage amplifies both profits and losses, so use it wisely. Strategies like scalping, swing trading, and day trading are commonly used by more advanced traders.<br><br>The market can be volatile, and significant price changes can occur quickly. Understanding how to read price charts, manage risk, and stay updated on global news is crucial for successful trading.<br><br>"
};

function fetchFXLesson() {
    let allLessons = '';

    // Loop through each lesson and add it to the output string
    for (let key in fxLessons) {
        allLessons += fxLessons[key];
    }

    // Display all lessons at once
    addMessage('ai', allLessons);
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
