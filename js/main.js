// Main JavaScript File for Wareeth Game
class WareethGame {
    constructor() {
        this.init();
    }
    
    init() {
        this.initializeEventListeners();
        this.initializeTheme();
        this.initializeAnimations();
        this.checkAuth();
    }
    
    initializeEventListeners() {
        // Add event listeners for common functionality
        document.addEventListener('DOMContentLoaded', () => {
            this.onPageLoad();
        });
        
        // Handle navigation active state
        this.updateActiveNavigation();
        
        // Handle responsive navigation
        this.handleResponsiveNav();
    }
    
    initializeTheme() {
        // Apply heritage theme colors
        this.applyThemeColors();
        
        // Handle dark/light mode toggle if available
        this.initializeThemeToggle();
    }
    
    initializeAnimations() {
        // Initialize common animations
        this.initializeScrollAnimations();
        this.initializeHoverEffects();
        this.initializeLoadingAnimations();
    }
    
    checkAuth() {
        // Check if user is authenticated
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentPage = window.location.pathname.split('/').pop();
        
        // Pages that require authentication
        const protectedPages = ['dashboard.html', 'game.html', 'profile.html', 'leaderboard.html', 'result.html'];
        
        if (protectedPages.includes(currentPage) && !isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // Update UI based on auth state
        this.updateAuthUI(isLoggedIn);
    }
    
    updateAuthUI(isLoggedIn) {
        const username = localStorage.getItem('username');
        const authButtons = document.querySelectorAll('[data-auth]');
        
        authButtons.forEach(button => {
            if (isLoggedIn) {
                if (button.dataset.auth === 'login') {
                    button.style.display = 'none';
                } else if (button.dataset.auth === 'logout') {
                    button.style.display = 'block';
                }
            } else {
                if (button.dataset.auth === 'login') {
                    button.style.display = 'block';
                } else if (button.dataset.auth === 'logout') {
                    button.style.display = 'none';
                }
            }
        });
    }
    
    onPageLoad() {
        // Show welcome message for new users
        this.showWelcomeMessage();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize form validation
        this.initializeFormValidation();
        
        // Add loading states to buttons
        this.addLoadingStates();
    }
    
    showWelcomeMessage() {
        const isFirstVisit = !localStorage.getItem('hasVisited');
        if (isFirstVisit && window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                this.showAlert('مرحباً بك في لعبة وريث! اختبر معرفتك بالتراث السعودي.', 'info');
                localStorage.setItem('hasVisited', 'true');
            }, 2000);
        }
    }
    
    updateActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    handleResponsiveNav() {
        // Handle mobile navigation
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                    navbarCollapse.classList.remove('show');
                }
            });
        }
    }
    
    applyThemeColors() {
        // Apply CSS variables dynamically if needed
        const root = document.documentElement;
        
        // Theme colors are already set in CSS, but can be modified here
        // root.style.setProperty('--primary-color', '#B8743B');
    }
    
    initializeThemeToggle() {
        // If theme toggle is implemented
        const themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
            });
        }
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
    
    initializeScrollAnimations() {
        // Initialize Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Observe elements with scroll animation class
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }
    
    initializeHoverEffects() {
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .card, .stat-card, .action-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0)';
            });
        });
    }
    
    initializeLoadingAnimations() {
        // Add loading animations to buttons with loading state
        const loadingButtons = document.querySelectorAll('[data-loading]');
        
        loadingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري التحميل...';
                button.disabled = true;
                
                // Simulate loading completion
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            });
        });
    }
    
    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    initializeFormValidation() {
        // Add form validation to all forms
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });
    }
    
    addLoadingStates() {
        // Add loading states to all buttons
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            if (!button.hasAttribute('data-no-loading')) {
                button.addEventListener('click', function() {
                    if (!this.disabled && !this.classList.contains('no-loading')) {
                        const originalContent = this.innerHTML;
                        
                        // Add loading spinner
                        if (this.innerHTML.includes('fa-spinner')) return;
                        
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        this.disabled = true;
                        
                        // Restore after a short delay if no action was taken
                        setTimeout(() => {
                            if (this.innerHTML.includes('fa-spinner')) {
                                this.innerHTML = originalContent;
                                this.disabled = false;
                            }
                        }, 3000);
                    }
                });
            }
        });
    }
    
    // Utility functions
    showAlert(message, type = 'info') {
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
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    formatDate(date) {
        return new Intl.DateTimeFormat('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `منذ ${days} يوم${days > 1 ? '' : ''}`;
        } else if (hours > 0) {
            return `منذ ${hours} ساعة${hours > 1 ? '' : ''}`;
        } else if (minutes > 0) {
            return `منذ ${minutes} دقيقة${minutes > 1 ? '' : ''}`;
        } else {
            returnالآن';
        }
    }
    
    shareContent(title, text, url) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(text + ' ' + url).then(() => {
                this.showAlert('تم النسخ إلى الحافظة', 'success');
            });
        }
    }
}

// Initialize the game
const wareethGame = new WareethGame();

// Make utilities globally available
window.wareethGame = wareethGame;
window.showAlert = (message, type) => wareethGame.showAlert(message, type);
window.formatNumber = (num) => wareethGame.formatNumber(num);
window.formatDate = (date) => wareethGame.formatDate(date);
window.getTimeAgo = (date) => wareethGame.getTimeAgo(date);
window.shareContent = (title, text, url) => wareethGame.shareContent(title, text, url);

// Global functions for common actions
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

function goHome() {
    window.location.href = 'dashboard.html';
}

function refreshPage() {
    window.location.reload();
}

// Make global functions available
window.logout = logout;
window.goHome = goHome;
window.refreshPage = refreshPage;