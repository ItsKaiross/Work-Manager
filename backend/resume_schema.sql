-- Add Resume Table
USE `work_manager`;

CREATE TABLE IF NOT EXISTS `resumes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT NOT NULL,
  `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `parsed_data` JSON,
  `skills` JSON,
  `job_keywords` JSON,
  `experience_years` DECIMAL(4,2),
  `education_level` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_resumes_user_id` (`user_id`),
  CONSTRAINT `fk_resumes_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;

-- Add Resume Match Scores Table
CREATE TABLE IF NOT EXISTS `resume_match_scores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `resume_id` INT NOT NULL,
  `application_id` INT NOT NULL,
  `match_percentage` DECIMAL(5,2),
  `skill_match` DECIMAL(5,2),
  `experience_match` DECIMAL(5,2),
  `calculated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resume_match_resume_id` (`resume_id`),
  KEY `idx_resume_match_application_id` (`application_id`),
  CONSTRAINT `fk_resume_match_resume`
    FOREIGN KEY (`resume_id`)
    REFERENCES `resumes` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_resume_match_application`
    FOREIGN KEY (`application_id`)
    REFERENCES `job_applications` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;
