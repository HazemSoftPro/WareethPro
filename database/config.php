<?php
/**
 * Database Configuration for Wareeth Game
 * إعدادات قاعدة البيانات للعبة وريث
 */

class DatabaseConfig {
    // Database connection parameters
    private $host = 'localhost';
    private $username = 'root';
    private $password = '';
    private $database = 'wareeth_db';
    
    // Connection object
    private $conn;
    
    // Constructor
    public function __construct() {
        $this->connect();
    }
    
    /**
     * Establish database connection
     * إنشاء اتصال بقاعدة البيانات
     */
    private function connect() {
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database);
            
            // Check connection
            if ($this->conn->connect_error) {
                throw new Exception("فشل الاتصال: " . $this->conn->connect_error);
            }
            
            // Set charset to utf8 for Arabic support
            $this->conn->set_charset("utf8mb4");
            
        } catch (Exception $e) {
            die("خطأ في الاتصال بقاعدة البيانات: " . $e->getMessage());
        }
    }
    
    /**
     * Get database connection
     * الحصول على اتصال قاعدة البيانات
     */
    public function getConnection() {
        return $this->conn;
    }
    
    /**
     * Create database tables if they don't exist
     * إنشاء جداول قاعدة البيانات إذا لم تكن موجودة
     */
    public function createTables() {
        try {
            // Create users table
            $usersTable = "
                CREATE TABLE IF NOT EXISTS users (
                    id INT(11) AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    level VARCHAR(20) DEFAULT 'مبتدئ',
                    total_score INT(11) DEFAULT 0,
                    games_played INT(11) DEFAULT 0,
                    best_score INT(11) DEFAULT 0,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    status ENUM('active', 'inactive') DEFAULT 'active'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            // Create questions table
            $questionsTable = "
                CREATE TABLE IF NOT EXISTS questions (
                    id INT(11) AUTO_INCREMENT PRIMARY KEY,
                    question_text TEXT NOT NULL,
                    option_a VARCHAR(255) NOT NULL,
                    option_b VARCHAR(255) NOT NULL,
                    option_c VARCHAR(255) NOT NULL,
                    option_d VARCHAR(255) NOT NULL,
                    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    difficulty ENUM('سهل', 'متوسط', 'صعب', 'محترف') NOT NULL,
                    points INT(11) DEFAULT 10,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status ENUM('active', 'inactive') DEFAULT 'active'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            // Create scores table
            $scoresTable = "
                CREATE TABLE IF NOT EXISTS scores (
                    id INT(11) AUTO_INCREMENT PRIMARY KEY,
                    user_id INT(11) NOT NULL,
                    game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    score INT(11) NOT NULL,
                    total_questions INT(11) NOT NULL,
                    correct_answers INT(11) NOT NULL,
                    wrong_answers INT(11) NOT NULL,
                    skipped_answers INT(11) DEFAULT 0,
                    percentage DECIMAL(5,2) NOT NULL,
                    time_taken VARCHAR(10) NOT NULL,
                    difficulty_level VARCHAR(20) NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            // Create achievements table
            $achievementsTable = "
                CREATE TABLE IF NOT EXISTS achievements (
                    id INT(11) AUTO_INCREMENT PRIMARY KEY,
                    user_id INT(11) NOT NULL,
                    achievement_name VARCHAR(100) NOT NULL,
                    achievement_description TEXT NOT NULL,
                    achievement_icon VARCHAR(50) NOT NULL,
                    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            // Create game_sessions table
            $gameSessionsTable = "
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id INT(11) AUTO_INCREMENT PRIMARY KEY,
                    user_id INT(11) NOT NULL,
                    session_token VARCHAR(255) NOT NULL UNIQUE,
                    session_data JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            // Execute table creation
            $this->conn->query($usersTable);
            $this->conn->query($questionsTable);
            $this->conn->query($scoresTable);
            $this->conn->query($achievementsTable);
            $this->conn->query($gameSessionsTable);
            
            return true;
            
        } catch (Exception $e) {
            die("خطأ في إنشاء الجداول: " . $e->getMessage());
        }
    }
    
    /**
     * Insert sample data for testing
     * إدخال بيانات نموذجية للاختبار
     */
    public function insertSampleData() {
        try {
            // Check if data already exists
            $checkQuestions = "SELECT COUNT(*) as count FROM questions";
            $result = $this->conn->query($checkQuestions);
            $row = $result->fetch_assoc();
            
            if ($row['count'] > 0) {
                return; // Data already exists
            }
            
            // Insert sample questions
            $sampleQuestions = [
                [
                    'ما هو اسم أول مملكة تم تأسيسها في شبه الجزيرة العربية؟',
                    'المملكة العربية السعودية',
                    'مملكة كندة',
                    'مملكة سبأ',
                    'مملكة حِمْيَر',
                    'B',
                    'تاريخ',
                    'متوسط',
                    10
                ],
                [
                    'ما هي أكبر مدينة من حيث المساحة في المملكة العربية السعودية؟',
                    'الرياض',
                    'مكة المكرمة',
                    'المدينة المنورة',
                    'الدمام',
                    'A',
                    'جغرافيا',
                    'سهل',
                    10
                ],
                [
                    'ما هو اسم العيد الوطني للمملكة العربية السعودية؟',
                    'عيد الفطر',
                    'عيد الأضحى',
                    'اليوم الوطني',
                    'عيد الجلوس',
                    'C',
                    'ثقافة',
                    'سهل',
                    10
                ],
                [
                    'في أي عام تم تأسيس المملكة العربية السعودية؟',
                    '1925',
                    '1932',
                    '1945',
                    '1950',
                    'B',
                    'تاريخ',
                    'متوسط',
                    10
                ],
                [
                    'كم عدد مناطق المملكة العربية السعودية الإدارية؟',
                    '13',
                    '15',
                    '18',
                    '20',
                    'A',
                    'جغرافيا',
                    'متوسط',
                    10
                ]
            ];
            
            $insertQuestion = "INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($insertQuestion);
            
            foreach ($sampleQuestions as $question) {
                $stmt->bind_param("sssssssii", 
                    $question[0], $question[1], $question[2], $question[3], $question[4],
                    $question[5], $question[6], $question[7], $question[8]
                );
                $stmt->execute();
            }
            
            // Insert sample user
            $insertUser = "INSERT INTO users (username, email, password, level, total_score, games_played, best_score) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($insertUser);
            
            $username = "أحمد محمد";
            $email = "ahmed@example.com";
            $password = password_hash("password123", PASSWORD_DEFAULT);
            $level = "متوسط";
            $totalScore = 1250;
            $gamesPlayed = 24;
            $bestScore = 85;
            
            $stmt->bind_param("ssssiii", $username, $email, $password, $level, $totalScore, $gamesPlayed, $bestScore);
            $stmt->execute();
            
            return true;
            
        } catch (Exception $e) {
            die("خطأ في إدخال البيانات النموذجية: " . $e->getMessage());
        }
    }
    
    /**
     * Close database connection
     * إغلاق اتصال قاعدة البيانات
     */
    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
    
    /**
     * Destructor - close connection when object is destroyed
     */
    public function __destruct() {
        $this->close();
    }
}

// Usage example:
// $db = new DatabaseConfig();
// $db->createTables();
// $db->insertSampleData();
?>