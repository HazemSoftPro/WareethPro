// Dashboard Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadUserStats();
    loadRecentActivity();
    initializeAnimations();
    initializeQuickActions();
});

function loadUserData() {
    // Get user data from localStorage
    const username = localStorage.getItem('username') || 'أحمد محمد';
    const userLevel = getUserLevel();
    
    // Update welcome message
    const welcomeTitle = document.querySelector('.welcome-section h1');
    if (welcomeTitle) {
        welcomeTitle.textContent = `مرحباً بك يا ${username}`;
    }
    
    // Update user level
    const levelElements = document.querySelectorAll('[data-level]');
    levelElements.forEach(element => {
        element.textContent = userLevel;
    });
    
    // Update navigation user dropdown
    const userDropdown = document.querySelector('.navbar-nav .dropdown-toggle');
    if (userDropdown) {
        userDropdown.innerHTML = `<i class="fas fa-user-circle me-1"></i>${username}`;
    }
}

function loadUserStats() {
    // Get user statistics
    const stats = getUserStatistics();
    
    // Update stat cards
    updateStatCards(stats);
    
    // Update progress bar
    updateProgressBar(stats);
    
    // Update activity stats
    updateActivityStats(stats);
}

function getUserStatistics() {
    // Get games from localStorage
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    
    const stats = {
        gamesPlayed: games.length || 24,
        bestScore: 85,
        totalScore: 1250,
        currentScore: 650,
        maxScore: 1000,
        averageScore: 72,
        rank: 12,
        totalPlayers: 156
    };
    
    // Calculate real statistics from games if available
    if (games.length > 0) {
        stats.bestScore = Math.max(...games.map(g => g.percentage));
        stats.totalScore = games.reduce((sum, g) => sum + g.score, 0);
        stats.averageScore = Math.round(games.reduce((sum, g) => sum + g.percentage, 0) / games.length);
        stats.gamesPlayed = games.length;
    }
    
    return stats;
}

function updateStatCards(stats) {
    // Update individual stat cards
    const statCards = [
        { selector: '[data-stat="games"]', value: stats.gamesPlayed },
        { selector: '[data-stat="best"]', value: stats.bestScore + '%' },
        { selector: '[data-stat="total"]', value: stats.totalScore },
        { selector: '[data-stat="rank"]', value: '#' + stats.rank }
    ];
    
    statCards.forEach(card => {
        const element = document.querySelector(card.selector);
        if (element) {
            element.textContent = card.value;
        }
    });
}

