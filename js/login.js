async function handleLogin(email, password) {
    try {
        // Use default credentials for demo
        if (email === "kelvin.net6@gmail.com" && password === "433677kk") {
            const defaultUserData = {
                token: "default_token",
                userId: "default_user",
                email: email,
                paySheetNumber: "PS123456",
                payCodeNumber: "PC789012",
                fullName: "Default User",
                balance: 50000,
                accountStatus: "active"
            };
            localStorage.setItem("userData", JSON.stringify(defaultUserData));
            window.location.href = "home.html";
            return;
        }

        alert("Please use the default credentials:\nEmail: kelvin.net6@gmail.com\nPassword: 433677kk");
        return;
    } catch (error) {
        console.error("Error during login:", error);
        if (!navigator.onLine) {
            alert("Please check your internet connection and try again.");
        } else {
            alert("Login failed. Please check your email and password.");
        }
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