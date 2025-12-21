<?php
/**
 * Multiplayer API Endpoints
 * نقاط نهاية اللعب الجماعي
 */

$method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

require_once '../database/multiplayer_operations.php';
require_once '../database/question_operations.php';

$multiplayerOps = new MultiplayerOperations();
$questionOps = new QuestionOperations();

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'create-room':
                handleCreateRoom();
                break;
                
            case 'join-room':
                handleJoinRoom();
                break;
                
            case 'leave-room':
                handleLeaveRoom();
                break;
                
            case 'start-game':
                handleStartMultiplayerGame();
                break;
                
            case 'answer':
                handleSubmitMultiplayerAnswer();
                break;
                
            case 'chat':
                handleSendChatMessage();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'rooms':
                handleGetActiveRooms();
                break;
                
            case 'room':
                handleGetRoomDetails();
                break;
                
            case 'questions':
                handleGetMultiplayerQuestions();
                break;
                
            case 'chat':
                handleGetChatMessages();
                break;
                
            default:
                apiResponse(false, null, 'Invalid action', 400);
        }
        break;
        
    default:
        apiResponse(false, null, 'Method not allowed', 405);
}

function handleCreateRoom() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomName = $_POST['room_name'] ?? '';
    $category = $_POST['category'] ?? 'all';
    $difficulty = $_POST['difficulty'] ?? 'all';
    $maxPlayers = intval($_POST['max_players'] ?? 4);
    $password = $_POST['password'] ?? null;
    $isPrivate = isset($_POST['is_private']) && $_POST['is_private'] === 'true';
    
    // Validation
    if (empty($roomName)) {
        apiResponse(false, null, 'Room name is required', 400);
    }
    
    if ($maxPlayers < 2 || $maxPlayers > 8) {
        $maxPlayers = 4;
    }
    
    $result = $GLOBALS['multiplayerOps']->createRoom(
        $userId, $roomName, $category, $difficulty, $maxPlayers, $password, $isPrivate
    );
    
    if ($result['success']) {
        apiResponse(true, [
            'room_id' => $result['room_id'],
            'room_code' => $result['room_code'],
            'room_name' => $roomName
        ], $result['message'], 201);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleJoinRoom() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomId = intval($_POST['room_id'] ?? 0);
    $roomCode = $_POST['room_code'] ?? '';
    $password = $_POST['password'] ?? null;
    
    // Get room by ID or code
    if ($roomId > 0) {
        $roomResult = $GLOBALS['multiplayerOps']->getRoomDetails($roomId);
        if (!$roomResult['success']) {
            apiResponse(false, null, 'Room not found', 404);
        }
        $room = $roomResult['room'];
    } elseif (!empty($roomCode)) {
        // Find room by code (would need to add method)
        apiResponse(false, null, 'Room code lookup not implemented', 501);
    } else {
        apiResponse(false, null, 'Room ID or code is required', 400);
    }
    
    // Check password if room is private
    if ($room['is_private'] && $room['password'] !== $password) {
        apiResponse(false, null, 'Invalid password', 401);
    }
    
    $result = $GLOBALS['multiplayerOps']->joinRoom($room['id'], $userId);
    
    if ($result['success']) {
        apiResponse(true, [
            'room_id' => $room['id'],
            'room_name' => $room['room_name'],
            'room_code' => $room['room_code']
        ], $result['message']);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleLeaveRoom() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomId = intval($_POST['room_id'] ?? 0);
    
    if ($roomId === 0) {
        apiResponse(false, null, 'Room ID is required', 400);
    }
    
    $result = $GLOBALS['multiplayerOps']->leaveRoom($roomId, $userId);
    
    if ($result['success']) {
        apiResponse(true, null, $result['message']);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleGetActiveRooms() {
    $limit = intval($_GET['limit'] ?? 20);
    $category = $_GET['category'] ?? null;
    $difficulty = $_GET['difficulty'] ?? null;
    
    if ($limit < 1 || $limit > 50) {
        $limit = 20;
    }
    
    $result = $GLOBALS['multiplayerOps']->getActiveRooms($limit, $category, $difficulty);
    
    if ($result['success']) {
        apiResponse(true, $result['rooms'], 'Active rooms retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}

function handleGetRoomDetails() {
    $roomId = intval($_GET['room_id'] ?? 0);
    
    if ($roomId === 0) {
        apiResponse(false, null, 'Room ID is required', 400);
    }
    
    $result = $GLOBALS['multiplayerOps']->getRoomDetails($roomId);
    
    if ($result['success']) {
        apiResponse(true, $result['room'], 'Room details retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 404);
    }
}

function handleStartMultiplayerGame() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomId = intval($_POST['room_id'] ?? 0);
    
    if ($roomId === 0) {
        apiResponse(false, null, 'Room ID is required', 400);
    }
    
    // Check if user is room owner
    $roomResult = $GLOBALS['multiplayerOps']->getRoomDetails($roomId);
    if (!$roomResult['success']) {
        apiResponse(false, null, 'Room not found', 404);
    }
    
    $room = $roomResult['room'];
    $isOwner = false;
    foreach ($room['players'] as $player) {
        if ($player['user_id'] === $userId && $player['is_owner']) {
            $isOwner = true;
            break;
        }
    }
    
    if (!$isOwner) {
        apiResponse(false, null, 'Only room owner can start the game', 403);
    }
    
    $result = $GLOBALS['multiplayerOps']->startGame($roomId);
    
    if ($result['success']) {
        // Get multiplayer questions
        $questionResult = $GLOBALS['questionOps']->getRandomQuestions(
            15, $room['difficulty'], $room['category']
        );
        
        if ($questionResult['success']) {
            // Store questions in session for this room
            session_start();
            $_SESSION['multiplayer_game_' . $roomId] = [
                'questions' => $questionResult['questions'],
                'current_question' => 0,
                'start_time' => time()
            ];
            
            apiResponse(true, [
                'room_id' => $roomId,
                'questions' => array_map(function($q) { return $q['client']; }, $questionResult['questions'])
            ], $result['message']);
        } else {
            apiResponse(false, null, 'Failed to get game questions', 500);
        }
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleSubmitMultiplayerAnswer() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomId = intval($_POST['room_id'] ?? 0);
    $questionId = intval($_POST['question_id'] ?? 0);
    $answer = strtoupper($_POST['answer'] ?? '');
    $timeTaken = intval($_POST['time_taken'] ?? 0);
    
    if ($roomId === 0 || $questionId === 0 || empty($answer)) {
        apiResponse(false, null, 'Missing required fields', 400);
    }
    
    if (!in_array($answer, ['A', 'B', 'C', 'D'])) {
        apiResponse(false, null, 'Invalid answer', 400);
    }
    
    $result = $GLOBALS['multiplayerOps']->submitAnswer($roomId, $userId, $questionId, $answer, $timeTaken);
    
    if ($result['success']) {
        apiResponse(true, [
            'is_correct' => $result['is_correct'],
            'points' => $result['points']
        ], $result['message']);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleGetMultiplayerQuestions() {
    requireAuth();
    
    $roomId = intval($_GET['room_id'] ?? 0);
    
    if ($roomId === 0) {
        apiResponse(false, null, 'Room ID is required', 400);
    }
    
    // Check if game session exists
    session_start();
    if (!isset($_SESSION['multiplayer_game_' . $roomId])) {
        apiResponse(false, null, 'No active game session', 400);
    }
    
    $gameSession = $_SESSION['multiplayer_game_' . $roomId];
    
    apiResponse(true, [
        'questions' => array_map(function($q) { return $q['client']; }, $gameSession['questions']),
        'current_question' => $gameSession['current_question']
    ], 'Multiplayer questions retrieved');
}

function handleSendChatMessage() {
    requireAuth();
    
    $userId = $_SESSION['user_id'];
    $roomId = intval($_POST['room_id'] ?? 0);
    $message = trim($_POST['message'] ?? '');
    
    if ($roomId === 0 || empty($message)) {
        apiResponse(false, null, 'Room ID and message are required', 400);
    }
    
    $result = $GLOBALS['multiplayerOps']->saveChatMessage($roomId, $userId, $message);
    
    if ($result['success']) {
        apiResponse(true, null, $result['message']);
    } else {
        apiResponse(false, null, $result['message'], 400);
    }
}

function handleGetChatMessages() {
    $roomId = intval($_GET['room_id'] ?? 0);
    $limit = intval($_GET['limit'] ?? 50);
    
    if ($roomId === 0) {
        apiResponse(false, null, 'Room ID is required', 400);
    }
    
    $result = $GLOBALS['multiplayerOps']->getRecentChatMessages($roomId, $limit);
    
    if ($result['success']) {
        apiResponse(true, $result['messages'], 'Chat messages retrieved successfully');
    } else {
        apiResponse(false, null, $result['message'], 500);
    }
}