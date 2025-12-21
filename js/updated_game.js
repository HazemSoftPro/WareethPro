/**
 * Updated Game JavaScript with API Integration
 * لعبة جافاسكريبت محددة مع تكامل الـ API
 */

class Game {
    constructor() {
        this.currentQuestion = 0;
        this.questions = [];
        this.score = 0;
        this.timeLeft = 30;
        this.timerInterval = null;
        this.selectedAnswer = null;
        this.hints = {
            '5050': 3,
            'skip': 1,
            'audience': 2
        };
        this.answers = [];
        this.gameSession = null;
        this.questionStartTime = null;
        
        this.init();
    }

    async init() {
        try {
            // Start game session
            await this.startGameSession();
            
            // Load first question
            this.loadQuestion();
            this.startTimer();
            this.updateUI();
        } catch (error) {
            console.error('Game initialization error:', error);
            wareethAPI.showAlert('فشل بدء اللعبة', 'danger');
            window.location.href = 'dashboard.html';
        }
    }

    async startGameSession() {
        // Get game configuration from URL parameters or defaults
        const urlParams = new URLSearchParams(window.location.search);
        const gameConfig = {
            difficulty: urlParams.get('difficulty') || 'all',
            category: urlParams.get('category') || 'all',
            questionCount: parseInt(urlParams.get('questions')) || 10
        };

        try {
            const response = await warethAPI.startGame(gameConfig);
            
            if (response.success) {
                this.gameSession = {
                    game_id: response.data.game_id,
                    questions: response.data.questions,
                    current_question: 0,
                    score: 0,
                    difficulty: response.data.difficulty,
                    category: response.data.category
                };
                
                this.questions = response.data.questions;
                this.score = 0;
                this.currentQuestion = 0;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw error;
        }
    }

    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        this.currentQuestionData = this.questions[this.currentQuestion];
        this.selectedAnswer = null;
        this.questionStartTime = Date.now();
        
        // Update question text
        document.getElementById('questionText').textContent = this.currentQuestionData.question_text;
        document.getElementById('categoryName').textContent = this.currentQuestionData.category;
        document.getElementById('questionCounter').textContent = `سؤال ${this.currentQuestion + 1} من ${this.questions.length}`;
        
        // Update options
        const options = document.querySelectorAll('.answer-option');
        const optionLetters = ['A', 'B', 'C', 'D'];
        const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'];
        
        options.forEach((option, index) => {
            const optionText = option.querySelector('.answer-text');
            optionText.textContent = this.currentQuestionData[optionKeys[index]];
            option.setAttribute('data-answer', optionLetters[index]);
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.display = 'block';
        });
        
        // Reset submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>تأكيد الإجابة';
        
        // Reset timer
        this.timeLeft = 30;
        this.updateTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimer() {
        const timerElement = document.getElementById('timer');
        const timerText = document.getElementById('timerText');
        
        timerText.textContent = this.timeLeft;
        
        // Change color based on time left
        timerElement.classList.remove('warning', 'danger');
        if (this.timeLeft <= 10 && this.timeLeft > 5) {
            timerElement.classList.add('warning');
        } else if (this.timeLeft <= 5) {
            timerElement.classList.add('danger');
        }
    }

    async selectAnswer(element, answer) {
        // Remove previous selection
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        element.classList.add('selected');
        this.selectedAnswer = answer;
        
        // Enable submit button
        document.getElementById('submitBtn').disabled = false;
    }

    async submitAnswer() {
        if (!this.selectedAnswer) return;
        
        const timeTaken = Math.floor((Date.now() - this.questionStartTime) / 1000);
        
        // Stop timer
        clearInterval(this.timerInterval);
        
        // Disable all options
        document.querySelectorAll('.answer-option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        try {
            // Submit answer to API
            const response = await warethAPI.submitAnswer({
                questionIndex: this.currentQuestion,
                answer: this.selectedAnswer,
                timeTaken: timeTaken
            });
            
            if (response.success) {
                const isCorrect = response.data.is_correct;
                const correctAnswer = response.data.correct_answer;
                const pointsEarned = response.data.points_earned;
                
                // Update score
                this.score = response.data.total_score;
                
                // Show correct answer
                const correctOption = document.querySelector(`.answer-option[data-answer="${correctAnswer}"]`);
                correctOption.classList.add('correct');
                
                // Show incorrect answer if wrong
                if (!isCorrect && this.selectedAnswer) {
                    const selectedOption = document.querySelector('.answer-option.selected');
                    selectedOption.classList.add('incorrect');
                }
                
                // Store answer
                this.answers.push({
                    question_index: this.currentQuestion,
                    question: this.currentQuestionData.question_text,
                    selected: this.selectedAnswer,
                    correct: correctAnswer,
                    isCorrect: isCorrect,
                    points: pointsEarned,
                    timeTaken: timeTaken
                });
                
                // Update UI
                this.updateUI();
                
                // Update submit button
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = isCorrect ? 
                    '<i class="fas fa-check-circle me-2"></i>إجابة صحيحة!' : 
                    '<i class="fas fa-times-circle me-2"></i>إجابة خاطئة!';
                
                // Show result modal
                setTimeout(() => {
                    this.showResult(isCorrect, correctAnswer, pointsEarned);
                }, 1500);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            warethAPI.handleAPIError(error, 'فشل إرسال الإجابة');
        }
    }

    showResult(isCorrect, correctAnswer, pointsEarned) {
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        const resultContent = document.getElementById('resultContent');
        
        const correctAnswerText = this.getCorrectAnswerText(correctAnswer);
        const icon = isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
        const message = isCorrect ? 'إجابة صحيحة! أحسنت!' : 'إجابة خاطئة! حاول مرة أخرى';
        const points = isCorrect ? `+${pointsEarned}` : '0';
        
        resultContent.innerHTML = `
            <div class="text-center">
                <i class="fas ${icon} fa-5x mb-3"></i>
                <h3 class="h4 mb-3">${message}</h3>
                <p class="text-muted mb-2">الإجابة الصحيحة: ${correctAnswerText}</p>
                <p class="fs-5 fw-bold text-primary">النقاط المكتسبة: ${points}</p>
            </div>
        `;
        
        resultModal.show();
    }

    getCorrectAnswerText(correctAnswer) {
        const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'];
        const optionIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
        return this.currentQuestionData[optionKeys[optionIndex]];
    }

    nextQuestion() {
        const resultModal = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
        resultModal.hide();
        
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
        } else {
            this.loadQuestion();
            this.startTimer();
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        
        // Submit no answer
        this.submitNoAnswer();
    }

    async submitNoAnswer() {
        const timeTaken = Math.floor((Date.now() - this.questionStartTime) / 1000);
        
        try {
            const response = await warethAPI.submitAnswer({
                questionIndex: this.currentQuestion,
                answer: '',
                timeTaken: timeTaken
            });
            
            // Show correct answer
            // We don't know the correct answer from the client, so we'll just show time up
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-clock me-2"></i>انتهى الوقت!';
            
            // Store no answer
            this.answers.push({
                question_index: this.currentQuestion,
                question: this.currentQuestionData.question_text,
                selected: null,
                correct: null,
                isCorrect: false,
                points: 0,
                timeTaken: timeTaken
            });
            
            // Show result modal
            setTimeout(() => {
                this.showResult(false, 'N/A', 0);
            }, 1500);
            
        } catch (error) {
            warethAPI.handleAPIError(error, 'فشل تسجيل الإجابة');
        }
    }

    useHint(type) {
        if (this.hints[type] <= 0) return;
        
        this.hints[type]--;
        
        switch(type) {
            case '5050':
                this.use5050Hint();
                break;
            case 'skip':
                this.skipQuestion();
                break;
            case 'audience':
                this.useAudienceHint();
                break;
        }
        
        // Update hint counts
        document.getElementById('hint5050').textContent = this.hints['5050'];
        document.getElementById('hintSkip').textContent = this.hints['skip'];
        document.getElementById('hintAudience').textContent = this.hints['audience'];
    }

    use5050Hint() {
        const options = document.querySelectorAll('.answer-option');
        const toHide = [];
        
        // Hide 2 random options (we don't know the correct answer, so just hide random ones)
        for (let i = 0; i < 2; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * 4);
            } while (toHide.includes(randomIndex));
            toHide.push(randomIndex);
        }
        
        toHide.forEach(index => {
            options[index].style.display = 'none';
        });
    }

