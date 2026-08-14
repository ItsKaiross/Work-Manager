# Work Manager 🚀

A comprehensive job application tracking system with AI-powered resume matching, interview preparation suggestions, and a full-featured admin panel. Built with FastAPI and Next.js.

## Features ✨

### 📋 Job Application Management
- Track all your job applications in one place
- Status tracking: Saved, Applied, Interviewing, Offer, Rejected, Withdrawn
- Store job details: company, position, location, salary, job description, notes
- Filter applications by status and category
- Search applications by company, position, or location
- Filter applications by applied date range (From/To)
- Auto-categorization by work type (Video Editor, Full Stack, Frontend, Backend, Mobile, Data, DevOps, Design, Product, QA)
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
- Resume performance analysis with AI

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

### 🔐 Admin Panel
- **Dashboard**: Overview with real-time statistics
  - Total users, active users, admin count
  - Total applications across all users
  - Quick action buttons
  - System status display
- **User Management**: Full CRUD operations for user accounts
  - Create, update, and delete users
  - Toggle user active/inactive status
  - Grant or revoke admin privileges
  - View user details and activity timestamps
  - Prevent self-deletion and self-privilege removal
- **Settings**: System configuration and customization
  - Dark/Light mode toggle with persistence
  - System information display
  - Admin actions panel

### 🎨 Theme Support
- **Dark Mode**: Full dark theme support across the entire application
- **Light Mode**: Clean, professional light theme
- **Persistent Preferences**: Theme choice saved to browser localStorage
- **Smooth Transitions**: Seamless switching between themes
- **Context-Based**: Uses React Context API for global theme state

### 🔒 Authentication & Security
- **Email/Password Login**: Traditional authentication with JWT
- **Google OAuth**: Quick sign-in with Google account
- **Role-Based Access Control**: Admin and user roles with appropriate permissions
- **Protected Routes**: Admin panel requires admin privileges
- **Secure JWT Tokens**: Token-based authentication for all API calls
- **Password Hashing**: Bcrypt for secure password storage

## Tech Stack 🛠️

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL with asyncmy (async MySQL driver)
- **Authentication**: JWT tokens + OAuth2 (Google)
- **AI Integration**: OpenAI GPT for resume analysis and job extraction
- **Storage**: Supabase for resume file storage
- **Resume Parsing**: PyPDF2, python-docx

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks + Context API
- **Routing**: Next.js App Router

## Project Structure 📁

```
Work Manager/
├── backend/
│   ├── app/
│   │   ├── core/           # Authentication & security
│   │   ├── crud/           # Database operations
│   │   │   ├── job_application.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── admin.py           # Admin endpoints (NEW)
│   │   │   ├── job_applications.py
│   │   │   ├── resume.py
│   │   │   └── extract.py
│   │   ├── schemas/        # Pydantic models
│   │   ├── utils/          # Helper functions
│   │   │   ├── resume_parser.py
│   │   │   └── suggestion_generator.py
│   │   ├── database.py
│   │   └── main.py
│   ├── schema.sql         # Database schema
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── admin/                 # Admin panel (NEW)
│   │   │   ├── dashboard/        # Statistics overview
│   │   │   ├── users/            # User management
│   │   │   ├── settings/         # Theme & settings
│   │   │   └── layout.tsx        # Admin layout
│   │   ├── applications/   # Job applications pages
│   │   ├── resume/         # Resume management
│   │   ├── components/     # React components
│   │   └── page.tsx        # Login page
│   ├── contexts/          # React contexts (NEW)
│   │   └── ThemeContext.tsx     # Theme management
│   ├── lib/               # Utilities and API calls
│   │   ├── api.ts
│   │   └── admin-api.ts          # Admin API client (NEW)
│   ├── types/             # TypeScript types
│   └── package.json
└── README.md

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

## Database Schema 🗄️

### Key Tables

**users**
- User authentication and role management
- Fields: id, email, hashed_password, auth_provider, is_active, is_admin, created_at

**job_applications**
- Job tracking with company, position, status, description, etc.
- Links to users for multi-user support
- Fields: id, user_id, company, position, location, status, description, requirements, salary, currency, url, notes, applied_date, created_at, updated_at

**resumes**
- Stores resume metadata and parsed data
- JSON fields for skills and parsed information
- `is_active` flag for active resume selection
- Fields: id, user_id, filename, file_path, parsed_data, is_active, created_at

**resume_match_scores**
- Links resumes to applications
- Stores match_percentage, skill_match, experience_match
- **UNIQUE constraint** on (resume_id, application_id) prevents duplicates

## Usage Guide 📖

### For Regular Users

1. **Create Account & Login**
2. **Upload Resume** → Navigate to "Resume & Success Rate"
3. **Add Applications** → Click "Add Application" (paste URL for auto-extraction)
4. **Track Progress** → Update statuses as you progress through the hiring process
5. **Follow-up Reminders** → Check dashboard for stale applications
6. **Interview Prep** → Get AI-powered suggestions for each application

### For Administrators

1. **Access Admin Panel** → Click "⚡ Admin Panel" in sidebar
2. **View Dashboard** → Monitor system statistics
3. **Manage Users** → Create, update, or delete user accounts
4. **Assign Roles** → Grant or revoke admin privileges
5. **Toggle Theme** → Switch between light and dark modes in Settings

## Troubleshooting 🔧

### Common Issues

**Match scores not showing?**
1. Ensure resume tables exist: Run `schema.sql`
2. Upload and set an active resume
3. Restart backend server

**Resume upload fails?**
- Check file type is supported (PDF, DOC, DOCX, TXT)
- Verify file size is under 10MB
- Check backend logs for errors

**Admin panel not accessible?**
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in backend `.env.local`
- Restart backend to create admin user
- Check database `users` table for `is_admin=1`

**Theme not persisting?**
- Check browser localStorage is enabled
- Try clearing browser cache
- Verify JavaScript is enabled

**Google OAuth not working?**
- Verify Google OAuth credentials in `.env.local`
- Check redirect URI matches Google Cloud Console settings
- Ensure `FRONTEND_URL` is correct

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements 🚀

- [ ] Email notifications for application deadlines and follow-ups
- [ ] Interview scheduling and calendar integration
- [ ] Salary comparison and analytics across applications
- [ ] Application templates for common roles
- [ ] Export applications to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Integration with job boards (LinkedIn, Indeed, Glassdoor)
- [ ] AI cover letter generation based on job description
- [ ] Interview question practice mode with mock interviews
- [ ] Team collaboration features for shared job searches
- [ ] Browser extension for one-click job posting imports

## Security Features 🛡️

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and user roles with appropriate permissions
- **Protected Routes**: Admin routes require admin privileges
- **Password Hashing**: Bcrypt for secure password storage
- **OAuth2 Integration**: Secure Google authentication
- **Self-Protection**: Admins cannot delete or deactivate themselves
- **Token Expiration**: Automatic session management

## Performance Optimizations ⚡

- **Async Database Operations**: Non-blocking MySQL queries with asyncmy
- **Auto-refresh**: Smart 30-second polling for application updates
- **Optimistic UI Updates**: Instant feedback for user actions
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **CSS Purging**: Tailwind CSS automatic unused style removal

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Support 💬

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact: markjunellex@gmail.com

## Acknowledgments 🙏

- FastAPI for the excellent backend framework
- Next.js team for the powerful React framework
- OpenAI for AI-powered features
- Supabase for cloud storage
- Tailwind CSS for utility-first styling
- All contributors who helped improve this project

---

**Built with ❤️ for job seekers everywhere**

Last Updated: August 2026

Happy job hunting! 🎯
