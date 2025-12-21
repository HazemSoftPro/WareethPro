// Leaderboard Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboardData();
    initializeFilters();
    initializeAnimations();
});

function loadLeaderboardData() {
    // Get leaderboard data
    const leaderboardData = getLeaderboardData();
    
    // Update top 3 players
    updateTopPlayers(leaderboardData.slice(0, 3));
    
    // Update rest of leaderboard
    updateLeaderboardTable(leaderboardData.slice(3));
    
    // Highlight current user
    highlightCurrentUser();
}

function getLeaderboardData() {
    // Sample leaderboard data (in real app, this would come from API)
    return [
        { rank: 1, name: 'Mohammed Al Saud', score: 2850, level: 'محترف', games: 186, percentage: 92, trend: 'up' },
        { rank: 2, name: 'sarah Abdulrahman', score: 2450, level: 'محترف', games: 145, percentage: 88, trend: 'stable' },
        { rank: 3, name: 'Fahad Al Qasimi', score: 2100, level: 'متقدم', games: 123, percentage: 85, trend: 'down' },
        { rank: 4, name: 'Nora Al Ahmed', score: 1950, level: 'متقدم', games: 98, percentage: 82, trend: 'up' },
        { rank: 5, name: 'Khalid Omar', score: 1820, level: 'متقدم', games: 87, percentage: 78, trend: 'stable' },
        { rank: 6, name: 'Hind Al Rashid', score: 1680, level: 'متوسط', games: 76, percentage: 75, trend: 'up' },
        { rank: 7, name: 'Abdullah Al Turki', score: 1550, level: 'متوسط', games: 65, percentage: 72, trend: 'down' },
        { rank: 8, name: 'Aisha Al Mansour', score: 1420, level: 'متوسط', games: 54, percentage: 68, trend: 'up' },
        { rank: 9, name: 'Sultan Al Faisal', score: 1350, level: 'متوسط', games: 48, percentage: 65, trend: 'stable' },
        { rank: 10, name: 'Layla Al Ghamdi', score: 1280, level: 'متوسط', games: 42, percentage: 62, trend: 'up' },
        { rank: 11, name: 'Omar Al Harbi', score: 1260, level: 'متوسط', games: 38, percentage: 60, trend: 'down' },
        { rank: 12, name: 'أحمد محمد', score: 1250, level: 'متوسط', games: 24, percentage: 72, trend: 'up', isCurrentUser: true }
    ];
}

