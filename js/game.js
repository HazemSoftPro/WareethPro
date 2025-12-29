// Game JavaScript
class Game {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.score = 0;
        this.timeLeft = 30;
        this.timerInterval = null;
        this.selectedAnswer = null;
        this.hints = {
            '5050': 3,
            'skip': 1,
            'audience': 2
        };
        this.questions = [];
        this.currentQuestionData = null;
        this.answers = [];
        this.gameActive = false;
        
        this.init();
    }
    
    async init() {
        await this.loadQuestions();
        this.startGame();
    }
    
    async loadQuestions() {
        try {
            // استيراد الأسئلة من ملف محلي أو API
            this.questions = this.getLocalQuestions();
            
            // خلط الأسئلة عشوائياً
            this.shuffleQuestions();
            
            // اختيار أول 10 أسئلة فقط
            this.questions = this.questions.slice(0, 10);
            
            this.totalQuestions = this.questions.length;
            
        } catch (error) {
            console.error('خطأ في تحميل الأسئلة:', error);
            // استخدم الأسئلة الافتراضية في حالة الخطأ
            this.questions = this.getDefaultQuestions();
            this.totalQuestions = this.questions.length;
        }
    }
    
    getLocalQuestions() {
        // إنشاء الأسئلة من الملف النصي
        const questions = [];
        
        // قسم العبارات
        const expressions = [
            {
                question: 'ما هو المعنى الدقيق لعبارة "ابعد مِشْحاه"؟',
                options: [
                    'أي أنه سار مسافة طويلة ووصل إليه بطريقة سريعة.',
                    'أي أنه ابتعد وهاجر إلى مكان لم يعد يعرفه.',
                    'أي أبعده وأقصاه إلى مكان بعيد.',
                    'أي أنه سليم النية وطيب السمعة.'
                ],
                correct: 'C',
                category: 'العبارات'
            },
            {
                question: 'عبارة "أبو العمرين وأبو الزمريْن" تُطلق على:',
                options: [
                    'الشخص الذي يمتلك مكانة عالية في القوم.',
                    'صاحب الأفعال الطيبة وعظيم الشأن وطيب السمعة.',
                    'الرجل الذي يمتلك عمراً طويلاً وزوجتين.',
                    'المرأة التي تقول عن زوجها أنه "أبو العمرين والزمريْن" لتقصيره.'
                ],
                correct: 'B',
                category: 'العبارات'
            },
            {
                question: 'ماذا يُقصد بمن "أخذ سُمُّ الحُمُّوس"؟',
                options: [
                    'أي أنه تمهل وتأخر في إظهار الغضب.',
                    'أي أنه شُفي من غضبه وحممه.',
                    'أي أنه تمادى في الغضب.',
                    'أي كان أول من صب عليه الغاضب غضبه، أو أول من ضُرب في مشاجرة.'
                ],
                correct: 'D',
                category: 'العبارات'
            }
        ];
        
        // قسم الأزياء
        const fashion = [
            {
                question: 'ما هو الزي الخارجي الأساسي للرجل في معظم بادية نجد والذي يتميز بأكمام واسعة ومثلثة الشكل؟',
                options: [
                    'البشت',
                    'السديري',
                    'المرودن',
                    'الزبون'
                ],
                correct: 'C',
                category: 'الأزياء'
            },
            {
                question: 'ما هي القطعة المربعة الشكل التي يضعها الرجل على رأسه وتثنى على شكل مثلث، وقد يطلق عليها اسم "مروجنة"؟',
                options: [
                    'الشماغ',
                    'الغترة',
                    'المعم',
                    'الطاقية'
                ],
                correct: 'B',
                category: 'الأزياء'
            },
            {
                question: 'ما هي الخامة التي كان يُصنع منها "العقال" التقليدي الذي يستخدمه عامة البدو محلياً؟',
                options: [
                    'الحرير المستورد',
                    'وبر الإبل',
                    'صوف الماعز',
                    'قماش القطيفة'
                ],
                correct: 'C',
                category: 'الأزياء'
            }
        ];
        
        // قسم الحرف
        const crafts = [
            {
                question: 'ما هي إحدى المنتجات التي يصنعها الحداد وتُستخدم في الحرب؟',
                options: [
                    'المكاييل',
                    'المحاميس',
                    'السيوف',
                    'الزرابيل'
                ],
                correct: 'C',
                category: 'الحرف اليدوية'
            },
            {
                question: 'ما هي الأداة الحديدية التي يصنعها الحداد من الحديد الصُّلب وتُستخدم لـ ضرب الصوان بقَدْح ويَنْبَعِث عنه شرار يُوجِه للفتيلة لإشعالها؟',
                options: [
                    'الشلف',
                    'المنكاب',
                    'المطرقة',
                    'الزَّنُود'
                ],
                correct: 'D',
                category: 'الحرف اليدوية'
            },
            {
                question: 'تُصنع المحاميس من حديد المِطَل، وتُستعمل لتحميس ماذا؟',
                options: [
                    'الجلود',
                    'الغرب',
                    'سعف النخيل',
                    'حبوب القهوة'
                ],
                correct: 'D',
                category: 'الحرف اليدوية'
            }
        ];
        
        // قسم الأكل
        const food = [
            {
                question: 'ما هو المصطلح العام الذي يطلق على ما يشبع الجوع أو يتم تناوله كغذاء، مثل القمح والخبز؟',
                options: [
                    'الدهن',
                    'الإدام',
                    'العيش',
                    'المرق'
                ],
                correct: 'C',
                category: 'الأكل'
            },
            {
                question: 'ما هو المصطلح الذي يشير إلى اللحم أو الفتات الذي يؤخذ من الحيوان؟',
                options: [
                    'السمن',
                    'الشفرة',
                    'اللحم',
                    'الجندل'
                ],
                correct: 'C',
                category: 'الأكل'
            },
            {
                question: 'ما هو المشروب الذي يعد من مشتقات الحليب ويصنف ضمن الأغذية السائلة؟',
                options: [
                    'السمن',
                    'الماء',
                    'اللبن',
                    'العيش'
                ],
                correct: 'C',
                category: 'الأكل'
            }
        ];
        
        // دمج جميع الأسئلة
        questions.push(...expressions, ...fashion, ...crafts, ...food);
        
        return questions;
    }
    
    getDefaultQuestions() {
        return [
            {
                question: 'ما هو المعنى الدقيق لعبارة "ابعد مِشْحاه"؟',
                options: [
                    'أي أنه سار مسافة طويلة ووصل إليه بطريقة سريعة.',
                    'أي أنه ابتعد وهاجر إلى مكان لم يعد يعرفه.',
                    'أي أبعده وأقصاه إلى مكان بعيد.',
                    'أي أنه سليم النية وطيب السمعة.'
                ],
                correct: 'C',
                category: 'العبارات'
            },
            {
                question: 'عبارة "أبو العمرين وأبو الزمريْن" تُطلق على:',
                options: [
                    'الشخص الذي يمتلك مكانة عالية في القوم.',
                    'صاحب الأفعال الطيبة وعظيم الشأن وطيب السمعة.',
                    'الرجل الذي يمتلك عمراً طويلاً وزوجتين.',
                    'المرأة التي تقول عن زوجها أنه "أبو العمرين والزمريْن" لتقصيره.'
                ],
                correct: 'B',
                category: 'العبارات'
            },
            {
                question: 'ما هو الزي الخارجي الأساسي للرجل في معظم بادية نجد والذي يتميز بأكمام واسعة ومثلثة الشكل؟',
                options: [
                    'البشت',
                    'السديري',
                    'المرودن',
                    'الزبون'
                ],
                correct: 'C',
                category: 'الأزياء'
            },
            {
                question: 'ما هي الخامة التي كان يُصنع منها "العقال" التقليدي الذي يستخدمه عامة البدو محلياً؟',
                options: [
                    'الحرير المستورد',
                    'وبر الإبل',
                    'صوف الماعز',
                    'قماش القطيفة'
                ],
                correct: 'C',
                category: 'الأزياء'
            },
            {
                question: 'ما هي إحدى المنتجات التي يصنعها الحداد وتُستخدم في الحرب؟',
                options: [
                    'المكاييل',
                    'المحاميس',
                    'السيوف',
                    'الزرابيل'
                ],
                correct: 'C',
                category: 'الحرف اليدوية'
            },
            {
                question: 'تُصنع المحاميس من حديد المِطَل، وتُستعمل لتحميس ماذا؟',
                options: [
                    'الجلود',
                    'الغرب',
                    'سعف النخيل',
                    'حبوب القهوة'
                ],
                correct: 'D',
                category: 'الحرف اليدوية'
            },
            {
                question: 'ما هو المصطلح العام الذي يطلق على ما يشبع الجوع أو يتم تناوله كغذاء، مثل القمح والخبز؟',
                options: [
                    'الدهن',
                    'الإدام',
                    'العيش',
                    'المرق'
                ],
                correct: 'C',
                category: 'الأكل'
            },
            {
                question: 'ما هو المصطلح الذي يشير إلى اللحم أو الفتات الذي يؤخذ من الحيوان؟',
                options: [
                    'السمن',
                    'الشفرة',
                    'اللحم',
                    'الجندل'
                ],
                correct: 'C',
                category: 'الأكل'
            },
            {
                question: 'ما هو المشروب الذي يعد من مشتقات الحليب ويصنف ضمن الأغذية السائلة؟',
                options: [
                    'السمن',
                    'الماء',
                    'اللبن',
                    'العيش'
                ],
                correct: 'C',
                category: 'الأكل'
            },
            {
                question: 'ماذا يُقصد بمن "أخذ سُمُّ الحُمُّوس"؟',
                options: [
                    'أي أنه تمهل وتأخر في إظهار الغضب.',
                    'أي أنه شُفي من غضبه وحممه.',
                    'أي أنه تمادى في الغضب.',
                    'أي كان أول من صب عليه الغاضب غضبه، أو أول من ضُرب في مشاجرة.'
                ],
                correct: 'D',
                category: 'العبارات'
            }
        ];
    }
    
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.loadQuestion();
        this.updateUI();
    }
    
    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }
        
        this.currentQuestionData = this.questions[this.currentQuestion];
        this.selectedAnswer = null;
        
        // Reset timer
        this.timeLeft = 30;
        this.updateTimer();
        
        // Start timer
        this.startTimer();
        
        // Update question text
        document.getElementById('questionText').textContent = this.currentQuestionData.question;
        document.getElementById('categoryName').textContent = this.currentQuestionData.category;
        document.getElementById('questionCounter').textContent = `سؤال ${this.currentQuestion + 1} من ${this.totalQuestions}`;
        
        // Update options
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            const optionText = option.querySelector('.answer-text');
            optionText.textContent = this.currentQuestionData.options[index];
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.display = 'block';
            option.style.pointerEvents = 'auto';
            
            // Remove percentage badges
            const badge = option.querySelector('.percentage-badge');
            if (badge) {
                badge.remove();
            }
        });
        
        // Reset submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>تأكيد الإجابة';
        
        // Enable hint buttons
        this.enableHintButtons();
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
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
    
    selectAnswer(element, answer) {
        if (!this.gameActive) return;
        
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
    
    submitAnswer() {
        if (!this.selectedAnswer || !this.gameActive) return;
        
        // Stop timer
        clearInterval(this.timerInterval);
        
        // Disable all options
        document.querySelectorAll('.answer-option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Disable hint buttons
        this.disableHintButtons();
        
        // Show correct answer
        const correctIndex = this.getOptionIndex(this.currentQuestionData.correct);
        const correctOption = document.querySelector(`.answer-option:nth-child(${correctIndex})`);
        if (correctOption) {
            correctOption.classList.add('correct');
        }
        
        // Show incorrect answer if wrong
        if (this.selectedAnswer !== this.currentQuestionData.correct) {
            const selectedOption = document.querySelector('.answer-option.selected');
            if (selectedOption) {
                selectedOption.classList.add('incorrect');
            }
        }
        
        // Calculate score
        const isCorrect = this.selectedAnswer === this.currentQuestionData.correct;
        let questionScore = 0;
        
        if (isCorrect) {
            // Base points + bonus for speed
            questionScore = 10;
            const timeBonus = Math.floor(this.timeLeft / 3);
            questionScore += timeBonus;
            this.score += questionScore;
        }
        
        // Store answer
        this.answers.push({
            question: this.currentQuestionData.question,
            selected: this.selectedAnswer,
            correct: this.currentQuestionData.correct,
            isCorrect: isCorrect,
            score: questionScore,
            timeLeft: this.timeLeft
        });
        
        // Update UI
        this.updateUI();
        
        // Update submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = isCorrect ? 
            `<i class="fas fa-check-circle me-2"></i>إجابة صحيحة! (+${questionScore})` : 
            '<i class="fas fa-times-circle me-2"></i>إجابة خاطئة!';
        
        // Show result modal
        setTimeout(() => {
            this.showResult(isCorrect, questionScore);
        }, 1500);
    }
    
    getOptionIndex(letter) {
        const letters = ['A', 'B', 'C', 'D'];
        return letters.indexOf(letter) + 1;
    }
    
    showResult(isCorrect, points) {
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        const resultContent = document.getElementById('resultContent');
        
        const icon = isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
        const message = isCorrect ? 'إجابة صحيحة! أحسنت!' : 'إجابة خاطئة! حاول مرة أخرى';
        const correctAnswer = this.currentQuestionData.options[this.getOptionIndex(this.currentQuestionData.correct) - 1];
        
        resultContent.innerHTML = `
            <div class="text-center">
                <i class="fas ${icon} fa-5x mb-3"></i>
                <h3 class="h4 mb-3">${message}</h3>
                <p class="text-muted mb-2">الإجابة الصحيحة: ${correctAnswer}</p>
                ${isCorrect ? `<p class="fs-5 fw-bold text-primary">النقاط المكتسبة: +${points}</p>` : ''}
                <p class="text-muted small">الوقت المتبقي: ${this.timeLeft} ثانية</p>
            </div>
        `;
        
        resultModal.show();
    }
    
    nextQuestion() {
        const resultModal = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
        if (resultModal) {
            resultModal.hide();
        }
        
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
        } else {
            this.loadQuestion();
        }
    }
    
    timeUp() {
        clearInterval(this.timerInterval);
        
        if (!this.gameActive) return;
        
        // Show correct answer
        const correctIndex = this.getOptionIndex(this.currentQuestionData.correct);
        const correctOption = document.querySelector(`.answer-option:nth-child(${correctIndex})`);
        if (correctOption) {
            correctOption.classList.add('correct');
        }
        
        // Disable all options
        document.querySelectorAll('.answer-option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Disable hint buttons
        this.disableHintButtons();
        
        // Store no answer
        this.answers.push({
            question: this.currentQuestionData.question,
            selected: null,
            correct: this.currentQuestionData.correct,
            isCorrect: false,
            score: 0,
            timeLeft: 0
        });
        
        // Update submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-clock me-2"></i>انتهى الوقت!';
        
        // Show result modal
        setTimeout(() => {
            this.showResult(false, 0);
        }, 1500);
    }
    
    useHint(type) {
        if (!this.gameActive || this.hints[type] <= 0) return;
        
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
        
        // Disable button if no more hints
        if (this.hints[type] <= 0) {
            document.getElementById(`hint${type.charAt(0).toUpperCase() + type.slice(1)}Btn`).disabled = true;
        }
    }
    
    use5050Hint() {
        const options = document.querySelectorAll('.answer-option');
        const correctIndex = this.getOptionIndex(this.currentQuestionData.correct) - 1;
        const wrongOptions = [];
        
        options.forEach((option, index) => {
            if (index !== correctIndex) {
                wrongOptions.push(index);
            }
        });
        
        // Remove 2 wrong options
        const toRemove = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
        toRemove.forEach(index => {
            options[index].style.display = 'none';
        });
    }
    
    skipQuestion() {
        clearInterval(this.timerInterval);
        
        // Store skip
        this.answers.push({
            question: this.currentQuestionData.question,
            selected: 'SKIPPED',
            correct: this.currentQuestionData.correct,
            isCorrect: false,
            score: 0,
            timeLeft: this.timeLeft
        });
        
        this.nextQuestion();
    }
    
    useAudienceHint() {
        // Simulate audience poll
        const correctPercentage = 40 + Math.floor(Math.random() * 30);
        const remaining = 100 - correctPercentage;
        
        const percentages = [correctPercentage];
        for (let i = 0; i < 3; i++) {
            const remainingOptions = 4 - i - 1;
            const percentage = remainingOptions > 0 ? Math.floor(Math.random() * (remaining / remainingOptions)) : remaining;
            percentages.push(percentage);
            remaining -= percentage;
        }
        
        // Shuffle percentages
        percentages.sort(() => Math.random() - 0.5);
        
        // Show percentages on options
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            if (!option.querySelector('.percentage-badge')) {
                const badge = document.createElement('span');
                badge.className = 'percentage-badge badge bg-primary me-2';
                option.querySelector('.answer-text').prepend(badge);
            }
            option.querySelector('.percentage-badge').textContent = `${percentages[index]}%`;
        });
    }
    
    disableHintButtons() {
        document.getElementById('hint5050Btn').disabled = true;
        document.getElementById('hintSkipBtn').disabled = true;
        document.getElementById('hintAudienceBtn').disabled = true;
    }
    
    enableHintButtons() {
        document.getElementById('hint5050Btn').disabled = this.hints['5050'] <= 0;
        document.getElementById('hintSkipBtn').disabled = this.hints['skip'] <= 0;
        document.getElementById('hintAudienceBtn').disabled = this.hints['audience'] <= 0;
    }
    
    pauseGame() {
        if (!this.gameActive) return;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.gameActive = false;
            showAlert('اللعبة متوقفة مؤقتاً', 'info');
        } else {
            this.gameActive = true;
            this.startTimer();
            showAlert('استمرار اللعبة', 'info');
        }
    }
    
    exitGame() {
        if (confirm('هل أنت متأكد من إنهاء اللعبة؟ سيتم فقدان تقدمك الحالي.')) {
            clearInterval(this.timerInterval);
            this.gameActive = false;
            window.location.href = 'dashboard.html';
        }
    }
    
    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        const progress = ((this.currentQuestion) / this.totalQuestions) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        this.gameActive = false;
        
        // Calculate statistics
        const correctAnswers = this.answers.filter(a => a.isCorrect).length;
        const wrongAnswers = this.answers.filter(a => !a.isCorrect && a.selected !== null && a.selected !== 'SKIPPED').length;
        const skippedAnswers = this.answers.filter(a => a.selected === null || a.selected === 'SKIPPED').length;
        const percentage = Math.round((correctAnswers / this.totalQuestions) * 100);
        
        // Calculate time statistics
        const totalTime = this.answers.reduce((sum, answer) => sum + (30 - answer.timeLeft), 0);
        const avgTime = Math.round(totalTime / this.answers.length);
        
        // Prepare game data
        const gameData = {
            score: this.score,
            totalQuestions: this.totalQuestions,
            correctAnswers: correctAnswers,
            wrongAnswers: wrongAnswers,
            skippedAnswers: skippedAnswers,
            percentage: percentage,
            avgTime: avgTime,
            answers: this.answers,
            date: new Date().toLocaleString('ar-SA'),
            hintsUsed: {
                '5050': 3 - this.hints['5050'],
                'skip': 1 - this.hints['skip'],
                'audience': 2 - this.hints['audience']
            }
        };
        
        // Store in localStorage
        const games = JSON.parse(localStorage.getItem('games') || '[]');
        games.push(gameData);
        localStorage.setItem('games', JSON.stringify(games));
        localStorage.setItem('lastGame', JSON.stringify(gameData));
        
        // Show game over modal
        this.showGameOverModal(gameData);
    }
    
    showGameOverModal(gameData) {
        const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        const gameOverContent = document.getElementById('gameOverContent');
        
        let performanceText = '';
        if (gameData.percentage >= 80) {
            performanceText = '<p class="text-success"><i class="fas fa-crown me-2"></i>أداء ممتاز! أنت خبير في التراث</p>';
        } else if (gameData.percentage >= 60) {
            performanceText = '<p class="text-primary"><i class="fas fa-medal me-2"></i>أداء جيد جداً</p>';
        } else if (gameData.percentage >= 40) {
            performanceText = '<p class="text-warning"><i class="fas fa-award me-2"></i>أداء متوسط</p>';
        } else {
            performanceText = '<p class="text-info"><i class="fas fa-book me-2"></i>استمر في التعلم</p>';
        }
        
        gameOverContent.innerHTML = `
            <div class="text-center">
                <i class="fas fa-flag-checkered fa-4x text-warning mb-3"></i>
                <h3 class="h4 mb-3">تهانينا! لقد أكملت اللعبة</h3>
                
                <div class="row justify-content-center mb-3">
                    <div class="col-md-8">
                        <div class="card border-success mb-2">
                            <div class="card-body py-2">
                                <h5 class="mb-0">النتيجة النهائية: <span class="text-primary">${gameData.score}</span> نقطة</h5>
                            </div>
                        </div>
                        
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="border rounded p-2">
                                    <div class="text-success fw-bold">${gameData.correctAnswers}</div>
                                    <div class="small">صحيحة</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border rounded p-2">
                                    <div class="text-danger fw-bold">${gameData.wrongAnswers}</div>
                                    <div class="small">خاطئة</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border rounded p-2">
                                    <div class="text-warning fw-bold">${gameData.skippedAnswers}</div>
                                    <div class="small">متخطاة</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${gameData.percentage}%">
                                    ${gameData.percentage}%
                                </div>
                            </div>
                            <small class="text-muted">نسبة الإجابات الصحيحة</small>
                        </div>
                        
                        ${performanceText}
                        
                        <p class="text-muted small mt-3">
                            <i class="fas fa-clock me-1"></i>
                            متوسط الوقت: ${gameData.avgTime} ثانية لكل سؤال
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        gameOverModal.show();
    }
    
    viewResults() {
        window.location.href = 'result.html';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    let game;
    
    // Make sure DOM is fully loaded
    setTimeout(() => {
        game = new Game();
        
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
        
        window.viewResults = function() {
            game.viewResults();
        };
    }, 100);
});

// Helper function to show alerts
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert.position-fixed');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.style.textAlign = 'center';
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