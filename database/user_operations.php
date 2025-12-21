<?php
/**
 * User Operations for Wareeth Game
 * عمليات المستخدمين للعبة وريث
 */

require_once 'config.php';

class UserOperations {
    private $db;
    
    public function __construct() {
        $this->db = new DatabaseConfig();
    }
    
    /**
     * Register new user
     * تسجيل مستخدم جديد
     */
    public function registerUser($username, $email, $password) {
        try {
            $conn = $this->db->getConnection();
            
            // Validate inputs
            if (empty($username) || empty($email) || empty($password)) {
                return ['success' => false, 'message' => 'جميع الحقول مطلوبة'];
            }
            
            // Check if username already exists
            $checkUsername = "SELECT id FROM users WHERE username = ?";
            $stmt = $conn->prepare($checkUsername);
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                return ['success' => false, 'message' => 'اسم المستخدم موجود بالفعل'];
            }
            
            // Check if email already exists
            $checkEmail = "SELECT id FROM users WHERE email = ?";
            $stmt = $conn->prepare($checkEmail);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                return ['success' => false, 'message' => 'البريد الإلكتروني موجود بالفعل'];
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $insertUser = "INSERT INTO users (username, email, password, level, total_score, games_played, best_score) VALUES (?, ?, ?, 'مبتدئ', 0, 0, 0)";
            $stmt = $conn->prepare($insertUser);
            $stmt->bind_param("sss", $username, $email, $hashedPassword);
            
            if ($stmt->execute()) {
                $userId = $conn->insert_id;
                
                // Create initial achievements
                $this->createInitialAchievements($userId);
                
                return [
                    'success' => true, 
                    'message' => 'تم تسجيل المستخدم بنجاح',
                    'user_id' => $userId
                ];
            } else {
                return ['success' => false, 'message' => 'فشل تسجيل المستخدم'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * User login
     * تسجيل دخول المستخدم
     */
    public function loginUser($email, $password) {
        try {
            $conn = $this->db->getConnection();
            
            // Get user by email
            $getUser = "SELECT id, username, email, password, level, total_score, games_played, best_score FROM users WHERE email = ? AND status = 'active'";
            $stmt = $conn->prepare($getUser);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'];
            }
            
            $user = $result->fetch_assoc();
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                return ['success' => false, 'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'];
            }
            
            // Update last login
            $updateLogin = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $conn->prepare($updateLogin);
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            
            // Remove password from response
            unset($user['password']);
            
            return [
                'success' => true, 
                'message' => 'تم تسجيل الدخول بنجاح',
                'user' => $user
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get user profile
     * الحصول على ملف المستخدم الشخصي
     */
    public function getUserProfile($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $getUser = "SELECT id, username, email, level, total_score, games_played, best_score, registration_date, last_login FROM users WHERE id = ? AND status = 'active'";
            $stmt = $conn->prepare($getUser);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                return ['success' => false, 'message' => 'المستخدم غير موجود'];
            }
            
            $user = $result->fetch_assoc();
            
            // Get user achievements
            $achievements = $this->getUserAchievements($userId);
            $user['achievements'] = $achievements;
            
            // Get recent games
            $recentGames = $this->getUserRecentGames($userId, 5);
            $user['recent_games'] = $recentGames;
            
            // Calculate statistics
            $user['average_score'] = $this->getUserAverageScore($userId);
            $user['rank'] = $this->getUserRank($userId);
            
            return [
                'success' => true, 
                'user' => $user
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update user profile
     * تحديث ملف المستخدم الشخصي
     */
    public function updateUserProfile($userId, $username, $email) {
        try {
            $conn = $this->db->getConnection();
            
            // Check if username is taken by another user
            $checkUsername = "SELECT id FROM users WHERE username = ? AND id != ?";
            $stmt = $conn->prepare($checkUsername);
            $stmt->bind_param("si", $username, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                return ['success' => false, 'message' => 'اسم المستخدم موجود بالفعل'];
            }
            
            // Check if email is taken by another user
            $checkEmail = "SELECT id FROM users WHERE email = ? AND id != ?";
            $stmt = $conn->prepare($checkEmail);
            $stmt->bind_param("si", $email, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                return ['success' => false, 'message' => 'البريد الإلكتروني موجود بالفعل'];
            }
            
            // Update user profile
            $updateUser = "UPDATE users SET username = ?, email = ? WHERE id = ?";
            $stmt = $conn->prepare($updateUser);
            $stmt->bind_param("ssi", $username, $email, $userId);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'تم تحديث الملف الشخصي بنجاح'];
            } else {
                return ['success' => false, 'message' => 'فشل تحديث الملف الشخصي'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get user achievements
     * الحصول على إنجازات المستخدم
     */
    private function getUserAchievements($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $getAchievements = "SELECT achievement_name, achievement_description, achievement_icon, earned_at FROM achievements WHERE user_id = ? ORDER BY earned_at DESC";
            $stmt = $conn->prepare($getAchievements);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $achievements = [];
            while ($row = $result->fetch_assoc()) {
                $achievements[] = $row;
            }
            
            return $achievements;
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get user recent games
     * الحصول على ألعاب المستخدم الأخيرة
     */
    private function getUserRecentGames($userId, $limit = 5) {
        try {
            $conn = $this->db->getConnection();
            
            $getRecentGames = "SELECT score, total_questions, correct_answers, percentage, game_date, difficulty_level FROM scores WHERE user_id = ? ORDER BY game_date DESC LIMIT ?";
            $stmt = $conn->prepare($getRecentGames);
            $stmt->bind_param("ii", $userId, $limit);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $games = [];
            while ($row = $result->fetch_assoc()) {
                $games[] = $row;
            }
            
            return $games;
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    /**
     * Get user average score
     * الحصول على متوسط درجات المستخدم
     */
    private function getUserAverageScore($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $getAverage = "SELECT AVG(percentage) as avg_score FROM scores WHERE user_id = ?";
            $stmt = $conn->prepare($getAverage);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return round($row['avg_score'], 2);
            }
            
            return 0;
            
        } catch (Exception $e) {
            return 0;
        }
    }
    
    /**
     * Get user rank
     * الحصول على ترتيب المستخدم
     */
    private function getUserRank($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $getRank = "SELECT COUNT(*) + 1 as rank FROM users WHERE total_score > (SELECT total_score FROM users WHERE id = ?) AND status = 'active'";
            $stmt = $conn->prepare($getRank);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row['rank'];
            }
            
            return 1;
            
        } catch (Exception $e) {
            return 1;
        }
    }
    
    /**
     * Create initial achievements for new user
     * إنشاء إنجازات أولية للمستخدم الجديد
     */
    private function createInitialAchievements($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $insertAchievement = "INSERT INTO achievements (user_id, achievement_name, achievement_description, achievement_icon) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($insertAchievement);
            
            $achievements = [
                ['الانضمام', 'لقد انضممت إلى لعبة وريث', 'fa-user-plus'],
                ['البداية', 'تم إنشاء حسابك بنجاح', 'fa-flag-checkered']
            ];
            
            foreach ($achievements as $achievement) {
                $stmt->bind_param("isss", $userId, $achievement[0], $achievement[1], $achievement[2]);
                $stmt->execute();
            }
            
        } catch (Exception $e) {
            // Log error but don't fail registration
        }
    }
    
    /**
     * Save game result
     * حفظ نتيجة اللعبة
     */
    public function saveGameResult($userId, $score, $totalQuestions, $correctAnswers, $wrongAnswers, $skippedAnswers, $percentage, $timeTaken, $difficultyLevel) {
        try {
            $conn = $this->db->getConnection();
            
            // Insert game result
            $insertScore = "INSERT INTO scores (user_id, score, total_questions, correct_answers, wrong_answers, skipped_answers, percentage, time_taken, difficulty_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($insertScore);
            $stmt->bind_param("iiiiiiiss", $userId, $score, $totalQuestions, $correctAnswers, $wrongAnswers, $skippedAnswers, $percentage, $timeTaken, $difficultyLevel);
            
            if ($stmt->execute()) {
                // Update user statistics
                $this->updateUserStatistics($userId, $score, $percentage);
                
                // Check for new achievements
                $this->checkAchievements($userId, $percentage, $score);
                
                return ['success' => true, 'message' => 'تم حفظ نتيجة اللعبة بنجاح'];
            } else {
                return ['success' => false, 'message' => 'فشل حفظ نتيجة اللعبة'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update user statistics
     * تحديث إحصائيات المستخدم
     */
    private function updateUserStatistics($userId, $score, $percentage) {
        try {
            $conn = $this->db->getConnection();
            
            // Update total score and games played
            $updateStats = "UPDATE users SET total_score = total_score + ?, games_played = games_played + 1, best_score = GREATEST(best_score, ?) WHERE id = ?";
            $stmt = $conn->prepare($updateStats);
            $stmt->bind_param("iii", $score, $percentage, $userId);
            $stmt->execute();
            
            // Update user level based on total score
            $this->updateUserLevel($userId);
            
        } catch (Exception $e) {
            // Log error
        }
    }
    
    /**
     * Update user level
     * تحديث مستوى المستخدم
     */
    private function updateUserLevel($userId) {
        try {
            $conn = $this->db->getConnection();
            
            $getUserScore = "SELECT total_score FROM users WHERE id = ?";
            $stmt = $conn->prepare($getUserScore);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $totalScore = $user['total_score'];
                
                // Determine level based on total score
                $level = 'مبتدئ';
                if ($totalScore >= 2000) {
                    $level = 'محترف';
                } elseif ($totalScore >= 1000) {
                    $level = 'متقدم';
                } elseif ($totalScore >= 500) {
                    $level = 'متوسط';
                }
                
                // Update level
                $updateLevel = "UPDATE users SET level = ? WHERE id = ?";
                $stmt = $conn->prepare($updateLevel);
                $stmt->bind_param("si", $level, $userId);
                $stmt->execute();
            }
            
        } catch (Exception $e) {
            // Log error
        }
    }
    
    /**
     * Check for new achievements
     * التحقق من الإنجازات الجديدة
     */
    private function checkAchievements($userId, $percentage, $score) {
        try {
            $conn = $this->db->getConnection();
            
            // Get user statistics
            $getUserStats = "SELECT games_played, total_score, best_score FROM users WHERE id = ?";
            $stmt = $conn->prepare($getUserStats);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $newAchievements = [];
                
                // Check for perfect game achievement
                if ($percentage == 100) {
                    $newAchievements[] = ['مثالي', 'حققت 100% في لعبة', 'fa-star'];
                }
                
                // Check for high score achievement
                if ($score >= 90) {
                    $newAchievements[] = ['درجة عالية', 'حققت 90 نقطة أو أكثر', 'fa-trophy'];
                }
                
                // Check for games played achievements
                if ($user['games_played'] == 10) {
                    $newAchievements[] = ['لاعب منتظم', 'أكملت 10 ألعاب', 'fa-gamepad'];
                } elseif ($user['games_played'] == 50) {
                    $newAchievements[] = ['لاعب نشط', 'أكملت 50 لعبة', 'fa-fire'];
                } elseif ($user['games_played'] == 100) {
                    $newAchievements[] = ['محترف', 'أكملت 100 لعبة', 'fa-crown'];
                }
                
                // Check for total score achievements
                if ($user['total_score'] >= 500 && $user['total_score'] < 1000) {
                    $newAchievements[] = ['متوسط', 'وصلت إلى 500 نقطة', 'fa-medal'];
                } elseif ($user['total_score'] >= 1000 && $user['total_score'] < 2000) {
                    $newAchievements[] = ['متقدم', 'وصلت إلى 1000 نقطة', 'fa-award'];
                } elseif ($user['total_score'] >= 2000) {
                    $newAchievements[] = ['خبير', 'وصلت إلى 2000 نقطة', 'fa-crown'];
                }
                
                // Insert new achievements
                foreach ($newAchievements as $achievement) {
                    // Check if achievement already exists
                    $checkAchievement = "SELECT id FROM achievements WHERE user_id = ? AND achievement_name = ?";
                    $stmt = $conn->prepare($checkAchievement);
                    $stmt->bind_param("is", $userId, $achievement[0]);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    if ($result->num_rows === 0) {
                        // Insert new achievement
                        $insertAchievement = "INSERT INTO achievements (user_id, achievement_name, achievement_description, achievement_icon) VALUES (?, ?, ?, ?)";
                        $stmt = $conn->prepare($insertAchievement);
                        $stmt->bind_param("isss", $userId, $achievement[0], $achievement[1], $achievement[2]);
                        $stmt->execute();
                    }
                }
            }
            
        } catch (Exception $e) {
            // Log error
        }
    }
}
?>