<?php
/**
 * Questions API Endpoints
 * نقاط نهاية الأسئلة
 */

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

require_once '../database/question_operations.php';
$questionOps = new QuestionOperations();

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'random':
                handleGetRandomQuestions();
                break;
                
            case 'categories':
                handleGetCategories();
                break;
                
            case 'difficulties':
                handleGetDifficulties();
                break;
                
            case 'statistics':
                handleGetStatistics();
                break;
                
            default:
                handleGetQuestions();
                break;
        }
        break;
        
    case 'POST':
        if ($action === 'add') {
            handleAddQuestion();
        } else {
            apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    default:
        apiResponse(false, null, 'Method not allowed', 405);
}

function handleGetRandomQuestions() {
    $limit = intval($_GET['limit'] ?? 10);
    $difficulty = $_GET['difficulty'] ?? null;
    $category = $_GET['category'] ?? null;
    
    // Validate limit
    if ($limit < 1 || $limit > 50) {
        $limit = 10;
    }
    
    $result = $GLOBALS['questionOps']->getRandomQuestions($limit, $difficulty, $category);
    
    if ($result['success']) {
        // Remove correct answers from client response
        $questionsForClient = array_map(function($question) {
            return $question['client'];
        }, $result['questions']);
        
        apiResponse(true, [
            'questions' => $questionsForClient,
            'count' => count($questionsForClient)
        ], 'Questions retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}

function handleGetQuestions() {
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $category = $_GET['category'] ?? null;
    $difficulty = $_GET['difficulty'] ?? null;
    
    // Validate pagination
    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = 20;
    
    $result = $GLOBALS['questionOps']->getAllQuestions($page, $limit, $category, $difficulty);
    
    if ($result['success']) {
        apiResponse(true, $result, 'Questions retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}

function handleGetCategories() {
    $result = $GLOBALS['questionOps']->getCategories();
    
    if ($result['success']) {
        apiResponse(true, $result['categories'], 'Categories retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}

function handleGetDifficulties() {
    // Standard difficulties
    $difficulties = ['سهل', 'متوسط', 'صعب', 'محترف'];
    apiResponse(true, $difficulties, 'Difficulties retrieved successfully');
}

function handleGetStatistics() {
    $result = $GLOBALS['questionOps']->getStatistics();
    
    if ($result['success']) {
        apiResponse(true, $result, 'Statistics retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}

function handleAddQuestion() {
    requireAuth();
    require_once '../database/user_operations.php';
    
    // Check if user is admin or has permission
    session_start();
    if ($_SESSION['level'] !== 'محترف') {
        apiResponse(false, null, 'Insufficient permissions', 403);
    }
    
    $questionText = $_POST['question_text'] ?? '';
    $optionA = $_POST['option_a'] ?? '';
    $optionB = $_POST['option_b'] ?? '';
    $optionC = $_POST['option_c'] ?? '';
    $optionD = $_POST['option_d'] ?? '';
    $correctAnswer = strtoupper($_POST['correct_answer'] ?? '');
    $category = $_POST['category'] ?? '';
    $difficulty = $_POST['difficulty'] ?? '';
    $points = intval($_POST['points'] ?? 10);
    
    // Validation
    if (empty($questionText) || empty($optionA) || empty($optionB) || 
        empty($optionC) || empty($optionD) || empty($correctAnswer) || 
        empty($category) || empty($difficulty)) {
        apiResponse(false, null, 'All fields are required', 400);
    }
    
    if (!in_array($correctAnswer, ['A', 'B', 'C', 'D'])) {
        apiResponse(false, null, 'Correct answer must be A, B, C, or D', 400);
    }
    
    if (!in_array($difficulty, ['سهل', 'متوسط', 'صعب', 'محترف'])) {
        apiResponse(false, null, 'Invalid difficulty level', 400);
    }
    
    $result = $GLOBALS['questionOps']->addQuestion(
        $questionText, $optionA, $optionB, $optionC, $optionD, 
        $correctAnswer, $category, $difficulty, $points
    );
    
    if ($result['success']) {
        apiResponse(true, ['question_id' => $result['question_id']], $result['message'], 201);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}