function updateTopPlayers(topPlayers) {
    const topPlayersContainer = document.querySelector('.top-players');
    if (!topPlayersContainer) return;
    
    const positions = ['second', 'first', 'third'];
    const medals = ['#C0C0C0', '#FFD700', '#CD7F32'];
    
    topPlayersContainer.innerHTML = topPlayers.map((player, index) => {
        const position = positions[index];
        const medalColor = medals[index];
        const medalNumber = index + 1;
        
        return `
            <div class="podium-card ${position}">
                <div class="podium-medal ${position}">
                    <span class="medal-number">${medalNumber}</span>
                </div>
                <div class="podium-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <h3 class="podium-name">${player.name}</h3>
                <div class="podium-score">${player.score.toLocaleString()}</div>
                <div class="podium-level">المستوى: ${player.level}</div>
                <div class="podium-stats">
                    <span><i class="fas fa-gamepad me-1"></i>${player.games} مباراة</span>
                    <span><i class="fas fa-percentage me-1"></i>${player.percentage}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateLeaderboardTable(players) {
    const leaderboardTable = document.querySelector('.leaderboard-table');
    if (!leaderboardTable) return;
    
    const tableHTML = players.map(player => `
        <div class="player-row ${player.isCurrentUser ? 'current-user-row' : ''}">
            <div class="player-rank ${player.rank <= 3 ? 'top-3' : ''}">${player.rank}</div>
            <div class="player-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="player-info">
                <div class="player-name">
                    ${player.isCurrentUser ? '<span class="current-user-badge">أنت</span>' : ''}
                    ${player.name}
                </div>
                <div class="player-level">المستوى: ${player.level}</div>
            </div>
            <div class="player-stats">
                <div class="player-score">${player.score.toLocaleString()}</div>
                <div class="player-games">${player.games} مباراة</div>
                <div class="player-trend trend-${player.trend}">
                    <i class="fas fa-arrow-${player.trend === 'stable' ? 'right' : player.trend}"></i>
                </div>
            </div>
        </div>
    `).join('');
    
    leaderboardTable.innerHTML = tableHTML;
}

function highlightCurrentUser() {
    const currentUsers = document.querySelectorAll('.current-user-row');
    currentUsers.forEach(row => {
        // Smooth scroll to current user after page load
        setTimeout(() => {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            row.style.transition = 'background-color 0.5s ease';
            row.style.backgroundColor = 'rgba(184, 116, 59, 0.2)';
            
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 2000);
        }, 1000);
    });
}

function initializeFilters() {
    // Handle tab switching
    const tabs = document.querySelectorAll('#leaderboardTabs button');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('data-bs-target');
            loadFilteredLeaderboard(target);
        });
    });
}

function loadFilteredLeaderboard(filter) {
    // Show loading state
    const tabContent = document.querySelector(filter);
    if (tabContent) {
        if (filter === '#all-time') {
            // Load full leaderboard
            loadLeaderboardData();
        } else {
            // Show placeholder for other filters
            showFilterPlaceholder(filter);
        }
    }
}

function showFilterPlaceholder(filter) {
    const tabContent = document.querySelector(filter);
    if (!tabContent) return;
    
    const filterNames = {
        '#monthly': 'هذا الشهر',
        '#weekly': 'هذا الأسبوع',
        '#daily': 'اليوم'
    };
    
    const icons = {
        '#monthly': 'fa-calendar-alt',
        '#weekly': 'fa-calendar-week',
        '#daily': 'fa-calendar-day'
    };
    
    const filterName = filterNames[filter] || 'المرشح';
    const icon = icons[filter] || 'fa-filter';
    
    tabContent.innerHTML = `
        <div class="text-center py-5">
            <i class="fas ${icon} fa-4x text-primary mb-3"></i>
            <h3 class="h4 text-primary">نتائج ${filterName}</h3>
            <p class="text-muted">سيتم عرض نتائج ${filterName} هنا</p>
            <button class="btn btn-primary btn-custom mt-3" onclick="load${filterName.replace(' ', '')}Data()">
                <i class="fas fa-download me-2"></i>
                تحميل البيانات
            </button>
        </div>
    `;
}

function initializeAnimations() {
    // Animate podium cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.podium-card').forEach(card => {
        observer.observe(card);
    });
    
    // Animate player rows
    const rowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInRight 0.5s ease-out';
                rowObserver.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.player-row').forEach(row => {
        rowObserver.observe(row);
    });
    
    // Add hover effects
    document.querySelectorAll('.player-row').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(-5px)';
            this.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = '';
        });
    });
}

function refreshLeaderboard() {
    // Show loading state
    showAlert('جاري تحديث لوحة المتصدرين...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        loadLeaderboardData();
        showAlert('تم تحديث لوحة المتصدرين بنجاح', 'success');
    }, 1500);
}

function loadMonthlyData() {
    showAlert('سيتم تحميل بيانات هذا الشهر قريباً', 'info');
}

function loadWeeklyData() {
    showAlert('سيتم تحميل بيانات هذا الأسبوع قريباً', 'info');
}

function loadDailyData() {
    showAlert('سيتم تحميل بيانات اليوم قريباً', 'info');
}

function viewPlayerProfile(playerName) {
    showAlert(`سيتم عرض ملف ${playerName} الشخصي قريباً`, 'info');
}

function shareLeaderboard() {
    const shareText = 'شاهد لوحة المتصدرين في لعبة وريث وتحدى نفسك للوصول إلى القمة!';
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'لوحة المتصدرين - لعبة وريث',
            text: shareText,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText + ' ' + url).then(() => {
            showAlert('تم نسخ رابط لوحة المتصدرين إلى الحافظة', 'success');
        });
    }
}

function exportLeaderboard() {
    showAlert('سيتم تصدير لوحة المتصدرين قريباً', 'info');
}

// Make functions globally available
window.refreshLeaderboard = refreshLeaderboard;
window.loadMonthlyData = loadMonthlyData;
window.loadWeeklyData = loadWeeklyData;
window.loadDailyData = loadDailyData;
window.viewPlayerProfile = viewPlayerProfile;
window.shareLeaderboard = shareLeaderboard;
window.exportLeaderboard = exportLeaderboard;

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