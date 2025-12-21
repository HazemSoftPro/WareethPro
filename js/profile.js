// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadUserStats();
    loadAchievements();
    loadGameHistory();
    initializeAnimations();
});

function loadUserData() {
    // Get user data from localStorage
    const username = localStorage.getItem('username') || 'أحمد محمد';
    const email = localStorage.getItem('userEmail') || 'ahmed.mohammed@email.com';
    
    // Update profile info
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    
    if (profileName) profileName.textContent = username;
    if (profileEmail) profileEmail.textContent = email;
    
    // Update level badge
    const userLevel = getUserLevel();
    const levelBadge = document.querySelector('.profile-level');
    if (levelBadge) levelBadge.textContent = userLevel;
}

function loadUserStats() {
    // Get user statistics
    const stats = getUserStatistics();
    
    // Update stat cards
    updateStatCard('stat-games', stats.gamesPlayed);
    updateStatCard('stat-best', stats.bestScore + '%');
    updateStatCard('stat-total', stats.totalScore);
    updateStatCard('stat-average', stats.averageScore + '%');
    
    // Update progress bars
    updateProgressBars(stats);
}

function updateStatCard(id, value) {
    const statCard = document.querySelector(`[data-stat="${id}"]`);
    if (statCard) {
        statCard.textContent = value;
    }
}

function getUserStatistics() {
    // Get games from localStorage
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    
    const stats = {
        gamesPlayed: games.length || 24,
        bestScore: 0,
        totalScore: 1250,
        averageScore: 0,
        correctAnswers: 0,
        totalQuestions: 0
    };
    
    // Calculate statistics from games
    if (games.length > 0) {
        stats.bestScore = Math.max(...games.map(g => g.percentage));
        stats.totalScore = games.reduce((sum, g) => sum + g.score, 0);
        stats.averageScore = Math.round(games.reduce((sum, g) => sum + g.percentage, 0) / games.length);
        stats.correctAnswers = games.reduce((sum, g) => sum + g.correctAnswers, 0);
        stats.totalQuestions = games.reduce((sum, g) => sum + g.totalQuestions, 0);
    }
    
    return stats;
}

function updateProgressBars(stats) {
    // Level progress
    const levelProgress = document.querySelector('.progress-fill');
    const currentPoints = stats.totalScore;
    const maxPoints = getNextLevelPoints(currentPoints);
    const progressPercentage = (currentPoints / maxPoints) * 100;
    
    if (levelProgress) {
        levelProgress.style.width = `${progressPercentage}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.progress-label span:last-child');
    if (progressText) {
        progressText.textContent = `${currentPoints} / ${maxPoints} نقطة`;
    }
    
    // Correct answers progress
    const correctProgress = document.querySelectorAll('.progress-fill')[1];
    if (correctProgress && stats.totalQuestions > 0) {
        const correctPercentage = (stats.correctAnswers / stats.totalQuestions) * 100;
        correctProgress.style.width = `${correctPercentage}%`;
    }
    
    // Achievements progress
    const achievementProgress = document.querySelectorAll('.progress-fill')[2];
    if (achievementProgress) {
        const achievements = getUserAchievements();
        const achievementPercentage = (achievements.unlocked / achievements.total) * 100;
        achievementProgress.style.width = `${achievementPercentage}%`;
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

function getNextLevelPoints(currentPoints) {
    if (currentPoints >= 2000) return 3000;
    if (currentPoints >= 1000) return 2000;
    if (currentPoints >= 500) return 1000;
    return 500;
}

function loadAchievements() {
    const achievements = [
        { id: 1, name: 'الفوز الأول', desc: 'أكمل أول لعبة', icon: 'fa-trophy', unlocked: true },
        { id: 2, name: 'سلسلة انتصارات', desc: '5 انتصارات متتالية', icon: 'fa-fire', unlocked: true },
        { id: 3, name: 'لاعب سريع', desc: 'أجب على 10 أسئلة في دقيقة', icon: 'fa-bolt', unlocked: true },
        { id: 4, name: 'مثالي', desc: '100% في مباراة', icon: 'fa-star', unlocked: true },
        { id: 5, name: 'خبير تراث', desc: '100 سؤال صحيح', icon: 'fa-brain', unlocked: true },
        { id: 6, name: 'بطل الأبطال', desc: 'أفضل 10 لاعبين', icon: 'fa-crown', unlocked: false },
        { id: 7, name: 'صاروخ', desc: 'مستوى محترف في أسبوع', icon: 'fa-rocket', unlocked: false },
        { id: 8, name: 'محب التراث', desc: '50 مباراة', icon: 'fa-heart', unlocked: false }
    ];
    
    const achievementGrid = document.querySelector('.achievement-grid');
    if (achievementGrid) {
        achievementGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 onclick="showAchievementDetails(${achievement.id})">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `).join('');
    }
}

