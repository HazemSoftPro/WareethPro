<?php
/**
 * Question Operations for Wareeth Game
 * عمليات الأسئلة للعبة وريث
 */

require_once 'config.php';

class QuestionOperations {
    private $db;
    
    public function __construct() {
        $this->db = new DatabaseConfig();
    }
    
    /**
     * Get random questions for game
     * الحصول على أسئلة عشوائية للعبة
     */
    public function getRandomQuestions($limit = 10, $difficulty = null, $category = null) {
        try {
            $conn = $this->db->getConnection();
            
            // Build query based on parameters
            $query = "SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points FROM questions WHERE status = 'active'";
            $params = [];
            $types = "";
            
            if ($difficulty && $difficulty !== 'all') {
                $query .= " AND difficulty = ?";
                $params[] = $difficulty;
                $types .= "s";
            }
            
            if ($category && $category !== 'all') {
                $query .= " AND category = ?";
                $params[] = $category;
                $types .= "s";
            }
            
            $query .= " ORDER BY RAND() LIMIT ?";
            $params[] = $limit;
            $types .= "i";
            
            $stmt = $conn->prepare($query);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $questions = [];
            while ($row = $result->fetch_assoc()) {
                // Remove correct_answer from client response for security
                $questionForClient = $row;
                unset($questionForClient['correct_answer']);
                $questions[] = [
                    'client' => $questionForClient,
                    'server' => $row // Keep correct answer for server validation
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
     * Get all questions for admin
     * الحصول على جميع الأسئلة للمسؤول
     */
    public function getAllQuestions($page = 1, $limit = 20, $category = null, $difficulty = null) {
        try {
            $conn = $this->db->getConnection();
            
            $offset = ($page - 1) * $limit;
            
            // Build query
            $query = "SELECT * FROM questions WHERE 1=1";
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
            
            // Get total count
            $countQuery = str_replace("SELECT *", "SELECT COUNT(*) as total", $query);
            $countStmt = $conn->prepare($countQuery);
            
            if (!empty($params)) {
                $countStmt->bind_param($types, ...$params);
            }
            
            $countStmt->execute();
            $totalResult = $countStmt->get_result();
            $total = $totalResult->fetch_assoc()['total'];
            
            // Get questions
            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            $types .= "ii";
            
            $stmt = $conn->prepare($query);
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            $questions = [];
            while ($row = $result->fetch_assoc()) {
                $questions[] = $row;
            }
            
            return [
                'success' => true,
                'questions' => $questions,
                'total' => $total,
                'page' => $page,
                'total_pages' => ceil($total / $limit)
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Add new question
     * إضافة سؤال جديد
     */
    public function addQuestion($questionText, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $category, $difficulty, $points = 10) {
        try {
            $conn = $this->db->getConnection();
            
            // Validate inputs
            if (empty($questionText) || empty($optionA) || empty($optionB) || empty($optionC) || empty($optionD) || empty($correctAnswer)) {
                return ['success' => false, 'message' => 'جميع الحقول مطلوبة'];
            }
            
            if (!in_array($correctAnswer, ['A', 'B', 'C', 'D'])) {
                return ['success' => false, 'message' => 'الإجابة الصحيحة يجب أن تكون A, B, C, أو D'];
            }
            
            if (!in_array($difficulty, ['سهل', 'متوسط', 'صعب', 'محترف'])) {
                return ['success' => false, 'message' => 'مستوى الصعوبة غير صالح'];
            }
            
            // Insert question
            $insertQuestion = "INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($insertQuestion);
            $stmt->bind_param("ssssssssi", $questionText, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $category, $difficulty, $points);
            
            if ($stmt->execute()) {
                $questionId = $conn->insert_id;
                return [
                    'success' => true, 
                    'message' => 'تم إضافة السؤال بنجاح',
                    'question_id' => $questionId
                ];
            } else {
                return ['success' => false, 'message' => 'فشل إضافة السؤال'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update question
     * تحديث السؤال
     */
    public function updateQuestion($questionId, $questionText, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $category, $difficulty, $points) {
        try {
            $conn = $this->db->getConnection();
            
            // Validate inputs
            if (!in_array($correctAnswer, ['A', 'B', 'C', 'D'])) {
                return ['success' => false, 'message' => 'الإجابة الصحيحة يجب أن تكون A, B, C, أو D'];
            }
            
            if (!in_array($difficulty, ['سهل', 'متوسط', 'صعب', 'محترف'])) {
                return ['success' => false, 'message' => 'مستوى الصعوبة غير صالح'];
            }
            
            // Update question
            $updateQuestion = "UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, category = ?, difficulty = ?, points = ? WHERE id = ?";
            $stmt = $conn->prepare($updateQuestion);
            $stmt->bind_param("ssssssssiii", $questionText, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $category, $difficulty, $points, $questionId);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    return ['success' => true, 'message' => 'تم تحديث السؤال بنجاح'];
                } else {
                    return ['success' => false, 'message' => 'السؤال غير موجود أو لم يتم تغيير أي شيء'];
                }
            } else {
                return ['success' => false, 'message' => 'فشل تحديث السؤال'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Delete question
     * حذف السؤال
     */
    public function deleteQuestion($questionId) {
        try {
            $conn = $this->db->getConnection();
            
            // Soft delete - set status to inactive
            $deleteQuestion = "UPDATE questions SET status = 'inactive' WHERE id = ?";
            $stmt = $conn->prepare($deleteQuestion);
            $stmt->bind_param("i", $questionId);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    return ['success' => true, 'message' => 'تم حذف السؤال بنجاح'];
                } else {
                    return ['success' => false, 'message' => 'السؤال غير موجود'];
                }
            } else {
                return ['success' => false, 'message' => 'فشل حذف السؤال'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get question by ID
     * الحصول على سؤال بالمعرف
     */
    public function getQuestionById($questionId) {
        try {
            $conn = $this->db->getConnection();
            
            $getQuestion = "SELECT * FROM questions WHERE id = ?";
            $stmt = $conn->prepare($getQuestion);
            $stmt->bind_param("i", $questionId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $question = $result->fetch_assoc();
                return [
                    'success' => true,
                    'question' => $question
                ];
            } else {
                return ['success' => false, 'message' => 'السؤال غير موجود'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get questions by category
     * الحصول على الأسئلة حسب الفئة
     */
    public function getQuestionsByCategory($category, $limit = null) {
        try {
            $conn = $this->db->getConnection();
            
            $query = "SELECT id, question_text, category, difficulty, points FROM questions WHERE category = ? AND status = 'active' ORDER BY created_at DESC";
            $params = [$category];
            $types = "s";
            
            if ($limit) {
                $query .= " LIMIT ?";
                $params[] = $limit;
                $types .= "i";
            }
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $questions = [];
            while ($row = $result->fetch_assoc()) {
                $questions[] = $row;
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
     * Get questions by difficulty
     * الحصول على الأسئلة حسب الصعوبة
     */
    public function getQuestionsByDifficulty($difficulty, $limit = null) {
        try {
            $conn = $this->db->getConnection();
            
            $query = "SELECT id, question_text, category, difficulty, points FROM questions WHERE difficulty = ? AND status = 'active' ORDER BY created_at DESC";
            $params = [$difficulty];
            $types = "s";
            
            if ($limit) {
                $query .= " LIMIT ?";
                $params[] = $limit;
                $types .= "i";
            }
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $questions = [];
            while ($row = $result->fetch_assoc()) {
                $questions[] = $row;
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
     * Get categories
     * الحصول على الفئات
     */
    public function getCategories() {
        try {
            $conn = $this->db->getConnection();
            
            $getCategories = "SELECT DISTINCT category FROM questions WHERE status = 'active' ORDER BY category";
            $stmt = $conn->prepare($getCategories);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $categories = [];
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row['category'];
            }
            
            return [
                'success' => true,
                'categories' => $categories
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get statistics
     * الحصول على إحصائيات
     */
    public function getStatistics() {
        try {
            $conn = $this->db->getConnection();
            
            // Get total questions
            $getTotal = "SELECT COUNT(*) as total FROM questions WHERE status = 'active'";
            $result = $conn->query($getTotal);
            $total = $result->fetch_assoc()['total'];
            
            // Get questions by category
            $getByCategory = "SELECT category, COUNT(*) as count FROM questions WHERE status = 'active' GROUP BY category ORDER BY count DESC";
            $result = $conn->query($getByCategory);
            $byCategory = [];
            while ($row = $result->fetch_assoc()) {
                $byCategory[] = $row;
            }
            
            // Get questions by difficulty
            $getByDifficulty = "SELECT difficulty, COUNT(*) as count FROM questions WHERE status = 'active' GROUP BY difficulty ORDER BY count DESC";
            $result = $conn->query($getByDifficulty);
            $byDifficulty = [];
            while ($row = $result->fetch_assoc()) {
                $byDifficulty[] = $row;
            }
            
            return [
                'success' => true,
                'total_questions' => $total,
                'by_category' => $byCategory,
                'by_difficulty' => $byDifficulty
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
        }
    }
    
    /**
     * Import questions from CSV
     * استيراد الأسئلة من ملف CSV
     */
    public function importQuestionsFromCSV($csvFile) {
        try {
            $conn = $this->db->getConnection();
            
            if (!file_exists($csvFile)) {
                return ['success' => false, 'message' => 'ملف CSV غير موجود'];
            }
            
            $file = fopen($csvFile, 'r');
            $imported = 0;
            $skipped = 0;
            
            // Skip header row if exists
            $header = fgetcsv($file);
            
            while (($row = fgetcsv($file)) !== FALSE) {
                if (count($row) >= 8) {
                    $questionText = trim($row[0]);
                    $optionA = trim($row[1]);
                    $optionB = trim($row[2]);
                    $optionC = trim($row[3]);
                    $optionD = trim($row[4]);
                    $correctAnswer = strtoupper(trim($row[5]));
                    $category = trim($row[6]);
                    $difficulty = trim($row[7]);
                    $points = isset($row[8]) ? intval($row[8]) : 10;
                    
                    // Validate data
                    if (!empty($questionText) && !empty($optionA) && !empty($optionB) && !empty($optionC) && !empty($optionD) && 
                        in_array($correctAnswer, ['A', 'B', 'C', 'D']) && 
                        in_array($difficulty, ['سهل', 'متوسط', 'صعب', 'محترف'])) {
                        
                        $insertQuestion = "INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        $stmt = $conn->prepare($insertQuestion);
                        $stmt->bind_param("ssssssssi", $questionText, $optionA, $optionB, $optionC, $optionD, $correctAnswer, $category, $difficulty, $points);
                        
                        if ($stmt->execute()) {
                            $imported++;
                        } else {
                            $skipped++;
                        }
                    } else {
                        $skipped++;
                    }
                } else {
                    $skipped++;
                }
            }
            
            fclose($file);
            
            return [
                'success' => true,
                'message' => "تم استيراد $imported سؤال بنجاح، تم تخطي $skipped سؤال",
                'imported' => $imported,
                'skipped' => $skipped
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في الاستيراد: ' . $e->getMessage()];
        }
    }
    
    /**
     * Export questions to CSV
    * تصدير الأسئلة إلى ملف CSV
     */
    public function exportQuestionsToCSV($filename = 'questions_export.csv') {
        try {
            $conn = $this->db->getConnection();
            
            $getQuestions = "SELECT question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, points FROM questions WHERE status = 'active' ORDER BY id";
            $result = $conn->query($getQuestions);
            
            $filepath = 'exports/' . $filename;
            
            // Create exports directory if it doesn't exist
            if (!is_dir('exports')) {
                mkdir('exports', 0755, true);
            }
            
            $file = fopen($filepath, 'w');
            
            // Add header
            fputcsv($file, ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'category', 'difficulty', 'points']);
            
            // Add data
            while ($row = $result->fetch_assoc()) {
                fputcsv($file, $row);
            }
            
            fclose($file);
            
            return [
                'success' => true,
                'message' => 'تم تصدير الأسئلة بنجاح',
                'filepath' => $filepath,
                'count' => $result->num_rows
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطأ في التصدير: ' . $e->getMessage()];
        }
    }
}
?>