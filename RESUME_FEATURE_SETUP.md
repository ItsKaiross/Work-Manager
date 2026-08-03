# Resume Upload & Success Rate Feature - Setup Guide

## Overview
This feature allows users to upload their resume and automatically calculates a success rate based on how well their resume matches their job applications. The system analyzes skills, experience, and provides personalized recommendations.

## Setup Instructions

### 1. Database Setup

Run the SQL schema to create the necessary tables:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p work_manager < backend/resume_schema.sql
```

Or manually execute the SQL commands in `backend/resume_schema.sql` using your preferred MySQL client.

This will create two tables:
- `resumes` - Stores uploaded resume files and metadata
- `resume_match_scores` - Tracks match percentages between resumes and job applications

### 2. Backend Setup

No additional Python packages are required - the feature uses existing dependencies.

The backend routes are automatically included when you start the FastAPI server:

```bash
cd backend/app
python main.py
```

The server will run on `http://localhost:8000`

### 3. Frontend Setup

No additional npm packages are required - the feature uses existing dependencies.

Start the Next.js development server:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

### 1. Resume Upload
- Upload resume files in PDF, DOC, DOCX, or TXT format
- Add skills (comma-separated)
- Specify years of experience
- Select education level

### 2. Success Rate Calculation
The system calculates your success rate based on:
- **Match Percentage**: How well your skills align with job descriptions (70% weight)
- **Experience Match**: How your experience compares to job requirements (30% weight)
- **Success Rate**: Percentage of applications that resulted in interviews or offers

### 3. Analysis Dashboard
View comprehensive metrics including:
- Overall success rate percentage
- Average match score across all applications
- Total applications analyzed
- Top matching skills
- Personalized recommendations

### 4. Automatic Matching
When you upload a resume:
- The system automatically calculates match scores for ALL existing job applications
- Match scores are recalculated when you update your resume skills
- New applications can be compared against your resume

## API Endpoints

### Resume Management
- `POST /api/resumes/upload` - Upload a new resume
- `GET /api/resumes/` - Get all resumes for current user
- `GET /api/resumes/active` - Get the most recent active resume
- `GET /api/resumes/{id}` - Get specific resume
- `PUT /api/resumes/{id}` - Update resume information
- `DELETE /api/resumes/{id}` - Delete resume

### Analysis
- `GET /api/resumes/{id}/analysis` - Get comprehensive success rate analysis
- `POST /api/resumes/{id}/recalculate` - Recalculate all match scores

## Usage Flow

1. **Login** to your Work Manager account
2. **Navigate** to "Resume & Success Rate" in the sidebar
3. **Upload** your resume with skills and experience details
4. **View** your success rate dashboard with personalized insights
5. **Track** how well your resume matches your job applications
6. **Update** your resume or skills as needed to improve your match scores

## How Success Rate is Calculated

### Match Score Formula:
```
Match Score = (Skill Match × 0.7) + (Experience Match × 0.3)
```

**Skill Match**: Percentage of your skills found in the job description
**Experience Match**: How your years of experience compare to job requirements

### Success Rate Formula:
```
Success Rate = (Successful Applications / Total Applications) × 100
```

**Successful Applications**: Applications with status "interviewing" or "offer"
**Total Applications**: All applications matched with your resume

## Recommendations System

The system provides personalized recommendations based on:
- Average match score (< 50%, 50-70%, > 70%)
- Success rate (< 20%, 20-50%, > 50%)
- Number of skills listed (< 5 skills triggers recommendation)

## File Storage

Uploaded resumes are stored in:
```
backend/uploads/resumes/
```

File naming convention:
```
{user_id}_{timestamp}_{original_filename}
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `backend/app/config.py`
- Ensure the `work_manager` database exists

### Upload Issues
- Verify the `backend/uploads/resumes/` directory exists
- Check file permissions on the uploads directory
- Ensure file size is reasonable (backend will reject very large files)

### No Success Rate Showing
- You need at least one job application to see match scores
- Upload a resume with skills specified
- Ensure your applications have descriptions for matching

## Future Enhancements

Potential improvements for this feature:
- PDF parsing to automatically extract skills
- Advanced NLP for better job description matching
- Resume version history
- A/B testing different resume versions
- Integration with job posting APIs for real-time matching
- Export analysis reports

## Support

For issues or questions, please check the main project documentation or create an issue in the repository.
