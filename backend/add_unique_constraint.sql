-- Add UNIQUE constraint to prevent duplicate match scores
-- This will make ON DUPLICATE KEY UPDATE work properly

USE `work_manager`;

-- Add UNIQUE constraint on (resume_id, application_id)
ALTER TABLE `resume_match_scores`
ADD UNIQUE KEY `unique_resume_application` (`resume_id`, `application_id`);
