-- Fix duplicate match scores and add UNIQUE constraint
-- Run this script to clean up duplicates and prevent future duplicates

USE `work_manager`;

-- Step 1: Delete duplicate match scores, keeping only the most recent one
DELETE t1 FROM resume_match_scores t1
INNER JOIN resume_match_scores t2 
WHERE 
    t1.id < t2.id
    AND t1.resume_id = t2.resume_id 
    AND t1.application_id = t2.application_id;

-- Step 2: Add UNIQUE constraint to prevent future duplicates
ALTER TABLE `resume_match_scores`
ADD UNIQUE KEY `unique_resume_application` (`resume_id`, `application_id`);

-- Verify the fix
SELECT 
    resume_id, 
    application_id, 
    COUNT(*) as count,
    GROUP_CONCAT(id) as ids
FROM resume_match_scores
GROUP BY resume_id, application_id
HAVING count > 1;
-- Should return 0 rows if all duplicates are removed
