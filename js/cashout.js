
// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('authToken');
    window.location.href = "index.html";
});

// Handle form submission
document.getElementById("cashOutForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const paymentNumber = document.getElementById("paymentNumber").value.trim();
    const amount = parseFloat(document.getElementById("amount").value.trim());
    const paymentMethod = document.getElementById("paymentMethod").value;
    const pickupLocation = document.getElementById("pickupLocation").value.trim();

    // Validate inputs
    if (!paymentNumber || !amount || isNaN(amount) || amount <= 0) {
        document.getElementById("errorMessage").innerText = "Please fill in all fields with valid information.";
        return;
    }

    // Hide the form and show transaction summary
    document.querySelector(".form-container").style.display = "none";
    document.getElementById("transactionSummary").style.display = "block";

    // Display summary
    let summaryText = `Payment Collection Number: ${paymentNumber}<br>Amount: $${amount.toFixed(2)}<br>Payment Method: ${paymentMethod}`;
    
    if (paymentMethod === 'pickup') {
        if (!pickupLocation) {
            document.getElementById("errorMessage").innerText = "Please enter a valid pickup location.";
            return;
        }
        summaryText += `<br>Pickup Location: ${pickupLocation}`;
    }

    document.getElementById("summaryDetails").innerHTML = summaryText;

    // Prepare data for API request
    const requestData = {
        paymentNumber: paymentNumber,
        amount: amount,
        paymentMethod: paymentMethod,
        pickupLocation: paymentMethod === 'pickup' ? pickupLocation : null
    };

    // Call API to handle Cash Out request
    fetch('https://0.0.0.0:5000/api/epaywallet/account/request/get/source/accountbalance/${accountNumber}/${emailAddress}', {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("transactionSummary").innerHTML += `<br>Transaction Successful!`;
        } else {
            document.getElementById("errorMessage").innerText = "There was an error processing your transaction.";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("errorMessage").innerText = "An error occurred while processing the transaction.";
    });
});

// Change transaction fee based on amount
document.getElementById("amount").addEventListener("input", function() {
    const amount = parseFloat(document.getElementById("amount").value.trim());
    const fee = amount * 0.02; // 2% fee
    document.getElementById("feeInfo").innerText = `Transaction Fee: $${fee.toFixed(2)}`;
});

// Toggle Cash Pickup Location visibility
document.getElementById("paymentMethod").addEventListener("change", function() {
    if (this.value === 'pickup') {
        document.getElementById("pickupLocationLabel").style.display = "block";
        document.getElementById("pickupLocation").style.display = "block";
    } else {
        document.getElementById("pickupLocationLabel").style.display = "none";
        document.getElementById("pickupLocation").style.display = "none";
    }
});
