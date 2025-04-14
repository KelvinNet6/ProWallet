// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('authToken'); // Remove data from localStorage
    window.location.href = "index.html";
});

// Get DOM elements
const emailNotifs = document.getElementById('email-notifications');
const smsNotifs = document.getElementById('sms-notifications');
const privacyMode = document.getElementById('privacy-mode');
const activityVisibility = document.getElementById('activity-visibility');
const passwordModal = document.getElementById('password-modal');
const closePasswordModal = passwordModal.querySelector('.close');
const passwordForm = document.getElementById('password-form');


// Load user profile
window.addEventListener('load', async () => {
    try {
        const response = await fetch('https://0.0.0.0:5000/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('user-name').textContent = data.name;
            document.getElementById('user-email').textContent = data.email;

            // Load saved settings
            emailNotifs.checked = data.emailNotifications;
            smsNotifs.checked = data.smsNotifications;
            privacyMode.checked = data.privacyMode;
            activityVisibility.checked = data.activityVisibility;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
});

// Profile image upload preview
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');
profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Notification Settings
emailNotifs.addEventListener('change', async (e) => {
    await updateNotificationSettings('email', e.target.checked);
});

smsNotifs.addEventListener('change', async (e) => {
    await updateNotificationSettings('sms', e.target.checked);
});

async function updateNotificationSettings(type, enabled) {
    try {
        const response = await fetch('https://0.0.0.0:5000/api/notifications/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ type, enabled })
        });

        if (!response.ok) throw new Error('Failed to update settings');
    } catch (error) {
        console.error('Error updating notification settings:', error);
        alert('Failed to update notification settings');
    }
}

// Privacy Settings
privacyMode.addEventListener('change', (e) => {
    updatePrivacySettings('privacyMode', e.target.checked);
});

activityVisibility.addEventListener('change', (e) => {
    updatePrivacySettings('activityVisibility', e.target.checked);
});

async function updatePrivacySettings(setting, enabled) {
    try {
        const response = await fetch('https://0.0.0.0:5000/api/privacy/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ setting, enabled })
        });

        if (!response.ok) throw new Error('Failed to update privacy settings');
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        alert('Failed to update privacy settings');
    }
}

// Password Change
document.getElementById('change-password-btn').addEventListener('click', () => {
    passwordModal.style.display = 'block';
});

closePasswordModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    try {
        const response = await fetch('https://0.0.0.0:5000/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            alert('Password updated successfully');
            passwordModal.style.display = 'none';
            passwordForm.reset();
        } else {
            alert('Failed to update password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
    }
});

// 2FA Setup
document.getElementById('enable-2fa-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('https://0.0.0.0:5000/api/2fa/setup', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            alert('2FA setup instructions sent to your email');
        } else {
            alert('Failed to setup 2FA');
        }
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        alert('Failed to setup 2FA');
    }
});