    skipQuestion() {
        clearInterval(this.timerInterval);
        
        // Submit skip
        this.submitNoAnswer();
    }

    useAudienceHint() {
        // Simulate audience poll
        const percentages = [
            Math.floor(Math.random() * 30) + 20,
            Math.floor(Math.random() * 30) + 20,
            Math.floor(Math.random() * 30) + 20,
            Math.floor(Math.random() * 30) + 20
        ];
        
        // Adjust to sum to 100
        const total = percentages.reduce((a, b) => a + b, 0);
        const adjustedPercentages = percentages.map(p => Math.floor((p / total) * 100));
        
        // Shuffle percentages
        adjustedPercentages.sort(() => Math.random() - 0.5);
        
        // Show percentages on options
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            if (!option.querySelector('.percentage-badge')) {
                const badge = document.createElement('span');
                badge.className = 'percentage-badge badge bg-primary me-2';
                option.querySelector('.answer-text').prepend(badge);
            }
            option.querySelector('.percentage-badge').textContent = `${adjustedPercentages[index]}%`;
        });
    }

    pauseGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            warethAPI.showAlert('اللعبة متوقفة مؤقتاً', 'info');
        } else {
            this.startTimer();
            warethAPI.showAlert('استمرار اللعبة', 'info');
        }
    }

    exitGame() {
        if (confirm('هل أنت متأكد من إنهاء اللعبة؟')) {
            clearInterval(this.timerInterval);
            window.location.href = 'dashboard.html';
        }
    }

    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('progressBar').style.width = `${(this.currentQuestion / this.questions.length) * 100}%`;
    }

    async endGame() {
        try {
            // End game session
            const response = await warethAPI.endGame();
            
            if (response.success) {
                const gameData = response.data;
                
                // Store game results in localStorage for result page
                localStorage.setItem('lastGame', JSON.stringify(gameData));
                
                // Redirect to result page
                window.location.href = 'result.html';
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            warethAPI.handleAPIError(error, 'فشل حفظ نتيجة اللعبة');
            // Still redirect to dashboard even if saving failed
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth().then(isAuthenticated => {
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize game
        const game = new Game();
        
        // Make functions globally available
        window.selectAnswer = function(element, answer) {
            game.selectAnswer(element, answer);
        };
        
        window.submitAnswer = function() {
            game.submitAnswer();
        };
        
        window.nextQuestion = function() {
            game.nextQuestion();
        };
        
        window.useHint = function(type) {
            game.useHint(type);
        };
        
        window.pauseGame = function() {
            game.pauseGame();
        };
        
        window.exitGame = function() {
            game.exitGame();
        };
    });
});