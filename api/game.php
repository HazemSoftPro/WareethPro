<?php
/**
 * Game API Endpoints
 * نقاط نهاية اللعب الفردي
 */

$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

require_once '../database/question_operations.php';
require_once '../database/user_operations.php';

$questionOps = new QuestionOperations();
$userOps = new UserOperations();

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'start':
                handleStartGame();
                break;
                
            case 'answer':
                handleSubmitAnswer();
                break;
                
            case 'end':
                handleEndGame();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'history':
                handleGetGameHistory();
                break;
                
            case 'stats':
                handleGetGameStats();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    default:
        apiResponse(false, null, 'Method not allowed', 405);
}

function handleStartGame() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $difficulty = $_POST['difficulty'] ?? 'all';
    $category = $_POST['category'] ?? 'all';
    $questionCount = intval($_POST['question_count'] ?? 10);
    
    // Validate question count
    if ($questionCount < 5 || $questionCount > 20) {
        $questionCount = 10;
    }
    
    // Get random questions
    $result = $GLOBALS['questionOps']->getRandomQuestions($questionCount, $difficulty, $category);
    
    if (!$result['success']) {
        apiResponse(false, null, 'Failed to get questions', 500);
    }
    
    // Start game session
    session_start();
    $gameSession = [
        'game_id' => uniqid('game_', true),
        'user_id' => $userId,
        'questions' => $result['questions'], // Keep server data with correct answers
        'current_question' => 0,
        'answers' => [],
        'score' => 0,
        'start_time' => time(),
        'difficulty' => $difficulty,
        'category' => $category
    ];
    
    $_SESSION['game_session'] = $gameSession;
    
    // Return questions without correct answers
    $questionsForClient = array_map(function($question) {
        return $question['client'];
    }, $result['questions']);
    
    apiResponse(true, [
        'game_id' => $gameSession['game_id'],
        'questions' => $questionsForClient,
        'question_count' => count($questionsForClient),
        'difficulty' => $difficulty,
        'category' => $category
    ], 'Game started successfully');
}

function handleSubmitAnswer() {
    requireAuth();
    
    session_start();
    if (!isset($_SESSION['game_session'])) {
        apiResponse(false, null, 'No active game session', 400);
    }
    
    $gameSession = &$_SESSION['game_session'];
    $questionIndex = intval($_POST['question_index'] ?? 0);
    $answer = strtoupper($_POST['answer'] ?? '');
    $timeTaken = intval($_POST['time_taken'] ?? 0);
    
    // Validate question index
    if ($questionIndex < 0 || $questionIndex >= count($gameSession['questions'])) {
        apiResponse(false, null, 'Invalid question index', 400);
    }
    
    // Get the correct answer
    $question = $gameSession['questions'][$questionIndex]['server'];
    $correctAnswer = $question['correct_answer'];
    $isCorrect = ($answer === $correctAnswer);
    
    // Calculate points (base points + time bonus)
    $basePoints = $question['points'] ?? 10;
    $timeBonus = max(0, min(10, floor($timeTaken / 3))); // Max 10 bonus points
    $totalPoints = $isCorrect ? ($basePoints + $timeBonus) : 0;
    
    // Store answer
    $answerData = [
        'question_index' => $questionIndex,
        'question_id' => $question['id'],
        'answer' => $answer,
        'correct_answer' => $correctAnswer,
        'is_correct' => $isCorrect,
        'points_earned' => $totalPoints,
        'time_taken' => $timeTaken,
        'answered_at' => time()
    ];
    
    $gameSession['answers'][$questionIndex] = $answerData;
    $gameSession['score'] += $totalPoints;
    $gameSession['current_question'] = $questionIndex + 1;
    
    // Check if game is complete
    $isGameComplete = ($gameSession['current_question'] >= count($gameSession['questions']));
    
    apiResponse(true, [
        'is_correct' => $isCorrect,
        'correct_answer' => $correctAnswer,
        'points_earned' => $totalPoints,
        'total_score' => $gameSession['score'],
        'is_game_complete' => $isGameComplete,
        'current_question' => $gameSession['current_question'],
        'total_questions' => count($gameSession['questions'])
    ], 'Answer submitted successfully');
}

function handleEndGame() {
    requireAuth();
    
    session_start();
    if (!isset($_SESSION['game_session'])) {
        apiResponse(false, null, 'No active game session', 400);
    }
    
    $gameSession = $_SESSION['game_session'];
    $userId = $gameSession['user_id'];
    
    // Calculate final statistics
    $totalQuestions = count($gameSession['questions']);
    $correctAnswers = count(array_filter($gameSession['answers'], function($answer) {
        return $answer['is_correct'];
    }));
    $wrongAnswers = count(array_filter($gameSession['answers'], function($answer) {
        return !$answer['is_correct'] && $answer['answer'] !== null;
    }));
    $skippedAnswers = $totalQuestions - $correctAnswers - $wrongAnswers;
    
    $totalTime = time() - $gameSession['start_time'];
    $percentage = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100, 2) : 0;
    
    // Save game result to database
    $result = $GLOBALS['userOps']->saveGameResult(
        $userId,
        $gameSession['score'],
        $totalQuestions,
        $correctAnswers,
        $wrongAnswers,
        $skippedAnswers,
        $percentage,
        $totalTime,
        $gameSession['difficulty']
    );
    
    if (!$result['success']) {
        apiResponse(false, null, 'Failed to save game result', 500);
    }
    
    // Prepare game summary
    $gameSummary = [
        'game_id' => $gameSession['game_id'],
        'score' => $gameSession['score'],
        'total_questions' => $totalQuestions,
        'correct_answers' => $correctAnswers,
        'wrong_answers' => $wrongAnswers,
        'skipped_answers' => $skippedAnswers,
        'percentage' => $percentage,
        'time_taken' => $totalTime,
        'difficulty' => $gameSession['difficulty'],
        'category' => $gameSession['category'],
        'answers' => $gameSession['answers']
    ];
    
    // Clear game session
    unset($_SESSION['game_session']);
    
    apiResponse(true, $gameSummary, 'Game ended and saved successfully');
}

function handleGetGameHistory() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $limit = intval($_GET['limit'] ?? 10);
    $page = intval($_GET['page'] ?? 1);
    
    // Get user's recent games from database
    // This would require adding a method to user_operations.php
    // For now, return a placeholder response
    
    apiResponse(true, [
        'games' => [],
        'total' => 0,
        'page' => $page,
        'limit' => $limit
    ], 'Game history retrieved');
}

function handleGetGameStats() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    
    // Get user profile for statistics
    $result = $GLOBALS['userOps']->getUserProfile($userId);
    
    if ($result['success']) {
        $user = $result['user'];
        
        $stats = [
            'total_score' => $user['total_score'],
            'games_played' => $user['games_played'],
            'best_score' => $user['best_score'],
            'average_score' => $user['average_score'] ?? 0,
            'rank' => $user['rank'] ?? 1,
            'level' => $user['level'],
            'recent_games' => $user['recent_games'] ?? [],
            'achievements' => $user['achievements'] ?? []
        ];
        
        apiResponse(true, $stats, 'Game statistics retrieved successfully');
    } else {
        apiResponse(false, null, 'Failed to get user statistics', 500);
    }
}