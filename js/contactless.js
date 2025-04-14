// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('payCoAccount'); // Remove data from localStorage
    window.location.href = "index.html";
});

document.addEventListener('DOMContentLoaded', () => {
    const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
    const enableNFCBtn = document.getElementById('enableNFC');
    const disableNFCBtn = document.getElementById('disableNFC');
    const paymentStatus = document.getElementById('paymentStatus');
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');

    if (storedAccount) {
        // Fetch card data from API
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
            // Fallback to stored data
            cardNumber.textContent = `**** **** **** ${storedAccount.paySheetNumber.slice(-4)}`;
            cardHolder.textContent = storedAccount.accountName;
        });
    }

    enableNFCBtn.addEventListener('click', async () => {
        try {
            if ('NDEFReader' in window) {
                const ndef = new NDEFReader();
                await ndef.scan();

                enableNFCBtn.style.display = 'none';
                disableNFCBtn.style.display = 'block';
                paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i><p>NFC Active - Ready to Pay</p>';

                ndef.onreading = event => {
                    handleNFCPayment(event);
                };
            } else {
                throw new Error('NFC not supported');
            }
        } catch (error) {
            paymentStatus.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>NFC not available on this device.</p>
                <small>Please ensure:</small>
                <ul style="text-align: left; margin-top: 5px;">
                    <li>Your device has NFC hardware</li>
                    <li>NFC is enabled in your device settings</li>
                    <li>You're using a supported browser (Chrome Android/iOS)</li>
                </ul>`;
        }
    });

    disableNFCBtn.addEventListener('click', () => {
        enableNFCBtn.style.display = 'block';
        disableNFCBtn.style.display = 'none';
        paymentStatus.innerHTML = '<i class="fas fa-mobile-alt"></i><p>Hold near payment terminal</p>';
    });
});

async function handleNFCPayment(event) {
    const paymentStatus = document.getElementById('paymentStatus');
    const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
    
    if (!storedAccount || !storedAccount.paySheetNumber) {
        paymentStatus.innerHTML = '<i class="fas fa-times-circle"></i><p>Account not found</p>';
        return;
    }

    paymentStatus.innerHTML = `
        <div class="payment-animation">
            <i class="fas fa-circle-notch fa-spin"></i>
            <p>Processing Payment...</p>
        </div>`;

    try {
        // Default transaction amount - you may want to make this configurable
        const transactionAmount = 10.00;

        // Process payment through API
        const response = await fetch(`https://0.0.0.0:44323/api/epaywallet/account/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                accountNumber: storedAccount.paySheetNumber,
                amount: transactionAmount,
                transactionType: 'NFC_PAYMENT'
            })
        });

        const data = await response.json();

        if (data.success) {
            paymentStatus.innerHTML = `
                <div class="payment-animation success">
                    <i class="fas fa-check-circle success-icon"></i>
                    <p>Payment Successful!</p>
                </div>`;
            setTimeout(() => {
                paymentStatus.innerHTML = `
                    <div class="payment-animation ready">
                        <i class="fas fa-check-circle"></i>
                        <p>Ready for next payment</p>
                    </div>`;
            }, 3000);
        } else {
            throw new Error(data.message || 'Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        paymentStatus.innerHTML = '<i class="fas fa-times-circle"></i><p>Payment Failed: ' + 
            (error.message || 'Transaction could not be processed') + '</p>';
    }
}
