// Multiplayer Game JavaScript
class MultiplayerGame {
    constructor() {
        this.currentRoom = null;
        this.isInRoom = false;
        this.rooms = [];
        this.onlineUsers = 24;
        this.socket = null;
        this.currentUser = localStorage.getItem('username') || 'لاعب';
        
        this.init();
    }
    
    init() {
        this.loadRooms();
        this.initializeWebSocket();
        this.startRealTimeUpdates();
        this.initializeEventListeners();
    }
    
    loadRooms() {
        // Sample rooms data (in real app, this would come from server)
        this.rooms = [
            {
                id: 1,
                name: 'غرفة التراث الإسلامي',
                category: 'تاريخ',
                difficulty: 'متوسط',
                maxPlayers: 4,
                currentPlayers: 2,
                status: 'waiting',
                players: ['أحمد', 'سارة'],
                createdAt: new Date(Date.now() - 5 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true
            },
            {
                id: 2,
                name: 'تحدي الجغرافيا',
                category: 'جغرافيا',
                difficulty: 'صعب',
                maxPlayers: 4,
                currentPlayers: 4,
                status: 'playing',
                players: ['محمد', 'فهد', 'نورة', 'عبدالله'],
                createdAt: new Date(Date.now() - 2 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true
            },
            {
                id: 3,
                name: 'غرفة الثقافة السعودية',
                category: 'ثقافة',
                difficulty: 'سهل',
                maxPlayers: 4,
                currentPlayers: 1,
                status: 'waiting',
                players: ['خالد'],
                createdAt: new Date(Date.now() - 10 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true
            },
            {
                id: 4,
                name: 'بطولة الأبطال',
                category: 'متنوع',
                difficulty: 'محترف',
                maxPlayers: 6,
                currentPlayers: 3,
                status: 'waiting',
                players: ['سلطان', 'لينا', 'عمر'],
                createdAt: new Date(Date.now() - 15 * 60000),
                hasPassword: true,
                password: 'champions2024',
                allowSpectators: false,
                enableChat: true,
                isPrivate: true
            },
            {
                id: 5,
                name: 'تحدي السرعة',
                category: 'متنوع',
                difficulty: 'متوسط',
                maxPlayers: 4,
                currentPlayers: 4,
                status: 'playing',
                players: ['هند', 'يوسف', 'مريهام', 'بندر'],
                createdAt: new Date(Date.now() - 1 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true
            },
            {
                id: 6,
                name: 'غرفة المبتدئين',
                category: 'متنوع',
                difficulty: 'سهل',
                maxPlayers: 4,
                currentPlayers: 2,
                status: 'waiting',
                players: ['رنا', 'ماجد'],
                createdAt: new Date(Date.now() - 20 * 60000),
                hasPassword: false,
                allowSpectators: true,
                enableChat: true,
                isBeginnerRoom: true
            }
        ];
        
        this.updateRoomsList();
    }
    
    updateRoomsList() {
        // Update online count
        document.getElementById('onlineCount').textContent = this.onlineUsers;
        document.getElementById('activeRooms').textContent = this.rooms.filter(r => r.status === 'waiting').length;
        document.getElementById('chatOnlineCount').textContent = this.onlineUsers;
    }
    
    initializeWebSocket() {
        // Simulate WebSocket connection (in real app, this would be actual WebSocket)
        this.simulateWebSocket();
    }
    
    simulateWebSocket() {
        // Simulate real-time updates
        setInterval(() => {
            this.simulateUserActivity();
            this.simulateChatMessages();
        }, 30000); // Every 30 seconds
        
        // Simulate quick updates
        setInterval(() => {
            this.updateOnlineCount();
        }, 10000); // Every 10 seconds
    }
    
    simulateUserActivity() {
        // Randomly add/remove users from rooms
        if (Math.random() > 0.7) {
            const randomRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
            if (randomRoom.status === 'waiting' && randomRoom.currentPlayers < randomRoom.maxPlayers) {
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
            { author: 'عبدالله', text: 'مميز! أريد اللعب مرة أخرى' },
            { author: 'فاطمة', text: 'أحد ينشئ غرفة جديدة؟' },
            { author: 'خالد', text: 'تحدي السرعة كان ممتعاً جداً' },
            { author: 'مريهام', text: 'جربوا غرفة التاريخ، الأسئلة فيها ممتازة' },
            { author: 'بندر', text: 'متى تبدأ البطولة القادمة؟' }
        ];
        
        if (Math.random() > 0.6) {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.addChatMessage(randomMessage.author, randomMessage.text, 'other');
        }
    }
    
    updateOnlineCount() {
        // Simulate fluctuating online count
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        this.onlineUsers = Math.max(10, Math.min(50, this.onlineUsers + change));
        this.updateRoomsList();
    }
    
    startRealTimeUpdates() {
        // Update room times
        setInterval(() => {
            this.updateRoomTimes();
        }, 60000); // Every minute
        
        // Check room status changes
        setInterval(() => {
            this.checkRoomStatusChanges();
        }, 15000); // Every 15 seconds
    }
    
    updateRoomTimes() {
        this.rooms.forEach(room => {
            // Update time displays
            const timeElements = document.querySelectorAll('.room-time');
            // In real implementation, this would update the DOM
        });
    }
    
    checkRoomStatusChanges() {
        this.rooms.forEach(room => {
            // Randomly start games in waiting rooms with enough players
            if (room.status === 'waiting' && room.currentPlayers >= 2 && Math.random() > 0.8) {
                room.status = 'playing';
                this.showNotification(`بدأت اللعبة في غرفة ${room.name}!`, 'success');
                this.updateRoomDisplay(room);
            }
        });
    }
    
    updateRoomDisplay(room) {
        // Update room display in the UI
        const roomCard = document.querySelector(`[data-room-id="${room.id}"]`);
        if (roomCard) {
            const statusElement = roomCard.querySelector('.room-status');
            const statusClass = room.status === 'playing' ? 'status-playing' : 'status-waiting';
            const statusText = room.status === 'playing' ? 'قيد اللعب' : 'في انتظار';
            
            statusElement.className = `room-status ${statusClass}`;
            statusElement.textContent = statusText;
        }
    }
    
    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-pills .nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleTabSwitch(e.target.textContent);
            });
        });
        
        // Room filter
        document.querySelectorAll('.filter-tabs .nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.filterRooms(e.target.textContent.trim());
            });
        });
    }
    
    handleTabSwitch(tabName) {
        console.log(`Switched to tab: ${tabName}`);
        // Handle tab switching logic
    }
    
    filterRooms(filterType) {
        let filteredRooms = this.rooms;
        
        switch(filterType) {
            case 'جميع الغرف':
                filteredRooms = this.rooms;
                break;
            case 'متاحة الآن':
                filteredRooms = this.rooms.filter(r => r.status === 'waiting' && r.currentPlayers < r.maxPlayers);
                break;
            case 'غرف خاصة':
                filteredRooms = this.rooms.filter(r => r.isPrivate);
                break;
        }
        
        console.log(`Filtered rooms (${filterType}): ${filteredRooms.length} rooms`);
        this.displayFilteredRooms(filteredRooms);
    }
    
    displayFilteredRooms(rooms) {
        // In real implementation, this would update the DOM
        console.log('Displaying filtered rooms:', rooms);
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
        } else {
            this.enterRoom(roomId);
        }
    }
    
    enterRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        
        // Check password if required
        if (room.hasPassword) {
            const password = prompt(`أدخل كلمة مرور الغرفة ${room.name}:`);
            if (password !== room.password) {
                this.showAlert('كلمة المرور غير صحيحة', 'danger');
                return;
            }
        }
        
        // Add user to room
        if (!room.players.includes(this.currentUser)) {
            room.players.push(this.currentUser);
            room.currentPlayers++;
        }
        
        this.currentRoom = room;
        this.isInRoom = true;
        
        this.showAlert(`انضممت إلى غرفة ${room.name}`, 'success');
        
        // Navigate to multiplayer game room
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomId}`;
        }, 1500);
    }
    
    spectateRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        this.showAlert(`أنت تشاهد غرفة ${room.name}`, 'info');
        
        // Navigate to spectator view
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomId}&spectator=true`;
        }, 1500);
    }
    
    createRoom() {
        const form = document.getElementById('createRoomForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const roomData = {
            name: document.getElementById('roomName').value,
            category: document.getElementById('roomCategory').value,
            difficulty: document.getElementById('roomDifficulty').value,
            maxPlayers: parseInt(document.getElementById('maxPlayers').value),
            password: document.getElementById('roomPassword').value,
            allowSpectators: document.getElementById('allowSpectators').checked,
            enableChat: document.getElementById('enableChat').checked,
            isPrivate: document.getElementById('isPrivate').checked,
            status: 'waiting',
            currentPlayers: 1,
            players: [this.currentUser],
            createdAt: new Date(),
            id: this.rooms.length + 1
        };
        
        // Add room to list
        this.rooms.push(roomData);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createRoomModal'));
        modal.hide();
        
        // Show success message
        this.showAlert(`تم إنشاء غرفة ${roomData.name} بنجاح`, 'success');
        
        // Navigate to the room
        setTimeout(() => {
            window.location.href = `multiplayer-game.html?room=${roomData.id}&owner=true`;
        }, 1500);
    }
    
    showCreateRoomModal() {
        const modal = new bootstrap.Modal(document.getElementById('createRoomModal'));
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
        
        // Limit messages to prevent memory issues
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 50) {
            messages[0].remove();
        }
    }
    
    simulateMessageSending(message) {
        // Simulate other users responding
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const responses = [
                    'موافق! أنا موجود.',
                    'فكرة ممتازة!',
                    'أنا معكم.',
                    'متى نبدأ؟',
                    'هل الغرفة جاهزة؟'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const randomUser = ['محمد', 'سارة', 'خالد', 'فاطمة', 'عبدالله'][Math.floor(Math.random() * 5)];
                
                this.addChatMessage(randomUser, randomResponse, 'other');
            }, 2000 + Math.random() * 3000);
        }
    }
    
    handleChatKeypress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }
    
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'primary'} border-0 position-fixed top-0 start-50 translate-middle-x mt-3`;
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    showAlert(message, type) {
        // Use existing alert system or create custom
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
    window.toggleChat = () => window.multiplayerGame.toggleChat();
    window.sendMessage = () => window.multiplayerGame.sendMessage();
    window.handleChatKeypress = (e) => window.multiplayerGame.handleChatKeypress(e);
});

// Auto-refresh rooms periodically
setInterval(() => {
    if (window.multiplayerGame) {
        window.multiplayerGame.updateRoomsList();
    }
}, 30000); // Every 30 seconds