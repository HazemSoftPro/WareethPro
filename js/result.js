// Result Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadGameResults();
    initializeAnimations();
    updateUI();
});

function loadGameResults() {
    // Get game data from localStorage
    const gameData = JSON.parse(localStorage.getItem('lastGame') || '{}');
    
    if (!gameData.score) {
        // If no game data, show default values
        gameData.score = 85;
        gameData.totalQuestions = 10;
        gameData.correctAnswers = 8;
        gameData.wrongAnswers = 2;
        gameData.percentage = 85;
        gameData.time = '4:32';
        gameData.pointsEarned = '+85';
    }
    
    // Update UI with game data
    document.getElementById('scoreNumber').textContent = gameData.score;
    document.getElementById('correctAnswers').textContent = gameData.correctAnswers;
    document.getElementById('wrongAnswers').textContent = gameData.wrongAnswers;
    document.getElementById('totalTime').textContent = gameData.time || '4:32';
    document.getElementById('pointsEarned').textContent = gameData.pointsEarned || `+${gameData.score}`;
    
    // Update percentage in score circle
    const percentageElement = document.querySelector('.score-percentage');
    if (percentageElement) {
        percentageElement.textContent = `${gameData.percentage}%`;
    }
    
    // Update message based on performance
    updateResultMessage(gameData.percentage);
    
    // Update rating stars
    updateRatingStars(gameData.percentage);
    
    // Update achievements
    updateAchievements(gameData);
}

function updateResultMessage(percentage) {
    const resultTitle = document.querySelector('.result-title');
    const resultDescription = document.querySelector('.result-description');
    
    let title, description;
    
    if (percentage >= 90) {
        title = 'أداء أسطوري!';
        description = 'أنت حقاً خبير في التراث السعودي! أداء مذهل يستحق التقدير.';
    } else if (percentage >= 80) {
        title = 'أداء رائع!';
        description = 'لقد أثبتت معرفة ممتازة بالتراث السعودي. استمر في التطور والتعلم!';
    } else if (percentage >= 70) {
        title = 'أداء جيد جداً!';
        description = 'معرفتك بالتراث السعودي جيدة جداً. مع القليل من الممارسة ستصبح خبيراً!';
    } else if (percentage >= 60) {
        title = 'أداء جيد!';
        description = 'بداية ممتازة! استمر في التعلم وستحقق نتائج أفضل في المرات القادمة.';
    } else {
        title = 'استمر في المحاولة!';
        description = 'التعلم رحلة مستمرة. استمر في اللعب وستتحسن نتائجك بالتأكيد!';
    }
    
    if (resultTitle) resultTitle.textContent = title;
    if (resultDescription) resultDescription.textContent = description;
}

function updateRatingStars(percentage) {
    const ratingStars = document.getElementById('ratingStars');
    const ratingText = document.querySelector('.rating-text');
    
    let stars = '';
    let text = '';
    
    if (percentage >= 90) {
        stars = '<i class="fas fa-star"></i>'.repeat(5);
        text = 'أسطوري - مستوى الخبراء';
    } else if (percentage >= 80) {
        stars = '<i class="fas fa-star"></i>'.repeat(4) + '<i class="fas fa-star-half-alt"></i>';
        text = 'ممتاز - قريب من الاحتراف';
    } else if (percentage >= 70) {
        stars = '<i class="fas fa-star"></i>'.repeat(4) + '<i class="far fa-star"></i>';
        text = 'جيد جداً - مستوى متقدم';
    } else if (percentage >= 60) {
        stars = '<i class="fas fa-star"></i>'.repeat(3) + '<i class="far fa-star"></i>'.repeat(2);
        text = 'جيد - مستوى متوسط';
    } else if (percentage >= 50) {
        stars = '<i class="fas fa-star"></i>'.repeat(2) + '<i class="far fa-star"></i>'.repeat(3);
        text = 'مقبول - مستوى مبتدئ';
    } else {
        stars = '<i class="fas fa-star"></i>' + '<i class="far fa-star"></i>'.repeat(4);
        text = 'مبتدئ - بحاجة للممارسة';
    }
    
    if (ratingStars) ratingStars.innerHTML = stars;
    if (ratingText) ratingText.textContent = text;
}

function updateAchievements(gameData) {
    const achievements = [];
    
    // Check for various achievements
    if (gameData.percentage >= 80) {
        achievements.push({
            icon: 'fa-fire',
            text: 'سلسلة انتصارات (5)'
        });
    }
    
    if (gameData.time && parseInt(gameData.time.split(':')[0]) < 5) {
        achievements.push({
            icon: 'fa-bolt',
            text: 'لاعب سريع'
        });
    }
    
    if (gameData.correctAnswers >= 8) {
        achievements.push({
            icon: 'fa-brain',
            text: 'خبير تراث'
        });
    }
    
    if (gameData.percentage === 100) {
        achievements.push({
            icon: 'fa-star',
            text: 'مثالي'
        });
    }
    
    // Update achievement badges
    const achievementBadges = document.querySelector('.achievement-badges');
    if (achievementBadges) {
        achievementBadges.innerHTML = achievements.map(achievement => `
            <div class="achievement-badge">
                <i class="fas ${achievement.icon} me-2"></i>
                ${achievement.text}
            </div>
        `).join('');
    }
}

function initializeAnimations() {
    // Create confetti effect for high scores
    const gameData = JSON.parse(localStorage.getItem('lastGame') || '{}');
    
    if (gameData.percentage >= 80) {
        createConfetti();
    }
    
    // Animate score number
    animateScore();
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#B8743B', '#8D5F3B', '#A5434B', '#FFD700', '#FFA500'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 100);
    }
}

function animateScore() {
    const scoreElement = document.getElementById('scoreNumber');
    const targetScore = parseInt(scoreElement.textContent);
    let currentScore = 0;
    const increment = Math.ceil(targetScore / 50);
    
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }
        scoreElement.textContent = currentScore;
    }, 30);
}

function updateUI() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });
}

// Action functions
function playAgain() {
    window.location.href = 'game.html';
}

function reviewAnswers() {
    // Show answers review modal or navigate to review page
    showAlert('سيتم عرض مراجعة الإجابات قريباً', 'info');
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goHome() {
    window.location.href = 'dashboard.html';
}

function shareResult() {
    const gameData = JSON.parse(localStorage.getItem('lastGame') || '{}');
    const shareText = `لقد حققت ${gameData.score} نقطة (${gameData.percentage}%) في لعبة وريث! اختر معرفتك بالتراث السعودي.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجتي في لعبة وريث',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
            showAlert('تم نسخ النتيجة إلى الحافظة', 'success');
        });
    }
}

function shareOnSocial(platform) {
    const gameData = JSON.parse(localStorage.getItem('lastGame') || '{}');
    const shareText = `لقد حققت ${gameData.score} نقطة (${gameData.percentage}%) في لعبة وريث!`;
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${url}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`;
            break;
        case 'instagram':
            showAlert('مشاركة على إنستغرام تتطلب تطبيق الهاتف المحمول', 'info');
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Make functions globally available
window.playAgain = playAgain;
window.reviewAnswers = reviewAnswers;
window.goToDashboard = goToDashboard;
window.goHome = goHome;
window.shareResult = shareResult;
window.shareOnSocial = shareOnSocial;

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