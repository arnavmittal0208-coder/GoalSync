# GoalSync — Employee Performance Portal

**GoalSync** is a modern full-stack application for employee goal setting, performance tracking, manager approval, and admin reporting.

This repository includes a React frontend and an Express backend, deployed with:
- Frontend on **Vercel**
- Backend on **Render**
- Database on **MongoDB Atlas**

---

## 🌟 Project Overview

GoalSync is built for companies that want a structured performance workflow where:
- employees create and submit goals,
- managers review, approve, or reject goals,
- admins monitor team progress, export reports, and manage users.

The app currently provides:
- login-first authentication flow
- role-based dashboards for Employee / Manager / Admin
- goal creation, submission, approval, unlock, and shared goal handling
- quarterly check-ins and progress tracking
- notifications, analytics, and exportable reports

---

## 🧱 Tech Stack

- Frontend: **React**, **Vite**, **Tailwind CSS**, **React Router**, **Recharts**
- Backend: **Node.js**, **Express**, **MongoDB**, **Mongoose**
- Authentication: **JWT tokens** and role-based access control
- Deployment: **Vercel** (frontend), **Render** (backend), **MongoDB Atlas** (database)

---

## 📁 Repository Structure

```text
TrackSphere - Copy - Copy22/
├── goalsync-frontend/          # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI components and layout
│   │   ├── context/            # auth and app state context
│   │   ├── pages/              # auth, employee, manager, admin pages
│   │   ├── routes/             # protected routing
│   │   └── services/           # API client code
│   ├── package.json
│   └── vite.config.js
└── goalsync-backend/           # Express backend API
    ├── src/
    │   ├── config/             # database and environment config
    │   ├── controllers/        # request handlers
    │   ├── middleware/         # auth, validation, error handling
    │   ├── models/             # Mongoose schemas
    │   ├── routes/             # REST API endpoints
    │   └── utils/              # seed scripts, helpers
    ├── package.json
    └── src/server.js
```

---

## 🚀 Local Setup

### Backend

```bash
cd goalsync-backend
npm install
```

Create `.env` in `goalsync-backend/`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/goalsync?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Seed sample data:

```bash
npm run seed
```

Start backend in development:

```bash
npm run dev
```

Backend default URL: http://localhost:5000

### Frontend

```bash
cd ../goalsync-frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:5173

If you need a local frontend environment variable, create a `.env` file in `goalsync-frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment Instructions

### Frontend → Vercel
1. Push `goalsync-frontend/` to GitHub.
2. Import the project into Vercel.
3. Configure environment variables:
   - `VITE_API_URL=https://<your-backend>.onrender.com/api`
4. Deploy the frontend.

### Backend → Render
1. Push `goalsync-backend/` to GitHub.
2. Create a new Web Service on Render.
3. Add environment variables:
   - `MONGODB_URI` = Atlas connection string
   - `JWT_SECRET` = secure secret
   - `CLIENT_URL` = deployed frontend URL (for example https://<your-frontend>.vercel.app)
   - `PORT=5000`
4. Deploy the backend.

### Database → MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Add a database user and password.
3. Configure network/access settings.
4. Use the Atlas connection string for `MONGODB_URI`.

---

## 🔌 API Summary

### Auth
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/me`
- PUT `/api/auth/me`
- PUT `/api/auth/change-password`

### Goals
- GET `/api/goals`
- POST `/api/goals`
- PUT `/api/goals/:id`
- DELETE `/api/goals/:id`
- POST `/api/goals/submit`
- GET `/api/goals/manager/team`
- PUT `/api/goals/:id/approve`
- PUT `/api/goals/:id/reject`
- PUT `/api/goals/:id/unlock`
- POST `/api/goals/shared`
- GET `/api/goals/admin/all`

### Check-ins
- GET `/api/checkins`
- POST `/api/checkins`
- PUT `/api/checkins/:id/comment`
- GET `/api/checkins/team`

### Reports
- GET `/api/reports?format=excel`
- GET `/api/reports?format=csv`
- GET `/api/reports/audit`
- GET `/api/reports/cycles`

---

## 👥 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@goalsync.com | employee123 |
| Manager | manager@goalsync.com | manager123 |
| Admin | admin@goalsync.com | admin123 |

---

## ✅ Key Features

- Role-based login for Employee / Manager / Admin
- Goal creation, submission, approval, rejection, and unlock
- Shared goals and team goal coordination
- Quarterly check-ins and progress tracking
- In-app notifications and analytics
- Exportable Excel / CSV reports
- Audit log and goal cycle management
- Responsive frontend with modern UI

---

## 💡 Notes

- The app is designed to use a separate frontend and backend deployment.
- Frontend should be deployed to Vercel.
- Backend should be deployed to Render.
- MongoDB Atlas is recommended for production database hosting.
- The login page is the default entry point.

---
