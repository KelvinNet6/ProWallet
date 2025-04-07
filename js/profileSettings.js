
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
