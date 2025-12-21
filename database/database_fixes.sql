-- Wareeth Database Fixes and Missing Tables
-- Fixing inconsistencies and adding missing tables

USE `wareeth_db`;

-- 1. Create missing achievements table
CREATE TABLE IF NOT EXISTS `achievements` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) NOT NULL,
    `achievement_name` VARCHAR(100) NOT NULL,
    `achievement_description` TEXT NOT NULL,
    `achievement_icon` VARCHAR(50) NOT NULL DEFAULT 'fa-star',
    `earned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_earned_at` (`earned_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create room_chat table (alternative to game_messages for simpler chat)
CREATE TABLE IF NOT EXISTS `room_chat` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `message` TEXT NOT NULL,
    `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_sent_at` (`sent_at`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create multiplayer_answers table (alternative to player_answers for multiplayer)
CREATE TABLE IF NOT EXISTS `multiplayer_answers` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `question_id` INT(11) NOT NULL,
    `answer` ENUM('A', 'B', 'C', 'D') NULL DEFAULT NULL,
    `is_correct` BOOLEAN NULL DEFAULT NULL,
    `time_taken` INT(11) NULL DEFAULT NULL COMMENT 'Time taken in seconds',
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_question_id` (`question_id`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create multiplayer_results table (alternative to game_results for multiplayer specific)
CREATE TABLE IF NOT EXISTS `multiplayer_results` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `room_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `rank` INT(11) NOT NULL,
    `score` INT(11) NOT NULL,
    `game_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_game_date` (`game_date`),
    FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Fix scores table - add game_reference_id if it doesn't exist
ALTER TABLE `scores` 
ADD COLUMN IF NOT EXISTS `game_reference_id` INT(11) NULL COMMENT 'References game_results.id for multiplayer games',
ADD INDEX IF NOT EXISTS `fk_scores_game_reference` (`game_reference_id`);

-- 6. Add foreign key constraint for game_reference_id if it doesn't exist
-- Note: This might fail if constraint already exists, but that's okay
ALTER TABLE `scores` 
ADD CONSTRAINT `fk_scores_game_reference` 
FOREIGN KEY (`game_reference_id`) REFERENCES `game_results` (`id`) 
ON DELETE SET NULL;

-- 7. Insert sample achievements for existing users
INSERT IGNORE INTO `achievements` (`user_id`, `achievement_name`, `achievement_description`, `achievement_icon`) VALUES
(1, 'الانضمام', 'لقد انضممت إلى لعبة وريث', 'fa-user-plus'),
(1, 'البداية', 'تم إنشاء حسابك بنجاح', 'fa-flag-checkered'),
(2, 'الانضمام', 'لقد انضممت إلى لعبة وريث', 'fa-user-plus'),
(2, 'البداية', 'تم إنشاء حسابك بنجاح', 'fa-flag-checkered'),
(3, 'الانضمام', 'لقد انضممت إلى لعبة وريث', 'fa-user-plus'),
(3, 'البداية', 'تم إنشاء حسابك بنجاح', 'fa-flag-checkered'),
(4, 'الانضمام', 'لقد انضممت إلى لعبة وريث', 'fa-user-plus'),
(4, 'البداية', 'تم إنشاء حسابك بنجاح', 'fa-flag-checkered');

-- 8. Update user_statistics to match the actual scores table structure
UPDATE user_statistics us SET
    total_questions_answered = (
        SELECT COALESCE(SUM(total_questions), 0) 
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    total_correct_answers = (
        SELECT COALESCE(SUM(correct_answers), 0) 
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    total_wrong_answers = (
        SELECT COALESCE(SUM(wrong_answers), 0) 
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    total_time_played = (
        SELECT COALESCE(SUM(time_taken), 0) 
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    average_accuracy = (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN (SUM(correct_answers) * 100.0) / COUNT(*)
            ELSE 0 
        END
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    average_time_per_question = (
        SELECT CASE 
            WHEN SUM(total_questions) > 0 THEN SUM(time_taken) / SUM(total_questions)
            ELSE 0 
        END
        FROM scores s 
        WHERE s.user_id = us.user_id
    ),
    last_played = (
        SELECT MAX(created_at) 
        FROM scores s 
        WHERE s.user_id = us.user_id
    );

-- 9. Add indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_scores_user_created` ON `scores` (`user_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_room_players_status` ON `room_players` (`room_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_game_questions_status` ON `game_questions` (`room_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_player_answers_question_player` ON `player_answers` (`game_question_id`, `player_id`);