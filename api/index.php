<?php
/**
 * API Router for Wareeth Game
 * موجه الـ API للعبة وريث
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database configuration
require_once '../database/config.php';

// API Response Helper Function
function apiResponse($success, $data = null, $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Authentication Middleware
function requireAuth() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        apiResponse(false, null, 'Authentication required', 401);
    }
    return $_SESSION['user_id'];
}

// Get current user data
function getCurrentUser() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    require_once '../database/user_operations.php';
    $userOps = new UserOperations();
    $result = $userOps->getUserProfile($_SESSION['user_id']);
    
    return $result['success'] ? $result['user'] : null;
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Remove 'api' from path parts
if ($pathParts[0] === 'api') {
    array_shift($pathParts);
}

$route = $pathParts[0] ?? '';
$action = $pathParts[1] ?? '';
$id = $pathParts[2] ?? null;

try {
    switch ($route) {
        case 'auth':
            require_once 'auth.php';
            break;
            
        case 'questions':
            require_once 'questions.php';
            break;
            
        case 'game':
            require_once 'game.php';
            break;
            
        case 'multiplayer':
            require_once 'multiplayer.php';
            break;
            
        case 'user':
            require_once 'user.php';
            break;
            
        case 'leaderboard':
            require_once 'leaderboard.php';
            break;
            
        default:
            apiResponse(false, null, 'Endpoint not found', 404);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    apiResponse(false, null, 'Internal server error', 500);
}