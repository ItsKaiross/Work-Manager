-- Migration: Add currency column to job_applications table
-- Run this against your existing database

USE `work_manager`;

-- Add currency column with default value USD
ALTER TABLE `job_applications` 
ADD COLUMN `currency` VARCHAR(10) DEFAULT 'USD' 
AFTER `salary_range`;
