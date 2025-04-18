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
            cardNumber.textContent = `**** **** **** ${storedAccount.paySheetNumber.slice(-4)}`;
            cardHolder.textContent = storedAccount.accountName;
        });
    }

    enablePaymentBtn.addEventListener('click', async () => {
        try {
            paymentStatus.innerHTML = `
                <div class="payment-animation">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <p>Connecting to Yoco...</p>
                </div>`;

            // Initialize Yoco payment
            const response = await fetch('https://0.0.0.0:5000/api/yoco/initialize-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    accountNumber: storedAccount.paySheetNumber
                })
            });

            enablePaymentBtn.style.display = 'none';
            disablePaymentBtn.style.display = 'block';

            // Handle Yoco payment response here
            // Add your Yoco integration code

        } catch (error) {
            paymentStatus.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>Payment service unavailable</p>`;
        }
    });

    disablePaymentBtn.addEventListener('click', () => {
        enablePaymentBtn.style.display = 'block';
        disablePaymentBtn.style.display = 'none';
        paymentStatus.innerHTML = '<i class="fas fa-mobile-alt"></i><p>Ready for Yoco payment</p>';
    });
});