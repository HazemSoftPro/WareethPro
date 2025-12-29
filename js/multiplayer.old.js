
// Multiplayer Game JavaScript
class MultiplayerGame {
    constructor() {
        this.currentRoom = null;
        this.isInRoom = false;
        this.rooms = [];
        this.onlineUsers = 24;
        this.socket = null;
        this.currentUser = localStorage.getItem('username') || 'لاعب';
        this.currentUserId = localStorage.getItem('userId') || Date.now().toString();
        this.currentPrivateRoomId = null;
        
        this.init();
    }
    
    init() {
        this.loadRooms();
        this.initializeWebSocket();
        this.startRealTimeUpdates();
        this.initializeEventListeners();
        this.setupFiltering();
    }
    
    loadRooms() {
        // Sample rooms data based on categories from text file
        this.rooms = [
            {
                id: 1,
                name: 'تحدي العبارات النجدية',
                category: 'العبارات',
                difficulty: 'متوسط',
                maxPlayers: 4,
                currentPlayers: 2,
                status: 'waiting',
                players: ['أحمد', 'سارة'],
                createdAt: new Date(Date.now() - 5 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                gameDuration: 15,
                questionsCount: 15,
                powerupsEnabled: true
            },
            {
                id: 2,
                name: 'معركة الأزياء البدوية',
                category: 'الأزياء',
                difficulty: 'صعب',
                maxPlayers: 4,
                currentPlayers: 4,
                status: 'playing',
                players: ['محمد', 'فهد', 'نورة', 'عبدالله'],
                createdAt: new Date(Date.now() - 2 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                gameDuration: 10,
                questionsCount: 20,
                powerupsEnabled: false
            },
            {
                id: 3,
                name: 'مسابقة الحرف التقليدية',
                category: 'الحرف',
                difficulty: 'سهل',
                maxPlayers: 4,
                currentPlayers: 1,
                status: 'waiting',
                players: ['خالد'],
                createdAt: new Date(Date.now() - 10 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                gameDuration: 20,
                questionsCount: 10,
                powerupsEnabled: true
            },
            {
                id: 4,
                name: 'تحدي مصطلحات المطبخ النجدي',
                category: 'الأكل',
                difficulty: 'متوسط',
                maxPlayers: 6,
                currentPlayers: 3,
                status: 'waiting',
                players: ['سلطان', 'لينا', 'عمر'],
                createdAt: new Date(Date.now() - 15 * 60000),
                hasPassword: true,
                password: 'مطبخ2024',
                allowSpectators: false,
                enableChat: true,
                isPrivate: true,
                gameDuration: 25,
                questionsCount: 15,
                powerupsEnabled: true
            },
            {
                id: 5,
                name: 'بطولة التراث الشاملة',
                category: 'المختلطة',
                difficulty: 'محترف',
                maxPlayers: 4,
                currentPlayers: 4,
                status: 'playing',
                players: ['هند', 'يوسف', 'مريهام', 'بندر'],
                createdAt: new Date(Date.now() - 1 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                gameDuration: 5,
                questionsCount: 25,
                powerupsEnabled: true
            },
            {
                id: 6,
                name: 'غرفة المبتدئين الشاملة',
                category: 'المختلطة',
                difficulty: 'سهل',
                maxPlayers: 4,
                currentPlayers: 2,
                status: 'waiting',
                players: ['رنا', 'ماجد'],
                createdAt: new Date(Date.now() - 20 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                isBeginnerRoom: true,
                gameDuration: 30,
                questionsCount: 10,
                powerupsEnabled: false
            }
        ];
        
        this.updateRoomsList();
    }
    
    setupFiltering() {
        // Setup category filtering
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                const category = e.target.dataset.category;
                this.filterRooms(category);
            });
        });
    }
    
    filterRooms(category) {
        const roomsGrid = document.getElementById('roomsGrid');
        const roomCards = roomsGrid.querySelectorAll('.room-card');
        
        if (category === 'all') {
            roomCards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            roomCards.forEach(card => {
                const cardCategory = card.dataset.category;
                if (cardCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    updateRoomsList() {
        // Update online count
        document.getElementById('onlineCount').textContent = this.onlineUsers;
        const activeRooms = this.rooms.filter(r => r.status === 'waiting').length;
        document.getElementById('activeRooms').textContent = activeRooms;
        document.getElementById('chatOnlineCount').textContent = this.onlineUsers;
        
        // Update room times
        this.rooms.forEach(room => {
            const roomElement = document.querySelector(`[data-room-id="${room.id}"]`);
            if (roomElement) {
                const timeDiff = Math.floor((Date.now() - room.createdAt.getTime()) / 60000);
                const timeElement = roomElement.querySelector('.room-info .info-item:nth-child(3) span');
                if (timeElement) {
                    timeElement.textContent = `${timeDiff} دقيقة`;
                }
                
                // Update player count
                const playerElement = roomElement.querySelector('.room-info .info-item:nth-child(2) span');
                if (playerElement) {
                    playerElement.textContent = `${room.currentPlayers}/${room.maxPlayers}`;
                }
            }
        });
    }
    
    initializeWebSocket() {
        // Simulate WebSocket connection
        this.simulateWebSocket();
    }
    
    simulateWebSocket() {
        // Simulate real-time updates
        setInterval(() => {
            this.simulateUserActivity();
            this.simulateChatMessages();
        }, 30000);
        
        // Simulate online count updates
        setInterval(() => {
            this.updateOnlineCount();
        }, 10000);
    }
    
    simulateUserActivity() {
        // Randomly add/remove users from rooms
        if (Math.random() > 0.7) {
            const waitingRooms = this.rooms.filter(r => r.status === 'waiting' && r.currentPlayers < r.maxPlayers);
            if (waitingRooms.length > 0) {
                const randomRoom = waitingRooms[Math.floor(Math.random() * waitingRooms.length)];
                const randomUsers = ['علي', 'فاطمة', 'عبدالرحمن', 'نورة', 'خالد', 'لمياء'];
                const newUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
                if (!randomRoom.players.includes(newUser)) {
                    randomRoom.players.push(newUser);
                    randomRoom.currentPlayers++;
                    this.showNotification(`انضم ${newUser} إلى غرفة ${randomRoom.name}`, 'info');
                }
            }
        }
    }
    
    simulateChatMessages() {
        const messages = [
            { author: 'عبدالله', text: 'تحدي العبارات النجدية ممتع جداً!' },
            { author: 'فاطمة', text: 'من لديه غرفة للحرف اليدوية؟' },
            { author: 'خالد', text: 'الأسئلة عن الأزياء كانت صعبة' },
            { author: 'مريهام', text: 'مصطلحات الأكل تحتاج خبرة' },
            { author: 'بندر', text: 'اللعبة الشاملة الأفضل في رأيي' }
        ];
        
        if (Math.random() > 0.6) {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.addChatMessage(randomMessage.author, randomMessage.text, 'other');
        }
    }
    
    updateOnlineCount() {
        // Simulate fluctuating online count
        const change = Math.floor(Math.random() * 5) - 2;
        this.onlineUsers = Math.max(10, Math.min(50, this.onlineUsers + change));
        this.updateRoomsList();
    }
    
    startRealTimeUpdates() {
        // Check room status changes
        setInterval(() => {
            this.checkRoomStatusChanges();
        }, 15000);
    }
    
    checkRoomStatusChanges() {
        this.rooms.forEach(room => {
            // Start games in waiting rooms with enough players
            if (room.status === 'waiting' && room.currentPlayers >= 2 && Math.random() > 0.8) {
                room.status = 'playing';
                this.showNotification(`بدأت اللعبة في غرفة ${room.name}!`, 'success');
                this.updateRoomDisplay(room);
            }
            
            // End games in playing rooms
            if (room.status === 'playing' && Math.random() > 0.9) {
                room.status = 'waiting';
                room.currentPlayers = 1;
                room.players = [room.players[0]];
                this.updateRoomDisplay(room);
            }
        });
    }
    
    updateRoomDisplay(room) {
        const roomCard = document.querySelector(`[data-room-id="${room.id}"]`);
        if (roomCard) {
            const statusElement = roomCard.querySelector('.room-status');
            const joinButton = roomCard.querySelector('button');
            
            if (room.status === 'playing') {
                statusElement.className = 'room-status status-playing';
                statusElement.textContent = 'قيد اللعب';
                
                if (joinButton) {
                    joinButton.className = 'btn btn-secondary btn-sm';
                    joinButton.innerHTML = '<i class="fas fa-eye me-1"></i> مشاهدة';
                    joinButton.onclick = () => this.spectateRoom(room.id);
                }
            } else {
                statusElement.className = 'room-status status-waiting';
                statusElement.textContent = 'في انتظار';
                
                if (joinButton && room.currentPlayers < room.maxPlayers) {
                    joinButton.className = 'btn btn-primary btn-sm';
                    joinButton.innerHTML = '<i class="fas fa-sign-in-alt me-1"></i> انضمام';
                    joinButton.onclick = () => this.joinRoom(room.id);
                }
            }
            
            // Update players display
            const playersContainer = roomCard.querySelector('.room-players');
            if (playersContainer) {
                playersContainer.innerHTML = '';
                room.players.forEach(player => {
                    const playerDiv = document.createElement('div');
                    playerDiv.className = 'player-avatar';
                    playerDiv.textContent = player;
                    playersContainer.appendChild(playerDiv);
                });
                
                for (let i = room.players.length; i < room.maxPlayers; i++) {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'empty-slot';
                    emptySlot.textContent = '+';
                    playersContainer.appendChild(emptySlot);
                }
            }
        }
    }
    
    joinRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) {
            this.showAlert('الغرفة غير موجودة', 'danger');
            return;
        }
        
        if (room.status === 'playing') {
            if (room.allowSpectators) {
                this.spectateRoom(roomId);
            } else {
                this.showAlert('هذه الغرفة مغلقة للمشاهدة', 'warning');
                return;
            }
        } else if (room.currentPlayers >= room.maxPlayers) {
            this.showAlert('الغرفة ممتلئة', 'warning');
            return;
        } else if (room.hasPassword) {
            this.showPrivateRoomModal(room);
        } else {
            this.enterRoom(roomId);
        }
    }
    
    showPrivateRoomModal(room) {
        this.currentPrivateRoomId = room.id;
        const modal = new bootstrap.Modal(document.getElementById('privateRoomModal'));
        document.getElementById('privateRoomName').textContent = room.name;
        modal.show();
    }
    
    joinPrivateRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (room && room.hasPassword) {
            this.showPrivateRoomModal(room);
        } else {
            this.joinRoom(roomId);
        }
    }
    
    joinPrivateRoomConfirm() {
        const password = document.getElementById('privatePassword').value;
        const room = this.rooms.find(r => r.id === this.currentPrivateRoomId);
        
        if (!room) {
            this.showAlert('الغرفة غير موجودة', 'danger');
            return;
        }
        
        if (password !== room.password) {
            this.showAlert('كلمة المرور غير صحيحة', 'danger');
            document.getElementById('privatePassword').value = '';
            return;
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('privateRoomModal'));
        modal.hide();
        
        this.enterRoom(this.currentPrivateRoomId);
    }
    
    enterRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        
        // Add user to room
        if (!room.players.includes(this.currentUser)) {
            room.players.push(this.currentUser);
            room.currentPlayers++;
        }
        
        this.currentRoom = room;
        this.isInRoom = true;
        
        this.showAlert(`انضممت إلى غرفة ${room.name}`, 'success');
        
        // Prepare room data for multiplayer game
        const roomData = {
            id: room.id,
            name: room.name,
            category: room.category,
            difficulty: room.difficulty,
            players: room.players,
            currentPlayers: room.currentPlayers,
            maxPlayers: room.maxPlayers,
            duration: room.gameDuration,
            questionsCount: room.questionsCount,
            powerupsEnabled: room.powerupsEnabled,
            enableChat: room.enableChat
        };
        
        // Save room data to localStorage
        localStorage.setItem('currentRoom', JSON.stringify(roomData));
        
        // تحويل اسم الفئة إلى التنسيق المستخدم في multiplayer-game.html
        let categoryParam = '';
        switch(room.category) {
            case 'العبارات': categoryParam = 'عبارات'; break;
            case 'الأزياء': categoryParam = 'أزياء'; break;
            case 'الحرف': categoryParam = 'حرف'; break;
            case 'الأكل': categoryParam = 'أكل'; break;
            case 'المختلطة': 
                // للفئة المختلطة، نختار فئة عشوائية
                const categories = ['عبارات', 'أزياء', 'حرف', 'أكل'];
                categoryParam = categories[Math.floor(Math.random() * categories.length)];
                break;
            default: categoryParam = 'عبارات';
        }
        
        // Navigate to multiplayer game room مع الفئة
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomId}&category=${categoryParam}`;
        }, 1500);
    }
    
    spectateRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        this.showAlert(`أنت تشاهد غرفة ${room.name}`, 'info');
        
        // Save spectator status
        localStorage.setItem('isSpectator', 'true');
        
        // تحويل اسم الفئة إلى التنسيق المستخدم في multiplayer-game.html
        let categoryParam = '';
        switch(room.category) {
            case 'العبارات': categoryParam = 'عبارات'; break;
            case 'الأزياء': categoryParam = 'أزياء'; break;
            case 'الحرف': categoryParam = 'حرف'; break;
            case 'الأكل': categoryParam = 'أكل'; break;
            case 'المختلطة': 
                const categories = ['عبارات', 'أزياء', 'حرف', 'أكل'];
                categoryParam = categories[Math.floor(Math.random() * categories.length)];
                break;
            default: categoryParam = 'عبارات';
        }
        
        // Navigate to spectator view مع الفئة
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomId}&spectator=true&category=${categoryParam}`;
        }, 1500);
    }
    
    updateCategoryIcon() {
        const categorySelect = document.getElementById('roomCategory');
        const iconElement = document.getElementById('categoryIconPreview');
        
        if (iconElement) {
            iconElement.remove();
        }
        
        const selectedCategory = categorySelect.value;
        let iconClass = '';
        
        switch(selectedCategory) {
            case 'العبارات': iconClass = 'fas fa-comments'; break;
            case 'الأزياء': iconClass = 'fas fa-tshirt'; break;
            case 'الحرف': iconClass = 'fas fa-hammer'; break;
            case 'الأكل': iconClass = 'fas fa-utensils'; break;
            case 'المختلطة': iconClass = 'fas fa-random'; break;
        }
        
        if (iconClass) {
            const icon = document.createElement('i');
            icon.id = 'categoryIconPreview';
            icon.className = `${iconClass} me-2`;
            categorySelect.parentNode.insertBefore(icon, categorySelect.nextSibling);
        }
    }
    
    createRoom() {
        const form = document.getElementById('createRoomForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const roomName = document.getElementById('roomName').value;
        const roomCategory = document.getElementById('roomCategory').value;
        const roomDifficulty = document.getElementById('roomDifficulty').value;
        const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
        const gameDuration = parseInt(document.getElementById('gameDuration').value);
        const roomPassword = document.getElementById('roomPassword').value;
        const allowSpectators = document.getElementById('allowSpectators').checked;
        const enableChat = document.getElementById('enableChat').checked;
        const enablePowerups = document.getElementById('enablePowerups').checked;
        
        // Calculate questions count based on difficulty
        let questionsCount;
        switch(roomDifficulty) {
            case 'سهل': questionsCount = 10; break;
            case 'متوسط': questionsCount = 15; break;
            case 'صعب': questionsCount = 20; break;
            case 'محترف': questionsCount = 25; break;
            default: questionsCount = 15;
        }
        
        const roomData = {
            id: Date.now(),
            name: roomName,
            category: roomCategory,
            difficulty: roomDifficulty,
            maxPlayers: maxPlayers,
            currentPlayers: 1,
            status: 'waiting',
            players: [this.currentUser],
            createdAt: new Date(),
            hasPassword: roomPassword !== '',
            password: roomPassword,
            allowSpectators: allowSpectators,
            enableChat: enableChat,
            powerupsEnabled: enablePowerups,
            gameDuration: gameDuration,
            questionsCount: questionsCount,
            isPrivate: roomPassword !== ''
        };
        
        // Add room to list
        this.rooms.push(roomData);
        
        // Show success message
        this.showNotification(`تم إنشاء غرفة ${roomData.name} بنجاح!`, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createRoomModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        
        // Save room data to localStorage for the game
        localStorage.setItem('currentRoom', JSON.stringify(roomData));
        
        // تحويل اسم الفئة إلى التنسيق المستخدم في multiplayer-game.html
        let categoryParam = '';
        switch(roomCategory) {
            case 'العبارات': categoryParam = 'عبارات'; break;
            case 'الأزياء': categoryParam = 'أزياء'; break;
            case 'الحرف': categoryParam = 'حرف'; break;
            case 'الأكل': categoryParam = 'أكل'; break;
            case 'المختلطة': 
                const categories = ['عبارات', 'أزياء', 'حرف', 'أكل'];
                categoryParam = categories[Math.floor(Math.random() * categories.length)];
                break;
            default: categoryParam = 'عبارات';
        }
        
        // Navigate to the room after a short delay مع الفئة
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomData.id}&owner=true&category=${categoryParam}`;
        }, 2000);
    }
    
    showCreateRoomModal() {
        const modal = new bootstrap.Modal(document.getElementById('createRoomModal'));
        
        // Reset form
        document.getElementById('createRoomForm').reset();
        
        modal.show();
    }
    
    // Chat functionality
    toggleChat() {
        const chatContainer = document.getElementById('chatContainer');
        const chatBtn = document.querySelector('.floating-chat-btn');
        
        if (chatContainer.style.display === 'flex') {
            chatContainer.style.display = 'none';
            chatBtn.style.display = 'flex';
        } else {
            chatContainer.style.display = 'flex';
            chatBtn.style.display = 'none';
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.addChatMessage(this.currentUser, message, 'self');
        input.value = '';
        
        // Simulate sending to server
        this.simulateMessageSending(message);
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
        
        // Limit messages
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 50) {
            messages[0].remove();
        }
    }
    
    simulateMessageSending(message) {
        // Simulate other users responding
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const categoryResponses = {
                    'العبارات': ['أعرف كثير من العبارات النجدية!', 'تحدي العبارات ممتع', 'من يعرف معنى "أبعد مشحاه"؟'],
                    'الأزياء': ['المرودن والزبون من الأزياء الشهيرة', 'أعرف كل أنواع العقال', 'تحدي الأزياء صعب لكن ممتع'],
                    'الحرف': ['الخرازة من الحرف المهمة', 'الحدادة تحتاج مهارة', 'الحرف اليدوية جزء من التراث'],
                    'الأكل': ['مصطلحات الأكل قديمة وجميلة', 'العيش واللحم مصطلحات أساسية', 'تحدي الأكل ممتع']
                };
                
                // Find response based on message content
                let response = '';
                const categories = Object.keys(categoryResponses);
                categories.forEach(category => {
                    if (message.includes(category)) {
                        const responses = categoryResponses[category];
                        response = responses[Math.floor(Math.random() * responses.length)];
                    }
                });
                
                if (!response) {
                    const generalResponses = ['أنا معكم!', 'متى نبدأ؟', 'هذه فكرة ممتازة', 'أنتظر في الغرفة'];
                    response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
                }
                
                const randomUser = ['محمد', 'سارة', 'خالد', 'فاطمة', 'عبدالله'][Math.floor(Math.random() * 5)];
                
                this.addChatMessage(randomUser, response, 'other');
            }, 2000 + Math.random() * 3000);
        }
    }
    
    handleChatKeypress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'primary'} border-0 position-fixed top-0 start-50 translate-middle-x mt-3`;
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
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

// Initialize multiplayer game
document.addEventListener('DOMContentLoaded', function() {
    window.multiplayerGame = new MultiplayerGame();
    
    // Make functions globally available
    window.showCreateRoomModal = () => window.multiplayerGame.showCreateRoomModal();
    window.createRoom = () => window.multiplayerGame.createRoom();
    window.joinRoom = (id) => window.multiplayerGame.joinRoom(id);
    window.spectateRoom = (id) => window.multiplayerGame.spectateRoom(id);
    window.joinPrivateRoom = (id) => window.multiplayerGame.joinPrivateRoom(id);
    window.joinPrivateRoomConfirm = () => window.multiplayerGame.joinPrivateRoomConfirm();
    window.toggleChat = () => window.multiplayerGame.toggleChat();
    window.sendMessage = () => window.multiplayerGame.sendMessage();
    window.handleChatKeypress = (e) => window.multiplayerGame.handleChatKeypress(e);
});

// Auto-refresh rooms periodically
setInterval(() => {
    if (window.multiplayerGame) {
        window.multiplayerGame.updateRoomsList();
    }
}, 30000);
