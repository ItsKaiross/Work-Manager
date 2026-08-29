-- Add Cover Letters Table
USE `work_manager`;

CREATE TABLE IF NOT EXISTS `cover_letters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `resume_id` INT NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `ai_content` MEDIUMTEXT NOT NULL,
  `supporting_points` JSON NULL,
  `warnings` JSON NULL,
  `tone` VARCHAR(30) NOT NULL DEFAULT 'professional',
  `emphasis` VARCHAR(500) NULL,
  `recipient_name` VARCHAR(255) NULL,
  `status` ENUM('draft', 'final') NOT NULL DEFAULT 'draft',
  `model` VARCHAR(100) NULL,
  `prompt_version` VARCHAR(30) NULL,
  `source_fingerprint` CHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cover_letters_application` (`application_id`, `created_at`),
  CONSTRAINT `fk_cover_letters_application`
    FOREIGN KEY (`application_id`)
    REFERENCES `job_applications` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cover_letters_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cover_letters_resume`
    FOREIGN KEY (`resume_id`)
    REFERENCES `resumes` (`id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;