function updateProgressBar(stats) {
    const progressBar = document.querySelector('[data-progress="level"]');
    if (progressBar) {
        const percentage = (stats.currentScore / stats.maxScore) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('[data-progress-text="level"]');
    if (progressText) {
        progressText.textContent = `${stats.currentScore} / ${stats.maxScore} نقطة`;
    }
}

function updateActivityStats(stats) {
    // Update rank info
    const rankInfo = document.querySelector('[data-rank-info]');
    if (rankInfo) {
        rankInfo.textContent = `من بين ${stats.totalPlayers} لاعب`;
    }
    
    // Update last game info
    const lastGameInfo = document.querySelector('[data-last-game]');
    if (lastGameInfo) {
        lastGameInfo.textContent = 'منذ 2 ساعة';
    }
}

function loadRecentActivity() {
    // Get recent games
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    const recentGames = games.slice(-3).reverse();
    
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    if (recentGames.length === 0) {
        // Show sample activity
        activityList.innerHTML = `
            <div class="activity-item d-flex align-items-center mb-3 p-3 bg-light rounded">
                <div class="activity-icon me-3">
                    <i class="fas fa-trophy text-warning fa-2x"></i>
                </div>
                <div class="activity-content flex-grow-1">
                    <h6 class="mb-1">لعبة مكتملة - مستوى متوسط</h6>
                    <p class="text-muted mb-0">حققت 75 نقطة من 100</p>
                </div>
                <div class="activity-time">
                    <small class="text-muted">منذ 2 ساعة</small>
                </div>
            </div>
            <div class="activity-item d-flex align-items-center mb-3 p-3 bg-light rounded">
                <div class="activity-icon me-3">
                    <i class="fas fa-star text-primary fa-2x"></i>
                </div>
                <div class="activity-content flex-grow-1">
                    <h6 class="mb-1">مستوى جديد مفتوح</h6>
                    <p class="text-muted mb-0">متوسط - فتحت المستوى الجديد</p>
                </div>
                <div class="activity-time">
                    <small class="text-muted">منذ يوم</small>
                </div>
            </div>
            <div class="activity-item d-flex align-items-center mb-0 p-3 bg-light rounded">
                <div class="activity-icon me-3">
                    <i class="fas fa-medal text-success fa-2x"></i>
                </div>
                <div class="activity-content flex-grow-1">
                    <h6 class="mb-1">إنجاز جديد</h6>
                    <p class="text-muted mb-0">لاعب نشط - أكملت 20 مباراة</p>
                </div>
                <div class="activity-time">
                    <small class="text-muted">منذ 3 أيام</small>
                </div>
            </div>
        `;
    } else {
        activityList.innerHTML = recentGames.map((game, index) => {
            const date = new Date(game.date);
            const timeAgo = getTimeAgo(date);
            const icon = index === 0 ? 'fa-trophy text-warning' : 
                        index === 1 ? 'fa-star text-primary' : 'fa-medal text-success';
            const title = index === 0 ? 'لعبة مكتملة' : 
                         index === 1 ? 'مستوى جديد مفتوح' : 'إنجاز جديد';
            const description = index === 0 ? `حققت ${game.score} نقطة من 100` : 
                               index === 1 ? 'متوسط - فتحت المستوى الجديد' : 'لاعب نشط - أكملت 20 مباراة';
            
            return `
                <div class="activity-item d-flex align-items-center mb-3 p-3 bg-light rounded">
                    <div class="activity-icon me-3">
                        <i class="fas ${icon} fa-2x"></i>
                    </div>
                    <div class="activity-content flex-grow-1">
                        <h6 class="mb-1">${title}</h6>
                        <p class="text-muted mb-0">${description}</p>
                    </div>
                    <div class="activity-time">
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `منذ ${days} يوم${days > 1 ? '' : ''}`;
    } else if (hours > 0) {
        return `منذ ${hours} ساعة${hours > 1 ? '' : ''}`;
    } else {
        return 'منذ أقل من ساعة';
    }
}

function getUserLevel() {
    const stats = getUserStatistics();
    const points = stats.totalScore;
    
    if (points >= 2000) return 'محترف';
    if (points >= 1000) return 'متقدم';
    if (points >= 500) return 'متوسط';
    return 'مبتدئ';
}

function initializeAnimations() {
    // Animate stat cards on page load
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
    
    // Animate action cards
    document.querySelectorAll('.action-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out';
        }, index * 100);
    });
    
    // Add hover effects
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeQuickActions() {
    // Add click handlers to action buttons
    const quickPlayBtn = document.querySelector('[data-action="quick-play"]');
    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', function() {
            startQuickGame();
        });
    }
    
    const leaderboardBtn = document.querySelector('[data-action="leaderboard"]');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            window.location.href = 'leaderboard.html';
        });
    }
    
    const profileBtn = document.querySelector('[data-action="profile"]');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
}

function startQuickGame() {
    // Show loading state
    showAlert('جاري تحضير اللعبة...', 'info');
    
    // Simulate game preparation
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 1000);
}

function refreshDashboard() {
    showAlert('جاري تحديث لوحة التحكم...', 'info');
    
    setTimeout(() => {
        loadUserData();
        loadUserStats();
        loadRecentActivity();
        showAlert('تم تحديث لوحة التحكم بنجاح', 'success');
    }, 1500);
}

function showNotifications() {
    const notifications = [
        { title: 'إنجاز جديد', message: 'لقد حققت إنجاز "لاعب نشط"', time: 'منذ ساعة', read: false },
        { title: 'تحدي جديد', message: 'صديقك طارق تحداك في لعبة جديدة', time: 'منذ 3 ساعات', read: false },
        { title: 'مستوى جديد', message: 'مبارك! لقد وصلت إلى المستوى المتوسط', time: 'منذ يوم', read: true }
    ];
    
    // Show notifications modal (placeholder)
    showAlert(`لديك ${notifications.filter(n => !n.read).length} إشعارات غير مقروءة`, 'info');
}

function showSettings() {
    showAlert('الإعدادات ستكون متاحة قريباً', 'info');
}

function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

// Make functions globally available
window.startQuickGame = startQuickGame;
window.refreshDashboard = refreshDashboard;
window.showNotifications = showNotifications;
window.showSettings = showSettings;
window.logout = logout;

// Helper function to show alerts
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}