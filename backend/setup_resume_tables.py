"""
Script to set up the resume tables in the database.
Run this after setting up the main database schema.
"""

import mysql.connector
from config import settings

def setup_resume_tables():
    """Create resume-related tables in the database"""
    
    print("Connecting to database...")
    
    try:
        conn = mysql.connector.connect(
            host=settings.db_host,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name
        )
        
        cursor = conn.cursor()
        
        print("Creating 'resumes' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `resumes` (
              `id` INT NOT NULL AUTO_INCREMENT,
              `user_id` INT NOT NULL,
              `filename` VARCHAR(255) NOT NULL,
              `file_path` VARCHAR(500) NOT NULL,
              `file_size` INT NOT NULL,
              `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `parsed_data` JSON,
              `skills` JSON,
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
            COLLATE=utf8mb4_0900_ai_ci
        """)
        
        print("Creating 'resume_match_scores' table...")
        cursor.execute("""
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
            COLLATE=utf8mb4_0900_ai_ci
        """)
        
        conn.commit()
        
        print("✓ Tables created successfully!")
        print("\nCreated tables:")
        print("  - resumes")
        print("  - resume_match_scores")
        print("\nYou can now use the resume upload feature!")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False
    
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("\nDatabase connection closed.")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Resume Feature Database Setup")
    print("=" * 60)
    print()
    
    success = setup_resume_tables()
    
    if success:
        print("\n" + "=" * 60)
        print("Setup completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Setup failed. Please check the error messages above.")
        print("=" * 60)
