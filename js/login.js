
// API endpoint for login verification
const apiUrl = "https://0.0.0.0:44323/api/epaywallet/account/login"; 
const accountDetailsApi = "https://0.0.0.0:44323/api/epaywallet/account/details";

async function handleLogin(email, password) {
    try {
        const loginResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success) {
            // Get additional account details
            const accountResponse = await fetch(`${accountDetailsApi}/${loginData.userId}`, {
                headers: {
                    "Authorization": `Bearer ${loginData.token}`
                }
            });
            
            const accountData = await accountResponse.json();
            
            // Save complete user data to localStorage
            const userData = {
                token: loginData.token,
                userId: loginData.userId,
                email: email,
                paySheetNumber: accountData.paySheetNumber,
                payCodeNumber: accountData.payCodeNumber,
                fullName: accountData.fullName,
                balance: accountData.balance,
                accountStatus: accountData.status
            };
            
            localStorage.setItem("userData", JSON.stringify(userData));
            
            // Redirect to home page
            window.location.href = "home.html";
        } else {
            alert("Invalid email or password. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in. Please try again later.");
    }
}

// Form event listener
document.getElementById("login-btn").addEventListener("click", function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    handleLogin(email, password);
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
