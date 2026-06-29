# SIK-GO

SIK-GO is a web application for managing room reservations and proposal documents at the Faculty of Engineering, Universitas Indonesia. The system helps students browse rooms, submit booking requests, upload proposals, and use AI-assisted document analysis to check proposal quality and format.

The project is organized as a full-stack JavaScript application with a React frontend and an Express/MongoDB backend.

## Features

- User registration, login, and JWT-based authentication.
- Public room browsing and room availability checks.
- Room booking submission, tracking, approval, and rejection workflows.
- Proposal submission with PDF upload support.
- AI-assisted proposal review, summary, evaluation, plagiarism checking, and improvement suggestions.
- SIK document upload and status management.
- Admin views for managing rooms, bookings, proposals, and submitted documents.

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Native Fetch API for backend requests

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Google Gemini API for AI-powered document and proposal analysis

## Repository Structure

```text
SIK-GO/
|-- FE/                 # React + Vite frontend
|   |-- public/         # Static assets
|   `-- src/
|       |-- components/ # Reusable UI components
|       |-- pages/      # Application pages
|       |-- services/   # API client helpers
|       `-- styles/     # CSS files
|-- BE/                 # Express backend API
|   |-- scripts/        # Utility scripts
|   |-- src/
|   |   |-- controller/ # Request handlers
|   |   |-- database/   # MongoDB connection and models
|   |   |-- middleware/ # Auth and upload middleware
|   |   |-- repository/ # Data access layer
|   |   |-- route/      # API route definitions
|   |   `-- util/       # AI services and helpers
|   `-- uploads/        # Uploaded files
`-- README.md
```

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB database or MongoDB Atlas cluster
- Google Gemini API key

## Environment Variables

Create an `.env` file inside `BE/`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

Create an `.env` file inside `FE/`:

```env
VITE_API_URL=http://localhost:3000
```

Do not commit real `.env` values to GitHub.

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd SIK-GO
```

Install backend dependencies:

```bash
cd BE
npm install
```

Install frontend dependencies:

```bash
cd ../FE
npm install
```

Start the backend server:

```bash
cd ../BE
npm start
```

The API will run on `http://localhost:3000` by default.

Start the frontend development server in another terminal:

```bash
cd SIK-GO
cd FE
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

## Available Scripts

### Frontend

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the frontend for production
npm run preview  # Preview the production build locally
```

### Backend

```bash
npm start        # Start the Express API with nodemon
npm test         # Placeholder test script
```

## Main API Routes

| Module | Base Route | Description |
| --- | --- | --- |
| Auth | `/api/auth` | Register, login, and current user profile |
| Users | `/api/users` | User management |
| Rooms | `/api/rooms` | Room list, details, availability, and admin room management |
| Bookings | `/api/bookings` | Room booking workflow |
| Proposals | `/api/proposals` | Proposal submission, review, and status updates |
| Proposal Analysis | `/api/proposals-analysis` | AI analysis, plagiarism checks, suggestions, and audit |
| Proposal Evaluation | `/api/proposals-evaluation` | AI summary and evaluation |
| SIK Documents | `/api/sik-document` | SIK document upload, download, and status workflow |

## Application Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/rooms` - Room list
- `/reserve-room` - Room reservation flow
- `/bookings` - User bookings
- `/proposals` - User proposals
- `/proposals/:id` - Proposal detail
- `/document-analysis` - AI document analysis
- `/admin/dashboard` - Admin dashboard

## Notes

- The backend accepts file uploads and stores uploaded files under `BE/uploads/`.
- Most booking, proposal, and document routes require a valid JWT token.
- Admin-only routes require an authenticated user with the `admin` role.
- AI features require a valid Gemini API key.

## Team

SIK-GO was created by students from the Faculty of Engineering, Universitas Indonesia, as a software engineering project focused on improving room reservation and document review workflows.
