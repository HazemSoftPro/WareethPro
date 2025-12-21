<?php
/**
 * Multiplayer Operations for Wareeth Game
 * عمليات اللعب الجماعي للعبة وريث
 */

require_once 'config.php';

class MultiplayerOperations {
    private $db;
    
    public function __construct() {
        $this->db = new DatabaseConfig();
    }
    
    /**
     * Create new game room
     * إنشاء غرفة لعب جديدة
     */
    public function createRoom($ownerId, $roomName, $category, $difficulty, $maxPlayers, $password = null, $isPrivate = false) {
        try {
            $conn = $this->db->getConnection();
            
            // Generate unique room code
            $roomCode = $this->generateRoomCode();
            
            // Insert room
            $insertRoom = "INSERT INTO game_rooms (owner_id, room_name, room_code, category, difficulty, max_players, password, is_private, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertRoom);
            $stmt->bind_param("issssis", $ownerId, $roomName, $roomCode, $category, $difficulty, $maxPlayers, $password, $isPrivate);
            
            if ($stmt->execute()) {
                $roomId = $conn->insert_id;
                
                // Add owner as first player
                $this->joinRoom($roomId, $ownerId, true);
                
                return [
                    'success' => true,
                    'message' => 'تم إنشاء الغرفة بنجاح',
                    'room_id' => $roomId,
                    'room_code' => $roomCode
                ];
            } else {
                return ['success' => false, 'message' => 'فشل إنشاء الغرفة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Join game room
     * الانضمام إلى غرفة اللعب
     */
    public function joinRoom($roomId, $userId, $isOwner = false) {
        try {
            $conn = $this->db->getConnection();
            
            // Check if room exists and is joinable
            $getRoom = "SELECT * FROM game_rooms WHERE id = ? AND status IN ('waiting', 'ready')";
            $stmt = $conn->prepare($getRoom);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'الغرفة غير موجودة أو غير متاحة'];
            }
            
            $room = $result->fetch_assoc();
            
            // Check if room is full
            $getCurrentPlayers = "SELECT COUNT(*) as player_count FROM room_players WHERE room_id = ?";
            $stmt = $conn->prepare($getCurrentPlayers);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $playerCount = $stmt->get_result()->fetch_assoc()['player_count'];
            
            if ($playerCount >= $room['max_players']) {
                return ['success' => false, 'message' => 'الغرفة ممتلئة'];
            }
            
            // Check if user already in room
            $checkPlayer = "SELECT id FROM room_players WHERE room_id = ? AND user_id = ?";
            $stmt = $conn->prepare($checkPlayer);
            $stmt->bind_param("ii", $roomId, $userId);
            $stmt->execute();
            $checkResult = $stmt->get_result();
            
            if ($checkResult->num_rows > 0) {
                return ['success' => false, 'message' => 'أنت بالفعل في هذه الغرفة'];
            }
            
            // Add player to room
            $insertPlayer = "INSERT INTO room_players (room_id, user_id, is_owner, status, joined_at) VALUES (?, ?, ?, 'joined', CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertPlayer);
            $stmt->bind_param("iii", $roomId, $userId, $isOwner);
            
            if ($stmt->execute()) {
                return [
                    'success' => true,
                    'message' => 'تم الانضمام إلى الغرفة بنجاح'
                ];
            } else {
                return ['success' => false, 'message' => 'فشل الانضمام إلى الغرفة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Leave game room
     * مغادرة غرفة اللعب
     */
    public function leaveRoom($roomId, $userId) {
        try {
            $conn = $this->db->getConnection();
            
            // Remove player from room
            $deletePlayer = "DELETE FROM room_players WHERE room_id = ? AND user_id = ?";
            $stmt = $conn->prepare($deletePlayer);
            $stmt->bind_param("ii", $roomId, $userId);
            
            if ($stmt->execute()) {
                // Check if room is empty
                $getPlayersCount = "SELECT COUNT(*) as count FROM room_players WHERE room_id = ?";
                $stmt = $conn->prepare($getPlayersCount);
                $stmt->bind_param("i", $roomId);
                $stmt->execute();
                $count = $stmt->get_result()->fetch_assoc()['count'];
                
                if ($count === 0) {
                    // Delete empty room
                    $this->deleteRoom($roomId);
                }
                
                return ['success' => true, 'message' => 'تم مغادرة الغرفة بنجاح'];
            } else {
                return ['success' => false, 'message' => 'فشل مغادرة الغرفة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get room details
     * الحصول على تفاصيل الغرفة
     */
    public function getRoomDetails($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            // Get room info
            $getRoom = "SELECT * FROM game_rooms WHERE id = ?";
            $stmt = $conn->prepare($getRoom);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $roomResult = $stmt->get_result();
            
            if ($roomResult->num_rows === 0) {
                return ['success' => false, 'message' => 'الغرفة غير موجودة'];
            }
            
            $room = $roomResult->fetch_assoc();
            
            // Get players
            $getPlayers = "SELECT rp.*, u.username FROM room_players rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.joined_at";
            $stmt = $conn->prepare($getPlayers);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $playersResult = $stmt->get_result();
            
            $players = [];
            while ($player = $playersResult->fetch_assoc()) {
                $players[] = [
                    'user_id' => $player['user_id'],
                    'username' => $player['username'],
                    'is_owner' => $player['is_owner'],
                    'status' => $player['status'],
                    'score' => $player['score'],
                    'joined_at' => $player['joined_at']
                ];
            }
            
            $room['players'] = $players;
            $room['current_players'] = count($players);
            
            return [
                'success' => true,
                'room' => $room
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get active rooms
     * الحصول على الغرف النشطة
     */
    public function getActiveRooms($limit = 20, $category = null, $difficulty = null) {
        try {
            $conn = $this->db->getConnection();
            
            // Build query
            $query = "SELECT gr.*, COUNT(rp.id) as current_players FROM game_rooms gr LEFT JOIN room_players rp ON gr.id = rp.room_id WHERE gr.status IN ('waiting', 'ready', 'playing')";
            $params = [];
            $types = "";
            
            if ($category && $category !== 'all') {
                $query .= " AND gr.category = ?";
                $params[] = $category;
                $types .= "s";
            }
            
            if ($difficulty && $difficulty !== 'all') {
                $query .= " AND gr.difficulty = ?";
                $params[] = $difficulty;
                $types .= "s";
            }
            
            $query .= " GROUP BY gr.id ORDER BY gr.created_at DESC LIMIT ?";
            $params[] = $limit;
            $types .= "i";
            
            $stmt = $conn->prepare($query);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $rooms = [];
            while ($room = $result->fetch_assoc()) {
                // Get players for each room
                $room['players'] = $this->getRoomPlayers($room['id']);
                $rooms[] = $room;
            }
            
            return [
                'success' => true,
                'rooms' => $rooms,
                'total' => count($rooms)
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get room players
     * الحصول على لاعبي الغرفة
     */
    private function getRoomPlayers($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            $getPlayers = "SELECT u.username, rp.is_owner, rp.status, rp.score FROM room_players rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.joined_at";
            $stmt = $conn->prepare($getPlayers);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $players = [];
            while ($player = $result->fetch_assoc()) {
                $players[] = $player;
            }
            
            return $players;
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Update player status
     * تحديث حالة اللاعب
     */
    public function updatePlayerStatus($roomId, $userId, $status) {
        try {
            $conn = $this->db->getConnection();
            
            $updateStatus = "UPDATE room_players SET status = ? WHERE room_id = ? AND user_id = ?";
            $stmt = $conn->prepare($updateStatus);
            $stmt->bind_param("sii", $status, $roomId, $userId);
            
            if ($stmt->execute()) {
                // Check if all players are ready
                $this->checkAllPlayersReady($roomId);
                
                return ['success' => true, 'message' => 'تم تحديث الحالة'];
            } else {
                return ['success' => false, 'message' => 'فشل تحديث الحالة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Submit player answer
     * إرسال إجابة اللاعب
     */
    public function submitAnswer($roomId, $userId, $questionId, $answer, $timeTaken) {
        try {
            $conn = $this->db->getConnection();
            
            // Check if it's the correct answer
            $getQuestion = "SELECT correct_answer FROM questions WHERE id = ?";
            $stmt = $conn->prepare($getQuestion);
            $stmt->bind_param("i", $questionId);
            $stmt->execute();
            $questionResult = $stmt->get_result();
            
            if ($questionResult->num_rows === 0) {
                return ['success' => false, 'message' => 'السؤال غير موجود'];
            }
            
            $correctAnswer = $questionResult->fetch_assoc()['correct_answer'];
            $isCorrect = $answer === $correctAnswer;
            
            // Save answer
            $insertAnswer = "INSERT INTO multiplayer_answers (room_id, user_id, question_id, answer, is_correct, time_taken, submitted_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertAnswer);
            $stmt->bind_param("iiisii", $roomId, $userId, $questionId, $answer, $isCorrect, $timeTaken);
            
            if ($stmt->execute()) {
                // Update player score if correct
                if ($isCorrect) {
                    $updateScore = "UPDATE room_players SET score = score + 10 WHERE room_id = ? AND user_id = ?";
                    $stmt = $conn->prepare($updateScore);
                    $stmt->bind_param("ii", $roomId, $userId);
                    $stmt->execute();
                }
                
                return [
                    'success' => true,
                    'message' => 'تم إرسال الإجابة',
                    'is_correct' => $isCorrect,
                    'points' => $isCorrect ? 10 : 0
                ];
            } else {
                return ['success' => false, 'message' => 'فشل إرسال الإجابة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Start game
     * بدء اللعبة
     */
    public function startGame($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            // Update room status
            $updateRoom = "UPDATE game_rooms SET status = 'playing', started_at = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $conn->prepare($updateRoom);
            $stmt->bind_param("i", $roomId);
            
            if ($stmt->execute()) {
                // Reset all player scores and status
                $resetPlayers = "UPDATE room_players SET score = 0, status = 'playing' WHERE room_id = ?";
                $stmt = $conn->prepare($resetPlayers);
                $stmt->bind_param("i", $roomId);
                $stmt->execute();
                
                return ['success' => true, 'message' => 'بدأت اللعبة'];
            } else {
                return ['success' => false, 'message' => 'فشل بدء اللعبة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * End game
     * إنهاء اللعبة
     */
    public function endGame($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            // Update room status
            $updateRoom = "UPDATE game_rooms SET status = 'finished', ended_at = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $conn->prepare($updateRoom);
            $stmt->bind_param("i", $roomId);
            
            if ($stmt->execute()) {
                // Calculate final rankings
                $this->calculateFinalRankings($roomId);
                
                return ['success' => true, 'message' => 'انتهت اللعبة'];
            } else {
                return ['success' => false, 'message' => 'فشل إنهاء اللعبة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get multiplayer questions
     * الحصول على أسئلة اللعب الجماعي
     */
    public function getMultiplayerQuestions($category = null, $difficulty = null, $count = 15) {
        try {
            $conn = $this->db->getConnection();
            
            // Build query
            $query = "SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points FROM questions WHERE status = 'active'";
            $params = [];
            $types = "";
            
            if ($category && $category !== 'all') {
                $query .= " AND category = ?";
                $params[] = $category;
                $types .= "s";
            }
            
            if ($difficulty && $difficulty !== 'all') {
                $query .= " AND difficulty = ?";
                $params[] = $difficulty;
                $types .= "s";
            }
            
            $query .= " ORDER BY RAND() LIMIT ?";
            $params[] = $count;
            $types .= "i";
            
            $stmt = $conn->prepare($query);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $questions = [];
            while ($question = $result->fetch_assoc()) {
                // Remove correct answer for client
                $questionForClient = $question;
                unset($questionForClient['correct_answer']);
                
                $questions[] = [
                    'client' => $questionForClient,
                    'server' => $question
                ];
            }
            
            return [
                'success' => true,
                'questions' => $questions,
                'count' => count($questions)
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Save chat message
     * حفظ رسالة الدردشة
     */
    public function saveChatMessage($roomId, $userId, $message) {
        try {
            $conn = $this->db->getConnection();
            
            $insertMessage = "INSERT INTO room_chat (room_id, user_id, message, sent_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertMessage);
            $stmt->bind_param("iis", $roomId, $userId, $message);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'تم إرسال الرسالة'];
            } else {
                return ['success' => false, 'message' => 'فشل إرسال الرسالة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get recent chat messages
     * الحصول على رسائل الدردشة الأخيرة
     */
    public function getRecentChatMessages($roomId, $limit = 50) {
        try {
            $conn = $this->db->getConnection();
            
            $getMessages = "SELECT rc.*, u.username FROM room_chat rc JOIN users u ON rc.user_id = u.id WHERE rc.room_id = ? ORDER BY rc.sent_at DESC LIMIT ?";
            $stmt = $conn->prepare($getMessages);
            $stmt->bind_param("ii", $roomId, $limit);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $messages = [];
            while ($message = $result->fetch_assoc()) {
                $messages[] = [
                    'username' => $message['username'],
                    'message' => $message['message'],
                    'sent_at' => $message['sent_at']
                ];
            }
            
            // Reverse to show in chronological order
            $messages = array_reverse($messages);
            
            return [
                'success' => true,
                'messages' => $messages
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Private helper methods
     */
    private function generateRoomCode() {
        return substr(strtoupper(md5(uniqid(rand(), true))), 0, 6);
    }
    
    private function deleteRoom($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            $deleteRoom = "DELETE FROM game_rooms WHERE id = ?";
            $stmt = $conn->prepare($deleteRoom);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            
        } catch (Exception $e) {
            // Log error but don't fail
        }
    }
    
    private function checkAllPlayersReady($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            $getReadyCount = "SELECT COUNT(*) as ready_count FROM room_players WHERE room_id = ? AND status = 'ready'";
            $stmt = $conn->prepare($getReadyCount);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $readyCount = $stmt->get_result()->fetch_assoc()['ready_count'];
            
            $getTotalCount = "SELECT COUNT(*) as total_count FROM room_players WHERE room_id = ?";
            $stmt = $conn->prepare($getTotalCount);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $totalCount = $stmt->get_result()->fetch_assoc()['total_count'];
            
            // Auto-start game if all players are ready and at least 2 players
            if ($readyCount === $totalCount && $totalCount >= 2) {
                $this->startGame($roomId);
            }
            
        } catch (Exception $e) {
            // Log error but don't fail
        }
    }
    
    private function calculateFinalRankings($roomId) {
        try {
            $conn = $this->db->getConnection();
            
            // Get final rankings
            $getRankings = "SELECT rp.user_id, u.username, rp.score FROM room_players rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.score DESC";
            $stmt = $conn->prepare($getRankings);
            $stmt->bind_param("i", $roomId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $rankings = [];
            $rank = 1;
            while ($player = $result->fetch_assoc()) {
                $rankings[] = [
                    'rank' => $rank++,
                    'user_id' => $player['user_id'],
                    'username' => $player['username'],
                    'score' => $player['score']
                ];
            }
            
            // Save rankings to database
            foreach ($rankings as $ranking) {
                $insertRanking = "INSERT INTO multiplayer_results (room_id, user_id, rank, score, game_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
                $stmt = $conn->prepare($insertRanking);
                $stmt->bind_param("iiii", $roomId, $ranking['user_id'], $ranking['rank'], $ranking['score']);
                $stmt->execute();
                
                // Update user stats
                $this->updateUserMultiplayerStats($ranking['user_id'], $ranking['score'], $ranking['rank']);
            }
            
        } catch (Exception $e) {
            // Log error but don't fail
        }
    }
    
    private function updateUserMultiplayerStats($userId, $score, $rank) {
        try {
            $conn = $this->db->getConnection();
            
            // Update multiplayer games played
            $updateStats = "UPDATE users SET multiplayer_games_played = multiplayer_games_played + 1 WHERE id = ?";
            $stmt = $conn->prepare($updateStats);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            
            // Add score to total
            $updateScore = "UPDATE users SET total_score = total_score + ? WHERE id = ?";
            $stmt = $conn->prepare($updateScore);
            $stmt->bind_param("ii", $score, $userId);
            $stmt->execute();
            
            // Check for new achievements
            if ($rank === 1) {
                $this->addAchievement($userId, 'بطل الجماعي', 'فزت بلعبة جماعية!', 'fa-trophy');
            }
            
        } catch (Exception $e) {
            // Log error but don't fail
        }
    }
    
    private function addAchievement($userId, $name, $description, $icon) {
        try {
            $conn = $this->db->getConnection();
            
            // Check if achievement already exists
            $checkAchievement = "SELECT id FROM achievements WHERE user_id = ? AND achievement_name = ?";
            $stmt = $conn->prepare($checkAchievement);
            $stmt->bind_param("is", $userId, $name);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                $insertAchievement = "INSERT INTO achievements (user_id, achievement_name, achievement_description, achievement_icon) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($insertAchievement);
                $stmt->bind_param("isss", $userId, $name, $description, $icon);
                $stmt->execute();
            }
            
        } catch (Exception $e) {
            // Log error but don't fail
        }
    }
}
?>