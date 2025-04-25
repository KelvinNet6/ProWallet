
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
    const storedAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
    const enablePaymentBtn = document.getElementById('enablePayment');
    const disablePaymentBtn = document.getElementById('disablePayment');
    const paymentStatus = document.getElementById('paymentStatus');
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');

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

    enablePaymentBtn.addEventListener('click', async () => {
        try {
            // Show NFC activation animation
            paymentStatus.innerHTML = `
                <div class="payment-animation">
                    <i class="fas fa-wifi fa-pulse"></i>
                    <p>Activating NFC payment...</p>
                    <div class="nfc-range-indicator"></div>
                </div>`;
            
            // Add tap sound effect
            const tapSound = new Audio('tap-sound.mp3');
            tapSound.play();

            // Initialize Yoco POS payment
            const response = await fetch('https://0.0.0.0:5000/api/yoco/pos/initialize-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    accountNumber: storedAccount.paySheetNumber,
                    cardType: 'virtual'
                })
            });

            const result = await response.json();

            if (result.success) {
                paymentStatus.innerHTML = `
                    <div class="payment-animation success">
                        <i class="fas fa-check-circle"></i>
                        <p>Connected to Yoco POS. Ready for payment.</p>
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
                <i class="fas fa-credit-card"></i>
                <p>Ready for Yoco POS payment</p>
            </div>`;
    });
});
