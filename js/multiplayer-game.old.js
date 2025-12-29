
// Multiplayer Game Room JavaScript

// هيكل بيانات الأسئلة
class QuestionDatabase {
    constructor() {
        this.categories = {
            'عبارات': [],
            'أزياء': [],
            'حرف': [],
            'أكل': []
        };
        
        this.loadQuestions();
    }
    
    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('فشل في تحميل الأسئلة');
            }
            
            const data = await response.json();
            this.categories = data.categories;
            this.shuffleAllQuestions();
            
            console.log('تم تحميل الأسئلة بنجاح:', {
                'عبارات': this.categories['عبارات'].length,
                'أزياء': this.categories['أزياء'].length,
                'حرف': this.categories['حرف'].length,
                'أكل': this.categories['أكل'].length
            });
            
        } catch (error) {
            console.error('خطأ في تحميل الأسئلة:', error);
            this.loadDefaultQuestions();
        }
    }
    
    loadDefaultQuestions() {
        // أسئلة افتراضية في حالة فشل تحميل JSON
        this.categories['عبارات'] = this.shuffleArray([
            {
                text: 'ما هو المعنى الدقيق لعبارة "ابعد مِشْحاه"؟',
                options: [
                    'أي أنه سار مسافة طويلة ووصل إليه بطريقة سريعة.',
                    'أي أنه ابتعد وهاجر إلى مكان لم يعد يعرفه.',
                    'أي أبعده وأقصاه إلى مكان بعيد.',
                    'أي أنه سليم النية وطيب السمعة.'
                ],
                correct: 2
            },
            {
                text: 'عبارة "أبو العمرين وأبو الزمريْن" تُطلق على:',
                options: [
                    'الشخص الذي يمتلك مكانة عالية في القوم.',
                    'صاحب الأفعال الطيبة وعظيم الشأن وطيب السمعة.',
                    'الرجل الذي يمتلك عمراً طويلاً وزوجتين.',
                    'المرأة التي تقول عن زوجها أنه "أبو العمرين والزمريْن" لتقصيره.'
                ],
                correct: 1
            }
        ]);
        
        this.categories['أزياء'] = this.shuffleArray([
            {
                text: 'ما هو الزي الخارجي الأساسي للرجل في معظم بادية نجد والذي يتميز بأكمام واسعة ومثلثة الشكل؟',
                options: ['البشت', 'السديري', 'المرودن', 'الزبون'],
                correct: 2
            },
            {
                text: 'ما هي القطعة المربعة الشكل التي يضعها الرجل على رأسه وتثنى على شكل مثلث، وقد يطلق عليها اسم "مروجنة"؟',
                options: ['الشماغ', 'الغترة', 'المعم', 'الطاقية'],
                correct: 1
            }
        ]);
        
        this.categories['حرف'] = this.shuffleArray([
            {
                text: 'ما هي إحدى المنتجات التي يصنعها الحداد وتُستخدم في الحرب؟',
                options: ['المكاييل', 'المحاميس', 'السيوف', 'الزرابيل'],
                correct: 2
            },
            {
                text: 'ما هي الأداة الحديدية التي يصنعها الحداد من الحديد الصُّلب وتُستخدم لضرب الصوان بقَدْح ويَنْبَعِث عنه شرار يُوجِه للفتيلة لإشعالها؟',
                options: ['الشلف', 'المنكاب', 'المطرقة', 'الزَّنُود'],
                correct: 3
            }
        ]);
        
        this.categories['أكل'] = this.shuffleArray([
            {
                text: 'ما هو المصطلح العام الذي يطلق على ما يشبع الجوع أو يتم تناوله كغذاء، مثل القمح والخبز؟',
                options: ['الدهن', 'الإدام', 'العيش', 'المرق'],
                correct: 2
            },
            {
                text: 'ما هو المصطلح الذي يشير إلى اللحم أو الفتات الذي يؤخذ من الحيوان؟',
                options: ['السمن', 'الشفرة', 'اللحم', 'الجندل'],
                correct: 2
            }
        ]);
    }
    
    shuffleAllQuestions() {
        for (const category in this.categories) {
            this.categories[category] = this.shuffleArray([...this.categories[category]]);
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    getQuestionsByCategory(category) {
        return this.categories[category] || [];
    }
    
    getRandomQuestion(category) {
        const questions = this.categories[category];
        if (!questions || questions.length === 0) {
            return null;
        }
        
        // إزالة السؤال بعد استخدامه لمنع التكرار
        return questions.shift();
    }
    
    getQuestionsCount() {
        const counts = {};
        for (const category in this.categories) {
            counts[category] = this.categories[category].length;
        }
        return counts;
    }
}

class MultiplayerGameRoom {
    constructor() {
        this.roomId = this.getRoomIdFromUrl();
        this.isSpectator = this.getIsSpectatorFromUrl();
        this.isOwner = this.getIsOwnerFromUrl();
        this.currentUser = localStorage.getItem('username') || 'لاعب';
        this.currentRoom = null;
        this.gameState = 'waiting';
        this.currentQuestion = null;
        this.selectedAnswer = null;
        this.isReady = false;
        this.playerScore = 0;
        this.timeLeft = 15;
        this.timerInterval = null;
        this.players = [];
        this.socket = null;
        this.questionDatabase = new QuestionDatabase();
        this.questionsHistory = [];
        this.questionsAnswered = 0;
        this.currentCategory = 'عبارات';
        
        this.init();
    }
    
    async init() {
        this.loadRoomData();
        this.setRoomCategory();
        
        // انتظار تحميل الأسئلة
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.initializeWebSocket();
        this.setupEventListeners();
        this.updateUI();
        this.startCountdown();
        
        if (this.isSpectator) {
            document.getElementById('spectatorBanner').style.display = 'block';
        }
    }
    
    setRoomCategory() {
        const categories = ['عبارات', 'أزياء', 'حرف', 'أكل'];
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam && categories.includes(categoryParam)) {
            this.currentCategory = categoryParam;
        } else {
            this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
        }
        
        this.currentRoom.category = this.currentCategory;
    }
    
    getRoomIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room') || '1';
    }
    
    getIsSpectatorFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('spectator') === 'true';
    }
    
    getIsOwnerFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('owner') === 'true';
    }
    
    loadRoomData() {
        this.currentRoom = {
            id: this.roomId,
            name: `غرفة التراث - ${this.currentCategory}`,
            category: this.currentCategory,
            difficulty: 'متوسط',
            maxPlayers: 4,
            currentPlayers: 3,
            status: 'waiting',
            totalQuestions: this.getTotalQuestionsCount(),
            players: [
                { name: this.currentUser, score: 0, status: 'ready', isOwner: true, isCurrentUser: true },
                { name: 'سارة', score: 0, status: 'ready', isOwner: false },
                { name: 'خالد', score: 0, status: 'ready', isOwner: false },
                { name: 'فاطمة', score: 0, status: 'waiting', isOwner: false }
            ]
        };
        
        this.players = this.currentRoom.players;
        this.updatePlayersList();
    }
    
    getTotalQuestionsCount() {
        const questions = this.questionDatabase.getQuestionsByCategory(this.currentCategory);
        return Math.min(questions.length, 10); // الحد الأقصى 10 أسئلة لكل جولة
    }
    
    initializeWebSocket() {
        this.simulateWebSocketConnection();
    }
    
    simulateWebSocketConnection() {
        setInterval(() => {
            this.simulatePlayerActions();
        }, 5000);
        
        setInterval(() => {
            this.simulateGameEvents();
        }, 8000);
    }
    
    simulatePlayerActions() {
        if (Math.random() > 0.8 && this.currentRoom.currentPlayers < this.currentRoom.maxPlayers) {
            const newPlayers = ['علي', 'نورة', 'عبدالله', 'لمياء'];
            const randomPlayer = newPlayers[Math.floor(Math.random() * newPlayers.length)];
            
            if (!this.players.find(p => p.name === randomPlayer)) {
                this.addPlayer(randomPlayer);
                this.addSystemMessage(`انضم ${randomPlayer} إلى الغرفة`);
            }
        }
        
        if (Math.random() > 0.7 && this.gameState === 'waiting') {
            const waitingPlayer = this.players.find(p => p.status === 'waiting' && !p.isCurrentUser);
            if (waitingPlayer) {
                waitingPlayer.status = 'ready';
                this.updatePlayersList();
                this.addChatMessage(waitingPlayer.name, 'أنا جاهز!', 'other');
                this.checkAllPlayersReady();
            }
        }
    }
    
    simulateGameEvents() {
        if (this.gameState === 'waiting') {
            const readyPlayers = this.players.filter(p => p.status === 'ready');
            if (readyPlayers.length >= 2 && Math.random() > 0.6) {
                this.startGame();
            }
        }
        
        if (this.gameState === 'playing') {
            if (Math.random() > 0.7) {
                this.simulatePlayerAnswer();
            }
        }
    }
    
    addPlayer(playerName) {
        const newPlayer = {
            name: playerName,
            score: 0,
            status: 'waiting',
            isOwner: false,
            isCurrentUser: false
        };
        
        this.players.push(newPlayer);
        this.currentRoom.currentPlayers++;
        this.updatePlayersList();
        this.updateRoomStats();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4' && this.gameState === 'playing' && !this.isSpectator) {
                const answerLetter = String.fromCharCode(64 + parseInt(e.key));
                this.selectAnswerByLetter(answerLetter);
            }
            
            if (e.key === 'r' || e.key === 'R') {
                this.toggleReady();
            }
            
            if (e.key === 'Escape') {
                this.leaveRoom();
            }
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendPlayerStatus('away');
            } else {
                this.sendPlayerStatus('active');
            }
        });
        
        window.addEventListener('beforeunload', (e) => {
            this.leaveRoom();
        });
    }
    
    updateUI() {
        document.querySelector('.game-header h3').textContent = this.currentRoom.name;
        document.getElementById('currentPlayers').textContent = this.currentRoom.currentPlayers;
        document.getElementById('gameLevel').textContent = this.currentRoom.difficulty;
        document.getElementById('gameCategory').textContent = this.currentRoom.category;
        
        const statusElement = document.getElementById('roomStatus');
        const statusText = {
            'waiting': 'في انتظار',
            'ready': 'جاهز للبدء',
            'playing': 'قيد اللعب',
            'finished': 'انتهت'
        };
        statusElement.textContent = statusText[this.gameState];
    }
    
    updatePlayersList() {
        const playersList = document.getElementById('playersList');
        playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = `player-item ${player.isCurrentUser ? 'current-user' : ''}`;
            
            const statusClass = player.status === 'ready' ? 'indicator-ready' : 
                               player.status === 'thinking' ? 'indicator-thinking' : 'indicator-waiting';
            
            const statusText = player.status === 'ready' ? 'جاهز' : 
                              player.status === 'thinking' ? 'يجيب' : 'في انتظار';
            
            playerItem.innerHTML = `
                <div class="player-avatar">${player.name.charAt(0)}</div>
                <div class="player-info">
                    <div class="player-name">${player.name} ${player.isCurrentUser ? '(أنت)' : ''} ${player.isOwner ? '👑' : ''}</div>
                    <div class="player-status">${statusText}</div>
                </div>
                <div class="player-score">${player.score}</div>
                <div class="player-indicator ${statusClass}"></div>
            `;
            
            playersList.appendChild(playerItem);
        });
        
        this.updateRoomStats();
    }
    
    updateRoomStats() {
        const readyPlayers = this.players.filter(p => p.status === 'ready').length;
        document.getElementById('playersCount').textContent = `${readyPlayers}/${this.currentRoom.currentPlayers}`;
        document.getElementById('chatOnlineCount').textContent = this.currentRoom.currentPlayers;
    }
    
    startCountdown() {
        let countdown = 60;
        const countdownElement = document.getElementById('startTime');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                
                const readyPlayers = this.players.filter(p => p.status === 'ready');
                if (readyPlayers.length >= 2) {
                    this.startGame();
                } else {
                    this.showAlert('لم يكن هناك لاعبون كافٍ لبدء اللعبة', 'warning');
                }
            }
        }, 1000);
    }
    
    toggleReady() {
        if (this.isSpectator) {
            this.showAlert('لا يمكنك تغيير حالة الاستعداد كمشاهد', 'info');
            return;
        }
        
        const currentUser = this.players.find(p => p.isCurrentUser);
        if (!currentUser) return;
        
        this.isReady = !this.isReady;
        currentUser.status = this.isReady ? 'ready' : 'waiting';
        
        const readyBtn = document.getElementById('readyBtn');
        if (this.isReady) {
            readyBtn.innerHTML = '<i class="fas fa-times me-2"></i>إلغاء الاستعداد';
            readyBtn.classList.add('ready');
            this.addChatMessage(this.currentUser, 'أنا جاهز!', 'self');
        } else {
            readyBtn.innerHTML = '<i class="fas fa-check me-2"></i>أنا جاهز';
            readyBtn.classList.remove('ready');
            this.addChatMessage(this.currentUser, 'ألغيت الاستعداد', 'self');
        }
        
        this.updatePlayersList();
        this.checkAllPlayersReady();
    }
    
    checkAllPlayersReady() {
        const readyPlayers = this.players.filter(p => p.status === 'ready');
        const totalPlayers = this.players.filter(p => !p.isSpectator).length;
        
        if (readyPlayers.length >= 2 && readyPlayers.length === totalPlayers) {
            setTimeout(() => {
                this.startGame();
            }, 2000);
        }
    }
    
    startGame() {
        if (this.gameState !== 'waiting') return;
        
        this.gameState = 'playing';
        this.updateUI();
        
        document.getElementById('readyBtn').style.display = 'none';
        document.getElementById('answersGrid').style.display = 'grid';
        
        this.players.forEach(player => {
            player.score = 0;
            player.status = 'playing';
        });
        
        this.updatePlayersList();
        
        this.addSystemMessage(`بدأت اللعبة! الفئة: ${this.currentCategory} 🎮`);
        
        setTimeout(() => {
            this.loadQuestion();
        }, 2000);
    }
    
    loadQuestion() {
        const question = this.questionDatabase.getRandomQuestion(this.currentCategory);
        
        if (!question) {
            this.showAlert('لم تعد هناك أسئلة متاحة في هذه الفئة!', 'info');
            this.endGame();
            return;
        }
        
        this.currentQuestion = question;
        this.selectedAnswer = null;
        this.timeLeft = 15;
        this.questionsAnswered++;
        
        document.getElementById('questionText').textContent = this.currentQuestion.text;
        
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.classList.remove('selected', 'correct', 'incorrect', 'disabled');
            option.querySelector('.answer-text').textContent = this.currentQuestion.options[index];
        });
        
        this.startQuestionTimer();
        this.addSystemMessage(`السؤال ${this.questionsAnswered}`);
    }
    
    startQuestionTimer() {
        this.clearTimer();
        
        const timerElement = document.getElementById('gameTimer');
        const progressBar = document.getElementById('progressBar');
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            progressBar.style.width = `${(this.timeLeft / 15) * 100}%`;
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    selectAnswer(element, answer) {
        if (this.gameState !== 'playing' || this.isSpectator) return;
        
        const currentUser = this.players.find(p => p.isCurrentUser);
        if (currentUser && currentUser.status !== 'playing') return;
        
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        element.classList.add('selected');
        this.selectedAnswer = answer;
        this.submitAnswer();
    }
    
    selectAnswerByLetter(letter) {
        const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const answerOptions = document.querySelectorAll('.answer-option');
        const index = answerMap[letter];
        
        if (index !== undefined && answerOptions[index]) {
            this.selectAnswer(answerOptions[index], letter);
        }
    }
    
    submitAnswer() {
        if (!this.selectedAnswer) return;
        
        const currentUser = this.players.find(p => p.isCurrentUser);
        if (currentUser) {
            currentUser.status = 'thinking';
            this.updatePlayersList();
        }
        
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.add('disabled');
        });
        
        setTimeout(() => {
            this.showCorrectAnswer();
        }, 2000);
    }
    
    showCorrectAnswer() {
        const answerOptions = document.querySelectorAll('.answer-option');
        const correctIndex = this.currentQuestion.correct;
        
        const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const selectedIndex = answerMap[this.selectedAnswer];
        
        answerOptions[correctIndex].classList.add('correct');
        
        if (selectedIndex !== correctIndex) {
            answerOptions[selectedIndex].classList.add('incorrect');
        }
        
        const currentUser = this.players.find(p => p.isCurrentUser);
        if (currentUser) {
            if (selectedIndex === correctIndex) {
                currentUser.score += 10;
                this.playerScore = currentUser.score;
                this.addChatMessage(this.currentUser, `إجابة صحيحة! +10 نقاط (المجموع: ${currentUser.score}) 🎉`, 'self');
            } else {
                this.addChatMessage(this.currentUser, 'إجابة خاطئة! حاول في السؤال القادم 💪', 'self');
            }
            currentUser.status = 'ready';
            this.updatePlayersList();
        }
        
        this.clearTimer();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    }
    
    simulatePlayerAnswer() {
        const otherPlayers = this.players.filter(p => !p.isCurrentUser && p.status === 'playing');
        if (otherPlayers.length === 0) return;
        
        const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        randomPlayer.status = 'thinking';
        this.updatePlayersList();
        
        setTimeout(() => {
            const isCorrect = Math.random() > 0.3;
            if (isCorrect) {
                randomPlayer.score += 10;
                this.addChatMessage(randomPlayer.name, `إجابة صحيحة! +10 نقاط (المجموع: ${randomPlayer.score})`, 'other');
            } else {
                this.addChatMessage(randomPlayer.name, 'إجابة خاطئة!', 'other');
            }
            randomPlayer.status = 'ready';
            this.updatePlayersList();
        }, 2000 + Math.random() * 2000);
    }
    
    timeUp() {
        this.clearTimer();
        
        const currentUser = this.players.find(p => p.isCurrentUser);
        if (currentUser && !this.selectedAnswer) {
            this.addChatMessage(this.currentUser, 'انتهى الوقت! لم تجب', 'self');
            currentUser.status = 'ready';
            this.updatePlayersList();
        }
        
        this.showCorrectAnswer();
    }
    
    nextQuestion() {
        if (this.questionsAnswered >= this.currentRoom.totalQuestions || this.questionsAnswered >= 10) {
            this.endGame();
        } else {
            this.loadQuestion();
        }
    }
    
    endGame() {
        this.gameState = 'finished';
        this.clearTimer();
        
        document.getElementById('questionText').textContent = 'انتهت اللعبة! 🏆';
        document.getElementById('answersGrid').style.display = 'none';
        document.getElementById('gameTimer').textContent = 'انتهت';
        
        this.showGameResults();
    }
    
    showGameResults() {
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        let resultsMessage = '🏆 نتائج اللعبة:\n';
        sortedPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            resultsMessage += `${medal} ${player.name}: ${player.score} نقطة\n`;
        });
        
        this.addSystemMessage(resultsMessage);
        this.addSystemMessage(`📊 الفئة: ${this.currentCategory} | الأسئلة: ${this.questionsAnswered}`);
        
        const winner = sortedPlayers[0];
        this.addSystemMessage(`🎊 فائز اللعبة: ${winner.name} بـ ${winner.score} نقطة!`);
        
        setTimeout(() => {
            this.showPlayAgainOption();
        }, 3000);
    }
    
    showPlayAgainOption() {
        document.getElementById('questionText').innerHTML = `
            <div>
                <h4>🎮 هل تريد اللعب مرة أخرى؟</h4>
                <p class="text-muted">الفئة: ${this.currentCategory} | الأسئلة: ${this.questionsAnswered}</p>
                <div class="mt-3">
                    <button class="btn btn-success btn-lg me-2" onclick="playAgain()">
                        <i class="fas fa-redo me-2"></i>العب مرة أخرى
                    </button>
                    <button class="btn btn-primary btn-lg me-2" onclick="changeCategory()">
                        <i class="fas fa-random me-2"></i>تغيير الفئة
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="leaveRoom()">
                        <i class="fas fa-sign-out-alt me-2"></i>مغادرة
                    </button>
                </div>
            </div>
        `;
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.addChatMessage(this.currentUser, message, 'self');
        input.value = '';
        
        this.simulateChatResponse(message);
    }
    
    addChatMessage(author, text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-author">${author}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 100) {
            messages[0].remove();
        }
    }
    
    addSystemMessage(text) {
        const messagesContainer = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = text;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    simulateChatResponse(message) {
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const responses = [
                    'موافق!', 'أفكر...', 'جيد جداً', 'ممتاز!',
                    'صعب بعض الشيء', 'أسهل مما توقعت'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const randomPlayer = this.players.filter(p => !p.isCurrentUser)[Math.floor(Math.random() * (this.players.length - 1))];
                
                if (randomPlayer) {
                    this.addChatMessage(randomPlayer.name, randomResponse, 'other');
                }
            }, 1000 + Math.random() * 2000);
        }
    }
    
    handleChatKeypress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }
    
    sendPlayerStatus(status) {
        console.log(`Player status: ${status}`);
    }
    
    leaveRoom() {
        if (confirm('هل أنت متأكد من مغادرة الغرفة؟')) {
            const playerIndex = this.players.findIndex(p => p.isCurrentUser);
            if (playerIndex !== -1) {
                this.players.splice(playerIndex, 1);
            }
            
            window.location.href = 'multiplayer.html';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    showAlert(message, type) {
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
        }, 5000);
    }
}

