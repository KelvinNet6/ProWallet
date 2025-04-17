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

document.addEventListener("DOMContentLoaded", function() {
    // Get user's PayCo number from localStorage
    const userAccount = JSON.parse(localStorage.getItem('paySheetAccount'));
    if (userAccount && userAccount.paySheetNumber) {
        document.getElementById("from-account").value = userAccount.paySheetNumber;
    }

    const transferBtn = document.getElementById("transfer-btn");
    const popup = document.getElementById("security-popup");
    const closePopupBtn = document.getElementById("closePopupBtn");
    const errorMessage = document.getElementById("error-message");
    const transferForm = document.getElementById("transfer-form");

    transferBtn.addEventListener("click", () => {
        const fromAccount = document.getElementById("from-account").value;
        const toAccount = document.getElementById("to-account").value;
        const amount = document.getElementById("amount").value;

        // Validate input fields
        if (!toAccount || !amount) {
            errorMessage.textContent = "Please fill in both recipient and amount.";
            errorMessage.style.display = "block";
        } else {
            errorMessage.style.display = "none";
            popup.style.display = "flex";

            // Now, send the transaction details to the API
            transferForm.addEventListener("submit", function(e) {
                e.preventDefault();

                const securityCode = document.getElementById("security-code").value;

                if (!securityCode) {
                    alert("Please enter your security code.");
                    return;
                }

                // Create the payload for the transfer
                const transferData = {
                    from_account: fromAccount,
                    to_account: toAccount,
                    amount: amount,
                    security_code: securityCode
                };

                // API URL to handle transfer
                const apiUrl = "https://0.0.0.0:44323/api/epaywallet/account/request/get/source/accountbalance";

                // Send the data to the API for processing
                fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                        "X-API-Key": localStorage.getItem("gcpApiKey"),
                        "X-Project-ID": localStorage.getItem("gcpProjectId")
                    },
                    body: JSON.stringify(transferData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const amountMWK = new Intl.NumberFormat('en-MW', { 
                            style: 'currency', 
                            currency: 'MWK' 
                        }).format(amount);
                        alert(`Transfer of ${amountMWK} successful!`);
                        window.location.href = "home.html";
                    } else {
                        alert("Transfer failed: " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error during transfer:", error);
                    alert("An error occurred while processing the transfer.");
                });
            });
        }
    });

    // Close the popup when the close button is clicked
    closePopupBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });

    // Close the popup when clicking outside the popup content
    popup.addEventListener("click", function(event) {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });

    document.getElementById("to-account").addEventListener("input", function() {
        const toAccount = this.value;
        if (toAccount.length >= 8) {
            // Fetch recipient details
            fetch(`https://0.0.0.0:5000/api/epaywallet/account/details/${toAccount}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    "X-API-Key": localStorage.getItem("gcpApiKey"),
                    "X-Project-ID": localStorage.getItem("gcpProjectId")
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("recipient-details").style.display = "block";
                    document.getElementById("recipient-name").textContent = data.fullName;
                    document.getElementById("recipient-image").src = data.profileImage || "favicon.png";
                }
            });
        } else {
            document.getElementById("recipient-details").style.display = "none";
        }
    });
});