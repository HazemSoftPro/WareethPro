<?php
/**
 * Authentication API Endpoints
 * نقاط نهاية المصادقة
 */

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

require_once '../database/user_operations.php';
$userOps = new UserOperations();

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'register':
                handleRegister();
                break;
                
            case 'login':
                handleLogin();
                break;
                
            case 'logout':
                handleLogout();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'profile':
                handleGetProfile();
                break;
                
            case 'check':
                handleCheckAuth();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    default:
        apiResponse(false, null, 'Method not allowed', 405);
}

function handleRegister() {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        apiResponse(false, null, 'All fields are required', 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        apiResponse(false, null, 'Invalid email format', 400);
    }
    
    if (strlen($password) < 8) {
        apiResponse(false, null, 'Password must be at least 8 characters', 400);
    }
    
    // Register user
    $result = $GLOBALS['userOps']->registerUser($username, $email, $password);
    
    if ($result['success']) {
        // Auto-login after registration
        session_start();
        $_SESSION['user_id'] = $result['user_id'];
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        
        apiResponse(true, [
            'user_id' => $result['user_id'],
            'username' => $username,
            'email' => $email
        ], $result['message'], 201);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleLogin() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validation
    if (empty($email) || empty($password)) {
        apiResponse(false, null, 'Email and password are required', 400);
    }
    
    // Login user
    $result = $GLOBALS['userOps']->loginUser($email, $password);
    
    if ($result['success']) {
        session_start();
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['username'] = $result['user']['username'];
        $_SESSION['email'] = $result['user']['email'];
        $_SESSION['level'] = $result['user']['level'];
        $_SESSION['total_score'] = $result['user']['total_score'];
        
        apiResponse(true, $result['user'], $result['message']);
    } else {
        apiResponse(false, null, $result['message'], 401);
    }
}

function handleLogout() {
    session_start();
    session_destroy();
    
    apiResponse(true, null, 'Logged out successfully');
}

function handleGetProfile() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $result = $GLOBALS['userOps']->getUserProfile($userId);
    
    if ($result['success']) {
        apiResponse(true, $result['user'], 'Profile retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 404);
    }
}

function handleCheckAuth() {
    session_start();
    
    if (isset($_SESSION['user_id'])) {
        apiResponse(true, [
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email'],
            'level' => $_SESSION['level'] ?? 'مبتدئ',
            'total_score' => $_SESSION['total_score'] ?? 0
        ], 'User is authenticated');
    } else {
        apiResponse(false, null, 'User not authenticated', 401);
    }
}