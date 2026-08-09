# Work Manager 🎯

A comprehensive job application tracking system with AI-powered resume matching and interview preparation suggestions.

## Features ✨

### 📋 Job Application Management
- Track all your job applications in one place
- Status tracking: Saved, Applied, Interviewing, Offer, Rejected, Withdrawn
- Store job details: company, position, location, salary, job description, notes
- Filter applications by status
- Search applications by company, position, or location
- Filter applications by applied date range (From/To)
- Filter applications by work category, auto-detected from keywords in the position/description (e.g. Video Editor, Full Stack, Frontend, Backend, Mobile, Data, DevOps, Design, Product, QA)
- Auto-refresh every 30 seconds
- Multi-currency support (USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, SGD, PHP, MYR, THB, VND, IDR)

### ⏰ Follow-up Reminders
- Automatic staleness detection — no manual dates to maintain
- Applications are flagged when they've sat too long in their current status:
  - Saved: 5 days · Applied: 7 days · Interviewing: 3 days · Offer: 2 days
  - Rejected/Withdrawn are never flagged (terminal states)
- Dashboard "Needs Follow-up" section surfaces flagged applications, sorted by longest overdue
- Flagged cards show a highlighted border and days-since-update hint throughout the app

### 📄 Resume Management
- Upload resumes (PDF, DOC, DOCX, TXT)
- Automatic parsing of skills, experience, and education
- Support for multiple resumes
- Active resume selection

### 🎯 AI-Powered Resume Matching
- **Automatic match score calculation** when adding new applications
- Resume skills compared against job descriptions
- Visual match percentage badges (Green: 70%+, Yellow: 50-70%, Red: <50%)
- Skill match and experience match breakdown
- One-click recalculation for all applications

### 💡 Interview Preparation Suggestions
- AI-generated preparation tips for each job application
- 5 categories of personalized suggestions:
  - 🔧 **Technical Preparation** - Technologies and frameworks to review
  - 🏢 **Company Research** - What to know about the company
  - 💬 **Behavioral Prep** - Interview question preparation
  - 🎯 **Skills to Focus** - Areas to highlight or improve
  - ❓ **Questions to Ask** - Smart questions for interviewers
- Position-level specific advice (Senior, Junior, Manager)
- Generated based on job description and your resume

## Tech Stack 🛠️

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL with asyncmy (async MySQL driver)
- **Authentication**: JWT tokens
- **Resume Parsing**: PyPDF2, python-docx, python-pptx

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: Next.js App Router

## Project Structure 📁

```
Work Manager/
├── backend/
│   ├── app/
│   │   ├── core/           # Authentication & security
│   │   ├── crud/           # Database operations
│   │   │   ├── job_application.py
│   │   │   └── resume.py
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── job_applications.py
│   │   │   ├── resume.py
│   │   │   └── extract.py
│   │   ├── schemas/        # Pydantic models
│   │   ├── utils/          # Helper functions
│   │   │   ├── resume_parser.py
│   │   │   └── suggestion_generator.py
│   │   ├── database.py
│   │   └── main.py
│   ├── uploads/           # Resume storage
│   ├── schema.sql         # Database schema
│   ├── resume_schema.sql  # Resume tables schema
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── applications/   # Job application pages
│   │   │   ├── [id]/      # Application detail page
│   │   │   ├── new/       # New application form
│   │   │   ├── StatusFilter.tsx    # Filter by application status
│   │   │   ├── CategoryFilter.tsx  # Filter by keyword-detected work category
│   │   │   └── page.tsx   # Applications list (search + date range + filters)
│   │   ├── resume/        # Resume management page
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Sidebar.tsx
│   │   └── page.tsx       # Login page
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (incl. jobCategories.ts for category keyword matching)
│   ├── types/             # TypeScript types
│   └── public/
│
└── README.md
```

## Installation & Setup 🚀

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r app/requirements.txt
   ```

4. **Configure database**
   - Create a MySQL database named `work_manager`
   - Update database credentials in `backend/settings.json`:
     ```json
     {
       "db_host": "localhost",
       "db_user": "your_username",
       "db_password": "your_password",
       "db_name": "work_manager"
     }
     ```

5. **Initialize database**
   ```bash
   # Run main schema
   mysql -u your_username -p work_manager < schema.sql
   
   # Run resume schema
   mysql -u your_username -p work_manager < resume_schema.sql
   
   # Fix duplicate match scores (if needed)
   mysql -u your_username -p work_manager < fix_duplicate_match_scores.sql
   ```

6. **Start backend server**
   ```bash
   cd app
   uvicorn main:app --reload --port 8000
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL** (optional)
   - Create `.env.local` file:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## Usage Guide 📖

