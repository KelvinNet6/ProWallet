// Toggle Sidebar for Mobile
document.getElementById("menu-btn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('paySheetAccount'); // Remove data from localStorage
    window.location.href = "index.html";
});
// Get DOM elements
const editProfileBtn = document.getElementById('edit-profile-btn');
const profilePopup = document.getElementById('profile-popup');
const closeProfilePopup = document.getElementById('close-profile-popup');
const passwordPopup = document.getElementById('password-popup');
const closePasswordPopup = document.getElementById('close-password-popup');
const changePasswordBtn = document.getElementById('change-password-btn');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const profilePreview = document.getElementById('profile-preview');
const profileUpload = document.getElementById('profile-upload');

// Load user data
const userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'User Name',
    email: 'user@email.com',
    profileImage: 'Screenshot 2025-02-06 14.53.13.png'
};

// Initialize user data display
document.getElementById('user-name').textContent = userData.name;
document.getElementById('user-email').textContent = userData.email;
document.getElementById('current-profile-img').src = userData.profileImage;

// Profile image upload preview
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

// Toggle popups
editProfileBtn.addEventListener('click', () => {
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-email').value = userData.email;
    profilePreview.src = userData.profileImage;
    profilePopup.style.display = 'flex';
});

closeProfilePopup.addEventListener('click', () => {
    profilePopup.style.display = 'none';
});

changePasswordBtn.addEventListener('click', () => {
    passwordPopup.style.display = 'flex';
});

closePasswordPopup.addEventListener('click', () => {
    passwordPopup.style.display = 'none';
});

// Handle profile form submission
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    userData.name = document.getElementById('edit-name').value;
    userData.email = document.getElementById('edit-email').value;
    
    if (profilePreview.src) {
        userData.profileImage = profilePreview.src;
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update display
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('current-profile-img').src = userData.profileImage;
    
    profilePopup.style.display = 'none';
});

// Handle password form submission
passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'New passwords do not match!';
        return;
    }
    
    // Here you would typically validate current password with backend
    // For demo, we'll just simulate success
    localStorage.setItem('password', newPassword);
    errorDiv.textContent = '';
    passwordPopup.style.display = 'none';
    alert('Password updated successfully!');
});

// Handle toggles
document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        const setting = e.target.id;
        localStorage.setItem(setting, e.target.checked);
    });
    
    // Load saved toggle states
    const savedState = localStorage.getItem(toggle.id);
    if (savedState !== null) {
        toggle.checked = savedState === 'true';
    }
});

// Handle language and timezone selection
document.getElementById('language').addEventListener('change', (e) => {
    localStorage.setItem('language', e.target.value);
});

document.getElementById('timezone').addEventListener('change', (e) => {
    localStorage.setItem('timezone', e.target.value);
});

// Load saved selections
const savedLanguage = localStorage.getItem('language');
if (savedLanguage) {
    document.getElementById('language').value = savedLanguage;
}

const savedTimezone = localStorage.getItem('timezone');
if (savedTimezone) {
    document.getElementById('timezone').value = savedTimezone;
}
// 2FA Implementation
document.getElementById('enable-2fa-btn').addEventListener('click', async () => {
    const response = await fetch('https://0.0.0.0:5000/api/2fa/setup', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });
    
    if (response.ok) {
        const data = await response.json();
        // Show QR code or setup instructions
        alert('2FA setup instructions sent to your email');
    }
});

// Notification Settings
const emailNotifs = document.getElementById('email-notifications');
const smsNotifs = document.getElementById('sms-notifications');

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
            body: JSON.stringify({
                type: type,
                enabled: enabled
            })
        });
        
        if (!response.ok) throw new Error('Failed to update settings');
        
        // Save to localStorage for persistence
        localStorage.setItem(`${type}Notifications`, enabled);
    } catch (error) {
        console.error('Error updating notification settings:', error);
        alert('Failed to update notification settings');
    }
}

// Privacy Settings
const privacyMode = document.getElementById('privacy-mode');
const activityVisibility = document.getElementById('activity-visibility');

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
            body: JSON.stringify({
                setting: setting,
                enabled: enabled
            })
        });
        
        if (!response.ok) throw new Error('Failed to update privacy settings');
        
        // Save to localStorage for persistence
        localStorage.setItem(setting, enabled);
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        alert('Failed to update privacy settings');
    }
}

// Load saved settings on page load
window.addEventListener('load', () => {
    emailNotifs.checked = localStorage.getItem('emailNotifications') === 'true';
    smsNotifs.checked = localStorage.getItem('smsNotifications') === 'true';
    privacyMode.checked = localStorage.getItem('privacyMode') === 'true';
    activityVisibility.checked = localStorage.getItem('activityVisibility') === 'true';
});