function getUserAchievements() {
    const achievements = loadAchievements();
    const unlocked = achievements.filter(a => a.unlocked).length;
    return {
        unlocked: unlocked,
        total: achievements.length
    };
}

function loadGameHistory() {
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    
    // Get last 5 games
    const recentGames = games.slice(-5).reverse();
    
    const gameHistory = document.querySelector('.game-history');
    if (gameHistory) {
        if (recentGames.length === 0) {
            // Show sample data if no games
            gameHistory.innerHTML = `
                <div class="game-history-item">
                    <div>
                        <strong>مستوى متوسط</strong>
                        <br>
                        <small class="text-muted">85 نقطة</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-success">85%</span>
                        <br>
                        <small class="text-muted">منذ 2 ساعة</small>
                    </div>
                </div>
                <div class="game-history-item">
                    <div>
                        <strong>مستوى سهل</strong>
                        <br>
                        <small class="text-muted">90 نقطة</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-success">90%</span>
                        <br>
                        <small class="text-muted">منذ يوم</small>
                    </div>
                </div>
                <div class="game-history-item">
                    <div>
                        <strong>مستوى صعب</strong>
                        <br>
                        <small class="text-muted">65 نقطة</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-warning">65%</span>
                        <br>
                        <small class="text-muted">منذ يومين</small>
                    </div>
                </div>
            `;
        } else {
            gameHistory.innerHTML = recentGames.map(game => {
                const date = new Date(game.date);
                const timeAgo = getTimeAgo(date);
                const badgeClass = game.percentage >= 80 ? 'success' : game.percentage >= 60 ? 'warning' : 'danger';
                
                return `
                    <div class="game-history-item">
                        <div>
                            <strong>مستوى ${game.difficulty || 'متوسط'}</strong>
                            <br>
                            <small class="text-muted">${game.score} نقطة</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${badgeClass}">${game.percentage}%</span>
                            <br>
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                    </div>
                `;
            }).join('');
        }
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

function initializeAnimations() {
    // Animate stat cards on scroll
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
    
    // Add hover effects
    document.querySelectorAll('.achievement-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function showAchievementDetails(achievementId) {
    // Show achievement details modal
    showAlert('تفاصيل الإنجاز سيتم عرضها قريباً', 'info');
}

function editProfile() {
    showAlert('تحرير الملف الشخصي سيكون متاحاً قريباً', 'info');
}

function shareProfile() {
    const username = localStorage.getItem('username') || 'أحمد محمد';
    const shareText = `انضم إلى لعبة وريث وتحداني! أنا ${username} وقد حققت ${getUserStatistics().totalScore} نقطة.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'ملفي الشخصي في لعبة وريث',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
            showAlert('تم نسخ رابط الملف الشخصي إلى الحافظة', 'success');
        });
    }
}

// Make functions globally available
window.showAchievementDetails = showAchievementDetails;
window.editProfile = editProfile;
window.shareProfile = shareProfile;

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