// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('payCoAccount');
    window.location.href = "index.html";
});

document.addEventListener('DOMContentLoaded', () => {
    const storedAccount = JSON.parse(localStorage.getItem('userData'));
    const enablePaymentBtn = document.getElementById('enablePayment');
    const disablePaymentBtn = document.getElementById('disablePayment');
    const paymentStatus = document.getElementById('paymentStatus');
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');
    let isPaymentEnabled = false;

    // Add tap detection
    document.querySelector('.virtual-card').addEventListener('click', async () => {
        if (isPaymentEnabled) {
            const tapSound = new Audio('tap-sound.mp3');
            tapSound.play();

            try {
                if ('NDEFReader' in window) {
                    const ndef = new NDEFReader();
                    await ndef.scan();

                    ndef.addEventListener("reading", async ({ message, serialNumber }) => {
                        const tapSound = new Audio('tap-sound.mp3');
                        tapSound.play();

                        // Handle POS terminal communication
                        const posData = {
                            cardSerial: serialNumber,
                            timestamp: new Date().toISOString(),
                            terminalId: message.terminalId || 'DEFAULT_TERMINAL'
                        };

                        const response = await initiatePayment(posData);
                        handlePaymentResponse(response);
                    });

                    // Handle connection events
                    ndef.addEventListener("connecting", () => {
                        paymentStatus.innerHTML = `
                            <div class="payment-animation">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Connecting to payment terminal...</p>
                            </div>`;
                    });

                    ndef.addEventListener("error", (error) => {
                        showError("NFC Error: " + error.message);
                    });
                } else {
                    showError("NFC is not supported on this device");
                }
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    showError("Please enable NFC on your device");
                } else if (error.name === 'NotSupportedError') {
                    showError("NFC is not supported on this device");
                } else {
                    showError(error.message);
                }
            }
        }
    });

    if (storedAccount) {
        fetch(`https://0.0.0.0:5000/api/epaywallet/account/get/${storedAccount.paySheetNumber}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            cardNumber.textContent = `**** **** **** ${data.cardNumber.slice(-4)}`;
            cardHolder.textContent = data.accountName;
        })
        .catch(error => {
            console.error('Error fetching card data:', error);
            cardNumber.textContent = `**** **** **** ${storedAccount.paySheetNumber.slice(-4)}`;
            cardHolder.textContent = storedAccount.accountName;
        });
    }

    // Define payment functions outside event listeners
    async function initiatePayment() {
        try {
            const amount = await getTransactionAmount();

            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.balance) {
                showError("Unable to fetch account balance");
                return;
            }

            if (userData.balance < amount) {
                showError("Insufficient balance for this transaction");
                return;
            }

            const response = await fetch('https://0.0.0.0:5000/api/epaywallet/payment/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    accountNumber: storedAccount.payCodeNumber,
                    paymentType: 'contactless',
                    amount: amount,
                    deductFromWallet: true
                })
            });

            return await response.json();
        } catch (error) {
            showError(error.message || 'Payment failed');
            return { success: false };
        }
    }

    enablePaymentBtn.addEventListener('click', async () => {
        try {
            paymentStatus.innerHTML = `
                <div class="payment-animation">
                    <i class="fas fa-wifi fa-pulse"></i>
                    <p>Activating ProWallet payment...</p>
                    <div class="nfc-range-indicator"></div>
                </div>`;

            isPaymentEnabled = true;
            enablePaymentBtn.style.display = 'none';
            disablePaymentBtn.style.display = 'block';

            const storedAccount = JSON.parse(localStorage.getItem('userData'));
            if (!storedAccount) {
                throw new Error('Account data not found');
            }

                // Get current balance
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (!userData || !userData.balance) {
                    showError("Unable to fetch account balance");
                    return;
                }

                // Validate sufficient balance
                if (userData.balance < amount) {
                    showError("Insufficient balance for this transaction");
                    return;
                }

                const response = await fetch('https://0.0.0.0:5000/api/epaywallet/payment/initialize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        accountNumber: storedAccount.payCodeNumber,
                        paymentType: 'contactless',
                        amount: amount,
                        deductFromWallet: true
                    })
                });

                const result = await response.json();

                if (result.success) {
                    try {
                        // Update wallet balance in localStorage
                        const userData = JSON.parse(localStorage.getItem('userData'));
                        userData.balance -= amount;
                        localStorage.setItem('userData', JSON.stringify(userData));

                        // Show success message with new balance
                        paymentStatus.innerHTML = `
                            <div class="payment-animation success">
                                <i class="fas fa-check-circle"></i>
                                <p>Payment successful!</p>
                                <small>New balance: MWK ${userData.balance.toLocaleString()}</small>
                            </div>`;

                        // Create transaction record
                        const transaction = {
                            type: 'payment',
                            amount: amount,
                            timestamp: new Date().toISOString(),
                            status: 'completed'
                        };

                        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                        transactions.push(transaction);
                        localStorage.setItem('transactions', JSON.stringify(transactions));
                    } catch (error) {
                        console.error('Error updating local data:', error);
                        showError('Payment processed but local data update failed');
                    }
                }

                return result;
            }

            async function getTransactionAmount() {
                // Simulate getting amount from card machine
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(parseFloat(prompt("Enter transaction amount:", "0")));
                    }, 1000);
                });
            }

            function handlePaymentResponse(result) {
                if (result.success) {
                    paymentStatus.innerHTML = `
                        <div class="payment-animation success">
                            <i class="fas fa-check-circle"></i>
                            <p>Payment successful!</p>
                        </div>`;
                } else {
                    showError('Payment failed. Please try again.');
                }
            }

            function showError(message) {
                paymentStatus.innerHTML = `
                    <div class="payment-animation error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${message}</p>
                    </div>`;
            }

            // Initialize Epawallet payment
            const response = await fetch('https://0.0.0.0:5000/api/epaywallet/payment/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    accountNumber: storedAccount.paySheetNumber,
                    paymentType: 'contactless'
                })
            });

            const result = await response.json();

            if (result.success) {
                paymentStatus.innerHTML = `
                    <div class="payment-animation success">
                        <i class="fas fa-check-circle"></i>
                        <p>Contactless payment enabled. Ready for transaction.</p>
                    </div>`;
                enablePaymentBtn.style.display = 'none';
                disablePaymentBtn.style.display = 'block';
            } else {
                throw new Error(result.message || 'Failed to connect to Yoco POS');
            }
        } catch (error) {
            paymentStatus.innerHTML = `
                <div class="payment-animation error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message || 'Payment service unavailable'}</p>
                </div>`;
        }
    });

    disablePaymentBtn.addEventListener('click', () => {
        enablePaymentBtn.style.display = 'block';
        disablePaymentBtn.style.display = 'none';
        paymentStatus.innerHTML = `
            <div class="payment-status">
                <i class="fas fa-wifi"></i>
                <p>NFC Payment Ready</p>
                <small>Hold your device near the NFC payment terminal</small>
                <div class="nfc-indicator"></div>
            </div>`;
    });
});