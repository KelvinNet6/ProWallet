// Authentication check function
function checkAuth() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.token) {
        window.location.href = 'index.html';
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', checkAuth);