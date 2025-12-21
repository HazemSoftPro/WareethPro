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

    
    /**
     * Insert sample data for testing
     * إدخال بيانات نموذجية للاختبار
     */
    
    
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