### First Time Setup

1. **Create an account**
   - Navigate to `http://localhost:3000`
   - Register with username and password

2. **Upload your resume**
   - Click "Resume" in the sidebar
   - Upload your resume (PDF, DOC, or DOCX recommended)
   - System automatically extracts skills, experience, and education

3. **Add job applications**
   - Click "Applications" → "Add Application"
   - Fill in job details (include job description for better matching)
   - Match score is calculated automatically!

### Daily Workflow

1. **View all applications**
   - Dashboard shows all applications with match percentages
   - Filter by status (Saved, Applied, Interviewing, etc.)
   - Filter by work category (auto-detected from job title/description keywords)
   - Search by company, position, or location
   - Narrow results to an applied-date range
   - Color-coded badges show match quality

2. **Update application status**
   - Click on any application card
   - Change status as you progress through interviews
   - Add notes and update details

3. **Get interview preparation tips**
   - Open any application detail page
   - Scroll to "Interview Preparation Suggestions"
   - Click "Generate Suggestions" for personalized tips

4. **Recalculate match scores**
   - Upload a new resume or update your existing one
   - Click "Recalculate Matches" to update all scores
   - Applications refresh automatically

5. **Check follow-up reminders**
   - Dashboard highlights applications with no status update in a while
   - Open the flagged application and follow up, or update its status to clear the flag

## API Endpoints 🔌

### Authentication
- `POST /register` - Create new account
- `POST /token` - Login and get JWT token

### Applications
- `GET /applications` - List all applications (includes `needs_follow_up` / `days_since_update`)
- `POST /applications` - Create new application (auto-calculates match score)
- `GET /applications/{id}` - Get application details
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Delete application
- `GET /applications/{id}/suggestions` - Get interview preparation suggestions

### Resume
- `POST /api/resumes/upload` - Upload resume (auto-parses and calculates matches)
- `GET /api/resumes` - List all resumes
- `GET /api/resumes/active` - Get active resume
- `GET /api/resumes/{id}/analysis` - Get resume performance analysis
- `POST /api/resumes/{id}/recalculate` - Recalculate match scores

## Database Schema 🗄️

### Key Tables

**job_applications**
- Job tracking with company, position, status, description, etc.
- Links to users for multi-user support

**resumes**
- Stores resume metadata and parsed data
- JSON fields for skills and parsed information
- `is_active` flag for active resume selection

**resume_match_scores**
- Links resumes to applications
- Stores match_percentage, skill_match, experience_match
- **UNIQUE constraint** on (resume_id, application_id) prevents duplicates

**users**
- User authentication and management

## Troubleshooting 🔧

### Match scores not showing?
1. Ensure resume tables exist: Run `resume_schema.sql`
2. Check for unique constraint: Run `fix_duplicate_match_scores.sql`
3. Restart backend server

### Duplicate application cards?
- Run the fix script: `mysql -u user -p work_manager < fix_duplicate_match_scores.sql`
- This adds UNIQUE constraint to prevent duplicate match scores

### Resume upload fails?
- Check `backend/uploads/resumes` directory exists
- Verify file permissions
- Ensure file type is supported (PDF, DOC, DOCX, TXT)

### Match scores not updating automatically?
- Verify you have an active resume uploaded
- Check backend logs for errors
- Ensure database unique constraint is in place

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements 🚀

- [ ] Email notifications for application deadlines
- [ ] Interview scheduling and calendar integration
- [ ] Salary comparison and analytics
- [ ] Application templates for common roles
- [ ] Export applications to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Integration with job boards (LinkedIn, Indeed)
- [ ] AI cover letter generation
- [ ] Interview question practice mode

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Support 💬

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact: markjunellex@gmail.com

## Acknowledgments 🙏

- FastAPI for the excellent backend framework
- Next.js team for the powerful React framework
- All contributors who helped improve this project

---

**Built with ❤️ for job seekers everywhere**

Happy job hunting! 🎯
