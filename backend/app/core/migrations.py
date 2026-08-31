from app.database import get_pool


async def _ensure_job_keywords_column(conn):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'resumes'
            """
        )
        (table_count,) = await cur.fetchone()
        if table_count == 0:
            # resumes table not set up yet (resume_schema.sql not run) - nothing to migrate.
            return

        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'resumes' AND column_name = 'job_keywords'
            """
        )
        (count,) = await cur.fetchone()
        if count == 0:
            await cur.execute("ALTER TABLE resumes ADD COLUMN job_keywords JSON")
            await conn.commit()


async def _ensure_cover_letters_table(conn):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name IN ('job_applications', 'resumes', 'users')
            """
        )
        (dependency_count,) = await cur.fetchone()
        if dependency_count < 3:
            # job_applications/resumes/users not set up yet - the FK constraints below would fail.
            return

        await cur.execute(
            """
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
            COLLATE=utf8mb4_0900_ai_ci
            """
        )
        await conn.commit()


async def _ensure_app_settings_table(conn):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS `app_settings` (
              `setting_key` VARCHAR(100) NOT NULL,
              `setting_value` TEXT,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`setting_key`)
            ) ENGINE=InnoDB
            DEFAULT CHARSET=utf8mb4
            COLLATE=utf8mb4_0900_ai_ci
            """
        )
        await conn.commit()


async def run_migrations():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await _ensure_job_keywords_column(conn)
        await _ensure_app_settings_table(conn)
        await _ensure_cover_letters_table(conn)
