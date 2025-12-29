// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    // Form validation
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                showAlert('الرجاء ملء جميع الحقول المطلوبة', 'danger');
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showAlert('البريد الإلكتروني غير صحيح', 'danger');
                return;
            }
            
            // Simulate login (in real app, this would be an API call)
            simulateLogin(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Basic validation
            if (!username || !email || !password || !confirmPassword) {
                showAlert('الرجاء ملء جميع الحقول المطلوبة', 'danger');
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showAlert('البريد الإلكتروني غير صحيح', 'danger');
                return;
            }
            
            // Validate password strength
            if (password.length < 8) {
                showAlert('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'danger');
                return;
            }
            
            // Validate password match
            if (password !== confirmPassword) {
                showAlert('كلمتا المرور غير متطابقتين', 'danger');
                return;
            }
            
            // Check terms acceptance
            if (!terms) {
                showAlert('يجب الموافقة على الشروط والأحكام', 'danger');
                return;
            }
            
            // Simulate registration
            simulateRegistration(username, email, password);
        });
    }
});

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show alert message
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-message position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Simulate login function
function simulateLogin(email, password) {
    // Show loading
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري تسجيل الدخول...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Simulate successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('username', email.split('@')[0]);
        
        showAlert('تم تسجيل الدخول بنجاح', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 2000);
}

// Simulate registration function
function simulateRegistration(username, email, password) {
    // Show loading
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري إنشاء الحساب...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Store user data (in real app, this would be server-side)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({
            id: Date.now(),
            username: username,
            email: email,
            password: btoa(password), // Basic encoding (not secure for real apps)
            registrationDate: new Date().toISOString(),
            level: 'مبتدئ',
            totalScore: 0,
            gamesPlayed: 0
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        showAlert('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...', 'success');
        
        // Auto login and redirect
        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 2000);
}

// Check authentication on page load
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require authentication
    const protectedPages = ['dashboard.html', 'game.html', 'profile.html', 'leaderboard.html', 'result.html'];
    
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        window.location.href = 'login.html';
    }
    
    // Redirect authenticated users from login/register to dashboard
    if ((currentPage === 'login.html' || currentPage === 'register.html') && isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Run authentication check
checkAuth();