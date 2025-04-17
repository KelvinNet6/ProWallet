
// Get user data and API configuration from localStorage
const userData = JSON.parse(localStorage.getItem('userData'));
const apiBaseUrl = 'https://0.0.0.0:44323/api/epaywallet';

// Function to initialize profile page
async function initializeProfile() {
    // Check authentication only once
    if (!userData || !userData.token) {
        window.location.href = 'index.html';
        return;
    }
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = userData.fullName;
    document.getElementById('user-email').textContent = userData.email;

    // Fetch and display the saved profile image
    try {
        const response = await fetch(`${apiBaseUrl}/account/profile-image/${userData.userId}`, {
            headers: {
                "Authorization": `Bearer ${userData.token}`
            }
        });
        
        if (response.ok) {
            const imageData = await response.json();
            if (imageData.imageUrl) {
                document.getElementById('current-profile-img').src = imageData.imageUrl;
            }
        }
    } catch (error) {
        console.error('Error fetching profile image:', error);
    }
}

// Handle profile image upload
document.getElementById('profile-upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${apiBaseUrl}/account/profile-image/upload`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${userData.token}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('current-profile-img').src = result.imageUrl;
        } else {
            alert('Failed to upload image. Please try again.');
        }
    } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('An error occurred while uploading the image.');
    }
});

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', initializeProfile);

// Password change modal functionality
const passwordModal = document.getElementById('password-modal');
const closeBtn = document.querySelector('.close');
const changePasswordBtn = document.getElementById('change-password-btn');

changePasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

// Handle password form submission
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Add password change logic here
});

// Toggle settings functionality
const toggleSettings = document.querySelectorAll('.toggle-setting input');
toggleSettings.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        // Add settings toggle logic here
    });
});
