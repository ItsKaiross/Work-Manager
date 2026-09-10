USE `work_manager`;

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `user_id` INT NOT NULL,
  `resume_url` VARCHAR(1000) NULL,
  `portfolio_url` VARCHAR(1000) NULL,
  `github_url` VARCHAR(1000) NULL,
  `linkedin_url` VARCHAR(1000) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_profiles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
