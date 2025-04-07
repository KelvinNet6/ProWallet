
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
            paymentStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>NFC not available on this device</p>';
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
    paymentStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Processing Payment...</p>';

    try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i><p>Payment Successful!</p>';
        setTimeout(() => {
            paymentStatus.innerHTML = '<i class="fas fa-check-circle"></i><p>Ready for next payment</p>';
        }, 3000);
    } catch (error) {
        paymentStatus.innerHTML = '<i class="fas fa-times-circle"></i><p>Payment Failed</p>';
    }
}
