# Aptitude Test Platform

A comprehensive full-stack web application for online aptitude testing with an admin panel, AI-generated performance reports, and role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [User Roles & Features](#user-roles--features)
- [CSV Upload Format](#csv-upload-format)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Admin Panel
- **Dashboard**: Overview of students, questions, tests, and analytics
- **Question Management**: Add, edit, delete, and filter questions by difficulty, company, and category
- **CSV Bulk Upload**: Import questions in bulk with CSV format validation
- **Company Management**: Create and manage company-specific test pools
- **Test Reports**: View all student test results with detailed analytics and AI-generated performance summaries

### Student Features
- **General Aptitude Tests**: 3 difficulty levels (Easy, Medium, Hard) with randomized questions
- **Company-Wise Tests**: Take tests specific to companies (Wipro, Infosys, TCS, etc.)
- **Test Interface**: 
  - Clean, intuitive UI with progress tracking
  - Real-time timer with warnings
  - Previous/Next question navigation
  - Auto-saving of answers
- **Result Dashboard**: Score breakdown with visual charts
- **AI Performance Reports**: 
  - Personalized summary of performance
  - Identified strengths and weaknesses
  - Actionable improvement suggestions
- **Test History**: Access all past tests and reports

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Backend** | Next.js API Routes (Server Actions) |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **AI Reports** | OpenAI API (or any LLM via AI SDK) |
| **Deployment** | Vercel |

## 📁 Project Structure

\`\`\`
aptitude-test-app/
├── app/
│   ├── admin/                    # Admin dashboard routes
│   │   ├── dashboard/page.tsx
│   │   ├── questions/page.tsx
│   │   ├── companies/page.tsx
│   │   ├── tests/page.tsx
│   │   └── layout.tsx
│   ├── student/                  # Student routes
│   │   ├── dashboard/page.tsx
│   │   ├── tests/
│   │   │   ├── general/
│   │   │   ├── company/
│   │   │   └── results/[testId]/page.tsx
│   │   ├── reports/page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── signup-success/page.tsx
│   ├── api/                      # API routes
│   │   ├── tests/[testId]/generate-report/route.ts
│   │   └── ...
│   ├── layout.tsx
│   ├── page.tsx                  # Home/Landing page
│   └── globals.css
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── dashboard-stats.tsx
│   │   └── ...
│   ├── student/
│   │   ├── header.tsx
│   │   ├── test-interface.tsx
│   │   └── ...
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Token refresh
│   ├── db.ts                     # Database utilities
│   └── utils.ts
├── scripts/
│   └── 001_schema_setup.sql      # Database schema
├── middleware.ts                 # Auth middleware
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- A Supabase project (free tier available)
- OpenAI API key (for AI report generation)

### Step 1: Clone and Install

\`\`\`bash
git clone <repository-url>
cd aptitude-test-app
npm install
\`\`\`

### Step 2: Supabase Setup

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run Database Schema**: 
   - Copy the SQL from `scripts/001_schema_setup.sql`
   - Go to Supabase Dashboard → SQL Editor → New Query
   - Paste and execute the SQL to create tables
3. **Get Your Credentials**:
   - Go to Project Settings → API Keys
   - Copy your `Project URL` and `Anon Key`
   - Also get your `Service Role Key` for server-side operations

### Step 3: Environment Variables

Create a `.env.local` file in the project root:

\`\`\`env
# Supabase


# Database (if using direct connections)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# OpenAI (for AI report generation)
OPENAI_API_KEY=your_openai_api_key

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/signup-success
\`\`\`

### Step 4: Create Seed Data (Optional)

You can manually create initial companies or use the admin panel:
- Login as admin (role should be set to 'ADMIN' in users table)
- Add companies: Wipro, Infosys, TCS, Accenture, etc.
- Upload questions via CSV

### Step 5: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) and navigate to login/signup.

## 📊 Database Schema

### Tables Overview

#### `users`
\`\`\`sql
- id (UUID, PK) - From Supabase Auth
- email (Text) - User email
- name (Text) - User full name
- role (Enum) - 'ADMIN' or 'STUDENT'
- created_at (Timestamp)
- updated_at (Timestamp)
\`\`\`

#### `companies`
\`\`\`sql
- id (UUID, PK)
- name (Text) - Company name (Wipro, Infosys, etc.)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
\`\`\`

#### `questions`
\`\`\`sql
- id (UUID, PK)
- question_text (Text)
- option_a, option_b, option_c, option_d (Text)
- correct_option (Enum) - 'A', 'B', 'C', 'D'
- difficulty_level (Enum) - 'EASY', 'MEDIUM', 'HARD'
- category (Text) - 'Quantitative', 'Logical', 'Verbal', etc.
- company_id (UUID, FK) - NULL for general aptitude questions
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
\`\`\`

#### `tests`
\`\`\`sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- test_type (Enum) - 'GENERAL' or 'COMPANY'
- company_id (UUID, FK) - NULL for general tests
- difficulty_level (Enum) - 'EASY', 'MEDIUM', 'HARD'
- total_questions (Integer)
- correct_answers (Integer)
- wrong_answers (Integer)
- score (Numeric) - Percentage or points
- started_at (Timestamp)
- completed_at (Timestamp)
- duration_seconds (Integer)
\`\`\`

#### `test_answers`
\`\`\`sql
- id (UUID, PK)
- test_id (UUID, FK to tests)
- question_id (UUID, FK to questions)
- selected_option (Enum) - 'A', 'B', 'C', 'D', or NULL
- is_correct (Boolean)
- time_taken_seconds (Integer, optional)
\`\`\`

#### `ai_reports`
\`\`\`sql
- id (UUID, PK)
- test_id (UUID, FK to tests)
- summary_text (Text) - AI-generated summary
- strengths (Text) - Markdown bullet points
- weaknesses (Text) - Markdown bullet points
- suggestions (Text) - Markdown bullet points
- created_at (Timestamp)
\`\`\`

## 🔌 API Routes

### Test Endpoints

#### POST `/api/tests/[testId]/submit`
Submit completed test and calculate results.

**Request Body**:
\`\`\`json
{
  "answers": [
    { "question_id": "uuid", "selected_option": "A" }
  ]
}
\`\`\`

**Response**: `{ test_id, score, total_questions, correct_answers }`

#### POST `/api/tests/[testId]/generate-report`
Generate AI-powered performance report.

**Response**: 
\`\`\`json
{
  "id": "uuid",
  "summary_text": "...",
  "strengths": "...",
  "weaknesses": "...",
  "suggestions": "..."
}
\`\`\`

#### GET `/api/tests/[testId]`
Get test details and results.

#### GET `/api/questions/random`
Get randomized questions for a test.

**Query Params**: `?company_id=uuid&difficulty=EASY&limit=20`

## 👥 User Roles & Features

### Admin
- Create and manage questions
- Bulk upload questions via CSV
- Manage companies
- View all student tests and detailed reports
- Access admin dashboard with analytics
- **Routes**: `/admin/dashboard`, `/admin/questions`, `/admin/companies`, `/admin/tests`

### Student
- Take general and company-specific aptitude tests
- Auto-save answers during tests
- View personalized AI-generated performance reports
- Access test history and previous reports
- **Routes**: `/student/dashboard`, `/student/tests/...`, `/student/reports`

## 📤 CSV Upload Format

Upload questions in CSV format with these columns:

| Column | Type | Example | Required |
|--------|------|---------|----------|
| question_text | String | "What is 2+2?" | Yes |
| option_a | String | "3" | Yes |
| option_b | String | "4" | Yes |
| option_c | String | "5" | Yes |
| option_d | String | "6" | Yes |
| correct_option | String | "B" | Yes |
| difficulty_level | String | "EASY" / "MEDIUM" / "HARD" | Yes |
| category | String | "Quantitative" / "Logical" / "Verbal" | Yes |
| company_name | String | "Wipro" or leave blank for general | No |

### Example CSV

\`\`\`csv
question_text,option_a,option_b,option_c,option_d,correct_option,difficulty_level,category,company_name
"What is 2+2?","3","4","5","6","B","EASY","Quantitative",
"What is the capital of France?","London","Berlin","Paris","Madrid","C","EASY","Verbal",
"What comes next in sequence: 2,4,6,8?","9","10","12","14","C","MEDIUM","Logical","Wipro"
\`\`\`

## 🔐 Authentication

The app uses Supabase Auth with the following flow:

1. **Sign Up**: User provides email and password
2. **Email Verification**: Supabase sends confirmation link (development uses redirect URL)
3. **Role Assignment**: Admin assigns role ('ADMIN' or 'STUDENT') after signup
4. **Login**: User logs in with email/password
5. **Session Management**: JWT token stored in cookies, auto-refreshed via middleware
6. **Protected Routes**: Middleware redirects unauthenticated users to login


### Login Credentials (Development)

**For Testing Admin Panel**:
- Email: `admin@test.com`
- Password: Set during initial signup

**For Testing Student Features**:
- Email: `suraj1@gmail.com`
- Password: 123456
## 🌍 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service role key | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | `super_secret_key` |
| `OPENAI_API_KEY` | OpenAI API key for AI reports | `sk-...` |
| `POSTGRES_URL` | PostgreSQL connection string (optional) | `postgresql://...` |

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Import your repository
   - Select project root and Next.js framework

3. **Add Environment Variables**:
   - In Vercel Dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Configure Supabase for Production

1. In Supabase Dashboard, go to Authentication → URL Configuration
2. Add your Vercel domain to Authorized Redirect URLs
3. Update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production URL

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

## 📝 Code Style

- **TypeScript**: Use strict mode
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Organize imports (React, libs, components, styles)
- **Comments**: Add JSDoc comments for complex functions

## ⚡ Performance Tips

- Questions are paginated and lazy-loaded
- Test answers auto-save to prevent data loss
- AI report generation is async (user sees "Generating..." state)
- Images and PDFs are optimized for web
- Database queries use indexes on frequently filtered columns

## 🐛 Troubleshooting

### "Supabase connection error"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Run `npm run dev` and check browser console for errors

### "CSV upload fails"
- Ensure CSV has all required columns
- Check for special characters in text fields (should be properly escaped)
- Verify company names match existing companies in database

### "AI report not generating"
- Confirm `OPENAI_API_KEY` is valid
- Check OpenAI account has available credits
- Review server logs for API errors

### "Can't log in"
- Confirm user email is verified in Supabase Auth
- Clear browser cookies and try again
- Check if user role is properly set in `users` table

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Issues](https://github.com/yourname/aptitude-test-app/issues) on GitHub
3. Contact: support@example.com

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**
