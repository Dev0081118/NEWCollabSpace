# CollabSpace - Project Showcase & Collaboration Platform

A full-stack MERN application where creators, developers, and designers can showcase their projects, collaborate with others, and build their portfolio.

## Features

- **Authentication** - Sign up, log in, and manage sessions with JWT cookies
- **Project Gallery** - Browse, search, and filter projects by category
- **Project Details** - View full project info, like, comment, and collaborate
- **Likes** - Like/unlike projects with real-time count updates
- **Comments** - Add and delete comments on projects
- **Collaboration Requests** - Send, accept, or reject collaboration requests
- **Profile Dashboard** - View stats, manage projects, and track requests
- **Upload/Edit Projects** - Create and update project listings with images
- **Trending Section** - Discover most-liked projects

## Tech Stack

- **Frontend**: React, React Router, Axios, CSS (custom design system)
- **Backend**: Node.js, Express, Mongoose, JWT, Multer
- **Database**: MongoDB

## Project Structure

```
CollabSpace/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & file upload middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── seeds/          # Demo data seeder
│   ├── uploads/        # Uploaded images
│   ├── server.js       # Entry point
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/        # API client & endpoints
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context provider
│   │   ├── pages/      # Page components
│   │   ├── App.jsx     # Root component with routes
│   │   └── main.jsx    # Entry point
│   └── vite.config.js  # Vite configuration
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

The backend `.env` file is pre-configured for local development:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabspace
JWT_SECRET=collabspace_jwt_secret_key_2026
JWT_EXPIRE=7d
```

### 3. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

This creates demo users and projects. All demo accounts use password: `password123`

Demo accounts:
- alex@example.com
- sarah@example.com
- marcus@example.com
- priya@example.com
- demo@example.com

### 4. Start the Application

**Start the backend:**

```bash
cd backend
npm start
```

The API server runs on http://localhost:5000

**Start the frontend (in a separate terminal):**

```bash
cd frontend
npm run dev
```

The app runs on http://localhost:5173

### 5. Access the App

Open http://localhost:5173 in your browser. The Vite dev server proxies API requests to the backend.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Create account | No |
| POST | /api/auth/login | Log in | No |
| POST | /api/auth/logout | Log out | No |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/projects | List projects (search, category, pagination) | Optional |
| GET | /api/projects/trending | Top liked projects | Optional |
| GET | /api/projects/:id | Get project details | Optional |
| POST | /api/projects | Create project | Yes |
| PUT | /api/projects/:id | Update project | Yes* |
| DELETE | /api/projects/:id | Delete project | Yes* |
| POST | /api/projects/:id/like | Toggle like | Yes |
| GET | /api/projects/:id/comments | Get comments | No |
| POST | /api/projects/:id/comments | Add comment | Yes |
| DELETE | /api/comments/:id | Delete comment | Yes* |
| POST | /api/projects/:id/collab-requests | Send collab request | Yes |
| POST | /api/collab-requests/:id/accept | Accept request | Yes* |
| POST | /api/collab-requests/:id/reject | Reject request | Yes* |
| GET | /api/profile | Get profile with stats | Yes |
| GET | /api/profile/projects | User's projects | Yes |
| GET | /api/profile/collab-requests/incoming | Incoming requests | Yes* |
| GET | /api/profile/collab-requests/sent | Sent requests | Yes |

*_Owner-only actions_