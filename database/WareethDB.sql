-- Wareeth Game Database Schema
-- قاعدة بيانات لعبة وريث الثقافية التراثية

-- Create database
CREATE DATABASE IF NOT EXISTS `wareeth_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wareeth_db`;

-- Users table
CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `level` VARCHAR(20) NOT NULL DEFAULT 'مبتدئ',
    `total_score` INT(11) NOT NULL DEFAULT 0,
    `games_played` INT(11) NOT NULL DEFAULT 0,
    `best_score` INT(11) NOT NULL DEFAULT 0,
    `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `multiplayer_games_played` INT(11) NOT NULL DEFAULT 0,
    `multiplayer_wins` INT(11) NOT NULL DEFAULT 0,
    `best_multiplayer_score` INT(11) NOT NULL DEFAULT 0,
    `is_online` BOOLEAN NOT NULL DEFAULT FALSE,
    `last_activity` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`),
    KEY `idx_status` (`status`),
    KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table
CREATE TABLE `questions` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) NOT NULL,
    `option_d` VARCHAR(255) NOT NULL,
    `correct_answer` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `difficulty` ENUM('سهل', 'متوسط', 'صعب', 'محترف') NOT NULL,
    `points` INT(11) NOT NULL DEFAULT 10,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_difficulty` (`difficulty`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game rooms table
CREATE TABLE `game_rooms` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `owner_id` INT(11) NOT NULL,
    `room_name` VARCHAR(100) NOT NULL,
    `room_code` VARCHAR(10) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `difficulty` ENUM('سهل', 'متوسط', 'صعب', 'محترف') NOT NULL,
    `max_players` INT(11) NOT NULL DEFAULT 4,
    `current_players` INT(11) NOT NULL DEFAULT 0,
    `password` VARCHAR(50) NULL DEFAULT NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT FALSE,
    `allow_spectators` BOOLEAN NOT NULL DEFAULT TRUE,
    `enable_chat` BOOLEAN NOT NULL DEFAULT TRUE,
    `status` ENUM('waiting', 'ready', 'playing', 'finished', 'closed') NOT NULL DEFAULT 'waiting',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `started_at` TIMESTAMP NULL DEFAULT NULL,
    `ended_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `room_code` (`room_code`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room players table
CREATE TABLE `room_players` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `is_owner` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_spectator` BOOLEAN NOT NULL DEFAULT FALSE,
    `status` ENUM('joined', 'ready', 'playing', 'thinking', 'disconnected') NOT NULL DEFAULT 'joined',
    `score` INT(11) NOT NULL DEFAULT 0,
    `correct_answers` INT(11) NOT NULL DEFAULT 0,
    `wrong_answers` INT(11) NOT NULL DEFAULT 0,
    `total_time` INT(11) NOT NULL DEFAULT 0,
    `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `left_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `room_user` (`room_id`, `user_id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game sessions table
CREATE TABLE `game_sessions` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `session_token` VARCHAR(255) NOT NULL,
    `session_data` JSON NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `session_token` (`session_token`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_expires_at` (`expires_at`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game messages table
CREATE TABLE `game_messages` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `message_type` ENUM('text', 'system', 'game_event') NOT NULL DEFAULT 'text',
    `message_text` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game questions table
CREATE TABLE `game_questions` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `question_id` INT(11) NOT NULL,
    `round_number` INT(11) NOT NULL,
    `status` ENUM('pending', 'active', 'answered', 'skipped') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `started_at` TIMESTAMP NULL DEFAULT NULL,
    `ended_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_question_id` (`question_id`),
    KEY `idx_round_number` (`round_number`),
    KEY `idx_status` (`status`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player answers table
CREATE TABLE `player_answers` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `game_question_id` INT(11) NOT NULL,
    `player_id` INT(11) NOT NULL,
    `answer` ENUM('A', 'B', 'C', 'D') NULL DEFAULT NULL,
    `is_correct` BOOLEAN NULL DEFAULT NULL,
    `time_taken` INT(11) NULL DEFAULT NULL COMMENT 'Time taken in seconds',
    `points_earned` INT(11) NULL DEFAULT NULL,
    `answered_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `game_question_player` (`game_question_id`, `player_id`),
    KEY `idx_player_id` (`player_id`),
    KEY `idx_is_correct` (`is_correct`),
    FOREIGN KEY (`game_question_id`) REFERENCES `game_questions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game results table
CREATE TABLE `game_results` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `winner_id` INT(11) NULL DEFAULT NULL,
    `total_questions` INT(11) NOT NULL,
    `total_players` INT(11) NOT NULL,
    `started_at` TIMESTAMP NULL DEFAULT NULL,
    `ended_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_winner_id` (`winner_id`),
    KEY `idx_created_at` (`created_at`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scores table
CREATE TABLE `scores` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `score` INT(11) NOT NULL,
    `total_questions` INT(11) NOT NULL,
    `correct_answers` INT(11) NOT NULL,
    `wrong_answers` INT(11) NOT NULL,
    `skipped_answers` INT(11) NOT NULL DEFAULT 0,
    `percentage` DECIMAL(5,2) NOT NULL,
    `time_taken` INT(11) NOT NULL COMMENT 'Time taken in seconds',
    `difficulty_level` VARCHAR(20) NOT NULL,
    `game_type` ENUM('single', 'multiplayer') NOT NULL DEFAULT 'single',
    `game_reference_id` INT(11) NULL COMMENT 'References game_results.id for multiplayer games',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_difficulty_level` (`difficulty_level`),
    KEY `idx_game_type` (`game_type`),
    KEY `fk_scores_game_reference` (`game_reference_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User statistics table
CREATE TABLE `user_statistics` (
    `user_id` INT(11) NOT NULL,
    `total_questions_answered` INT(11) NOT NULL DEFAULT 0,
    `total_correct_answers` INT(11) NOT NULL DEFAULT 0,
    `total_wrong_answers` INT(11) NOT NULL DEFAULT 0,
    `total_time_played` INT(11) NOT NULL DEFAULT 0 COMMENT 'In seconds',
    `average_accuracy` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `average_time_per_question` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `favorite_category` VARCHAR(50) NULL DEFAULT NULL,
    `favorite_difficulty` ENUM('سهل', 'متوسط', 'صعب', 'محترف') NULL DEFAULT NULL,
    `last_played` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    KEY `idx_accuracy` (`average_accuracy`),
    KEY `idx_last_played` (`last_played`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers

-- Update user statistics after a new score is inserted
DELIMITER //
CREATE TRIGGER after_score_insert
AFTER INSERT ON scores
FOR EACH ROW
BEGIN
    DECLARE total_questions_answered INT;
    DECLARE total_correct_answers INT;
    DECLARE total_wrong_answers INT;
    DECLARE total_time_played INT;
    
    -- Calculate totals
    SELECT 
        COALESCE(SUM(total_questions), 0),
        COALESCE(SUM(correct_answers), 0),
        COALESCE(SUM(wrong_answers), 0),
        COALESCE(SUM(TIME_TO_SEC(time_taken)), 0)
    INTO 
        total_questions_answered,
        total_correct_answers,
        total_wrong_answers,
        total_time_played
    FROM scores 
    WHERE user_id = NEW.user_id;
    
    -- Update or insert into user_statistics
    INSERT INTO user_statistics (
        user_id,
        total_questions_answered,
        total_correct_answers,
        total_wrong_answers,
        total_time_played,
        average_accuracy,
        average_time_per_question,
        last_played
    ) VALUES (
        NEW.user_id,
        total_questions_answered,
        total_correct_answers,
        total_wrong_answers,
        total_time_played,
        CASE 
            WHEN total_questions_answered > 0 
            THEN (total_correct_answers * 100.0) / total_questions_answered 
            ELSE 0 
        END,
        CASE 
            WHEN total_questions_answered > 0 
            THEN total_time_played / total_questions_answered 
            ELSE 0 
        END,
        NOW()
    )
    ON DUPLICATE KEY UPDATE
        total_questions_answered = VALUES(total_questions_answered),
        total_correct_answers = VALUES(total_correct_answers),
        total_wrong_answers = VALUES(total_wrong_answers),
        total_time_played = VALUES(total_time_played),
        average_accuracy = VALUES(average_accuracy),
        average_time_per_question = VALUES(average_time_per_question),
        last_played = VALUES(last_played),
        updated_at = NOW();
    
    -- Update favorite category
    UPDATE user_statistics us
    JOIN (
        SELECT 
            user_id,
            category,
            COUNT(*) as category_count
        FROM scores s
        JOIN questions q ON s.difficulty_level = q.difficulty
        WHERE s.user_id = NEW.user_id
        GROUP BY user_id, category
        ORDER BY category_count DESC
        LIMIT 1
    ) AS fav_cat ON us.user_id = fav_cat.user_id
    SET us.favorite_category = fav_cat.category
    WHERE us.user_id = NEW.user_id;
    
    -- Update favorite difficulty
    UPDATE user_statistics us
    JOIN (
        SELECT 
            user_id,
            difficulty_level,
            COUNT(*) as difficulty_count
        FROM scores 
        WHERE user_id = NEW.user_id
        GROUP BY user_id, difficulty_level
        ORDER BY difficulty_count DESC
        LIMIT 1
    ) AS fav_diff ON us.user_id = fav_diff.user_id
    SET us.favorite_difficulty = fav_diff.difficulty_level
    WHERE us.user_id = NEW.user_id;
END //
DELIMITER ;

-- Update current_players count when a player joins or leaves a room
DELIMITER //
CREATE TRIGGER after_room_player_insert
AFTER INSERT ON room_players
FOR EACH ROW
BEGIN
    UPDATE game_rooms 
    SET current_players = (
        SELECT COUNT(*) FROM room_players WHERE room_id = NEW.room_id AND is_spectator = FALSE
    ) 
    WHERE id = NEW.room_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_room_player_delete
AFTER DELETE ON room_players
FOR EACH ROW
BEGIN
    UPDATE game_rooms 
    SET current_players = (
        SELECT COUNT(*) FROM room_players WHERE room_id = OLD.room_id AND is_spectator = FALSE
    ) 
    WHERE id = OLD.room_id;
    
    -- If no players left, close the room
    IF (SELECT COUNT(*) FROM room_players WHERE room_id = OLD.room_id) = 0 THEN
        UPDATE game_rooms 
        SET status = 'closed', 
            ended_at = NOW() 
        WHERE id = OLD.room_id 
        AND status NOT IN ('finished', 'closed');
    END IF;
END //
DELIMITER ;

-- Update game_rooms status when all players are ready
DELIMITER //
CREATE TRIGGER after_room_player_update
AFTER UPDATE ON room_players
FOR EACH ROW
BEGIN
    DECLARE total_players INT;
    DECLARE ready_players INT;
    
    -- Only proceed if status changed to 'ready' or from 'ready' to something else
    IF (OLD.status != NEW.status AND (NEW.status = 'ready' OR OLD.status = 'ready')) THEN
        -- Get total players (excluding spectators)
        SELECT COUNT(*) INTO total_players
        FROM room_players
        WHERE room_id = NEW.room_id AND is_spectator = FALSE;
        
        -- Get number of ready players (excluding spectators)
        SELECT COUNT(*) INTO ready_players
        FROM room_players
        WHERE room_id = NEW.room_id 
        AND status = 'ready' 
        AND is_spectator = FALSE;
        
        -- If all players are ready, update room status to 'ready'
        IF ready_players = total_players AND total_players > 0 THEN
            UPDATE game_rooms 
            SET status = 'ready' 
            WHERE id = NEW.room_id 
            AND status = 'waiting';
        -- If not all players are ready, set status back to 'waiting'
        ELSEIF (SELECT status FROM game_rooms WHERE id = NEW.room_id) = 'ready' THEN
            UPDATE game_rooms 
            SET status = 'waiting' 
            WHERE id = NEW.room_id;
        END IF;
    END IF;
    
    -- If player status changed to 'playing', update room status to 'playing' if not already
    IF NEW.status = 'playing' AND OLD.status != 'playing' THEN
        UPDATE game_rooms 
        SET status = 'playing',
            started_at = COALESCE(started_at, NOW())
        WHERE id = NEW.room_id 
        AND status = 'ready';
    END IF;
END //
DELIMITER ;

-- Sample data (from both files)

-- Insert sample users
INSERT INTO `users` (`username`, `email`, `password`, `level`, `total_score`, `games_played`, `best_score`, `last_login`, `status`, `multiplayer_games_played`, `multiplayer_wins`, `best_multiplayer_score`, `is_online`, `last_activity`) VALUES
('player1', 'player1@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'متوسط', 350, 15, 95, NOW(), 'active', 5, 2, 85, TRUE, NOW()),
('player2', 'player2@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محترف', 780, 32, 100, NOW(), 'active', 12, 8, 98, TRUE, NOW()),
('player3', 'player3@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مبتدئ', 120, 5, 65, NOW(), 'active', 0, 0, 0, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('player4', 'player4@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'متوسط', 450, 20, 90, NOW(), 'inactive', 3, 1, 75, FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Insert sample questions
INSERT INTO `questions` (`question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `category`, `difficulty`, `points`, `status`) VALUES
('ما هي عاصمة المملكة العربية السعودية؟', 'جدة', 'الرياض', 'الدمام', 'مكة المكرمة', 'B', 'جغرافيا', 'سهل', 10, 'active'),
('في أي عام تم توحيد المملكة العربية السعودية؟', '1932', '1927', '1945', '1950', 'A', 'تاريخ', 'سهل', 10, 'active'),
('ما هو أطول نهر في العالم؟', 'نهر النيل', 'نهر الأمازون', 'نهر اليانغتسي', 'نهر المسيسيبي', 'B', 'جغرافيا', 'متوسط', 15, 'active'),
('من هو مؤلف كتاب "المنقذ من الضلال"؟', 'ابن سينا', 'الغزالي', 'ابن خلدون', 'ابن تيمية', 'B', 'ثقافة', 'صعب', 20, 'active'),
('ما هي العملة الرسمية للمملكة العربية السعودية؟', 'الدرهم', 'الدينار', 'الريال', 'اليورو', 'C', 'اقتصاد', 'سهل', 10, 'active'),
('ما هو اسم أول مملكة تم تأسيسها في شبه الجزيرة العربية؟', 'المملكة العربية السعودية', 'مملكة كندة', 'مملكة سبأ', 'مملكة حِمْيَر', 'B', 'تاريخ', 'متوسط', 10, 'active'),
('ما هي أكبر مدينة من حيث المساحة في المملكة العربية السعودية؟', 'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'A', 'جغرافيا', 'سهل', 10, 'active'),
('ما هو اسم العيد الوطني للمملكة العربية السعودية؟', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'عيد الجلوس', 'C', 'ثقافة', 'سهل', 10, 'active'),
('في أي عام تم تأسيس المملكة العربية السعودية؟', '1925', '1932', '1945', '1950', 'B', 'تاريخ', 'متوسط', 10, 'active'),
('كم عدد مناطق المملكة العربية السعودية الإدارية؟', '13', '15', '18', '20', 'A', 'جغرافيا', 'متوسط', 10, 'active');

-- Insert sample scores (time_taken is in seconds)
INSERT INTO `scores` (`user_id`, `score`, `total_questions`, `correct_answers`, `wrong_answers`, `skipped_answers`, `percentage`, `time_taken`, `difficulty_level`, `game_type`) VALUES
(1, 85, 10, 8, 2, 0, 85.00, 272, 'متوسط', 'single'),
(1, 90, 10, 9, 1, 0, 90.00, 225, 'سهل', 'single'),
(1, 65, 10, 6, 4, 0, 65.00, 312, 'صعب', 'single'),
(2, 95, 10, 9, 1, 0, 95.00, 200, 'محترف', 'single'),
(2, 88, 10, 8, 2, 0, 88.00, 255, 'متوسط', 'single'),
(3, 70, 10, 7, 3, 0, 70.00, 345, 'سهل', 'single'),
(4, 92, 10, 9, 1, 0, 92.00, 230, 'متوسط', 'single'),
(4, 78, 10, 7, 3, 0, 78.00, 270, 'سهل', 'single');

-- Insert sample game rooms
INSERT INTO `game_rooms` (`owner_id`, `room_name`, `room_code`, `category`, `difficulty`, `max_players`, `is_private`, `status`, `created_at`) VALUES
(1, 'غرفة اللاعب الأول', 'ABC123', 'عام', 'متوسط', 4, FALSE, 'waiting', NOW()),
(2, 'تحدي الثقافة', 'XYZ789', 'ثقافة', 'صعب', 3, TRUE, 'waiting', NOW()),
(3, 'مسابقة التاريخ', 'HIST01', 'تاريخ', 'سهل', 2, FALSE, 'playing', NOW()),
(4, 'من سيربح المليون', 'WINNER', 'عام', 'محترف', 4, FALSE, 'finished', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Insert sample room players
INSERT INTO `room_players` (`room_id`, `user_id`, `is_owner`, `status`, `score`, `correct_answers`, `wrong_answers`) VALUES
(1, 1, TRUE, 'ready', 0, 0, 0),
(1, 2, FALSE, 'joined', 0, 0, 0),
(2, 2, TRUE, 'ready', 0, 0, 0),
(3, 3, TRUE, 'playing', 45, 4, 1),
(3, 4, FALSE, 'playing', 30, 3, 2),
(4, 1, FALSE, 'disconnected', 85, 8, 2),
(4, 2, FALSE, 'disconnected', 92, 9, 1),
(4, 3, FALSE, 'disconnected', 75, 7, 3),
(4, 4, TRUE, 'disconnected', 100, 10, 0);

-- Insert sample game results
INSERT INTO `game_results` (`room_id`, `winner_id`, `total_questions`, `total_players`, `started_at`, `ended_at`) VALUES
(4, 4, 10, 4, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Update scores with game references
UPDATE `scores` SET game_type = 'multiplayer', game_reference_id = 1 WHERE id IN (6, 7, 8, 9);

-- Insert sample game questions
INSERT INTO `game_questions` (`room_id`, `question_id`, `round_number`, `status`, `started_at`, `ended_at`) VALUES
(3, 1, 1, 'answered', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 9 MINUTE)),
(3, 2, 2, 'answered', DATE_SUB(NOW(), INTERVAL 8 MINUTE), DATE_SUB(NOW(), INTERVAL 7 MINUTE)),
(3, 3, 3, 'answered', DATE_SUB(NOW(), INTERVAL 6 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(3, 4, 4, 'answered', DATE_SUB(NOW(), INTERVAL 4 MINUTE), DATE_SUB(NOW(), INTERVAL 3 MINUTE)),
(3, 5, 5, 'active', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL);

-- Insert sample player answers
INSERT INTO `player_answers` (`game_question_id`, `player_id`, `answer`, `is_correct`, `time_taken`, `points_earned`) VALUES
(1, 3, 'B', TRUE, 12, 10),
(1, 4, 'B', TRUE, 8, 10),
(2, 3, 'A', TRUE, 15, 10),
(2, 4, 'C', FALSE, 10, 0),
(3, 3, 'B', TRUE, 20, 15),
(3, 4, 'B', TRUE, 18, 15),
(4, 3, 'A', FALSE, 10, 0),
(4, 4, 'B', TRUE, 12, 15),
(5, 3, 'C', NULL, NULL, NULL),
(5, 4, 'C', NULL, NULL, NULL);

-- Insert sample game messages
INSERT INTO `game_messages` (`room_id`, `user_id`, `message_type`, `message_text`) VALUES
(3, 3, 'text', 'مرحباً بالجميع!'),
(3, 4, 'text', 'أهلاً بك!'),
(3, 0, 'system', 'بدأت الجولة الأولى'),
(3, 0, 'game_event', 'أجاب اللاعب 3 على السؤال بشكل صحيح (+10 نقاط)'),
(3, 0, 'game_event', 'أجاب اللاعب 4 على السؤال بشكل صحيح (+10 نقاط)');

-- Add foreign key constraint for game_reference_id after both tables are created
ALTER TABLE `scores` 
ADD CONSTRAINT `fk_scores_game_reference` 
FOREIGN KEY (`game_reference_id`) REFERENCES `game_results` (`id`) 
ON DELETE SET NULL;

-- Insert sample user statistics (these would normally be updated by the trigger)
INSERT INTO `user_statistics` (
    `user_id`,
    `total_questions_answered`,
    `total_correct_answers`,
    `total_wrong_answers`,
    `total_time_played`,
    `average_accuracy`,
    `average_time_per_question`,
    `favorite_category`,
    `favorite_difficulty`,
    `last_played`
) VALUES
(1, 30, 25, 5, 1200, 83.33, 40.00, 'جغرافيا', 'متوسط', NOW()),
(2, 50, 45, 5, 1800, 90.00, 36.00, 'ثقافة', 'محترف', NOW()),
(3, 15, 10, 5, 900, 66.67, 60.00, 'تاريخ', 'سهل', NOW()),
(4, 40, 35, 5, 1500, 87.50, 37.50, 'عام', 'متوسط', NOW());
