# InternHub - Internship Management Platform

A comprehensive platform connecting students, universities, and companies for successful internship experiences.

## Features

- **University Dashboard**: Manage student applications, track submissions, and review internship progress
- **Company Dashboard**: Post internships, review applications, manage candidates through hiring pipeline
- **Application Management**: Complete workflow from submission to acceptance/rejection
- **File Upload**: CV and resume upload with secure storage
- **Role-based Access**: Separate interfaces for universities and companies
- **Real-time Stats**: Track application metrics and status

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- File upload with express-fileupload
- bcrypt for password hashing

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Lucide icons

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd internhub/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=internhub
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and automatically create database tables on first run.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd internhub/frontend/internhub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Database Schema

The application uses two main tables:

### universityapplications
- Stores applications from university perspective
- Tracks student submissions and status

### companyapplications
- Stores applications from company perspective
- Enables company review workflow

Both tables are synchronized when applications are submitted.

## User Roles

1. **University**: Submit applications on behalf of students, track submissions
2. **Company**: Review applications, update status, download documents
3. **Admin**: (Future) System administration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/change-password` - Change password

### Applications
- `POST /api/applications` - Submit application (University)
- `GET /api/applications/university` - Get university applications
- `GET /api/applications/company` - Get company applications
- `GET /api/applications/company/stats` - Get application statistics
- `PUT /api/applications/:id/review` - Update application status (Company)
- `PATCH /api/applications/:id/status` - Update application status (Company)

## Application Status Flow

1. **Pending** - Initial submission
2. **Under Review** - Company is reviewing
3. **Shortlisted** - Candidate selected for interview
4. **Accepted** - Offer extended
5. **Rejected** - Application declined

## File Upload

- Supported format: PDF only
- Max file size: 2MB per file
- Required files: CV and Resume
- Files stored in `/uploads` directory

## Default Test Users

After setup, you can create test users via the signup page:

**University Account:**
- Email: university@test.com
- Password: password123
- Role: university

**Company Account:**
- Email: company@test.com
- Password: password123
- Role: company

## Development

### Backend Development
```bash
cd internhub/backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd internhub/frontend/internhub
npm run dev  # Next.js dev server with hot reload
```

## Production Build

### Backend
```bash
cd internhub/backend
npm start
```

### Frontend
```bash
cd internhub/frontend/internhub
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `psql -U postgres -c "CREATE DATABASE internhub;"`

### File Upload Issues
- Ensure `/uploads` directory exists and has write permissions
- Check file size limits in backend configuration

### CORS Issues
- Backend is configured for `http://localhost:3000`
- Update CORS settings in `backend/app.js` if using different port

## Future Enhancements

- Email notifications
- Interview scheduling
- Student profiles
- Company profiles
- Advanced search and filtering
- Analytics dashboard
- Document preview
- Multi-language support

## License

MIT

## Contributors

Your team name here