// Initialize game room
document.addEventListener('DOMContentLoaded', function() {
    window.multiplayerGameRoom = new MultiplayerGameRoom();
    
    window.toggleReady = () => window.multiplayerGameRoom.toggleReady();
    window.selectAnswer = (element, answer) => window.multiplayerGameRoom.selectAnswer(element, answer);
    window.sendMessage = () => window.multiplayerGameRoom.sendMessage();
    window.handleChatKeypress = (e) => window.multiplayerGameRoom.handleChatKeypress(e);
    window.leaveRoom = () => window.multiplayerGameRoom.leaveRoom();
    window.toggleFullscreen = () => window.multiplayerGameRoom.toggleFullscreen();
    window.playAgain = () => {
        window.multiplayerGameRoom.questionsAnswered = 0;
        window.multiplayerGameRoom.questionDatabase.shuffleAllQuestions();
        window.multiplayerGameRoom.startGame();
    };
    window.changeCategory = () => {
        const categories = ['عبارات', 'أزياء', 'حرف', 'أكل'];
        const currentIndex = categories.indexOf(window.multiplayerGameRoom.currentCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        window.multiplayerGameRoom.currentCategory = categories[nextIndex];
        window.multiplayerGameRoom.currentRoom.name = `غرفة التراث - ${window.multiplayerGameRoom.currentCategory}`;
        window.multiplayerGameRoom.currentRoom.category = window.multiplayerGameRoom.currentCategory;
        window.multiplayerGameRoom.questionsAnswered = 0;
        window.multiplayerGameRoom.questionDatabase.shuffleAllQuestions();
        window.multiplayerGameRoom.startGame();
    };
});

window.addEventListener('beforeunload', (e) => {
    if (window.multiplayerGameRoom && window.multiplayerGameRoom.gameState === 'playing') {
        e.preventDefault();
        e.returnValue = 'اللعبة قيد التقدم. هل أنت متأكد من المغادرة؟';
    }
});