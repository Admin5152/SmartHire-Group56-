# SmartHire Backend Server

Express.js backend API for the SmartHire recruitment platform.

## Prerequisites

- Node.js 18+ or Bun
- Supabase project with the following tables: `profiles`, `jobs`, `applications`

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:8080
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OCR_API_KEY=your_ocr_space_api_key
```

## Installation

```bash
cd server
npm install
```

## Development

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job (public)
- `GET /api/jobs/creator/me` - Get HR's jobs (authenticated)
- `POST /api/jobs` - Create job (HR only)
- `PUT /api/jobs/:id` - Update job (HR only)
- `DELETE /api/jobs/:id` - Delete job (HR only)

### Applications
- `GET /api/applications` - Get all applications (HR only)
- `GET /api/applications/my` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications by job
- `GET /api/applications/ranked` - Get ranked applicants
- `POST /api/applications` - Create application
- `PATCH /api/applications/:id/status` - Update status (HR only)

### Resume
- `POST /api/resume/analyze` - Analyze resume with OCR

## HR Admin Access

HR dashboard requires specific credentials:
- Email: `Group56@gmail.com`
- Password: `Group56`
