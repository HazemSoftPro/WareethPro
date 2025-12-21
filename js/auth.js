/**
 * Updated Authentication JavaScript with API Integration
 * مصادقة جافاسكريبت محددة مع تكامل الـ API
 */

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
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login with API
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    // Basic validation
    if (!email || !password) {
        wareethAPI.showAlert('الرجاء ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        wareethAPI.showAlert('البريد الإلكتروني غير صحيح', 'danger');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    wareethAPI.showLoading(submitBtn, 'جاري تسجيل الدخول...');
    
    try {
        // Call API
        const response = await wareethAPI.login({ email, password });
        
        if (response.success) {
            wareethAPI.showAlert('تم تسجيل الدخول بنجاح', 'success');
            
            // Store minimal info in localStorage for UI purposes
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userEmail', response.data.email);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            wareethAPI.showAlert(response.message, 'danger');
        }
    } catch (error) {
        waretherAPI.handleAPIError(error, 'فشل تسجيل الدخول');
    } finally {
        wareethAPI.hideLoading(submitBtn, originalText);
    }
}

// Handle registration with API
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
        wareethAPI.showAlert('الرجاء ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        wareethAPI.showAlert('البريد الإلكتروني غير صحيح', 'danger');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        wareethAPI.showAlert('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'danger');
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        wareethAPI.showAlert('كلمتا المرور غير متطابقتين', 'danger');
        return;
    }
    
    // Check terms acceptance
    if (!terms) {
        warethAPI.showAlert('يجب الموافقة على الشروط والأحكام', 'danger');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    wareethAPI.showLoading(submitBtn, 'جاري إنشاء الحساب...');
    
    try {
        // Call API
        const response = await wareethAPI.register({
            username,
            email,
            password
        });
        
        if (response.success) {
            warethAPI.showAlert('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...', 'success');
            
            // Store minimal info in localStorage for UI purposes
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userEmail', response.data.email);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            warethAPI.showAlert(response.message, 'danger');
        }
    } catch (error) {
        warethAPI.handleAPIError(error, 'فشل إنشاء الحساب');
    } finally {
        wareethAPI.hideLoading(submitBtn, originalText);
    }
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Check authentication on page load
async function checkAuth() {
    try {
        const response = await warethAPI.checkAuth();
        
        if (response.success) {
            // Update localStorage with fresh data
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('userEmail', response.data.email);
            return true;
        } else {
            // Clear local session if server says not authenticated
            warethAPI.clearLocalSession();
            return false;
        }
    } catch (error) {
        // If API call fails, check localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        return isLoggedIn === 'true';
    }
}

// Logout function
async function logout() {
    try {
        await warethAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Always clear local session
    warethAPI.clearLocalSession();
    window.location.href = 'index.html';
}

// Run authentication check
checkAuth().then(isAuthenticated => {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'game.html', 'profile.html', 'leaderboard.html', 'result.html', 'multiplayer.html', 'multiplayer-game.html'];
    
    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'login.html';
    }
    
    // Redirect authenticated users from login/register to dashboard
    if ((currentPage === 'login.html' || currentPage === 'register.html') && isAuthenticated) {
        window.location.href = 'dashboard.html';
    }
});