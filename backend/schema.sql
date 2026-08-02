-- Create Database
CREATE DATABASE IF NOT EXISTS `work_manager`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- Use Database
USE `work_manager`;

-- Users Table
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `hashed_password` VARCHAR(255) DEFAULT NULL,
  `auth_provider` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;

-- Job Applications Table
CREATE TABLE `job_applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NOT NULL,
  `job_url` VARCHAR(1000) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `salary_range` VARCHAR(100) DEFAULT NULL,
  `status` ENUM(
    'saved',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn'
  ) DEFAULT 'saved',
  `source` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT,
  `applied_date` DATE DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_applications_user_id` (`user_id`),
  CONSTRAINT `fk_job_applications_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE job_applications ADD COLUMN description TEXT;
ALTER TABLE job_applications ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
