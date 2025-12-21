/**
 * API Integration for Wareeth Game
 * تكامل الـ API للعبة وريث
 */

class WareethAPI {
    constructor() {
        this.baseURL = '/api';
        this.init();
    }

    init() {
        // Set up axios defaults or use fetch
        this.setupInterceptors();
    }

    setupInterceptors() {
        // Handle authentication errors globally
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.status === 401) {
                this.logout();
                window.location.href = 'login.html';
            }
        });
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication Methods
    async register(userData) {
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('password', userData.password);

        return this.request('/auth.php', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    async login(credentials) {
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);

        return this.request('/auth.php', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    async logout() {
        try {
            return this.request('/auth.php?action=logout', {
                method: 'POST'
            });
        } catch (error) {
            // Even if API call fails, clear local session
            this.clearLocalSession();
        }
    }

    async checkAuth() {
        return this.request('/auth.php?action=check', {
            method: 'GET'
        });
    }

    async getProfile() {
        return this.request('/auth.php?action=profile', {
            method: 'GET'
        });
    }

    // Questions Methods
    async getRandomQuestions(params = {}) {
        const queryString = new URLSearchParams({
            action: 'random',
            ...params
        }).toString();

        return this.request(`/questions.php?${queryString}`, {
            method: 'GET'
        });
    }

    async getCategories() {
        return this.request('/questions.php?action=categories', {
            method: 'GET'
        });
    }

    async getDifficulties() {
        return this.request('/questions.php?action=difficulties', {
            method: 'GET'
        });
    }

    async getQuestionStatistics() {
        return this.request('/questions.php?action=statistics', {
            method: 'GET'
        });
    }

    // Single Player Game Methods
    async startGame(gameConfig) {
        const formData = new FormData();
        formData.append('action', 'start');
        formData.append('difficulty', gameConfig.difficulty || 'all');
        formData.append('category', gameConfig.category || 'all');
        formData.append('question_count', gameConfig.questionCount || 10);

        return this.request('/game.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async submitAnswer(answerData) {
        const formData = new FormData();
        formData.append('action', 'answer');
        formData.append('question_index', answerData.questionIndex);
        formData.append('answer', answerData.answer);
        formData.append('time_taken', answerData.timeTaken || 0);

        return this.request('/game.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async endGame() {
        return this.request('/game.php?action=end', {
            method: 'POST'
        });
    }

    async getGameStats() {
        return this.request('/game.php?action=stats', {
            method: 'GET'
        });
    }

    async getGameHistory(params = {}) {
        const queryString = new URLSearchParams({
            action: 'history',
            ...params
        }).toString();

        return this.request(`/game.php?${queryString}`, {
            method: 'GET'
        });
    }

    // Multiplayer Methods
    async createRoom(roomData) {
        const formData = new FormData();
        formData.append('action', 'create-room');
        formData.append('room_name', roomData.roomName);
        formData.append('category', roomData.category || 'all');
        formData.append('difficulty', roomData.difficulty || 'all');
        formData.append('max_players', roomData.maxPlayers || 4);
        if (roomData.password) formData.append('password', roomData.password);
        if (roomData.isPrivate) formData.append('is_private', 'true');

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async joinRoom(roomData) {
        const formData = new FormData();
        formData.append('action', 'join-room');
        if (roomData.roomId) formData.append('room_id', roomData.roomId);
        if (roomData.roomCode) formData.append('room_code', roomData.roomCode);
        if (roomData.password) formData.append('password', roomData.password);

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async leaveRoom(roomId) {
        const formData = new FormData();
        formData.append('action', 'leave-room');
        formData.append('room_id', roomId);

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async getActiveRooms(params = {}) {
        const queryString = new URLSearchParams({
            action: 'rooms',
            ...params
        }).toString();

        return this.request(`/multiplayer.php?${queryString}`, {
            method: 'GET'
        });
    }

    async getRoomDetails(roomId) {
        return this.request(`/multiplayer.php?action=room&room_id=${roomId}`, {
            method: 'GET'
        });
    }

    async startMultiplayerGame(roomId) {
        const formData = new FormData();
        formData.append('action', 'start-game');
        formData.append('room_id', roomId);

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async submitMultiplayerAnswer(answerData) {
        const formData = new FormData();
        formData.append('action', 'answer');
        formData.append('room_id', answerData.roomId);
        formData.append('question_id', answerData.questionId);
        formData.append('answer', answerData.answer);
        formData.append('time_taken', answerData.timeTaken || 0);

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async getMultiplayerQuestions(roomId) {
        return this.request(`/multiplayer.php?action=questions&room_id=${roomId}`, {
            method: 'GET'
        });
    }

    async sendChatMessage(roomId, message) {
        const formData = new FormData();
        formData.append('action', 'chat');
        formData.append('room_id', roomId);
        formData.append('message', message);

        return this.request('/multiplayer.php', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async getChatMessages(roomId, limit = 50) {
        return this.request(`/multiplayer.php?action=chat&room_id=${roomId}&limit=${limit}`, {
            method: 'GET'
        });
    }

    // Utility Methods
    clearLocalSession() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
    }

    // Error handling
    handleAPIError(error, customMessage = '') {
        console.error('API Error:', error);
        
        let message = customMessage || 'An error occurred';
        if (error.message) {
            message = error.message;
        }

        this.showAlert(message, 'danger');
        return { success: false, message };
    }

    showAlert(message, type = 'info') {
        // Create Bootstrap alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
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

    // Loading states
    showLoading(element, text = 'Loading...') {
        if (element) {
            element.disabled = true;
            element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
        }
    }

    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    }
}

// Global API instance
window.wareethAPI = new WareethAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WareethAPI;
}